import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchVisits, type VisitReport } from "@/lib/admin";

const periods = ["night", "today", "24h", "week", "month"] as const;

export function VisitStatistics({ passcode, refreshed }: { passcode: string; refreshed: string }) {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<string>("24h");
  const [data, setData] = useState<VisitReport | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    fetchVisits(passcode, period).then(result => {
      if (!active) return;
      if (result.ok) setData(result.data);
      else setError(result.reason);
    }).catch(() => { if (active) setError("offline"); });
    return () => { active = false; };
  }, [period, passcode, refreshed]);
  const label = (key: string) => t("visitStats." + key);
  const date = (at: string, full = false) => new Date(at).toLocaleString(i18n.language, {
    timeZone: "Europe/Moscow", ...(full || ["week","month"].includes(period) ? { day: "numeric", month: "short" } : {}),
    ...(full || !["week","month"].includes(period) ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
  const percent = (n: number, total: number) => total ? (n / total).toLocaleString(i18n.language, {style:"percent", maximumFractionDigits:1}) : "—";
  return <section className="visit-stats">
    <h2>{t("admin.tab.visits")}</h2>
    <div className="visit-periods">{periods.map(p => <button className="adm__tab" type="button" key={p}
      aria-pressed={period === p} onClick={() => setPeriod(p)}>{label(p)}</button>)}</div>
    {error ? <p role="alert">{t("admin.error." + error)}</p> : !data ? <p role="status">{t("common.loading")}</p> : <>
      <p>{date(data.start,true)} — {date(data.end,true)} · {label("zone")}</p>
      <div className="visit-kpis">{(["opens","visitors","signups","lessons"] as const).map(k =>
        <article key={k}><strong>{data[k].toLocaleString(i18n.language)}</strong>{label(k)}</article>)}</div>
      <article><h3>{label("timeline")}</h3>
        <div className="visit-bars">{data.buckets.map(b => <div key={b.at} tabIndex={0}
          aria-label={date(b.at,true) + " · " + b.n} data-hint={date(b.at) + " · " + b.n}>
          <i style={{height: (b.n / Math.max(1,...data.buckets.map(x => x.n)) * 100) + "%"}} />
        </div>)}</div>
        <div className="visit-axis"><span>{data.buckets[0] && date(data.buckets[0].at)}</span><span>{date(data.end)}</span></div>
      </article>
      <article><h3>{label("funnel")}</h3>{(["visitors","signups","lessons"] as const).map(k =>
        <div className="visit-row" key={k}><span>{label(k)}</span><b>{data[k]} · {percent(data[k],data.visitors)}</b>
        <progress value={data[k]} max={data.visitors || 1}/></div>)}
        <p>{label("afterSignup")} {percent(data.lessons,data.signups)}</p>
      </article>
      <article><h3>{label("sources")}</h3>{data.sources.length ? data.sources.map(s =>
        <div key={s.source} className="visit-row"><span>{s.source || label("direct")}</span><b>{s.n} · {percent(s.n,data.opens)}</b>
        <progress value={s.n} max={data.opens || 1}/></div>) : <p>{label("empty")}</p>}</article>
      <p>{label("method")}</p>
    </>}
  </section>;
}
