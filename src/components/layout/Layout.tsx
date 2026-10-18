import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  IconHome,
  IconBook,
  IconHeadphones,
  IconQuotes,
  IconBookmark,
  IconPen,
  IconChart,
  IconMore,
  IconUser,
} from "@/components/brand/icons";
import { StatsStrip } from "./StatsStrip";
import { Footer } from "./Footer";
import { Translator } from "@/components/translator/Translator";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { ConsentSheet } from "@/components/consent/ConsentSheet";
import { FeedbackButton } from "@/components/FeedbackButton";
import { sectionFor, startClock } from "@/lib/timeStore";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useReveal } from "@/lib/useReveal";
import { useAccess } from "@/context/AccessContext";
import { sectionOf } from "@/lib/plans";
import { useScrolled } from "@/lib/useScrolled";
import { SelectionLookup } from "@/components/lookup/SelectionLookup";
import { TaskDoneProvider } from "@/components/tasks/TaskDoneProvider";
import "./shell.css";

/*
 * Practice is where English comes in; the vocabulary is where it is kept.
 *
 * The active vocabulary used to sit here as a fifth kind of practice, which
 * was wrong twice: it is not a way of meeting words but a way of proving you
 * have them, and separating it from the collection it draws on meant two
 * places for one subject. It is an entrance inside the vocabulary now.
 */
const PRACTICE = [
  { to: "/reading", key: "reading", Icon: IconBook },
  { to: "/dictation", key: "dictation", Icon: IconHeadphones },
  { to: "/slang", key: "slang", Icon: IconQuotes },
] as const;

/*
 * Words: the collection, and the drill that proves you have them.
 *
 * "Use your words" lives here rather than under practice — it is not a way of
 * meeting words but a way of showing you hold them — but it had no entry in
 * the navigation at all, reachable only through a tab inside the vocabulary.
 * A whole section with no door in the rail is a section nobody finds.
 */
const WORDS = [
  { to: "/vocabulary", key: "vocabulary", Icon: IconBookmark },
  { to: "/writing", key: "writing", Icon: IconPen },
] as const;

const YOU = [
  { to: "/progress", key: "progress", Icon: IconChart },
  { to: "/profile", key: "profile", Icon: IconUser },
] as const;

/*
 * Five slots, and the fifth is a door rather than a destination.
 *
 * A phone bar with more than five targets stops being hittable, and the app
 * has seven places to go. Spending the last slot on Profile meant three
 * sections — Real English, Use your words, Progress — could not be reached
 * from a phone at all without going via the dashboard. "More" costs one tap
 * and reaches all of them, which is cheaper than a section being invisible.
 *
 * The label for dictation is the short one here: "Английский на слух" wraps
 * to two lines in a 75px column and pushes the bar out of shape.
 */
const TABS = [
  { to: "/", key: "home", Icon: IconHome },
  { to: "/reading", key: "reading", Icon: IconBook },
  { to: "/dictation", key: "dictationShort", Icon: IconHeadphones },
  { to: "/vocabulary", key: "vocabulary", Icon: IconBookmark },
] as const;

/** What sits behind "More". */
const MORE = [
  { to: "/slang", key: "slang", Icon: IconQuotes },
  { to: "/writing", key: "writing", Icon: IconPen },
  { to: "/progress", key: "progress", Icon: IconChart },
  { to: "/profile", key: "profile", Icon: IconUser },
] as const;

