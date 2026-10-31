import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  CONSENT_REOPEN,
  STORAGE_INVENTORY,
  getConsent,
  saveConsent,
} from "@/lib/consent";
import "./consent.css";

/**
 * The consent panel.
 *
 * Two states. At rest it is a single strip across the foot of the window —
 * one sentence, one button, one link — and the details view behind it carries
 * the full inventory and the one switch that exists.
 *
 * The strip replaced a card, and the card was a genuine obstacle rather than
 * an ugly one. On a phone it covered the sign-up form outright: a visitor
 * following a link to the app could not reach the email field until they had
 * dealt with a notice about localStorage. The details view still dims the
 * page, because that is a decision worth focus; the strip never does.
 *
 * The copy is the design here: most banners are vague because vagueness is
 * legally safer for companies that track people. Naming every key we write is
 * the opposite move, and it is the reason this one can afford to be small.
 */
export function ConsentSheet() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = getConsent();
    if (!stored) {
      // A beat before it appears: arriving to a modal already on screen reads as
      // an obstacle, arriving to one that slides in reads as an offer.
      const timer = window.setTimeout(() => setOpen(true), 700);
      return () => window.clearTimeout(timer);
    }
    setAnalytics(stored.analytics);
  }, []);

  useEffect(() => {
    const reopen = () => {
      const stored = getConsent();
      setAnalytics(stored?.analytics ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_REOPEN, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN, reopen);
  }, []);

  /* While the strip is up it covers the foot of the page, which on a phone is
     where the submit button of a short form sits. Marking the document lets
     the layout reserve that height instead, so the strip hides nothing — a
     notice that obscures the button it is asking you to use is the original
     problem in a smaller size. */
  useEffect(() => {
    if (!open || details) return;
    document.body.classList.add("has-consent-bar");
    return () => document.body.classList.remove("has-consent-bar");
  }, [open, details]);

  // The lesson's sticky action bar uses the strip's measured height, including
  // wrapped text and safe-area padding, rather than a fragile fixed offset.
  useEffect(() => {
    if (!open || details || !barRef.current) return;
    const bar = barRef.current;
    const measure = () => document.body.style.setProperty("--consent-bar-height", `${bar.offsetHeight}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    measure();
    return () => {
      observer.disconnect();
      document.body.style.removeProperty("--consent-bar-height");
    };
  }, [open, details]);

  // Escape closes the details view the same way the "back" button does.
  useEffect(() => {
    if (!details) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDetails(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [details]);

  if (!open) return null;

  const decide = (value: boolean) => {
    saveConsent(value);
    setOpen(false);
    setDetails(false);
  };

  /* The resting state: a strip, not a dialog. It is deliberately not
     `role="dialog"` and not modal — nothing here needs answering before the
     page can be used, and announcing it as a dialog would tell a screen
     reader the opposite. */
  if (!details) {
    return (
      <section ref={barRef} className="consent-bar" aria-label={t("consent.title")}>
        <p className="consent-bar__text">{t("consent.barText")}</p>
        <div className="consent-bar__actions">
          <button type="button" className="consent-bar__ok" onClick={() => decide(false)}>
            {t("consent.gotIt")}
          </button>
          <button type="button" className="consent-bar__more" onClick={() => setDetails(true)}>
            {t("consent.customise")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {details && <div className="consent-scrim" onClick={() => setDetails(false)} aria-hidden />}

      <section
        className="consent consent--details"
        role="dialog"
        aria-modal
        aria-labelledby="consent-title"
      >
        <div className="consent__head">
          <span className="consent__mark" aria-hidden>
            <BrandLogo variant="chip" className="h-5 w-5" />
          </span>
          <h2 id="consent-title" className="consent__title">
            {t("consent.title")}
          </h2>
        </div>

        <p className="consent__lede">{t("consent.lede")}</p>

        <div className="consent__rows">
          <div className="consent-row">
                <div className="consent-row__text">
                  <p className="consent-row__h">{t("consent.necessary.h")}</p>
                  <p className="consent-row__p">{t("consent.necessary.p")}</p>
                </div>
                <span className="consent-row__locked">{t("consent.always")}</span>
              </div>

              <div className="consent-row">
                <div className="consent-row__text">
                  <p className="consent-row__h">{t("consent.analytics.h")}</p>
                  <p className="consent-row__p">{t("consent.analytics.p")}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  aria-label={t("consent.analytics.h")}
                  className={`consent-switch${analytics ? " is-on" : ""}`}
                  onClick={() => setAnalytics((v) => !v)}
                >
                  <span className="consent-switch__dot" />
                </button>
              </div>
            </div>

            <div className="consent__inventory">
              <p className="consent__inventory-h">{t("consent.inventoryTitle")}</p>
              <ul>
                {STORAGE_INVENTORY.map((item) => (
                  <li key={item.key}>
                    <code>{item.key}</code>
                    <span>{t(`consent.purposes.${item.purpose}`)}</span>
                  </li>
                ))}
              </ul>
              <p className="consent__inventory-note">{t("consent.noThirdParty")}</p>
            </div>

        <div className="consent__actions">
          <button type="button" className="consent__primary" onClick={() => decide(analytics)}>
            {t("consent.save")}
          </button>
          <button type="button" className="consent__ghost" onClick={() => setDetails(false)}>
            {t("consent.back")}
          </button>
        </div>

        <p className="consent__foot">
          <Link to="/privacy">{t("footer.privacy")}</Link>
          <span aria-hidden>·</span>
          <Link to="/terms">{t("footer.terms")}</Link>
        </p>
      </section>
    </>
  );
}
