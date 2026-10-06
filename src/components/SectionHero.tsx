import type { CSSProperties, ReactNode } from "react";

interface SectionHeroProps {
  /**
   * The small line above the title. Optional, because on some pages it can
   * only repeat the title — and a heading printed twice reads as a mistake,
   * not as emphasis.
   */
  kicker?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

/**
 * The header every section opens with.
 *
 * It used to be a large card with three lines of text in it, which pushed the
 * actual content below the fold and made every page begin with an empty box.
 * A page title is not an object on the page — it is the page — so it now sits
 * directly on the ground, the way editorial layouts and every serious product
 * UI handle it. Cards are reserved for things you can act on.
 */
export function SectionHero({ kicker, title, description, children }: SectionHeroProps) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header>
        {kicker && <p className="eyebrow">{kicker}</p>}
        {/* Sized through the token rather than a utility class, so it keeps
            the clamp that stops long Russian headings running off a phone,
            and so every section opens at the same size as home. */}
        <h1
          className={`page-title max-w-2xl${kicker ? " mt-2" : ""}`}
          style={{ "--page-title-size": "3.1rem" } as CSSProperties}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>
      </header>
      {children}
    </div>
  );
}
