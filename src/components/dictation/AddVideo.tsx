import { useState } from "react";
import { useTranslation } from "react-i18next";
import { parseTranscript, parseVideoId, type VideoExercise } from "@/lib/videoDictation";
import { saveVideoExercise } from "@/lib/videoStore";

/**
 * Adding a video exercise.
 *
 * The timings cannot be fetched: there is no supported way to read a video's
 * captions from a web page, and the unofficial endpoint breaks the terms and
 * then breaks itself every few months. But YouTube already shows the transcript
 * with timestamps under every video, and it can be selected and copied — so the
 * form asks for exactly what is on the clipboard after that, and does the rest.
 *
 * The parser glues caption fragments back into sentences, because captions are
 * cut for reading speed rather than for meaning and dictating half a clause
 * teaches nothing.
 */
export function AddVideo({ onAdded, onCancel }: { onAdded: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [level, setLevel] = useState<VideoExercise["level"]>("B1");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const segments = transcript.trim() ? parseTranscript(transcript) : [];
  const videoId = parseVideoId(url);

  const submit = () => {
    if (!videoId) {
      setError(t("video.badUrl"));
      return;
    }
    if (segments.length === 0) {
      setError(t("video.badTranscript"));
      return;
    }

    saveVideoExercise({
      id: `${videoId}-${Date.now()}`,
      videoId,
      title: title.trim() || t("video.untitled"),
      channel: channel.trim(),
      licence: "creative-commons",
      level,
      segments,
    });
    onAdded();
  };

  return (
    <section className="card p-6 sm:p-8">
      <h2 className="page-title text-2xl">{t("video.addTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {t("video.addIntro")}
      </p>

      <ol className="mt-4 space-y-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
        <li>1. {t("video.step1")}</li>
        <li>2. {t("video.step2")}</li>
        <li>3. {t("video.step3")}</li>
      </ol>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          className="field"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder={t("video.urlPlaceholder")}
        />
        <input
          className="field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("video.titlePlaceholder")}
        />
        <input
          className="field"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder={t("video.channelPlaceholder")}
        />
        <select
          className="field"
          value={level}
          onChange={(e) => setLevel(e.target.value as VideoExercise["level"])}
        >
          {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className="field mt-3"
        rows={8}
        value={transcript}
        onChange={(e) => {
          setTranscript(e.target.value);
          setError(null);
        }}
        placeholder={"0:00\nWelcome back to the programme.\n0:04\nToday we are talking about sleep."}
      />

      {/* Live count, so a transcript in the wrong shape is obvious before
          saving rather than after opening the exercise. */}
      <p className="mt-2 text-xs" style={{ color: "var(--color-text-faint)" }}>
        {t("video.parsed", { count: segments.length })}
      </p>

      {segments.length > 0 && (
        <p className="mt-1 text-xs italic" style={{ color: "var(--color-text-faint)" }}>
          {t("video.firstLine")}: “{segments[0].text.slice(0, 90)}”
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="btn btn--primary" onClick={submit}>
          {t("video.save")}
        </button>
        <button type="button" className="btn btn--quiet" onClick={onCancel}>
          {t("common.cancel")}
        </button>
      </div>

      <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--color-text-faint)" }}>
        {t("video.licenceNote")}
      </p>
    </section>
  );
}
