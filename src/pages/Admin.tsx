import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchAdminStats,
  fetchUserDetail,
  getPinned,
  togglePinned,
  type AdminStats,
  type RosterRow,
  type UserDetail,
} from "@/lib/admin";
import { readingLibrarySize } from "@/data/readingLibrary";
import "./admin.css";

type Tab = "overview" | "people" | "texts";

/**
 * The owner's console.
 *
 * Deliberately plain: a place to read numbers, not a product surface. What it
 * is not is one long scroll — the first version stacked every figure in a
 * single feed, which made finding anything a matter of remembering how far
 * down it was. Three tabs, and a person opens on top of them.
 *
 * Everything shown here is computed on the server. The passcode is a lock on
 * the drawer, not on the building: the account check inside the edge function
 * is what keeps anyone else out, and no answer typed here can get past it.
 */
export default function Admin() {
  const { t } = useTranslation();
  const [passcode, setPasscode] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await fetchAdminStats(passcode);
    setBusy(false);
    if (result.ok) setStats(result.data);
    else setError(t(`admin.error.${result.reason}`));
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

  return (
    <div className="adm">
      <header className="adm__head">
        <h1 className="page-title text-2xl">{t("admin.title")}</h1>
        <p className="adm__stamp">{new Date(stats.generatedAt).toLocaleString()}</p>
      </header>

      <nav className="adm__tabs" role="tablist">
        {(["overview", "people", "texts"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? "adm__tab is-on" : "adm__tab"}
            onClick={() => setTab(key)}
          >
            {t(`admin.tab.${key}`)}
          </button>
        ))}
      </nav>

      {tab === "overview" && <Overview stats={stats} />}
      {tab === "people" && <People stats={stats} passcode={passcode} />}
      {tab === "texts" && <Texts stats={stats} />}
    </div>
  );
}

/* ── Overview ──────────────────────────────────────────────────────────── */

