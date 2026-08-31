import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import "./command-palette.css";

/**
 * ⌘K.
 *
 * Every tool people describe as a pleasure to use has one: the ability to get
 * anywhere without hunting through navigation. It costs a keystroke to learn
 * and then removes the menu entirely — and for the small share of people who
 * find it, it is the detail that makes an app feel like a professional
 * instrument rather than a website.
 *
 * Deliberately small in scope: places to go and a couple of things to switch.
 * A palette that tries to do everything becomes another menu to search.
 */
interface Command {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

export function CommandPalette() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => input.current?.focus(), 20);
  }, [open]);

  const commands: Command[] = useMemo(() => {
    const go = (path: string) => () => {
      navigate(path);
      setOpen(false);
    };

    return [
      { id: "home", label: t("nav.home"), hint: "/", run: go("/") },
      { id: "reading", label: t("nav.reading"), hint: "/reading", run: go("/reading") },
      { id: "writing", label: t("nav.writing"), hint: "/writing", run: go("/writing") },
      { id: "vocabulary", label: t("nav.vocabulary"), hint: "/vocabulary", run: go("/vocabulary") },
      { id: "everyday", label: t("nav.everydayEnglish"), hint: "/everyday-english", run: go("/everyday-english") },
      { id: "progress", label: t("nav.progress"), hint: "/progress", run: go("/progress") },
      { id: "profile", label: t("nav.profile"), hint: "/profile", run: go("/profile") },
      {
        id: "theme",
        label: t("palette.toggleTheme"),
        hint: mode,
        run: () => {
          setMode(mode === "dark" ? "light" : "dark");
          setOpen(false);
        },
      },
      {
        id: "language",
        label: t("palette.toggleLanguage"),
        hint: i18n.language.startsWith("ru") ? "RU → EN" : "EN → RU",
        run: () => {
          const next = i18n.language.startsWith("ru") ? "en" : "ru";
          void i18n.changeLanguage(next);
          localStorage.setItem("interfaceLanguage", next);
          setOpen(false);
        },
      },
    ];
  }, [navigate, t, mode, setMode, i18n]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.hint ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(1, results.length));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(1, results.length));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  };

  return (
    <>
      <div className="cmd-scrim" onClick={() => setOpen(false)} aria-hidden />
      <div className="cmd" role="dialog" aria-modal aria-label={t("palette.title")}>
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("palette.placeholder")}
          className="cmd__input"
          autoComplete="off"
          spellCheck={false}
        />

        <ul className="cmd__list">
          {results.length === 0 && <li className="cmd__empty">{t("palette.nothing")}</li>}
          {results.map((command, i) => (
            <li key={command.id}>
              <button
                type="button"
                className={`cmd__item${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={command.run}
              >
                <span>{command.label}</span>
                {command.hint && <span className="cmd__hint">{command.hint}</span>}
              </button>
            </li>
          ))}
        </ul>

        <p className="cmd__foot">
          <kbd>↑</kbd>
          <kbd>↓</kbd>
          {t("palette.toMove")}
          <kbd>↵</kbd>
          {t("palette.toOpen")}
          <kbd>esc</kbd>
          {t("palette.toClose")}
        </p>
      </div>
    </>
  );
}
