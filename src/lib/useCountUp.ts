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
    /* A hidden tab gets no animation frames at all, so the count never runs
       and the number sits at zero until something else re-renders it. Anyone
       who opens the app in a background tab and switches to it a second later
       sees "0 words due" over a full queue — which is not a slow animation,
       it is wrong information. */
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.hidden ||
      target === 0
    ) {
      setValue(target);
      return;
    }

    /* And the tab can be hidden *during* the count. The timer keeps running
       where frames do not, so this is the floor: by the time the animation
       should have finished, the real number is on screen either way. */
    const settle = window.setTimeout(() => setValue(target), duration + 120);
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
      window.clearTimeout(settle);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  return value;
}