function Overview({ stats }: { stats: AdminStats }) {
  const { t } = useTranslation();
  const totalTexts = readingLibrarySize;
  /* Two thirds of the library is the earliest useful moment to start writing
     more, rather than the latest. */
  const runningOut = stats.roster.filter((r) => totalTexts > 0 && r.textsRead / totalTexts >= 0.66);
  const signups = Object.entries(stats.users.signupsByDay).sort((a, b) => a[0].localeCompare(b[0]));
  const avgMinutes = stats.users.total > 0 ? Math.round(stats.totals.minutes / stats.users.total) : 0;
  const sections = Object.entries(stats.sectionTotals).sort((a, b) => b[1] - a[1]);
  const sectionTotal = sections.reduce((sum, [, n]) => sum + n, 0);
  const quiz = stats.totals.quiz;

  return (
    <>
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

      <div className="adm__cols">
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
          <p className="adm__h">{t("admin.whereTime")}</p>
          {sectionTotal === 0 ? (
            <p className="adm__empty">{t("admin.noData")}</p>
          ) : (
            <ul className="adm__bars">
              {sections.map(([section, minutes]) => (
                <li key={section}>
                  <span className="adm__barDay">{t(`progress.section.${section}`, section)}</span>
                  <span className="adm__barTrack">
                    <span style={{ width: `${Math.round((minutes / sectionTotal) * 100)}%` }} />
                  </span>
                  <span className="adm__barN tabular">{minutes}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="adm__block">
        <p className="adm__h">{t("admin.money")}</p>
        <p className="adm__empty">{t("admin.noBilling")}</p>
        {quiz.total > 0 && (
          <p className="adm__empty" style={{ marginTop: 8 }}>
            {t("admin.quizLine", { correct: quiz.correct, total: quiz.total })}
          </p>
        )}
      </section>
    </>
  );
}

/* ── People ────────────────────────────────────────────────────────────── */

function People({ stats, passcode }: { stats: AdminStats; passcode: string }) {
  const { t } = useTranslation();
  const [pins, setPins] = useState<string[]>(getPinned);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  /* Pinned first, then by time spent. Watching a handful of students among a
     thousand strangers is the whole reason this list needs any order but
     "most active". */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? stats.roster.filter((r) => (r.email ?? r.id).toLowerCase().includes(q))
      : stats.roster;
    return [...matched].sort((a, b) => {
      const pa = pins.includes(a.id) ? 1 : 0;
      const pb = pins.includes(b.id) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return b.minutes - a.minutes;
    });
  }, [stats.roster, pins, query]);

  if (open) {
    return <Person id={open} passcode={passcode} onBack={() => setOpen(null)} />;
  }

  return (
    <section className="adm__block">
      <input
        className="field adm__search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("admin.searchPeople")}
      />

      <div className="adm__tableWrap">
        <table className="adm__table">
          <thead>
            <tr>
              <th aria-label={t("admin.pin")} />
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
            {rows.map((r) => (
              <PersonRow
                key={r.id}
                row={r}
                pinned={pins.includes(r.id)}
                onPin={() => setPins(togglePinned(r.id))}
                onOpen={() => setOpen(r.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PersonRow({
  row,
  pinned,
  onPin,
  onOpen,
}: {
  row: RosterRow;
  pinned: boolean;
  onPin: () => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  return (
    <tr className={pinned ? "is-pinned" : undefined}>
      <td className="adm__pinCell">
        <button
          type="button"
          className={pinned ? "adm__pin is-on" : "adm__pin"}
          onClick={onPin}
          title={t("admin.pin")}
          aria-label={t("admin.pin")}
        >
          ★
        </button>
      </td>
      <td>
        <button type="button" className="adm__link" onClick={onOpen}>
          {row.email ?? row.id.slice(0, 8)}
        </button>
      </td>
      <td>{row.provider ?? "—"}</td>
      <td className="num tabular">{row.minutes}</td>
      <td className="num tabular">{row.activeDays}</td>
      <td className="num tabular">{row.words}</td>
      <td className="num tabular">{row.textsRead}</td>
      <td>{row.lastSignInAt ? new Date(row.lastSignInAt).toLocaleDateString() : "—"}</td>
    </tr>
  );
}

/* ── One person ────────────────────────────────────────────────────────── */

function Person({ id, passcode, onBack }: { id: string; passcode: string; onBack: () => void }) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchUserDetail(passcode, id).then((result) => {
      if (!live) return;
      if (result.ok) setDetail(result.data);
      else setError(t(`admin.error.${result.reason}`));
    });
    return () => {
      live = false;
    };
  }, [id, passcode, t]);

  if (error) return <p className="adm__error">{error}</p>;
  if (!detail) return <p className="adm__empty">{t("common.loading")}</p>;

  const sections = Object.entries(detail.bySection).sort((a, b) => b[1] - a[1]);
  const sectionTotal = sections.reduce((sum, [, n]) => sum + n, 0);

  return (
    <section className="adm__block">
      <button type="button" className="btn btn--quiet btn--sm" onClick={onBack}>
        ← {t("admin.backToPeople")}
      </button>

      <p className="adm__personName">{detail.profile.email ?? detail.profile.id.slice(0, 8)}</p>
      <p className="adm__stamp">
        {detail.profile.provider ?? "—"}
        {detail.profile.createdAt ? ` · ${t("admin.since")} ${new Date(detail.profile.createdAt).toLocaleDateString()}` : ""}
      </p>

      <div className="adm__kpis" style={{ marginTop: 18 }}>
        <Kpi label={t("admin.colMinutes")} value={detail.totals.minutes} />
        <Kpi label={t("admin.colDays")} value={detail.totals.activeDays} />
        <Kpi label={t("admin.colWords")} value={detail.totals.words} />
        <Kpi label={t("admin.colTexts")} value={detail.totals.texts} />
      </div>

      <div className="adm__cols">
        <div className="adm__block">
          <p className="adm__h">{t("admin.whereTime")}</p>
          {sectionTotal === 0 ? (
            <p className="adm__empty">{t("admin.noData")}</p>
          ) : (
            <ul className="adm__bars">
              {sections.map(([section, minutes]) => (
                <li key={section}>
                  <span className="adm__barDay">{t(`progress.section.${section}`, section)}</span>
                  <span className="adm__barTrack">
                    <span style={{ width: `${Math.round((minutes / sectionTotal) * 100)}%` }} />
                  </span>
                  <span className="adm__barN tabular">{minutes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="adm__block">
          <p className="adm__h">{t("admin.recentDays")}</p>
          {detail.days.length === 0 ? (
            <p className="adm__empty">{t("admin.noData")}</p>
          ) : (
            <ul className="adm__list">
              {detail.days.slice(0, 12).map((d) => (
                <li key={d.day}>
                  <span>{d.day.slice(5)}</span>
                  <span className="tabular">{t("progress.minutesShort", { count: d.minutes })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="adm__cols">
        <div className="adm__block">
          <p className="adm__h">{t("admin.theirWords")}</p>
          {detail.words.length === 0 ? (
            <p className="adm__empty">{t("admin.noData")}</p>
          ) : (
            <ul className="adm__list">
              {detail.words.slice(0, 20).map((w) => (
                <li key={`${w.word}-${w.added_at}`}>
                  <span>
                    <b>{w.word}</b> — {w.translation}
                  </span>
                  <span className="tabular">{w.added_at.slice(5, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="adm__block">
          <p className="adm__h">{t("admin.theirTexts")}</p>
          {detail.reads.length === 0 ? (
            <p className="adm__empty">{t("admin.noData")}</p>
          ) : (
            <ul className="adm__list">
              {detail.reads.slice(0, 20).map((r) => (
                <li key={`${r.text_id}-${r.opened_at}`}>
                  <span>{r.text_id}</span>
                  <span className="tabular">{r.opened_at.slice(5, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Texts ─────────────────────────────────────────────────────────────── */

function Texts({ stats }: { stats: AdminStats }) {
  const { t } = useTranslation();

  return (
    <section className="adm__block">
      <p className="adm__h">{t("admin.textsTitle")}</p>
      <p className="adm__empty" style={{ marginBottom: 12 }}>
        {t("admin.textsSub", { shown: stats.texts.length, total: readingLibrarySize })}
      </p>

      {stats.texts.length === 0 ? (
        <p className="adm__empty">{t("admin.noData")}</p>
      ) : (
        <div className="adm__tableWrap">
          <table className="adm__table">
            <thead>
              <tr>
                <th>{t("admin.colText")}</th>
                <th className="num">{t("admin.colOpens")}</th>
                <th className="num">{t("admin.colReaders")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.texts.map((x) => (
                <tr key={x.textId}>
                  <td>{x.textId}</td>
                  <td className="num tabular">{x.opens}</td>
                  <td className="num tabular">{x.readers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
