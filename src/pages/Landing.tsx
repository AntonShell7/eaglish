import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import "./landing.css";

const STEPS = ["meet", "save", "returns"] as const;
const PRINCIPLES = ["context", "honest", "short", "ownLanguage"] as const;

/**
 * The front page — the only screen most people will ever judge this by.
 *
 * It carries its own canvas rather than following the app's theme: near-black
 * ground, the brand mint, gold hairlines, warm white type. A front page that
 * changes its character with a toggle has no character, and this one is meant
 * to look the same to everyone who is sent the link.
 *
 * What it no longer does is boast. There was a row of counted facts under the
 * buttons — so many texts, so many topics, free — which is a promise that has
 * to be kept true forever in exchange for nothing, and a glowing blur behind
 * the mark that belonged to a different decade. Both gone. What is left is a
 * name, a sentence, and the way in.
 */
export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="lp">
      <section className="lp-hero">
        {/* The promise first, and in English.
            It names the subject before a word of explanation, which is the
            one job the top line has. */}
        <h1 className="lp-hero__title fade-up">{t("landing.heroTitle")}</h1>

        {/* Then the brand, stacked and large: the bird above its own name.
            It used to be a small horizontal lockup sitting above the
            headline, where it was neither read nor seen — too small to be a
            mark and too early to mean anything. Under the promise it has
            something to belong to, and at this size the eagle is finally
            the thing it was drawn to be. */}
        <div className="lp-lockup fade-up" style={{ animationDelay: "80ms" }}>
          <BrandLogo variant="chip" className="lp-lockup__mark" />
          <span className="lp-lockup__name">{t("brand")}</span>
        </div>

        <p className="lp-hero__sub fade-up" style={{ animationDelay: "150ms" }}>
          {t("landing.heroSub")}
        </p>

        {/* Above the fold, which it was not. The first screen ran 873px of
            logo and air and put the only button on the page below the edge
            of a laptop display — so the page asked to be scrolled before it
            had said anything worth scrolling for.

            One button, not two. "Войти" used to sit beside it and was doing
            nothing for anybody: a returning visitor already has the sign-in
            link in the bar at the top of every page, and a newcomer reading
            two options has to choose before they have decided anything. The
            page now asks for one thing. */}
        <div className="lp-actions fade-up" style={{ animationDelay: "220ms" }}>
          <Link to="/register" className="lp-btn lp-btn--go">
            {t("landing.start")}
          </Link>
        </div>

      </section>

      <section className="lp-section" data-reveal>
        <p className="lp-eyebrow">{t("landing.methodEyebrow")}</p>
        <h2 className="lp-title">{t("landing.methodTitle")}</h2>
        <p className="lp-lede">{t("landing.methodLede")}</p>

        <ol className="lp-steps" data-stagger>
          {STEPS.map((key, i) => (
            <li key={key} className="lp-step">
              <span className="lp-step__n">{String(i + 1).padStart(2, "0")}</span>
              <p className="lp-step__h">{t(`landing.steps.${key}.h`)}</p>
              <p className="lp-step__p">{t(`landing.steps.${key}.p`)}</p>
            </li>
          ))}
        </ol>

        <p className="lp-loop">{t("landing.loop")}</p>
      </section>

      <section className="lp-section" data-reveal>
        <p className="lp-eyebrow">{t("landing.principlesEyebrow")}</p>
        <h2 className="lp-title">{t("landing.principlesTitle")}</h2>

        <div className="lp-principles" data-stagger>
          {PRINCIPLES.map((key) => (
            <div key={key} className="lp-principle">
              <p className="lp-principle__h">{t(`landing.principles.${key}.h`)}</p>
              <p className="lp-principle__p">{t(`landing.principles.${key}.p`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-close" data-reveal>
        <h2 className="lp-close__h">{t("landing.closeTitle")}</h2>
        <div className="lp-actions lp-actions--center">
          <Link to="/register" className="lp-btn lp-btn--go">
            {t("landing.start")}
          </Link>
          <Link to="/login" className="lp-btn lp-btn--quiet">
            {t("auth.logIn")}
          </Link>
        </div>
      </section>
    </div>
  );
}
