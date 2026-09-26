import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  IconHome,
  IconBook,
  IconHeadphones,
  IconChat,
  IconBookmark,
  IconChart,
  IconUser,
} from "@/components/brand/icons";
import { StatsStrip } from "./StatsStrip";
import { Footer } from "./Footer";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { ConsentSheet } from "@/components/consent/ConsentSheet";
import { FeedbackButton } from "@/components/FeedbackButton";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useReveal } from "@/lib/useReveal";
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
  { to: "/everyday-english", key: "slang", Icon: IconChat },
] as const;

const WORDS = [{ to: "/vocabulary", key: "vocabulary", Icon: IconBookmark }] as const;

const YOU = [
  { to: "/progress", key: "progress", Icon: IconChart },
  { to: "/profile", key: "profile", Icon: IconUser },
] as const;

/* Five slots only — a tab bar with more becomes unhittable on a phone, so
   adding dictation had to cost something. Progress is the one that leaves:
   the dashboard already opens on a summary of it and links straight through,
   while the practice sections have nowhere else to be reached from in one tap. */
const TABS = [
  { to: "/", key: "home", Icon: IconHome },
  { to: "/reading", key: "reading", Icon: IconBook },
  { to: "/dictation", key: "dictation", Icon: IconHeadphones },
  { to: "/vocabulary", key: "vocabulary", Icon: IconBookmark },
  { to: "/profile", key: "profile", Icon: IconUser },
] as const;

export function Layout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user, demo } = useAuth();
  const scrolled = useScrolled();

  // Without this, moving between sections keeps the previous scroll offset.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Re-scan on every navigation: the next page's sections are new nodes.
  useReveal([pathname]);

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
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="rounded-full px-3 py-1.5 text-sm font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                {t("auth.logIn")}
              </NavLink>
              <NavLink
                to="/register"
                className="btn btn--primary"
              >
                {t("landing.start")}
              </NavLink>
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
            </NavLink>
          ))}
        </nav>
      )}

      <SelectionLookup />
      <ConsentSheet />
      <FeedbackButton />
      <CommandPalette />
    </div>
  );
}
