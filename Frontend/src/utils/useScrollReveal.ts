import { useEffect, useRef } from "react";

/**
 * useScrollReveal — attaches an IntersectionObserver to a container element.
 * When children with [data-reveal] enter the viewport, they receive the
 * "revealed" class which triggers the CSS transition defined in index.css.
 *
 * Respects prefers-reduced-motion: skips animation and marks all as revealed immediately.
 */
export function useScrollReveal(
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px"
) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const container = ref.current;
    if (!container) return;

    // Collect all reveal targets within this container
    const targets = Array.from(
      container.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    // If reduced motion, just reveal everything immediately
    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // only trigger once
          }
        });
      },
      { threshold, rootMargin }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
