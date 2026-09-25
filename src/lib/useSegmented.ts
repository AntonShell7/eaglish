import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Measures the active item of a segmented control so the indicator can travel
 * to it.
 *
 * The position has to be measured rather than computed: the items are sized by
 * their own text, which changes with the language and with counts like
 * "Уроки · 3/16". Anything derived from an index would drift the moment a label
 * grew, and a pill sitting slightly off its button is more noticeable than no
 * pill at all.
 *
 * Re-measured on resize and whenever the label set changes, and the first
 * measurement happens after paint, so the numbers are real rather than zero.
 */
export function useSegmented(activeKey: string | number) {
  const track = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<Record<string, string>>({});

  const measure = useCallback(() => {
    const node = track.current;
    if (!node) return;

    const active = node.querySelector<HTMLElement>(".is-active");
    if (!active) {
      setStyle({});
      return;
    }

    const trackBox = node.getBoundingClientRect();
    const itemBox = active.getBoundingClientRect();
    setStyle({
      "--seg-x": `${itemBox.left - trackBox.left}px`,
      "--seg-w": `${itemBox.width}px`,
    });
  }, []);

  useEffect(() => {
    measure();

    // Fonts land after the first paint and change every width on the row.
    const onFonts = () => measure();
    void document.fonts?.ready.then(onFonts);

    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, activeKey]);

  return { ref: track, style };
}
