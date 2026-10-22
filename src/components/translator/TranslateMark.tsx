/**
 * The translate mark.
 *
 * The button used to read "A я", which is clear to a Russian speaker reading
 * carefully and invisible to anybody scanning: two letters at tab-bar size are
 * a smudge, and the pair sat badly beside the other round controls in the
 * corner. Every translator a person has already used wears the same sign — a
 * CJK character beside a Latin A — so the button wears it too. It is drawn
 * here rather than loaded, at the only size it is used, with strokes heavy
 * enough to survive at twenty pixels.
 *
 * Drawn, not copied: the convention is the arrangement, not any one company's
 * artwork.
 */
export function TranslateMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* 文, upper left: the short stroke above, the bar, and the two
          falling strokes that cross under it. */}
      <path d="M6.6 2.6v1.4" />
      <path d="M2.4 5.6h8.4" />
      <path d="M9.3 5.6c-.7 3.3-2.6 5.6-5.6 7.1" />
      <path d="M4.6 8.2c1.3 2.2 2.9 3.7 4.9 4.6" />
      {/* A, lower right, with its crossbar. */}
      <path d="M13.2 21.4 17.4 11l4.2 10.4" />
      <path d="M14.7 17.8h5.4" />
    </svg>
  );
}
