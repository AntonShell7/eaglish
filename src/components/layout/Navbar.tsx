import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";

const LINKS = [
  { to: "/", key: "home" },
  { to: "/reading", key: "reading" },
  { to: "/writing", key: "writing" },
  { to: "/listening", key: "listening" },
  { to: "/everyday-english", key: "everydayEnglish" },
  { to: "/vocabulary", key: "vocabulary" },
  { to: "/progress", key: "progress" },
] as const;

function linkClass(isActive: boolean) {
  return [
    "rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200",
    isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
  ].join(" ");
}

function AuthButton({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <button
        type="button"
        onClick={async () => {
          await signOut();
          onNavigate?.();
          navigate("/");
        }}
        className="rounded-full px-4 py-2 text-sm font-semibold"
        style={{ color: "var(--color-danger)" }}
      >
        {t("nav.logOut")}
      </button>
    );
  }

  return (
    <NavLink
      to="/login"
      onClick={onNavigate}
      className="rounded-full px-4 py-2 text-sm font-semibold on-primary transition-transform duration-200 hover:scale-[1.03]"
      style={{ background: "var(--color-primary)" }}
    >
      {t("nav.logIn")}
    </NavLink>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ borderColor: "var(--color-border)", background: "color-mix(in srgb, var(--color-bg) 85%, transparent)" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <NavLink to="/" className="flex items-center gap-2.5">
          <BrandLogo variant="chip" className="h-9 w-9" />
          <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {t("brand")}
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => linkClass(isActive)}>
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          <AuthButton />
        </div>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border lg:hidden"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span aria-hidden>{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t px-5 py-4 lg:hidden" style={{ borderColor: "var(--color-border)" }}>
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) => linkClass(isActive) + " w-full"}
              >
                {t(`nav.${link.key}`)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <AuthButton onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
