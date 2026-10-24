/**
 * The mark on the best text for this reader today.
 *
 * At most two texts on a shelf carry it, and they are the ones holding the
 * most words this reader is due to review — meeting a word inside a sentence
 * is worth more than meeting it on a card.
 *
 * It was a crown, twice: once as a typographic ♛, which at fifteen pixels is a
 * blob with a serif on it, and once drawn as an outline, which at the same
 * size is a zigzag. A star reads as a star at any size — it is the one shape
 * that survives being small — and filled rather than hollow, because a gold
 * outline on a dark card is a thin scratch and a gold solid is a mark.
 */
export function CrownMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
    >
      <path d="M12 1.9l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.67l-6.18 3.25 1.18-6.87-5-4.87 6.91-1z" />
    </svg>
  );
}
