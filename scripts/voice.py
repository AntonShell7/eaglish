#!/usr/bin/env python3
"""
Speak the whole library, once.

Dictation used to depend on window.speechSynthesis, which means it depended on
whichever English voice the learner's operating system happened to ship. That
ranges from good (macOS, iOS) through robotic (Windows) to absent — a browser
reporting zero English voices leaves the entire section showing an apology
instead of a product.

At $22 per million characters the whole library is 215k characters and costs
under five dollars to voice once, so it is voiced once and shipped as files.
Nothing is generated while a learner waits, nothing is charged per listener,
and the audio keeps working even where the provider does not — which matters,
because the site itself currently needs a VPN from Russia.

Resumable by design: the file name is a hash of the sentence, so a rerun skips
everything already voiced and picks up only what changed. Editing one text
regenerates that text's new sentences and nothing else.

    python3 scripts/voice.py --voice tara            # the real run
    python3 scripts/voice.py --voice tara --limit 5  # a taste first
    python3 scripts/voice.py --samples               # one line in every voice
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile
import time
import ssl
import urllib.error
import urllib.request
import wave

# Python on macOS ships without a usable trust store unless somebody ran the
# installer's certificate script, and nobody ever does. curl works, urllib does
# not, and the failure arrives as a generic URLError — which the retry loop
# below then swallows into a minute of silent backoff before giving up. That
# cost an afternoon, so the context is built explicitly from certifi when it is
# there and left to the system default when it is not.
try:
    import certifi

    SSL_CONTEXT: ssl.SSLContext | None = ssl.create_default_context(cafile=certifi.where())
except ImportError:  # pragma: no cover - depends on the machine
    SSL_CONTEXT = None

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "voice"

# ── Providers ────────────────────────────────────────────────────────────────
#
# Two of them, because the first one turned out to be unusable at this size.
#
# Groq serves a good voice at $22 per million characters, and then rations it:
# a hundred requests a day, measured rather than read off a docs page — each
# call pushes the reset timer out by fourteen minutes and twenty-four seconds,
# which works out to exactly one full bucket per twenty-four hours. The library
# is 4,959 fragments. That is fifty days.
#
# OpenAI charges $15 per million characters for tts-1 and does not ration like
# that, so the whole library is one run of about half an hour. The Groq path is
# kept because it works, it sounds good, and a rate limit is a business
# decision that can change.
#
# Everything downstream of this table is shared: hashing, splitting, joining,
# compression, resumability.

PROVIDERS = {
    "groq": {
        "endpoint": "https://api.groq.com/openai/v1/audio/speech",
        "model": "canopylabs/orpheus-v1-english",
        "key_env": "GROQ_API_KEY",
        # Longer input comes back truncated or refused.
        "max_chars": 200,
        "price_per_million": 22.0,
        # Not in the docs. This list comes back in the error message when you
        # ask for a name that does not exist.
        "voices": ["autumn", "diana", "hannah", "austin", "daniel", "troy"],
        "default_voice": "daniel",
        "format": "wav",
    },
    "openai": {
        "endpoint": "https://api.openai.com/v1/audio/speech",
        "model": "tts-1",
        "key_env": "OPENAI_API_KEY",
        "max_chars": 4096,
        "price_per_million": 15.0,
        "voices": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
        "default_voice": "nova",
        "format": "wav",
    },
    # The newer model, and the reason to bother with it is the voices rather
    # than the price: five more of them, and they carry more character than the
    # original six. Confirmed available on this account by asking for each.
    "openai-hd": {
        "endpoint": "https://api.openai.com/v1/audio/speech",
        "model": "gpt-4o-mini-tts",
        "key_env": "OPENAI_API_KEY",
        "max_chars": 4096,
        "price_per_million": 12.0,
        "voices": [
            "alloy", "echo", "fable", "onyx", "nova", "shimmer",
            "ash", "ballad", "coral", "sage", "verse",
        ],
        "default_voice": "ballad",
        "format": "wav",
    },
}

# Filled in by main() once the provider is chosen.
P: dict = PROVIDERS["openai"]
MAX_CHARS = P["max_chars"]
PRICE_PER_MILLION = P["price_per_million"]
VOICES = P["voices"]


# ── what to say ──────────────────────────────────────────────────────────────

def sentences(voices: list[str]) -> dict[str, str]:
    """
    Every distinct English sentence, mapped to the voice that will read it.

    One voice per text rather than per sentence, and that is the whole point of
    the arrangement: a reader whose voice changes mid-dictation is a distraction
    at exactly the moment the learner is concentrating. Between texts it is the
    opposite — meeting the same English in a different mouth is the thing that
    stops an ear being trained on one speaker instead of on the language.

    Texts are dealt out round-robin, so the split stays even however many
    voices are given. A sentence that appears in two texts keeps whichever
    voice reached it first; identical sentences across texts are rare and it
    does not matter which one reads them.
    """
    assigned: dict[str, str] = {}
    index = 0
    for folder in ("reading", "listening"):
        for path in sorted((ROOT / "src" / "data" / folder).glob("*.json")):
            if path.name == "index.json":
                continue
            for text in json.load(open(path)):
                voice = voices[index % len(voices)]
                index += 1
                for line in text.get("sentences", []):
                    body = (line.get("text") or "").strip()
                    if body:
                        assigned.setdefault(body, voice)
    return assigned


def key_of(text: str) -> str:
    """The file name for a sentence. The client computes this identically."""
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]


def split(text: str) -> list[str]:
    """
    Cut an over-long sentence where a speaker would breathe.

    Clause boundaries first, because a join at a comma is inaudible and a join
    mid-phrase is not. Only if a single clause is still too long does this fall
    back to splitting on spaces, which is audible but rare — and better than a
    truncated sentence.
    """
    if len(text) <= MAX_CHARS:
        return [text]

    pieces: list[str] = []
    current = ""
    for part in re.split(r"(?<=[,;:—])\s+", text):
        candidate = f"{current} {part}".strip()
        if len(candidate) <= MAX_CHARS:
            current = candidate
            continue
        if current:
            pieces.append(current)
        current = part if len(part) <= MAX_CHARS else ""
        if not current:
            words, line = part.split(), ""
            for word in words:
                trial = f"{line} {word}".strip()
                if len(trial) > MAX_CHARS:
                    pieces.append(line)
                    line = word
                else:
                    line = trial
            current = line
    if current:
        pieces.append(current)
    return [p for p in pieces if p]


# ── saying it ────────────────────────────────────────────────────────────────

def speak(chunk: str, voice: str, api_key: str) -> bytes:
    """One request, with the retries a rate-limited endpoint requires."""
    body = json.dumps(
        {
            "model": P["model"],
            "input": chunk,
            "voice": voice,
            "response_format": P["format"],
        }
    ).encode()

    for attempt in range(6):
        request = urllib.request.Request(
            P["endpoint"],
            data=body,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                # Without this the request is refused with a bare 403. The
                # endpoint sits behind a CDN that blocks urllib's default
                # agent, and the refusal says nothing about why — curl works
                # from the same machine, same key, same second.
                "User-Agent": "eaglish-voice/1.0",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=120, context=SSL_CONTEXT) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")[:200]
            if error.code == 400 and "terms" in detail:
                raise SystemExit(
                    "\nThe model's terms have not been accepted yet.\n"
                    "Open https://console.groq.com/playground?model="
                    "canopylabs%2Forpheus-v1-english and accept them, then rerun.\n"
                )
            if error.code in (401, 403):
                raise SystemExit(
                    f"\nHTTP {error.code}: {detail}\n"
                    f"Check that {P['key_env']} is set and valid.\n"
                )
            # 429 is the normal state of a parallel run, not an error.
            if error.code in (429, 500, 502, 503, 529) and attempt < 5:
                time.sleep(2 ** attempt)
                continue
            raise SystemExit(f"HTTP {error.code}: {detail}")
        except urllib.error.URLError as error:
            # A broken trust store fails identically every time; retrying it six
            # times only hides the message that would have explained it.
            if isinstance(error.reason, ssl.SSLError):
                raise SystemExit(
                    f"\nTLS failed: {error.reason}\n"
                    "Python cannot verify the certificate. Run\n"
                    '  "/Applications/Python 3.13/Install Certificates.command"\n'
                    "or install certifi, then rerun.\n"
                )
            if attempt < 5:
                time.sleep(2 ** attempt)
                continue
            raise
        except TimeoutError:
            if attempt < 5:
                time.sleep(2 ** attempt)
                continue
            raise
    raise SystemExit("gave up after six attempts")


def join(chunks: list[bytes]) -> bytes:
    """Concatenate WAVs that share a format, keeping one header."""
    if len(chunks) == 1:
        return chunks[0]

    with tempfile.TemporaryDirectory() as tmp:
        paths = []
        for i, data in enumerate(chunks):
            path = pathlib.Path(tmp) / f"{i}.wav"
            path.write_bytes(data)
            paths.append(path)

        out = pathlib.Path(tmp) / "joined.wav"
        with wave.open(str(paths[0]), "rb") as first:
            params = first.getparams()
        with wave.open(str(out), "wb") as writer:
            writer.setparams(params)
            for path in paths:
                with wave.open(str(path), "rb") as reader:
                    writer.writeframes(reader.readframes(reader.getnframes()))
        return out.read_bytes()


def compress(wav: bytes, destination: pathlib.Path) -> None:
    """
    WAV to AAC, via the converter macOS already has.

    Four hours of 24 kHz WAV is around 700 MB, which cannot live in a
    repository. The same audio at 32 kbps mono is around 55 MB and is speech
    that nobody will describe as compressed.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(wav)
        source = tmp.name
    try:
        subprocess.run(
            ["afconvert", "-f", "m4af", "-d", "aac", "-b", "32000",
             "--mix", "-c", "1", source, str(destination)],
            check=True, capture_output=True,
        )
    finally:
        os.unlink(source)


