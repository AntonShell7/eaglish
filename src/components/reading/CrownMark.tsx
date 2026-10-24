/**
 * The crown.
 *
 * It marks at most two texts on a shelf — the ones carrying the most words
 * this reader is due to review — and it was a typographic ♛, which at this
 * size is a blob with a serif on it and inherits whatever colour it is given.
 * Drawn instead: three points, a band, and nothing else, at the one size it
 * is used. Gold, because gold is what a crown is; blue was the colour of
 * "where you got to", and the two were saying different things in one hue.
 */
export function CrownMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 20"
      width="15"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* One stroke: up to the left point, down to the dip, up to the centre,
          down again, up to the right point, and along the band. */}
      <path d="M3 5.4 L5.9 12.2 L9 6.4 L12 12.6 L15 6.4 L18.1 12.2 L21 5.4 L19.4 16.4 H4.6 Z" />
    </svg>
  );
}
