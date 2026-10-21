import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchCodes,
  makeCodes,
  CODE_DURATIONS,
  durationLabel,
  fetchAdminStats,
  fetchUserDetail,
  getPinned,
  togglePinned,
  type AdminStats,
  type RosterRow,
  type UserDetail,
  type AccessCodeRow,
} from "@/lib/admin";
import { readingLibrarySize } from "@/data/readingLibrary";
import "./admin.css";

type Tab = "overview" | "audience" | "people" | "texts" | "codes";

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
        {(["overview", "audience", "people", "texts", "codes"] as Tab[]).map((key) => (
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
      {tab === "audience" && <Audience stats={stats} />}
      {tab === "people" && <People stats={stats} passcode={passcode} />}
      {tab === "texts" && <Texts stats={stats} />}
      {tab === "codes" && <Codes passcode={passcode} />}
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

/* ── Audience ──────────────────────────────────────────────────────────
   Everything onboarding asks, counted.

   The percentages have two different denominators and the screen has to say
   which is which, or it reports something false. Goal, level and daily goal
   are one answer each, so they divide by the number of people who answered
   and add up to a hundred. Interests are multiple choice: six topics, any
   number of them picked, so their counts sum past the number of people and
   each one means "this share picked it". Drawing both as slices of the same
   pie would be a lie told in a chart. */

const GOAL_COLOURS = ["#6fd3a8", "#7aa7f0", "#e5a86a", "#c58ae0", "#6fc9d3", "#9aa3b2"];

function Audience({ stats }: { stats: AdminStats }) {
  const { t } = useTranslation();
  /* The site and the edge function ship separately, and the site can get
     there first: an older function answers without this block at all. An
     empty one renders "nobody has answered yet", which is wrong for a day
     and harmless, where reading .answered off undefined is a white screen. */
  const o = stats.onboarding ?? {
    answered: 0,
    goals: {},
    interests: {},
    levels: {},
    dailyGoals: {},
    placement: { tested: 0, selfReported: 0, averagePercent: null },
  };
  const answered = o.answered;

  const goals = Object.entries(o.goals).sort((a, b) => b[1] - a[1]);
  const levels = Object.entries(o.levels).sort((a, b) => a[0].localeCompare(b[0]));
  const interests = Object.entries(o.interests).sort((a, b) => b[1] - a[1]);
  const daily = Object.entries(o.dailyGoals).sort((a, b) => Number(a[0]) - Number(b[0]));

  if (answered === 0) {
    return (
      <section className="adm__block">
        <p className="adm__h">{t("admin.audience.title")}</p>
        <p className="adm__empty">{t("admin.audience.nobody")}</p>
      </section>
    );
  }

  return (
    <>
      <div className="adm__kpis">
        <Kpi label={t("admin.audience.answered")} value={answered} />
        <Kpi label={t("admin.audience.tested")} value={o.placement.tested} />
        <Kpi label={t("admin.audience.picked")} value={o.placement.selfReported} />
        <Kpi label={t("admin.audience.avgScore")} value={o.placement.averagePercent ?? 0} />
      </div>

      <div className="adm__cols">
        <section className="adm__block">
          <p className="adm__h">{t("admin.audience.goals")}</p>
          <p className="adm__sub">{t("admin.audience.ofAnswered", { count: answered })}</p>
          <Donut
            slices={goals.map(([key, n], i) => ({
              key,
              label: t(`onboarding.goals.${key}.h`),
              value: n,
              colour: GOAL_COLOURS[i % GOAL_COLOURS.length],
            }))}
            total={answered}
          />
        </section>

        <section className="adm__block">
          <p className="adm__h">{t("admin.audience.levels")}</p>
          <p className="adm__sub">{t("admin.audience.ofAnswered", { count: answered })}</p>
          <Shares rows={levels.map(([key, n]) => ({ key, label: key, value: n }))} total={answered} />
        </section>
      </div>

      <div className="adm__cols">
        <section className="adm__block">
          <p className="adm__h">{t("admin.audience.interests")}</p>
          <p className="adm__sub">{t("admin.audience.multiple")}</p>
          <Shares
            rows={interests.map(([key, n]) => ({ key, label: t(`onboarding.topics.${key}`, key), value: n }))}
            total={answered}
          />
        </section>

        <section className="adm__block">
          <p className="adm__h">{t("admin.audience.dailyGoal")}</p>
          <p className="adm__sub">{t("admin.audience.ofAnswered", { count: answered })}</p>
          <Shares
            rows={daily.map(([key, n]) => ({
              key,
              label: t("admin.audience.tasksPerDay", { count: Number(key) }),
              value: n,
            }))}
            total={answered}
          />
        </section>
      </div>
    </>
  );
}

/** A ring, drawn as one circle with a dashed stroke per slice. */
function Donut({
  slices,
  total,
}: {
  slices: { key: string; label: string; value: number; colour: string }[];
  total: number;
}) {
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="adm__donutWrap">
      <svg viewBox="0 0 140 140" className="adm__donut" role="img">
        <circle cx="70" cy="70" r={R} className="adm__donutTrack" />
        {slices.map((s) => {
          const length = total > 0 ? (s.value / total) * C : 0;
          const dash = `${length} ${C - length}`;
          const node = (
            <circle
              key={s.key}
              cx="70"
              cy="70"
              r={R}
              stroke={s.colour}
              strokeDasharray={dash}
              /* Negative, because the stroke is drawn clockwise from three
                 o'clock and each slice has to start where the last ended. */
              strokeDashoffset={-offset}
              className="adm__donutSlice"
            />
          );
          offset += length;
          return node;
        })}
      </svg>

      <ul className="adm__legend">
        {slices.map((s) => (
          <li key={s.key}>
            <span className="adm__dot" style={{ background: s.colour }} />
            <span className="adm__legendL">{s.label}</span>
            <span className="adm__legendN tabular">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Proportional bars: the share of people, with the count beside it. */
function Shares({ rows, total }: { rows: { key: string; label: string; value: number }[]; total: number }) {
  if (rows.length === 0) return null;
  const widest = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ul className="adm__shares">
      {rows.map((r) => (
        <li key={r.key}>
          <span className="adm__shareL">{r.label}</span>
          <span className="adm__shareTrack">
            {/* Scaled against the largest row, not against the total: with
                six topics nothing reaches a third and every bar would be a
                stub. The number on the right is the real share. */}
            <span style={{ width: `${Math.round((r.value / widest) * 100)}%` }} />
          </span>
          <span className="adm__shareN tabular">
            {Math.round((r.value / total) * 100)}% · {r.value}
          </span>
        </li>
      ))}
    </ul>
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
              <th>{t("admin.colGoal")}</th>
              <th>{t("admin.colLevel")}</th>
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
      <td>{row.goal ? t(`onboarding.goals.${row.goal}.h`) : "—"}</td>
      <td className="tabular">{row.level ?? "—"}</td>
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

      {detail.learner && (
        /* Read this before the numbers underneath. Three sessions and then
           silence means one thing from somebody who came for travel English
           and another from somebody preparing for an exam in April. */
        <dl className="adm__intake">
          <div>
            <dt>{t("admin.colGoal")}</dt>
            <dd>{detail.learner.goal ? t(`onboarding.goals.${detail.learner.goal}.h`) : "—"}</dd>
          </div>
          <div>
            <dt>{t("admin.colLevel")}</dt>
            <dd>
              {detail.learner.level ?? "—"}
              {detail.learner.placement && (
                <span className="adm__intakeNote">
                  {detail.learner.placement.selfReported
                    ? ` · ${t("admin.audience.selfReported")}`
                    : ` · ${detail.learner.placement.correct}/${detail.learner.placement.total}`}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt>{t("admin.audience.interests")}</dt>
            <dd>
              {detail.learner.interests?.length
                ? detail.learner.interests.map((topic) => t(`onboarding.topics.${topic}`, topic)).join(", ")
                : "—"}
            </dd>
          </div>
          <div>
            <dt>{t("admin.audience.dailyGoal")}</dt>
            <dd>{detail.learner.dailyGoal ? t("admin.audience.tasksPerDay", { count: detail.learner.dailyGoal }) : "—"}</dd>
          </div>
        </dl>
      )}

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

/* ── Access codes ──────────────────────────────────────────────────────── */

/**
 * Making codes, and seeing which ones have been used.
 *
 * This exists because the alternative was a tunnel and a SQL prompt. Handing
 * a friend access is the single most frequent thing that will happen in the
 * weeks before payment works, and a task done twenty times on a phone cannot
 * live in psql.
 *
 * The freshly minted batch is shown apart from the list and stays on screen
 * until the tab is left: a code that scrolled away into a table of two hundred
 * is a code that has to be hunted for, and the whole point of generating one
 * is to paste it into a message in the next ten seconds.
 */
function Codes({ passcode }: { passcode: string }) {
  const { t } = useTranslation();

  const [codes, setCodes] = useState<AccessCodeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const [count, setCount] = useState(5);
  const [note, setNote] = useState("");
  /* Indexed rather than stored as a number, so "forever" (null days) is just
     another entry in the list instead of a separate piece of state that the
     number field has to be disabled for. */
  const [durationKey, setDurationKey] = useState("forever");

  const duration = CODE_DURATIONS.find((d) => d.key === durationKey) ?? CODE_DURATIONS[CODE_DURATIONS.length - 1];

  const load = async () => {
    const result = await fetchCodes(passcode);
    if (result.ok) {
      setCodes(result.data.codes);
      setError(null);
    } else {
      setError(t(`admin.error.${result.reason}`));
    }
  };

  useEffect(() => {
    void load();
    // The passcode cannot change without the whole console being re-entered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCopied(false);

    const result = await makeCodes(passcode, {
      count,
      note,
      days: duration.days,
      maxUses: 1,
    });

    setBusy(false);
    if (!result.ok) {
      setError(t(`admin.error.${result.reason}`));
      return;
    }

    setFresh(result.data.codes.map((c) => c.code));
    void load();
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(fresh.join("\n"));
      setCopied(true);
    } catch {
      /* Clipboard refused — the codes are on screen and can be selected. */
    }
  };

  return (
    <section className="adm__block">
      <form className="adm__codeForm" onSubmit={generate}>
        <p className="adm__h">{t("admin.codes.makeTitle")}</p>
        <p className="adm__codeHint">{t("admin.codes.makeHint")}</p>

        <div className="adm__codeRow">
          <label className="adm__codeField">
            <span>{t("admin.codes.count")}</span>
            <input
              type="number"
              className="field"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>

          <label className="adm__codeField adm__codeField--wide">
            <span>{t("admin.codes.note")}</span>
            <input
              type="text"
              className="field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("admin.codes.notePlaceholder")}
            />
          </label>
        </div>

        <div className="adm__codeRow">
          <label className="adm__codeField adm__codeField--wide">
            <span>{t("admin.codes.duration")}</span>
            <select
              className="field"
              value={durationKey}
              onChange={(e) => setDurationKey(e.target.value)}
            >
              {CODE_DURATIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  {t(`admin.codes.durations.${d.key}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? t("common.loading") : t("admin.codes.make")}
        </button>

        {error && <p className="adm__error">{error}</p>}
      </form>

      {fresh.length > 0 && (
        <div className="adm__fresh">
          <div className="adm__freshHead">
            <p className="adm__h">{t("admin.codes.freshTitle", { count: fresh.length })}</p>
            <button type="button" className="btn btn--sm" onClick={copyAll}>
              {copied ? t("admin.codes.copied") : t("admin.codes.copyAll")}
            </button>
          </div>
          <ul className="adm__freshList">
            {fresh.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <p className="adm__codeHint">{t("admin.codes.freshHint")}</p>
        </div>
      )}

      <p className="adm__h" style={{ marginTop: "30px" }}>{t("admin.codes.listTitle")}</p>

      {codes === null && !error && <p className="adm__codeHint">{t("common.loading")}</p>}

      {codes !== null && codes.length === 0 && <p className="adm__codeHint">{t("admin.codes.empty")}</p>}

      {codes !== null && codes.length > 0 && (
        <div className="adm__tableWrap">
          <table className="adm__table">
            <thead>
              <tr>
                <th>{t("admin.codes.colCode")}</th>
                <th>{t("admin.codes.colUsed")}</th>
                <th>{t("admin.codes.colLength")}</th>
                <th>{t("admin.codes.colNote")}</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((row) => (
                <tr key={row.code} className={row.uses >= row.max_uses ? "is-spent" : undefined}>
                  <td className="tabular">{row.code}</td>
                  <td className="num tabular">
                    {row.uses} / {row.max_uses}
                  </td>
                  <td>
                    {(() => {
                      const label = durationLabel(row.days);
                      return t(label.key, { count: label.count });
                    })()}
                  </td>
                  <td>{row.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
