import { useEffect, useState } from "react";

/**
 * Whether the page has moved under the header.
 *
 * A sticky bar with a permanent line under it draws that line even when there
 * is nothing behind it to separate — the page opens already looking scrolled.
 * Letting the separation appear only once it means something is a small thing
 * that makes a layout feel considered rather than assembled.
 *
 * The listener is passive and the state only changes when the answer does, so
 * scrolling costs nothing beyond a comparison.
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const read = () => {
      const now = window.scrollY > threshold;
      setScrolled((was) => (was === now ? was : now));
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, [threshold]);

  return scrolled;
}
