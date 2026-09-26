import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { LevelFilter } from "@/components/LevelFilter";
import { DialogueRunner } from "@/components/slang/DialogueRunner";
import { slangDialogues, allExpressions, type Dialogue } from "@/data/slangDialogues";
import { getSlangResults } from "@/lib/slangProgress";
import type { Cefr } from "@/lib/textLevel";
import "@/components/slang/slang.css";

/**
 * Slang, as its own section.
 *
 * It used to be a tab inside Everyday English, which put a phrasebook and this
 * in one place and let the phrasebook win: cards are easier to make and easier
 * to browse, so the conversations never got built. The subjects are different
 * enough to deserve different rooms. Everyday English teaches you what to say;
 * this one teaches you to understand what is being said to you, which is the
 * half that makes people feel they cannot speak the language at all.
 */
export default function Slang() {
  const { t, i18n } = useTranslation();
  const ru = i18n.language.startsWith("ru");
  const [level, setLevel] = useState<Cefr | null>(null);
  const [open, setOpen] = useState<Dialogue | null>(null);

  const results = useMemo(() => getSlangResults(), [open]);

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const dialogue of slangDialogues) out[dialogue.level] = (out[dialogue.level] ?? 0) + 1;
    return out;
  }, []);

  const shown = useMemo(
    () => (level ? slangDialogues.filter((d) => d.level === level) : slangDialogues),
    [level],
  );

  if (open) {
    return (
      <SectionHero kicker={t("nav.slang")} title={t("nav.slang")} description={t("slangModule.intro")}>
        <DialogueRunner dialogue={open} onExit={() => setOpen(null)} />
      </SectionHero>
    );
  }

  return (
    <SectionHero kicker={t("nav.slang")} title={t("nav.slang")} description={t("slangModule.intro")}>
      <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("slangModule.shelfMeta", {
          dialogues: slangDialogues.length,
          expressions: allExpressions().length,
        })}
      </p>

      <div className="mt-5">
        <LevelFilter value={level} counts={counts} onChange={setLevel} />
      </div>

      <div className="sl-grid">
        {shown.map((dialogue) => {
          const result = results[dialogue.id];
          return (
            <button key={dialogue.id} type="button" className="sl-card" onClick={() => setOpen(dialogue)}>
              <div className="sl-card__top">
                <span className="sl-card__level">{dialogue.level}</span>
                {result && (
                  <span className="sl-card__done">
                    ✓ {result.bestCorrect}/{result.total}
                  </span>
                )}
              </div>
              <span className="sl-card__title">{ru ? dialogue.titleRu : dialogue.title}</span>
              <span className="sl-card__scene">{ru ? dialogue.sceneRu : dialogue.scene}</span>
              <span className="sl-card__meta">
                {t("slangModule.cardMeta", { count: dialogue.expressions.length })}
              </span>
            </button>
          );
        })}
      </div>
    </SectionHero>
  );
}
