import { useEffect, useRef, useState } from "react";

/**
 * Counts a number up to its target on first paint.
 *
 * Numbers that simply appear are read as decoration; numbers that climb are
 * read as *yours*. It is a two-hundred-millisecond difference in code and a
 * large one in how a progress screen feels — so long as it stays short enough
 * never to delay the actual information.
 */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || target === 0) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease out: fast at first, settling into the final number.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  return value;
}