# ── the run ──────────────────────────────────────────────────────────────────

def voice_one(text: str, voice: str, api_key: str) -> tuple[str, int, bool]:
    destination = OUT / f"{key_of(text)}.m4a"
    if destination.exists() and destination.stat().st_size > 0:
        return text, 0, True

    chunks = [speak(piece, voice, api_key) for piece in split(text)]
    compress(join(chunks), destination)
    return text, len(text), False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", default="openai", choices=sorted(PROVIDERS))
    parser.add_argument("--voice", default=None)
    parser.add_argument("--limit", type=int, default=0, help="stop after N sentences")
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--samples", action="store_true", help="one line per voice")
    args = parser.parse_args()

    global P, MAX_CHARS, PRICE_PER_MILLION, VOICES
    P = PROVIDERS[args.provider]
    MAX_CHARS = P["max_chars"]
    PRICE_PER_MILLION = P["price_per_million"]
    VOICES = P["voices"]
    if args.voice is None:
        args.voice = P["default_voice"]
    # Checked later, once it has been split: --voice now takes a comma-separated
    # list, and the names are validated against the chosen provider there.

    api_key = os.environ.get(P["key_env"]) or read_key(P["key_env"])
    if not api_key:
        raise SystemExit(
            f"{P['key_env']} not found in the environment or .env.local"
        )

    print(f"{args.provider} / {P['model']} / {args.voice}")

    OUT.mkdir(parents=True, exist_ok=True)

    if args.samples:
        line = ("The market is on a railway line. Not next to it. On it. "
                "Eight times a day, a train comes.")
        for voice in VOICES:
            target = OUT / f"sample-{voice}.m4a"
            try:
                compress(join([speak(piece, voice, api_key) for piece in split(line)]), target)
                print(f"  {voice:<8} → {target.relative_to(ROOT)}")
            except SystemExit as stop:
                raise stop
            except Exception as error:  # a voice name that does not exist
                print(f"  {voice:<8} — unavailable ({type(error).__name__})")
        return

    chosen = [v.strip() for v in args.voice.split(",") if v.strip()]
    unknown = [v for v in chosen if v not in VOICES]
    if unknown:
        raise SystemExit(f"not a voice on this provider: {unknown} — have {VOICES}")

    work = sentences(chosen)
    items = list(work.items())
    if args.limit:
        items = items[: args.limit]

    todo = [(s, v) for s, v in items if not (OUT / f"{key_of(s)}.m4a").exists()]
    spread = {v: sum(1 for _, got in todo if got == v) for v in chosen}
    print(f"{len(items)} sentences, {len(todo)} still to voice "
          f"({sum(len(s) for s, _ in todo):,} characters, "
          f"about ${sum(len(s) for s, _ in todo) / 1e6 * PRICE_PER_MILLION:.2f})")
    print("  " + " · ".join(f"{v}: {n}" for v, n in spread.items()))
    if not todo:
        return

    done = chars = 0
    started = time.time()
    with concurrent.futures.ThreadPoolExecutor(args.workers) as pool:
        futures = {pool.submit(voice_one, s, v, api_key): s for s, v in todo}
        for future in concurrent.futures.as_completed(futures):
            _, spent, skipped = future.result()
            done += 1
            chars += spent
            if done % 25 == 0 or done == len(todo):
                rate = done / max(time.time() - started, 1)
                left = (len(todo) - done) / max(rate, 0.01)
                print(f"  {done}/{len(todo)}  ${chars / 1e6 * PRICE_PER_MILLION:.2f}  "
                      f"~{left / 60:.0f} min left", flush=True)

    write_manifest(args.voice)

    real = [f for f in OUT.glob("*.m4a") if len(f.stem) == 16]
    size = sum(f.stat().st_size for f in real)
    print(f"\nDone. {len(real)} files, {size / 1e6:.0f} MB, "
          f"${chars / 1e6 * PRICE_PER_MILLION:.2f} spent this run.")


