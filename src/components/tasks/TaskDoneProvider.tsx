import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { completeTask, type ActivityKind } from "@/lib/activityStore";
import { getDueWords } from "@/lib/vocabularyStore";
import "./task-done.css";

interface Toast {
  title: string;
  left: number;
  cleared: boolean;
}

interface TaskDoneApi {
  /**
   * Marks a task finished and celebrates it. Returns false when it was already
   * finished today, so callers can tell a first pass from a repeat.
   */
  finish: (kind: ActivityKind, taskId: string, title: string, announce?: boolean) => boolean;
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

  /*
   * `announce: false` records the task without the toast.
   *
   * For callers that are about to show the same news themselves. The review
   * session ends on a summary screen, and a toast in the corner repeating it
   * is the same sentence twice — which reads as a bug rather than as
   * emphasis, and trains people to dismiss the toast without reading it.
   */
  const finish = useCallback((kind: ActivityKind, taskId: string, title: string, announce = true) => {
    const isNew = completeTask(kind, taskId);
    if (!isNew) return false;

    // What is left to do, rather than points awarded for having done it.
    const left = getDueWords().length;

    /* "The queue is clear" belongs to the activity that clears it.
       It used to be announced after *any* finished task whenever the due
       count happened to be zero — so somebody with an empty vocabulary, who
       had never reviewed anything, finished a reading quiz and was
       congratulated on having reviewed every word they own. The praise was
       for work that did not exist, which is the fastest way to make every
       other message in the app worth ignoring. */
    const cleared = kind === "vocabulary" && left === 0;
    if (!announce) return true;

    setToast({ title, left, cleared });

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), VISIBLE_MS);
    return true;
  }, []);

  return (
    <TaskDoneContext.Provider value={{ finish }}>
      {children}

      {toast && (
        <div
          className={`taskdone${toast.cleared ? " taskdone--goal" : ""}`}
          role="status"
          aria-live="polite"
        >
          <span className="taskdone__tick" aria-hidden>
            {toast.cleared ? "★" : "✓"}
          </span>

          <div className="taskdone__body">
            <p className="taskdone__h">
              {toast.cleared ? t("tasks.queueClearTitle") : toast.title}
            </p>
            <p className="taskdone__p">
              {toast.cleared ? t("tasks.queueClearBody") : t("tasks.left", { count: toast.left })}
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
