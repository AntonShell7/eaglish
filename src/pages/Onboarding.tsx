import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GOALS, INTERESTS, saveLearnerProfile, type Goal, type PlacementRecord } from "@/lib/learnerProfile";
import {
  TOTAL_QUESTIONS,
  estimate,
  nextItem,
  record,
  startSession,
  type PlacementSession,
  type PreparedItem,
  type ReadingLevel,
} from "@/lib/placement";
import "./onboarding.css";

const LEVELS: ReadingLevel[] = ["A1-A2", "B1-B2", "C1-C2"];
const DAILY_GOALS = [1, 3, 5];

type Step = "goal" | "interests" | "level" | "commitment" | "summary";
const STEPS: Step[] = ["goal", "interests", "level", "commitment", "summary"];

/* ── The level check ────────────────────────────────────────────────────── */

function LevelTest({
  onDone,
  onCancel,
}: {
  onDone: (level: ReadingLevel, record: PlacementRecord) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [session, setSession] = useState<PlacementSession>(startSession);
  const [item, setItem] = useState<PreparedItem | null>(() => nextItem(startSession()));
  const [finished, setFinished] = useState(false);

  const result = useMemo(() => estimate(session), [session]);
  const missed = session.answered.filter((a) => !a.correct);

  const answer = (index: number) => {
    if (!item) return;
    const next = record(session, item, index);
    setSession(next);
    const following = nextItem(next);
    setItem(following);
    if (!following) setFinished(true);
  };

  if (finished) {
    return (
      <div className="ob-card">
        <p className="ob-eyebrow">{t("onboarding.testResultEyebrow")}</p>
        <h2 className="ob-title">{t("onboarding.testResultTitle", { band: result.band })}</h2>
        <p className="ob-lede">
          {t("onboarding.testScore", { correct: result.correct, total: result.total })} ·{" "}
          {t(`onboarding.levelName.${result.level}`)}
        </p>

        {missed.length > 0 && (
          <div className="ob-review">
            <p className="ob-review__h">{t("onboarding.reviewTitle")}</p>
            {missed.map((a) => (
              <div key={a.id} className="ob-review__item">
                <p className="ob-review__q">{a.text.replace("___", `[ ${a.expected} ]`)}</p>
                <p className="ob-review__n">{a.note}</p>
              </div>
            ))}
          </div>
        )}

        <div className="ob-actions">
          <button
            type="button"
            className="ob-primary"
            onClick={() =>
              onDone(result.level, {
                band: result.band,
                correct: result.correct,
                total: result.total,
                takenAt: Date.now(),
              })
            }
          >
            {t("onboarding.acceptLevel")}
          </button>
          <button type="button" className="ob-ghost" onClick={onCancel}>
            {t("onboarding.chooseManually")}
          </button>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const asked = session.answered.length;

  return (
    <div className="ob-card">
      <p className="ob-eyebrow">{t("onboarding.question", { done: asked + 1, total: TOTAL_QUESTIONS })}</p>

      <div className="ob-bar" aria-hidden>
        <span style={{ width: `${(asked / TOTAL_QUESTIONS) * 100}%` }} />
      </div>

      <p className="ob-question">{item.text.replace("___", "______")}</p>

      <div className="ob-options">
        {item.options.map((option, i) => (
          <button key={option} type="button" className="ob-option" onClick={() => answer(i)}>
            {option}
          </button>
        ))}
      </div>

      <button type="button" className="ob-ghost ob-ghost--quiet" onClick={onCancel}>
        {t("onboarding.stopTest")}
      </button>
    </div>
  );
}

/* ── The flow ───────────────────────────────────────────────────────────── */

/**
 * Onboarding.
 *
 * Four questions, and every answer changes something the learner will see in
 * the next five minutes: the level opens the right texts, the goal reorders the
 * writing briefs, the interests reorder the reading list, and the daily goal is
 * what the streak is measured against. Anyone who doesn't know their level can
 * find out here instead of guessing — that's the one question people can't
 * answer honestly about themselves.
 */
export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [level, setLevel] = useState<ReadingLevel | null>(null);
  const [placement, setPlacement] = useState<PlacementRecord | null>(null);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [testing, setTesting] = useState(false);

  const index = STEPS.indexOf(step);
  const go = (next: Step) => setStep(next);

  const toggleInterest = (topic: string) =>
    setInterests((current) =>
      current.includes(topic) ? current.filter((x) => x !== topic) : [...current, topic],
    );

  const finish = () => {
    saveLearnerProfile({
      level: level ?? "A1-A2",
      goal: goal ?? "general",
      interests,
      dailyGoal,
      onboardedAt: Date.now(),
      placement: placement ?? undefined,
    });
    navigate("/");
  };

  return (
    <div className="ob">
      <header className="ob-top">
        <Link to="/" className="ob-brand">
          <BrandLogo variant="chip" className="h-7 w-7" />
          {t("brand")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="ob-main">
        {testing ? (
          <LevelTest
            onCancel={() => setTesting(false)}
            onDone={(detectedLevel, detectedRecord) => {
              setLevel(detectedLevel);
              setPlacement(detectedRecord);
              setTesting(false);
              go("commitment");
            }}
          />
        ) : (
          <>
            {/* Step counter, so the flow never feels endless. */}
            <ol className="ob-steps" aria-hidden>
              {STEPS.map((s, i) => (
                <li key={s} className={i <= index ? "is-done" : undefined} />
              ))}
            </ol>

            {step === "goal" && (
              <div className="ob-card">
                <p className="ob-eyebrow">{t("onboarding.welcome")}</p>
                <h2 className="ob-title">{t("onboarding.goalTitle")}</h2>
                <p className="ob-lede">{t("onboarding.goalLede")}</p>

                <div className="ob-grid">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`ob-choice${goal === g ? " is-picked" : ""}`}
                      onClick={() => {
                        setGoal(g);
                        go("interests");
                      }}
                    >
                      <span className="ob-choice__h">{t(`onboarding.goals.${g}.h`)}</span>
                      <span className="ob-choice__p">{t(`onboarding.goals.${g}.p`)}</span>
                    </button>
                  ))}
                </div>

                <Link to="/" className="ob-skip">
                  {t("onboarding.later")}
                </Link>
              </div>
            )}

            {step === "interests" && (
              <div className="ob-card">
                <p className="ob-eyebrow">{t("onboarding.step", { done: 2, total: STEPS.length })}</p>
                <h2 className="ob-title">{t("onboarding.interestsTitle")}</h2>
                <p className="ob-lede">{t("onboarding.interestsLede")}</p>

                <div className="ob-chips">
                  {INTERESTS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      className={`ob-chip${interests.includes(topic) ? " is-picked" : ""}`}
                      onClick={() => toggleInterest(topic)}
                    >
                      {t(`onboarding.topics.${topic}`)}
                    </button>
                  ))}
                </div>

                <div className="ob-actions">
                  <button type="button" className="ob-primary" onClick={() => go("level")}>
                    {t("onboarding.next")}
                  </button>
                  <button type="button" className="ob-ghost" onClick={() => go("goal")}>
                    {t("onboarding.back")}
                  </button>
                </div>
              </div>
            )}

            {step === "level" && (
              <div className="ob-card">
                <p className="ob-eyebrow">{t("onboarding.step", { done: 3, total: STEPS.length })}</p>
                <h2 className="ob-title">{t("onboarding.levelTitle")}</h2>
                <p className="ob-lede">{t("onboarding.levelLede")}</p>

                <div className="ob-grid">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={`ob-choice${level === l ? " is-picked" : ""}`}
                      onClick={() => {
                        setLevel(l);
                        setPlacement({
                          band: l === "A1-A2" ? "A2" : l === "B1-B2" ? "B1" : "C1",
                          correct: 0,
                          total: 0,
                          takenAt: Date.now(),
                          selfReported: true,
                        });
                        go("commitment");
                      }}
                    >
                      <span className="ob-choice__h">
                        {l} · {t(`onboarding.levelName.${l}`)}
                      </span>
                      <span className="ob-choice__p">{t(`onboarding.levelHint.${l}`)}</span>
                    </button>
                  ))}
                </div>

                <button type="button" className="ob-test" onClick={() => setTesting(true)}>
                  <span className="ob-test__h">{t("onboarding.testCta")}</span>
                  <span className="ob-test__p">{t("onboarding.testCtaHint")}</span>
                </button>

                <div className="ob-actions">
                  <button type="button" className="ob-ghost" onClick={() => go("interests")}>
                    {t("onboarding.back")}
                  </button>
                </div>
              </div>
            )}

            {step === "commitment" && (
              <div className="ob-card">
                <p className="ob-eyebrow">{t("onboarding.step", { done: 4, total: STEPS.length })}</p>
                <h2 className="ob-title">{t("onboarding.goalPerDayTitle")}</h2>
                <p className="ob-lede">{t("onboarding.goalPerDayLede")}</p>

                <div className="ob-grid">
                  {DAILY_GOALS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`ob-choice${dailyGoal === n ? " is-picked" : ""}`}
                      onClick={() => {
                        setDailyGoal(n);
                        go("summary");
                      }}
                    >
                      <span className="ob-choice__h">{t("onboarding.tasksPerDay", { count: n })}</span>
                      <span className="ob-choice__p">{t(`onboarding.pace.${n}`)}</span>
                    </button>
                  ))}
                </div>

                <div className="ob-actions">
                  <button type="button" className="ob-ghost" onClick={() => go("level")}>
                    {t("onboarding.back")}
                  </button>
                </div>
              </div>
            )}

            {step === "summary" && (
              <div className="ob-card">
                <p className="ob-eyebrow">{t("onboarding.planEyebrow")}</p>
                <h2 className="ob-title">{t("onboarding.planTitle")}</h2>

                <dl className="ob-plan">
                  <div>
                    <dt>{t("onboarding.planLevel")}</dt>
                    <dd>
                      {level} · {level && t(`onboarding.levelName.${level}`)}
                      {placement && !placement.selfReported && (
                        <span className="ob-plan__tag">
                          {t("onboarding.byTest", { correct: placement.correct, total: placement.total })}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("onboarding.planGoal")}</dt>
                    <dd>{goal && t(`onboarding.goals.${goal}.h`)}</dd>
                  </div>
                  <div>
                    <dt>{t("onboarding.planTopics")}</dt>
                    <dd>
                      {interests.length > 0
                        ? interests.map((x) => t(`onboarding.topics.${x}`)).join(", ")
                        : t("onboarding.planTopicsAny")}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("onboarding.planPace")}</dt>
                    <dd>{t("onboarding.tasksPerDay", { count: dailyGoal })}</dd>
                  </div>
                </dl>

                <p className="ob-note">{t("onboarding.changeLater")}</p>

                <div className="ob-actions">
                  <button type="button" className="ob-primary" onClick={finish}>
                    {t("onboarding.startLearning")}
                  </button>
                  <button type="button" className="ob-ghost" onClick={() => go("commitment")}>
                    {t("onboarding.back")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
