import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import "./landing.css";

const STEPS = ["meet", "save", "returns"] as const;
const PRINCIPLES = ["context", "honest", "short", "ownLanguage"] as const;

/**
 * What a visitor sees before signing in.
 *
 * Its whole job is to explain the method in a few lines — words are learned by
 * meeting them repeatedly, spaced repetition makes the meetings land — and then
 * get out of the way. No app chrome, no stats, nothing that only makes sense
 * once there's an account behind it.
 */
export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="lp mx-auto max-w-5xl px-5 py-8">
      <section className="lp-hero">
        <div className="lp-hero__grain" />
        <div className="lp-hero__inner">
          <div className="crest-stage lp-hero__mark fade-up">
            <BrandLogo />
          </div>

          <h1 className="lp-hero__name fade-up" style={{ animationDelay: "70ms" }}>
            {t("brand")}
          </h1>

          <p className="lp-hero__promise fade-up" style={{ animationDelay: "140ms" }}>
            {t("landing.promise")}
          </p>

          <div className="lp-hero__actions fade-up" style={{ animationDelay: "210ms" }}>
            <Link to="/register" className="lp-cta">
              {t("landing.start")}
            </Link>
            <Link to="/login" className="lp-ghost">
              {t("auth.logIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* The method */}
      <section className="lp-section">
        <p className="lp-eyebrow">{t("landing.methodEyebrow")}</p>
        <h2 className="lp-title">{t("landing.methodTitle")}</h2>
        <p className="lp-lede">{t("landing.methodLede")}</p>

        <div className="lp-steps">
          {STEPS.map((key, i) => (
            <div key={key} className="lp-step">
              <span className="lp-step__n">{i + 1}</span>
              <p className="lp-step__h">{t(`landing.steps.${key}.h`)}</p>
              <p className="lp-step__p">{t(`landing.steps.${key}.p`)}</p>
            </div>
          ))}
        </div>

        <p className="lp-steps__loop">{t("landing.loop")}</p>
      </section>

      {/* Principles */}
      <section className="lp-section">
        <p className="lp-eyebrow">{t("landing.principlesEyebrow")}</p>
        <h2 className="lp-title">{t("landing.principlesTitle")}</h2>

        <div className="lp-principles">
          {PRINCIPLES.map((key) => (
            <div key={key} className="lp-principle">
              <p className="lp-principle__h">{t(`landing.principles.${key}.h`)}</p>
              <p className="lp-principle__p">{t(`landing.principles.${key}.p`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-close">
        <h2 className="lp-close__h">{t("landing.closeTitle")}</h2>
        <div className="lp-close__actions">
          <Link to="/register" className="lp-cta">
            {t("landing.start")}
          </Link>
          <Link to="/login" className="lp-ghost">
            {t("auth.logIn")}
          </Link>
        </div>
      </section>
    </div>
  );
}
