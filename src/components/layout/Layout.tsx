import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  IconHome,
  IconBook,
  IconPen,
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
import { CookieBanner } from "@/components/CookieBanner";
import { SelectionLookup } from "@/components/lookup/SelectionLookup";
import "./shell.css";

const PRACTICE = [
  { to: "/reading", key: "reading", Icon: IconBook },
  { to: "/writing", key: "writing", Icon: IconPen },
  { to: "/listening", key: "listening", Icon: IconHeadphones },
  { to: "/everyday-english", key: "everydayEnglish", Icon: IconChat },
  { to: "/vocabulary", key: "vocabulary", Icon: IconBookmark },
] as const;

const YOU = [
  { to: "/progress", key: "progress", Icon: IconChart },
  { to: "/profile", key: "profile", Icon: IconUser },
] as const;

/** Five slots only — a tab bar with more becomes unhittable on a phone. */
const TABS = [
  { to: "/", key: "home", Icon: IconHome },
  { to: "/reading", key: "reading", Icon: IconBook },
  { to: "/writing", key: "writing", Icon: IconPen },
  { to: "/progress", key: "progress", Icon: IconChart },
  { to: "/profile", key: "profile", Icon: IconUser },
] as const;

export function Layout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  // Without this, moving between sections keeps the previous scroll offset.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <aside className="rail">
        <NavLink to="/" className="rail__brand">
          <BrandLogo variant="chip" className="h-7 w-7" />
          {t("brand")}
        </NavLink>

        <NavLink to="/" end className={({ isActive }) => `rail__link ${isActive ? "rail__link--active" : ""}`}>
          <IconHome />
          {t("nav.home")}
        </NavLink>

        <p className="rail__label">{t("shell.practice")}</p>
        <nav className="rail__group">
          {PRACTICE.map(({ to, key, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rail__link ${isActive ? "rail__link--active" : ""}`}>
              <Icon />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        <p className="rail__label">{t("shell.you")}</p>
        <nav className="rail__group">
          {YOU.map(({ to, key, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rail__link ${isActive ? "rail__link--active" : ""}`}>
              <Icon />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="rail__foot flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="topline">
          <NavLink to="/" className="topline__brand">
            <BrandLogo variant="chip" className="h-7 w-7" />
            {t("brand")}
          </NavLink>
          <StatsStrip routeKey={pathname} />
        </header>

        <main className="shell__main min-w-0 flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>

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

      <SelectionLookup />
      <CookieBanner />
    </div>
  );
}
