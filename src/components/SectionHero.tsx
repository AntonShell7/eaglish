import type { ReactNode } from "react";

interface SectionHeroProps {
  kicker: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function SectionHero({ kicker, title, description, children }: SectionHeroProps) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <section
        className="rounded-[var(--radius-lg)] border p-8 sm:p-12"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
      >
        <p
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {kicker}
        </p>
        <h1 className="page-title max-w-2xl text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>
      </section>
      {children}
    </div>
  );
}
