import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { IconFlame } from "@/components/brand/icons";
import { ACTIVITY_EVENT, getStreakState } from "@/lib/activityStore";
import { MAX_FREEZES, REFILL_DAYS } from "@/lib/streak";
import { whenSynced } from "@/lib/sync";

/** One quiet status control, with freeze details available on tap. */
export function StatsStrip({ routeKey }: { routeKey: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [state, setState] = useState(getStreakState);
  const details = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let active = true;
    const read = () => { if (active) setState(getStreakState()); };
    read();
    void whenSynced().then(read);
    if (details.current) details.current.open = false;
    window.addEventListener(ACTIVITY_EVENT, read);
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    document.addEventListener("visibilitychange", read);
    // Refresh at the user's local midnight, including DST changes.
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(() => { read(); schedule(); }, midnight.getTime() - now.getTime() + 100);
    };
    schedule();
    const outside = (event: PointerEvent) => {
      if (details.current && event.target instanceof Node && !details.current.contains(event.target)) details.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener(ACTIVITY_EVENT, read);
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", read);
      document.removeEventListener("pointerdown", outside);
    };
  }, [routeKey, user?.id]);

  const label = t("streak.days", { count: state.current });
  return (
    <details ref={details} className="streak-control" onKeyDown={event => {
      if (event.key === "Escape" && details.current?.open) {
        details.current.open = false;
        details.current.querySelector("summary")?.focus();
      }
    }} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }}>
      <summary className={`streak-chip${state.current > 0 ? " streak-chip--active" : ""}`} aria-label={label} title={label}>
        <IconFlame alive={state.current > 0} /><span>{state.current}</span>
      </summary>
      <div className="streak-popover">
        <strong>{label}</strong>
        <p>{t(state.practicedToday ? "streak.todayDone" : "streak.todayPending")}</p>
        <div className="streak-freezes"><span aria-hidden="true">❄</span><b>{t("streak.freezes", { count: state.freezes, max: MAX_FREEZES })}</b></div>
        <p>{t("streak.rules", { days: REFILL_DAYS, max: MAX_FREEZES })}</p>
      </div>
    </details>
  );
}
