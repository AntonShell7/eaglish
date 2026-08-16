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