def write_manifest(voice: str) -> None:
    """
    A small file whose presence answers "is the library voiced?".

    The client needs that answer before it can decide what to tell a learner
    whose browser has no system voice either. Probing one recording would not
    do: a miss is indistinguishable from a sentence that simply was not in the
    library. One known file, one request, one definite answer.
    """
    # Only the content-addressed recordings. The sample and comparison files
    # live in the same folder and are not part of the library — counting them
    # would tell the client the library is voiced when it holds six auditions.
    files = sorted(f for f in OUT.glob("*.m4a") if len(f.stem) == 16 and all(c in "0123456789abcdef" for c in f.stem))
    (OUT / "manifest.json").write_text(
        json.dumps(
            {
                "voice": voice,
                "model": P["model"],
                "count": len(files),
                "bytes": sum(f.stat().st_size for f in files),
                "generated": time.strftime("%Y-%m-%d"),
            },
            indent=1,
        )
        + "\n"
    )


def read_key(name: str) -> str | None:
    """The key from .env.local, which is gitignored and stays that way."""
    env = ROOT / ".env.local"
    if not env.exists():
        return None
    for line in env.read_text().splitlines():
        if line.startswith(f"{name}="):
            return line.split("=", 1)[1].strip()
    return None


if __name__ == "__main__":
    main()