export function Layout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user, demo } = useAuth();
  const { isPro } = useAccess();
  const scrolled = useScrolled();

  /* A dot next to the sections a free account cannot open yet.
     Clicking one is not an error — it reaches a screen explaining what is
     there and what it costs — but finding that out by clicking is a worse
     experience than being told beforehand, and this is the cheapest possible
     way to tell. Nothing is shown to someone who has paid. */
  const locked = (to: string) => !isPro && sectionOf(to) !== null;
  const [more, setMore] = useState(false);

  /* The sheet belongs to the page it was opened on. Leaving that page with it
     still up would reopen it over the destination. */
  useEffect(() => setMore(false), [pathname]);

  // Without this, moving between sections keeps the previous scroll offset.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Re-scan on every navigation: the next page's sections are new nodes.
  useReveal([pathname]);

  /* The clock runs for the whole signed-in session rather than per page, and
     reads the route at each tick — so walking from reading to the vocabulary
     splits the time correctly without restarting anything. */
  const here = useRef(pathname);
  here.current = pathname;
  useEffect(() => {
    if (!user) return;
    return startClock(() => sectionFor(here.current));
  }, [user]);

  return (
    <div className={user ? "shell" : "shell shell--guest"}>
      <aside className="rail">
        <NavLink to="/" className="rail__brand">
          <BrandLogo variant="chip" className="h-7 w-7" />
          {t("brand")}
        </NavLink>

        {user ? (
          <>
            <NavLink to="/" end className={({ isActive }) => `rail__link ${isActive ? "rail__link--active" : ""}`}>
              <IconHome />
              {t("nav.home")}
            </NavLink>

            <p className="rail__label">{t("shell.practice")}</p>
            <nav className="rail__group">
              {PRACTICE.map(({ to, key, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `rail__link ${isActive ? "rail__link--active" : ""}`}
                >
                  <Icon />
                  {t(`nav.${key}`)}
                  {locked(to) && <span className="rail__lock" aria-hidden="true" />}
                </NavLink>
              ))}
            </nav>

            <p className="rail__label">{t("shell.words")}</p>
            <nav className="rail__group">
              {WORDS.map(({ to, key, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `rail__link ${isActive ? "rail__link--active" : ""}`}
                >
                  <Icon />
                  {t(`nav.${key}`)}
                  {locked(to) && <span className="rail__lock" aria-hidden="true" />}
                </NavLink>
              ))}
            </nav>

            <p className="rail__label">{t("shell.you")}</p>
            <nav className="rail__group">
              {YOU.map(({ to, key, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `rail__link ${isActive ? "rail__link--active" : ""}`}
                >
                  <Icon />
                  {t(`nav.${key}`)}
                  {locked(to) && <span className="rail__lock" aria-hidden="true" />}
                </NavLink>
              ))}
            </nav>
          </>
        ) : (
          // A visitor gets the pitch and a way in — the section list would only
          // advertise doors that lead nowhere useful without an account.
          <nav className="rail__group mt-2">
            <NavLink to="/register" className="rail__link">
              {t("auth.createAccount")}
            </NavLink>
            <NavLink to="/login" className="rail__link">
              {t("auth.logIn")}
            </NavLink>
          </nav>
        )}

        <div className="rail__foot flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className={scrolled ? "topline is-scrolled" : "topline"}>
          <NavLink to="/" className="topline__brand">
            <BrandLogo variant="chip" className="h-7 w-7" />
            {t("brand")}
          </NavLink>

          {user ? (
            <span className="flex items-center gap-2">
              {demo && (
                <span className="chip" title={t("shell.demoMode")}>
                  demo
                </span>
              )}
              <StatsStrip routeKey={pathname} />
            </span>
          ) : (
            <div className="topline__guest">
              <NavLink to="/register" className="guest-btn guest-btn--go">
                {t("landing.start")}
              </NavLink>
              <NavLink to="/login" className="guest-btn guest-btn--quiet">
                {t("auth.logIn")}
              </NavLink>
              <span className="topline__sep" aria-hidden />
              <LanguageToggle />
            </div>
          )}
        </header>

        <main className="shell__main min-w-0 flex-1">
          <TaskDoneProvider>
            {/* Keyed by route so each page arrives with the same short rise
                instead of snapping into place. */}
            <div key={pathname} className="page-enter">
              <Outlet />
            </div>
          </TaskDoneProvider>
        </main>

        <Footer />

        {/* Present on every page of the signed-in app. The moment a learner
            needs a word is the moment they are halfway through writing a
            sentence, and leaving for a translator is how that sentence gets
            abandoned. */}
        <Translator />
      </div>

      {user && (
        <nav className="tabbar" aria-label={t("shell.practice")}>
          {TABS.map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `tabbar__link ${isActive ? "tabbar__link--active" : ""}`}
            >
              <Icon />
              {t(`nav.${key}`)}
              {locked(to) && <span className="tabbar__lock" aria-hidden="true" />}
            </NavLink>
          ))}

          <button
            type="button"
            className={`tabbar__link ${more ? "tabbar__link--active" : ""}`}
            aria-expanded={more}
            onClick={() => setMore((v) => !v)}
          >
            <IconMore />
            {t("nav.more")}
          </button>
        </nav>
      )}

      {/* The rest of the app, one tap from the bar. It closes on choosing
          something, and on tapping away — a sheet that only closes by its own
          button is a sheet people get stuck in. */}
      {user && more && (
        <>
          <div className="moresheet__scrim" onClick={() => setMore(false)} aria-hidden />
          <div className="moresheet" role="dialog" aria-label={t("nav.moreTitle")}>
            <p className="moresheet__h">{t("nav.moreTitle")}</p>
            {MORE.map(({ to, key, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `moresheet__link ${isActive ? "is-active" : ""}`}
                onClick={() => setMore(false)}
              >
                <Icon />
                {t(`nav.${key}`)}
                {locked(to) && <span className="moresheet__lock" aria-hidden="true" />}
              </NavLink>
            ))}
          </div>
        </>
      )}

      <SelectionLookup />
      <ConsentSheet />
      {/* A visitor has nothing to report yet, and a support tag floating over
          the front page is the wrong first impression. */}
      {user && <FeedbackButton />}
      <CommandPalette />
    </div>
  );
}
