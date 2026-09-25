import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { buildSession, type Session, type SessionStep } from "@/lib/session";
import { getStreak } from "@/lib/activityStore";
import { IconFlame } from "@/components/brand/icons";
import "./today.css";

/**
 * One screen, one button.
 *
 * The question a learner opens an app with is "what now", and the old home
 * answered it with five doors and a shelf behind each. This answers it with the
 * next thing, and shows the two steps after it so the session has a visible
 * end — a plan you can see the bottom of is one people finish.
 *
 * Everything here was already in the app. The only thing removed is the
 * choosing.
 */
export default function Today() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    void buildSession().then(setSession);
  }, []);

  const go = (step: SessionStep) => {
    if (step.kind === "review") return navigate("/vocabulary?practice=1");
    if (step.kind === "use") return navigate("/writing?task=usage");
    if (step.text) {
      const path = step.kind === "dictate" ? "/dictation" : "/reading";
      return navigate(`${path}?text=${encodeURIComponent(step.text.id)}`);
    }
    navigate("/reading");
  };

  if (!session) {
    return (
      <div className="today">
        <div className="skeleton today__skeleton" />
        <div className="skeleton today__skeleton today__skeleton--sm" />
      </div>
    );
  }

  const [first, ...rest] = session.steps;
  const minutes = session.steps.reduce((sum, step) => sum + step.minutes, 0);

  if (!first) {
    return (
      <div className="today">
        <h1 className="page-title today__h">{t("today.nothingTitle")}</h1>
        <p className="today__lede">{t("today.nothingBody")}</p>
      </div>
    );
  }

  return (
    <div className="today">
      <header className="today__head">
        <p className="eyebrow">{t("today.eyebrow")}</p>
        {streak > 0 && (
          <span className="today__streak">
            <IconFlame alive />
            {t("today.streak", { count: streak })}
          </span>
        )}
      </header>

      <h1 className="page-title today__h">{t(`today.headline.${first.kind}`, { count: session.due })}</h1>
      <p className="today__lede">{t(`today.lede.${first.kind}`, { count: session.due })}</p>

      {/* The one loud thing. It never asks which section — it starts. */}
      <button type="button" className="today__go" onClick={() => go(first)}>
        <span className="today__goLabel">{t(`today.start.${first.kind}`)}</span>
        <span className="today__goMeta">{t("today.minutes", { count: first.minutes })}</span>
      </button>

      {first.text && (
        <p className="today__chosen">
          {t("today.chosen", { title: first.text.title })}
          {first.recycled ? ` · ${t("today.recycled", { count: first.recycled })}` : ""}
        </p>
      )}

      {first.words && first.words.length > 0 && (
        <p className="today__words">
          {first.words.slice(0, 6).map((word) => (
            <span key={word} className="chip">
              {word}
            </span>
          ))}
        </p>
      )}

      {rest.length > 0 && (
        <section className="today__rest">
          <p className="eyebrow">{t("today.thenTitle", { minutes })}</p>
          <ol className="today__steps">
            {rest.map((step, i) => (
              <li key={i} className="today__step">
                <span className="today__stepN tabular">{i + 2}</span>
                <span className="today__stepBody">
                  <span className="today__stepH">{t(`today.step.${step.kind}`)}</span>
                  {step.text && <span className="today__stepP">{step.text.title}</span>}
                  {step.words && <span className="today__stepP">{step.words.join(" · ")}</span>}
                </span>
                <span className="today__stepM tabular">{t("today.minutes", { count: step.minutes })}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="today__library">
        {t("today.libraryHint")}{" "}
        <button type="button" className="today__link" onClick={() => navigate("/reading")}>
          {t("today.libraryLink")}
        </button>
      </p>
    </div>
  );
}
