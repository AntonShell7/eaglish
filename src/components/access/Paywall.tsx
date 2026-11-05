import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { displayPrices, type ProSection } from "@/lib/plans";
import { RedeemCode } from "./RedeemCode";
import "./paywall.css";

export function Paywall({ section }: { section: ProSection }) {
  const { t, i18n } = useTranslation();
  const { prices, standard, format } = displayPrices(i18n.language);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="pw" data-reveal>
        <p className="eyebrow">Eaglish Pro</p>
        <h1 className="page-title text-3xl mt-2">{t(`pricing.paywall.${section}.title`)}</h1>
        <p className="pw__lede">{t(`pricing.paywall.${section}.upgradeBody`)}</p>
        <div className="pw__offer">
          <p className="pw__badge">{t("pricing.paywall.launch")}</p>
          <div className="pw__price"><del dir="ltr">{format(standard.monthly)}</del><strong dir="ltr">{format(prices.monthly)}</strong><span>{t("pricing.paywall.perMonth")}</span></div>
        </div>
        <div className="pw__actions">
          <Link to="/pricing" className="pw__buy">{t("pricing.paywall.see", { price: prices.monthly })}</Link>
          <Link to="/reading" className="pw__reading">{t("pricing.paywall.toReading")}</Link>
        </div>
        <div className="pw__code">
          <p className="eyebrow">{t("pricing.code.haveOne")}</p>
          <RedeemCode compact />
        </div>
      </div>
    </div>
  );
}
