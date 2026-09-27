import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { fetchAdminStats, type AdminStats } from "@/lib/admin";
import "./admin.css";

/** How many texts exist, for judging whether anyone is running out of them. */
import { readingLibrarySize } from "@/data/readingLibrary";

/**
 * The owner's console.
 *
 * Deliberately plain: this is a place to read numbers, not a product surface,
 * and dressing it up would only make the figures harder to scan.
 *
 * Everything shown here is computed on the server. The passcode below is a
 * lock on the drawer, not on the building — the account check inside the edge
 * function is what actually keeps anyone else out, and no answer typed here
 * can get past it.
 */
export default function Admin() {
  const { t } = useTranslation();
  const [passcode, setPasscode] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await fetchAdminStats(passcode);
    setBusy(false);

    if (result.ok) {
      setStats(result.stats);
      return;
    }
    setError(t(`admin.error.${result.reason}`));
  };

  if (!stats) {
    return (
      <div className="adm adm--gate">
        <form className="adm__gate" onSubmit={submit}>
          <p className="adm__gateTitle">{t("admin.gateTitle")}</p>
          <input
            type="password"
            className="field"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
            autoComplete="off"
            placeholder={t("admin.passcode")}
          />
          {error && <p className="adm__error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? t("common.loading") : t("admin.enter")}
          </button>
        </form>
      </div>
    );
  }

  const totalTexts = readingLibrarySize;
  /* Anyone past two thirds of the library is about to run out of things to
     read, which is the earliest useful moment to start writing more. */
  const runningOut = stats.roster.filter((r) => totalTexts > 0 && r.textsRead / totalTexts >= 0.66);
  const signups = Object.entries(stats.users.signupsByDay).sort((a, b) => a[0].localeCompare(b[0]));
  const avgMinutes = stats.users.total > 0 ? Math.round(stats.totals.minutes / stats.users.total) : 0;

  return (
    <div className="adm">
      <header className="adm__head">
        <h1 className="page-title text-2xl">{t("admin.title")}</h1>
        <p className="adm__stamp">{new Date(stats.generatedAt).toLocaleString()}</p>
      </header>

      <div className="adm__kpis">
        <Kpi label={t("admin.users")} value={stats.users.total} />
        <Kpi label={t("admin.active7")} value={stats.users.active7} />
        <Kpi label={t("admin.active30")} value={stats.users.active30} />
        <Kpi label={t("admin.avgMinutes")} value={avgMinutes} />
        <Kpi label={t("admin.wordsTotal")} value={stats.totals.words} />
        <Kpi label={t("admin.textOpens")} value={stats.totals.textOpens} />
      </div>

      {runningOut.length > 0 && (
        <section className="adm__alert">
          <p className="adm__alertTitle">{t("admin.runningOutTitle")}</p>
          <p className="adm__alertBody">{t("admin.runningOutBody", { count: runningOut.length, total: totalTexts })}</p>
          <ul className="adm__alertList">
            {runningOut.map((r) => (
              <li key={r.id}>
                {r.email ?? r.id.slice(0, 8)} — {r.textsRead}/{totalTexts}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="adm__block">
        <p className="adm__h">{t("admin.signups")}</p>
        {signups.length === 0 ? (
          <p className="adm__empty">{t("admin.noData")}</p>
        ) : (
          <ul className="adm__bars">
            {signups.map(([day, n]) => (
              <li key={day}>
                <span className="adm__barDay">{day.slice(5)}</span>
                <span className="adm__barTrack">
                  <span style={{ width: `${Math.min(100, n * 25)}%` }} />
                </span>
                <span className="adm__barN tabular">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="adm__block">
        <p className="adm__h">{t("admin.people")}</p>
        <div className="adm__tableWrap">
          <table className="adm__table">
            <thead>
              <tr>
                <th>{t("admin.colWho")}</th>
                <th>{t("admin.colVia")}</th>
                <th className="num">{t("admin.colMinutes")}</th>
                <th className="num">{t("admin.colDays")}</th>
                <th className="num">{t("admin.colWords")}</th>
                <th className="num">{t("admin.colTexts")}</th>
                <th>{t("admin.colSeen")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.roster.map((r) => (
                <tr key={r.id}>
                  <td>{r.email ?? r.id.slice(0, 8)}</td>
                  <td>{r.provider ?? "—"}</td>
                  <td className="num tabular">{r.minutes}</td>
                  <td className="num tabular">{r.activeDays}</td>
                  <td className="num tabular">{r.words}</td>
                  <td className="num tabular">{r.textsRead}</td>
                  <td>{r.lastSignInAt ? new Date(r.lastSignInAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="adm__block">
        <p className="adm__h">{t("admin.popular")}</p>
        {stats.popular.length === 0 ? (
          <p className="adm__empty">{t("admin.noData")}</p>
        ) : (
          <ul className="adm__list">
            {stats.popular.map((p) => (
              <li key={p.textId}>
                <span>{p.textId}</span>
                <span className="tabular">{p.opens}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Stated rather than shown as zeroes: there is no billing system yet,
          and a row of noughts labelled "subscribers" reads as a measurement. */}
      <section className="adm__block">
        <p className="adm__h">{t("admin.money")}</p>
        <p className="adm__empty">{t("admin.noBilling")}</p>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="adm__kpi">
      <p className="adm__kpiN tabular">{value}</p>
      <p className="adm__kpiL">{label}</p>
    </div>
  );
}
