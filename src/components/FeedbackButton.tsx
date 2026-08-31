import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { CONTACT_EMAIL } from "@/data/legal";
import "./feedback.css";

/**
 * "Something's wrong here" — the most important button of a launch to friends.
 *
 * The point of handing the app to ten people is to find out where they get
 * stuck, and that only works if reporting takes one tap at the moment it
 * happens. Anything that requires switching to a messenger gets postponed and
 * then forgotten, and the report never arrives.
 *
 * The page and the browser travel with the message, because "it didn't work"
 * without them costs a round of questions. If the database is unreachable, the
 * form falls back to an email draft rather than losing what was typed.
 */
export function FeedbackButton() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const send = async () => {
    const text = message.trim();
    if (!text) return;
    setState("sending");

    try {
      if (!supabase) throw new Error("no backend");
      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id?.startsWith("demo") ? null : (user?.id ?? null),
        message: text,
        page: pathname,
        user_agent: navigator.userAgent.slice(0, 300),
      });
      if (error) throw error;
      setState("sent");
      setMessage("");
      window.setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 1600);
    } catch {
      setState("failed");
    }
  };

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Eaglish — отчёт")}&body=${encodeURIComponent(
    `${message}\n\n---\nСтраница: ${pathname}`,
  )}`;

  return (
    <>
      <button
        type="button"
        className="fb-launch"
        onClick={() => setOpen(true)}
        aria-label={t("feedback.launch")}
        title={t("feedback.launch")}
      >
        {t("feedback.launch")}
      </button>

      {open && (
        <>
          <div className="fb-scrim" onClick={() => setOpen(false)} aria-hidden />
          <section className="fb-card" role="dialog" aria-labelledby="fb-title">
            <h2 id="fb-title" className="fb-title">
              {t("feedback.title")}
            </h2>
            <p className="fb-lede">{t("feedback.lede")}</p>

            {state === "sent" ? (
              <p className="fb-sent">{t("feedback.sent")}</p>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder={t("feedback.placeholder")}
                  className="fb-input"
                />

                {state === "failed" && (
                  <p className="fb-failed">
                    {t("feedback.failed")}{" "}
                    <a href={mailto}>{t("feedback.byEmail")}</a>
                  </p>
                )}

                <div className="fb-actions">
                  <button
                    type="button"
                    className="fb-primary"
                    onClick={send}
                    disabled={!message.trim() || state === "sending"}
                  >
                    {state === "sending" ? t("common.loading") : t("feedback.send")}
                  </button>
                  <button type="button" className="fb-ghost" onClick={() => setOpen(false)}>
                    {t("common.cancel")}
                  </button>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </>
  );
}
