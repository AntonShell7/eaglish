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
import urllib.error
import urllib.request
import wave

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "voice"
MODEL = "canopylabs/orpheus-v1-english"
ENDPOINT = "https://api.groq.com/openai/v1/audio/speech"

# The model's own ceiling. Anything longer comes back truncated or refused, so
# long sentences are cut into clauses and the pieces are joined afterwards.
MAX_CHARS = 200
PRICE_PER_MILLION = 22.0

VOICES = ["tara", "troy", "hannah", "austin", "leah", "leo"]


# ── what to say ──────────────────────────────────────────────────────────────

def sentences() -> list[str]:
    """Every distinct English sentence in the library, in reading order."""
    seen: dict[str, None] = {}
    for folder in ("reading", "listening"):
        for path in sorted((ROOT / "src" / "data" / folder).glob("*.json")):
            if path.name == "index.json":
                continue
            for text in json.load(open(path)):
                for line in text.get("sentences", []):
                    body = (line.get("text") or "").strip()
                    if body:
                        seen.setdefault(body, None)
    return list(seen)


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
        {"model": MODEL, "input": chunk, "voice": voice, "response_format": "wav"}
    ).encode()

    for attempt in range(6):
        request = urllib.request.Request(
            ENDPOINT,
            data=body,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")[:200]
            if error.code == 400 and "terms" in detail:
                raise SystemExit(
                    "\nThe model's terms have not been accepted yet.\n"
                    "Open https://console.groq.com/playground?model="
                    "canopylabs%2Forpheus-v1-english and accept them, then rerun.\n"
                )
            # 429 is the normal state of a parallel run, not an error.
            if error.code in (429, 500, 502, 503, 529) and attempt < 5:
                time.sleep(2 ** attempt)
                continue
            raise SystemExit(f"HTTP {error.code}: {detail}")
        except (urllib.error.URLError, TimeoutError):
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
    parser.add_argument("--voice", default="tara")
    parser.add_argument("--limit", type=int, default=0, help="stop after N sentences")
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--samples", action="store_true", help="one line per voice")
    args = parser.parse_args()

    api_key = os.environ.get("GROQ_API_KEY") or read_key()
    if not api_key:
        raise SystemExit("GROQ_API_KEY not found in the environment or .env.local")

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

    work = sentences()
    if args.limit:
        work = work[: args.limit]

    todo = [s for s in work if not (OUT / f"{key_of(s)}.m4a").exists()]
    print(f"{len(work)} sentences, {len(todo)} still to voice "
          f"({sum(len(s) for s in todo):,} characters, "
          f"about ${sum(len(s) for s in todo) / 1e6 * PRICE_PER_MILLION:.2f})")
    if not todo:
        return

    done = chars = 0
    started = time.time()
    with concurrent.futures.ThreadPoolExecutor(args.workers) as pool:
        futures = {pool.submit(voice_one, s, args.voice, api_key): s for s in todo}
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

    size = sum(p.stat().st_size for p in OUT.glob("*.m4a"))
    print(f"\nDone. {len(list(OUT.glob('*.m4a')))} files, {size / 1e6:.0f} MB, "
          f"${chars / 1e6 * PRICE_PER_MILLION:.2f} spent this run.")


def write_manifest(voice: str) -> None:
    """
    A small file whose presence answers "is the library voiced?".

    The client needs that answer before it can decide what to tell a learner
    whose browser has no system voice either. Probing one recording would not
    do: a miss is indistinguishable from a sentence that simply was not in the
    library. One known file, one request, one definite answer.
    """
    files = sorted(OUT.glob("*.m4a"))
    (OUT / "manifest.json").write_text(
        json.dumps(
            {
                "voice": voice,
                "model": MODEL,
                "count": len(files),
                "bytes": sum(f.stat().st_size for f in files),
                "generated": time.strftime("%Y-%m-%d"),
            },
            indent=1,
        )
        + "\n"
    )


def read_key() -> str | None:
    env = ROOT / ".env.local"
    if not env.exists():
        return None
    for line in env.read_text().splitlines():
        if line.startswith("GROQ_API_KEY="):
            return line.split("=", 1)[1].strip()
    return None


if __name__ == "__main__":
    main()
