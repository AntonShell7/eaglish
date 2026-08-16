/**
 * The Eaglish mark: an eagle head in profile, wrapped by three sweeping
 * feather crescents. One flat silhouette filled with `currentColor`, so a
 * placement only sets a colour — no filters, no separate light/dark asset.
 *
 * The head and the eye share a path with `fill-rule: evenodd`, which punches
 * the eye clean through the silhouette instead of overlaying a second shape.
 */
export function EagleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48 38c4-12 16-20 30-18 10 1 18 7 22 16 4 2 7 6 7 11 0 4-2 7-5 9-1-5-5-8-10-8-5 0-9 2-12 6-5 7-13 11-22 11-12 0-21-9-21-20 0-3 5-6 11-7Zm22-4 18 4-14 4-4-8Z"
      />
      <path d="M40 32c-14 10-20 26-16 42 0-16 6-30 20-40Z" />
      <path d="M44 48c-12 12-14 30-4 44-4-16 0-30 12-40Z" />
      <path d="M56 62c-12 12-12 32 4 42 12 7 26 6 34 0-12 1-24-3-32-12-8-10-10-22-6-30Z" />
    </svg>
  );
}
