import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PRICES, type ProSection } from "@/lib/plans";
import { RedeemCode } from "./RedeemCode";
import "./paywall.css";

/**
 * What stands where a paid section would be.
 *
 * Written as an explanation rather than a wall. The learner clicked something
 * the navigation offered them, so the first job is to say what is behind it
 * and why it is behind anything at all — not to congratulate them on
 * discovering a limit. A paywall that opens with "Upgrade now" has skipped the
 * only sentence that could have persuaded anybody.
 *
 * It names the section, because "this feature requires a subscription" is the
 * same message on every screen and therefore no message at all. Three
 * sections, three reasons, each true about that section.
 *
 * The code field is here as well as on the pricing page, and deliberately
 * before the price rather than hidden under it: for the first weeks most
 * people arriving at this screen were *sent* a code, and making them go and
 * look for where to type it is a gratuitous detour.
 */
export function Paywall({ section }: { section: ProSection }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="pw" data-reveal>
        <p className="eyebrow">{t("pricing.paywall.eyebrow")}</p>

        <h1 className="page-title text-3xl mt-2">{t(`pricing.paywall.${section}.title`)}</h1>

        <p className="pw__lede">{t(`pricing.paywall.${section}.body`)}</p>

        <div className="pw__free">
          <p className="pw__free-h">{t("pricing.paywall.stillFree")}</p>
          <p className="pw__free-p">{t("pricing.paywall.stillFreeBody")}</p>
        </div>

        <div className="pw__actions">
          <Link to="/pricing" className="btn btn--primary btn--lg">
            {t("pricing.paywall.see", { price: PRICES.monthly })}
          </Link>
          <Link to="/reading" className="btn btn--quiet btn--lg">
            {t("pricing.paywall.toReading")}
          </Link>
        </div>

        <div className="pw__code">
          <p className="eyebrow">{t("pricing.code.haveOne")}</p>
          <RedeemCode compact />
        </div>
      </div>
    </div>
  );
}
