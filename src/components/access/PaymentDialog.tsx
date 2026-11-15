import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { startCheckout, type CheckoutError } from "@/lib/checkout";
import { PRICES } from "@/lib/plans";
import "./payment-dialog.css";

// Activate a method only after its server route and merchant account are verified.
const METHODS = [
  { id: "card", mark: "▤", ready: true },
  { id: "sbp", mark: "СБП", ready: false },
  { id: "sber", mark: "Sber", ready: false },
  { id: "tpay", mark: "T", ready: false },
  { id: "foreign", mark: "◎", ready: false },
] as const;
type Method = typeof METHODS[number]["id"];

export function PaymentDialog({ cycle, signedIn, onClose }: {
  cycle: "monthly" | "yearly"; signedIn: boolean; onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const [method, setMethod] = useState<Method>("card");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);
  const selected = METHODS.find((item) => item.id === method)!;
  const amount = new Intl.NumberFormat(i18n.language, { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(PRICES[cycle]);

  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  async function pay() {
    if (inFlight.current || !selected.ready || !signedIn) return;
    inFlight.current = true;
    setPaying(true);
    setError(null);
    try {
      // Existing YooKassa checkout is preserved. Unconnected methods never call it.
      const result = await startCheckout(cycle);
      if (result.ok) {
        window.location.assign(result.url);
        return;
      }
      setError(result.error);
    } catch {
      setError("failed");
    }
    inFlight.current = false;
    setPaying(false);
  }

  return (
    <dialog ref={dialog} className="payment" aria-labelledby="payment-title" aria-describedby="payment-subtitle"
      onCancel={(event) => { event.preventDefault(); if (!inFlight.current) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget && !inFlight.current) onClose(); }}>
      <div className="payment__body">
        <header className="payment__head">
          <div><p className="payment__eyebrow">EAGLISH PRO</p><h2 id="payment-title">{t("payment.title")}</h2></div>
          <button className="payment__close" type="button" onClick={onClose} disabled={paying} aria-label={t("payment.close")} autoFocus>×</button>
        </header>
        <p id="payment-subtitle" className="payment__subtitle">{t("payment.subtitle")}</p>
        <div className="payment__summary"><div><strong>{t(`payment.${cycle}`)}</strong><span>{t("payment.oneTime")}</span></div><strong dir="ltr">{amount}</strong></div>
        <fieldset className="payment__methods" disabled={paying}>
          <legend>{t("payment.methods")}</legend>
          {METHODS.map((item) => <label key={item.id} className={`payment__method ${method === item.id ? "is-selected" : ""}`}>
            <input type="radio" name="payment-method" value={item.id} checked={method === item.id} onChange={() => { setMethod(item.id); setError(null); }} />
            <span className={`payment__mark payment__mark--${item.id}`} aria-hidden="true">{item.mark}</span>
            <span className="payment__method-copy"><strong>{t(`payment.options.${item.id}.title`)}</strong><span>{t(`payment.options.${item.id}.description`)}</span></span>
            {!item.ready && <span className="payment__soon">{t("payment.soon")}</span>}
          </label>)}
        </fieldset>
        <div className="payment__status" aria-live="polite">
          {selected.ready ? t("payment.redirect") : t("payment.pending")}
        </div>
        {error && <p className="payment__error" role="alert">{t(`pricing.pay.errors.${error}`)}</p>}
        {!signedIn && selected.ready ? <Link to="/login" className="btn btn--primary payment__submit">{t("payment.signIn")}</Link> :
          <button type="button" className="btn btn--primary payment__submit" disabled={!selected.ready || paying} onClick={pay}>
            {paying ? t("pricing.pay.going") : selected.ready ? t("payment.pay", { amount }) : t("payment.pendingButton")}
          </button>}
        <p className="payment__legal">{t("payment.termsBefore")} <Link to="/offer">{t("payment.offer")}</Link> {t("payment.termsAfter")}</p>
        <p className="payment__secure">{t("payment.secure")}</p>
      </div>
    </dialog>
  );
}
