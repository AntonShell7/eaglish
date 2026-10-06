import { useEffect } from "react";

/**
 * Reveals elements marked with `data-reveal` as they scroll into view.
 *
 * One observer for the whole app rather than a wrapper component per section:
 * marking an element is then a single attribute, which is the only way this
 * kind of polish gets used everywhere instead of on two pages.
 *
 * Elements already on screen are revealed immediately, so nothing above the
 * fold waits for a scroll that may never come.
 *
 * It also watches for elements that arrive later, and that is not a nicety.
 * The hook used to take one snapshot per navigation, and a page that mounts
 * after its route does — anything behind a session check, a fetch or a lazy
 * import — had no marked elements yet when the snapshot was taken. The hook
 * found nothing, returned, and never looked again, so that content stayed at
 * opacity zero permanently. The front page was doing exactly this: three
 * sections, present in the document, invisible to every signed-out visitor,
 * because the landing renders only once the auth check finishes.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const revealAll = (nodes: HTMLElement[]) => nodes.forEach((n) => n.classList.add("is-in"));
    const find = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-reveal]:not(.is-in), [data-stagger]:not(.is-in)",
        ),
      );

    if (!("IntersectionObserver" in window)) {
      revealAll(find());
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    /* Observing the same node twice is harmless, but the set keeps the
       mutation callback from doing pointless work on every DOM change. */
    const seen = new WeakSet<Element>();
    const take = () => {
      for (const node of find()) {
        if (seen.has(node)) continue;
        seen.add(node);
        observer.observe(node);
      }
    };

    take();

    const mutations = new MutationObserver(take);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
