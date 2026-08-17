import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { completeTask, getDailyGoal, getTodayCount, type ActivityKind } from "@/lib/activityStore";
import { XP_PER_ACTIVITY } from "@/lib/gamification";
import "./task-done.css";

interface Toast {
  title: string;
  xp: number;
  done: number;
  goal: number;
  goalJustReached: boolean;
}

interface TaskDoneApi {
  /**
   * Marks a task finished and celebrates it. Returns false when it was already
   * finished today, so callers can tell a first pass from a repeat.
   */
  finish: (kind: ActivityKind, taskId: string, title: string) => boolean;
}

const TaskDoneContext = createContext<TaskDoneApi | null>(null);

const VISIBLE_MS = 5000;

/**
 * The one place that turns finished work into a reward.
 *
 * Progress used to move whenever a page mounted, which meant clicking around
 * the app looked like studying. Now every increment comes through here, from a
 * task that actually ended — and the user is told the moment it lands, because
 * a counter that goes up silently teaches nothing about what earned it.
 */
export function TaskDoneProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const finish = useCallback((kind: ActivityKind, taskId: string, title: string) => {
    const goal = getDailyGoal();
    const before = getTodayCount();
    const isNew = completeTask(kind, taskId);
    if (!isNew) return false;

    const done = getTodayCount();
    setToast({
      title,
      xp: XP_PER_ACTIVITY[kind] ?? 0,
      done,
      goal,
      goalJustReached: before < goal && done >= goal,
    });

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), VISIBLE_MS);
    return true;
  }, []);

  return (
    <TaskDoneContext.Provider value={{ finish }}>
      {children}

      {toast && (
        <div
          className={`taskdone${toast.goalJustReached ? " taskdone--goal" : ""}`}
          role="status"
          aria-live="polite"
        >
          <span className="taskdone__tick" aria-hidden>
            {toast.goalJustReached ? "★" : "✓"}
          </span>

          <div className="taskdone__body">
            <p className="taskdone__h">
              {toast.goalJustReached ? t("tasks.goalReachedTitle") : toast.title}
            </p>
            <p className="taskdone__p">
              {toast.goalJustReached
                ? t("tasks.goalReachedBody", { count: toast.done })
                : t("tasks.progress", { done: toast.done, target: toast.goal })}
              {toast.xp > 0 && ` · +${toast.xp} XP`}
            </p>
          </div>

          <button
            type="button"
            className="taskdone__close"
            onClick={() => setToast(null)}
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>
      )}
    </TaskDoneContext.Provider>
  );
}

export function useTaskDone(): TaskDoneApi {
  const ctx = useContext(TaskDoneContext);
  if (!ctx) throw new Error("useTaskDone must be used inside <TaskDoneProvider>");
  return ctx;
}
