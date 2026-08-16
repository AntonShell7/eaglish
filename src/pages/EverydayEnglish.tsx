import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { everydayEnglish, type SlangEntry } from "@/data/everydayEnglish";
import { addVocabularyWord } from "@/lib/vocabularyStore";
import { logActivity } from "@/lib/activityStore";

type Filter = "all" | SlangEntry["category"];

const FILTERS: { key: Filter; labelKey: string }[] = [
  { key: "all", labelKey: "slang.categoryAll" },
  { key: "Idiom", labelKey: "slang.idiom" },
  { key: "Slang", labelKey: "slang.slangWord" },
  { key: "Abbreviation", labelKey: "slang.abbreviation" },
];

function SlangCard({ entry }: { entry: SlangEntry }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    addVocabularyWord(entry.phrase, entry.meaning, t("nav.everydayEnglish"));
    logActivity("vocabulary");
    setSaved(true);
  };

  return (
    <div
      className="flex min-h-[190px] flex-col justify-between rounded-[var(--radius-lg)] border p-5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
    >
      <button type="button" onClick={() => setFlipped((v) => !v)} className="flex-1 text-left">
        <span
          className="mb-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {entry.category}
        </span>

        {flipped ? (
          <div>
            <p className="text-sm leading-relaxed">{entry.meaning}</p>
            <p className="mt-2 text-xs italic" style={{ color: "var(--color-text-muted)" }}>
              &ldquo;{entry.example}&rdquo;
            </p>
          </div>
        ) : (
          <>
            <p className="text-lg font-bold">{entry.phrase}</p>
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {t("slang.tapToFlip")}
            </p>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saved}
        className="mt-4 self-start rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
        style={{
          borderColor: saved ? "var(--color-success)" : "var(--color-border)",
          color: saved ? "var(--color-success)" : "var(--color-text-muted)",
        }}
      >
        {saved ? `✓ ${t("common.saved")}` : t("slang.saveToVocab")}
      </button>
    </div>
  );
}

export default function EverydayEnglish() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? everydayEnglish : everydayEnglish.filter((e) => e.category === filter)),
    [filter],
  );

  return (
    <SectionHero
      kicker={t("nav.everydayEnglish")}
      title={t("nav.everydayEnglish")}
      description={t("home.descriptions.everydayEnglish")}
    >
      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200"
            style={{
              borderColor: filter === f.key ? "var(--color-primary)" : "var(--color-border)",
              color: filter === f.key ? "var(--color-primary)" : "var(--color-text-muted)",
            }}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((entry) => (
          <SlangCard key={entry.phrase} entry={entry} />
        ))}
      </div>
    </SectionHero>
  );
}
