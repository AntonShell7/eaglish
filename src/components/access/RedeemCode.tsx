import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccess } from "@/context/AccessContext";
import { redeemCode, type RedeemError } from "@/lib/access";

/**
 * The code field.
 *
 * This is how the first people get in. Before there is a payment provider —
 * which needs a registered business, a published offer and three days of
 * moderation — a code is the whole distribution mechanism: a line of text sent
 * to a friend that turns a free account into a full one, with no money, no
 * receipt and no legal apparatus.
 *
 * It stays useful afterwards. Codes are how you comp a teacher, run a class,
 * refund somebody without touching a card, and apologise for an outage.
 *
 * Everything is typed uppercase as it is entered, and the server strips
 * anything that is not a letter or a digit, so "eagl 2026", "EAGL-2026" and
 * "eagl2026" are one code. Nobody should be told they typed a code wrong when
 * they typed the right code with a dash in it.
 */
export function RedeemCode({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { adopt } = useAccess();

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<RedeemError | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || code.trim().length === 0) return;

    setBusy(true);
    setError(null);

    const result = await redeemCode(code);

    setBusy(false);
    if (result.ok) {
      /* Adopted rather than re-fetched: the answer is already in hand, and a
         second round trip would leave the screen briefly disagreeing with the
         message that says it worked. */
      adopt(result.access);
      setDone(true);
      setCode("");
      return;
    }
    setError(result.error);
  };

  if (done) {
    return (
      <div className="auth-sent" role="status">
        <p className="font-semibold">{t("pricing.code.done")}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t("pricing.code.doneHint")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "" : "mt-5"} noValidate>
      {!compact && <label className="eyebrow" htmlFor="access-code">{t("pricing.code.label")}</label>}

      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="access-code"
          className="field flex-1"
          style={{ minWidth: "11rem", textTransform: "uppercase" }}
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError(null);
          }}
          placeholder={t("pricing.code.placeholder")}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "access-code-error" : undefined}
          disabled={busy}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || code.trim().length === 0}>
          {busy ? t("pricing.code.checking") : t("pricing.code.submit")}
        </button>
      </div>

      {error && (
        <p id="access-code-error" className="mt-2 text-sm text-[var(--color-danger)]" role="alert">
          {t(`pricing.code.errors.${error}`)}
        </p>
      )}
    </form>
  );
}
