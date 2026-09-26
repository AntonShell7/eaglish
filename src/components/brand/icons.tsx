const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBook() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M12 6.5C10.2 5 7.5 4.6 4.5 5.2v12c3-.6 5.7-.2 7.5 1.3" />
      <path d="M12 6.5c1.8-1.5 4.5-1.9 7.5-1.3v12c-3-.6-5.7-.2-7.5 1.3" />
      <path d="M12 6.5v12" />
    </svg>
  );
}

export function IconPen() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M4 20l1.2-4.4L15.8 5a2.4 2.4 0 013.4 3.4L8.6 18.8 4 20z" />
      <path d="M14.4 6.4l3.4 3.4" />
    </svg>
  );
}

export function IconHeadphones() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M4 14v-2a8 8 0 0116 0v2" />
      <path d="M4 13.5h2.6v6H5.4A1.4 1.4 0 014 18.1v-4.6zM20 13.5h-2.6v6h1.2a1.4 1.4 0 001.4-1.4v-4.6z" />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 01-2.6-.35L4.5 20.5l1.2-3.4A6.5 6.5 0 014 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5z" />
    </svg>
  );
}

export function IconBookmark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M6.5 4h11a1.5 1.5 0 011.5 1.5V20l-7-3.4L5 20V5.5A1.5 1.5 0 016.5 4z" />
    </svg>
  );
}

export function IconHome() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4.5v-5.5h-5V20H5a1 1 0 01-1-1v-8.5z" />
    </svg>
  );
}

export function IconChart() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V6M17 20v-9" />
    </svg>
  );
}

export function IconUser() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c.7-3.6 3.7-5.6 7.2-5.6s6.5 2 7.2 5.6" />
    </svg>
  );
}

/**
 * The streak flame.
 *
 * Two shapes rather than one: the outer body and an inner core that breathes
 * on a slightly different rhythm, which is what makes a flame read as alive
 * instead of as a blinking icon. The movement is small on purpose — this sits
 * in a toolbar the learner looks at every day, and anything larger would be
 * something to switch off rather than something to earn.
 */
export function IconFlame({ alive = false }: { alive?: boolean } = {}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      stroke="none"
      className={alive ? "flame is-alive" : "flame"}
    >
      <path
        className="flame__body"
        d="M12.8 2.2c.5 2.6-.6 4-1.9 5.3-1.4 1.4-3.1 2.8-3.1 5.6a5.2 5.2 0 0010.4.3c0-2.2-1-3.6-2-4.7.2 1-.2 1.9-.9 2.3.3-2.6-.7-5.9-2.5-8.8z"
      />
      <path className="flame__core" d="M12.1 12.1c1.2 1 1.8 1.9 1.8 3a1.9 1.9 0 01-3.8 0c0-1.2.9-2.1 2-3z" />
    </svg>
  );
}

export function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none">
      <path d="M13.5 2L5 13.2h5L9.4 22 19 10.4h-5.3L13.5 2z" />
    </svg>
  );
}

export function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  );
}

/**
 * Two speech marks, for the slang module. Not a speech bubble — that already
 * belongs to Everyday English, and the two sections need to be told apart at a
 * glance in a sidebar.
 */
export function IconQuotes() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base}>
      <path d="M9.5 6.5C7 7.6 5.5 9.8 5.5 12.4v5.1h5V12h-3" />
      <path d="M18.5 6.5c-2.5 1.1-4 3.3-4 5.9v5.1h5V12h-3" />
    </svg>
  );
}
