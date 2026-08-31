import { useEffect, useState } from "react";

/**
 * How far through the text you are.
 *
 * A long text with no sense of its own length is the reason people stop halfway
 * — not difficulty, but the absence of an end in sight. A two-pixel line under
 * the header answers that continuously and costs no space, which is why every
 * serious reading surface has one.
 */
export function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const node = target.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.bottom <= window.innerHeight ? 1 : 0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, -rect.top / total)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [target]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 45,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: "var(--gradient-brand)",
          transition: "width 90ms linear",
        }}
      />
    </div>
  );
}
