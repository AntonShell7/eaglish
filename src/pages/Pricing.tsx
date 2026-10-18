import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { RedeemCode } from "@/components/access/RedeemCode";
import { CONTACT_EMAIL } from "@/data/legal";
import { useSegmented } from "@/lib/useSegmented";
import { startCheckout, type CheckoutError } from "@/lib/checkout";
import { DAILY_AI_CALLS, PAYMENTS_LIVE, PLAN_FEATURES, PRICES, YEARLY_SAVING } from "@/lib/plans";
import "./pricing.css";

type Cycle = "monthly" | "yearly";

/**
 * The prices.
 *
 * Public, outside the sign-in wall, and that is not a detail: a payment
 * provider's moderator opens this page before approving anything, and a
 * learner deciding whether to register wants to know what it costs first. A
 * price behind a login is a price nobody sees.
 *
 * Two columns and no third. A middle tier exists to make the top one look
 * reasonable, which is a trick, and with one product and one person there is
 * nothing honest to put in it.
 *
 * What the page does *not* do is take money — see PAYMENTS_LIVE. Until a
 * provider is connected, it states the price and offers the code field, and
 * says plainly that payment is not open yet. A button that opens a dead
 * checkout costs more trust than an empty one.
 */
export default function Pricing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPro, expiresAt } = useAccess();

  const [cycle, setCycle] = useState<Cycle>("yearly");
  const seg = useSegmented(cycle);

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<CheckoutError | null>(null);

  /* Off to the provider. The button stays disabled for the whole trip,
     because a second click here is a second payment. */
  const pay = async () => {
    setPaying(true);
    setPayError(null);
    const result = await startCheckout(cycle);
    if (result.ok) {
      window.location.href = result.url;
      return;
    }
    setPaying(false);
    setPayError(result.error);
  };

  const price = cycle === "monthly" ? PRICES.monthly : PRICES.yearly;
  /* Per month either way, so the two cycles can be compared at a glance
     instead of in the reader's head. */
  const perMonth = cycle === "monthly" ? PRICES.monthly : Math.round(PRICES.yearly / 12);

  return (
    <div className="pr mx-auto max-w-5xl px-5 py-10">
      <header className="pr__head" data-reveal>
        <p className="eyebrow">{t("pricing.eyebrow")}</p>
        <h1 className="page-title text-4xl mt-2">{t("pricing.title")}</h1>
        <p className="pr__lede">{t("pricing.lede")}</p>
      </header>

      {/* Already paid: the page becomes a receipt rather than an ad. */}
      {isPro && (
        <div className="pr__have" role="status" data-reveal>
          <p className="pr__have-h">{t("pricing.have.title")}</p>
          <p className="pr__have-p">
            {expiresAt
              ? t("pricing.have.until", {
                  date: new Date(expiresAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })
              : t("pricing.have.forever")}
          </p>
        </div>
      )}

      <div className="pr__cycle" data-reveal>
        <div ref={seg.ref} style={seg.style} className="segmented" role="tablist" aria-label={t("pricing.cycleLabel")}>
          {(["monthly", "yearly"] as const).map((value) => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={cycle === value}
              className={`segmented__item ${cycle === value ? "is-active" : ""}`}
              onClick={() => setCycle(value)}
            >
              {t(`pricing.cycle.${value}`)}
            </button>
          ))}
        </div>
        {cycle === "yearly" && <span className="chip chip--success">{t("pricing.saving", { amount: YEARLY_SAVING })}</span>}
      </div>

      <div className="pr__grid" data-stagger>
        {/* Free, first. It is a real plan and the one most readers will be on,
            and putting it second reads as an afterthought. */}
        <section className="pr__card">
          <p className="pr__name">{t("pricing.plans.free.name")}</p>
          <p className="pr__price">
            <span className="pr__amount">0</span> <span className="pr__unit">₽</span>
          </p>
          <p className="pr__note">{t("pricing.plans.free.note")}</p>

          <ul className="pr__list">
            {PLAN_FEATURES.free.map((key) => (
              <li key={key}>{t(`pricing.features.${key}`, DAILY_AI_CALLS)}</li>
            ))}
          </ul>

          <div className="pr__foot">
            {user ? (
              <span className="pr__current">{t("pricing.plans.free.current")}</span>
            ) : (
              <Link to="/register" className="btn btn--quiet btn--lg w-full justify-center">
                {t("pricing.plans.free.cta")}
              </Link>
            )}
          </div>
        </section>

        <section className="pr__card pr__card--pro">
          <p className="pr__name">{t("pricing.plans.pro.name")}</p>

          <p className="pr__price">
            <span className="pr__amount tabular">{price.toLocaleString("ru-RU")}</span>{" "}
            <span className="pr__unit">₽ {t(`pricing.per.${cycle}`)}</span>
          </p>
          <p className="pr__note">
            {cycle === "yearly"
              ? t("pricing.plans.pro.perMonth", { amount: perMonth })
              : t("pricing.plans.pro.note")}
          </p>

          <ul className="pr__list pr__list--pro">
            {PLAN_FEATURES.pro.map((key) => (
              <li key={key}>{t(`pricing.features.${key}`, DAILY_AI_CALLS)}</li>
            ))}
          </ul>

          <div className="pr__foot">
            {isPro ? (
              <span className="pr__current">{t("pricing.plans.pro.current")}</span>
            ) : PAYMENTS_LIVE ? (
              <>
                {user ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--lg w-full justify-center"
                    onClick={pay}
                    disabled={paying}
                  >
                    {paying ? t("pricing.pay.going") : t("pricing.plans.pro.cta")}
                  </button>
                ) : (
                  /* A payment attaches to an account, so there has to be one
                     first. Sent to register rather than refused at the
                     provider's page, which is where this otherwise fails. */
                  <Link to="/register" className="btn btn--primary btn--lg w-full justify-center">
                    {t("pricing.pay.needAccount")}
                  </Link>
                )}
                {payError && (
                  <p className="mt-2 text-sm text-[var(--color-danger)]" role="alert">
                    {t(`pricing.pay.errors.${payError}`)}
                  </p>
                )}
              </>
            ) : (
              <div className="pr__soon">
                <p className="pr__soon-h">{t("pricing.soon.title")}</p>
                <p className="pr__soon-p">
                  {t("pricing.soon.body")}{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* The code field. Signed out, it is an explanation and a sign-in link:
          a code is attached to an account, so there is nothing to attach it to
          yet. */}
      {!isPro && (
        <section className="pr__codeblock" data-reveal>
          <p className="eyebrow">{t("pricing.code.haveOne")}</p>
          {user ? (
            <RedeemCode />
          ) : (
            <p className="pr__codehint">
              {t("pricing.code.signInFirst")}{" "}
              <Link to="/login" className="underline">
                {t("auth.logIn")}
              </Link>
            </p>
          )}
        </section>
      )}

      <footer className="pr__legal" data-reveal>
        <p>{t("pricing.legal")}</p>
        <p className="mt-2">
          <Link to="/terms" className="underline">
            {t("footer.terms")}
          </Link>
          {" · "}
          <Link to="/privacy" className="underline">
            {t("footer.privacy")}
          </Link>
        </p>
      </footer>
    </div>
  );
}
