import { useEffect, useState } from "react";

/**
 * useAnimatedCounter — animates a numeric value from 0 to `target` using
 * a cubic ease-out over `duration` ms. Respects prefers-reduced-motion.
 *
 * @param target    - The final value to count to
 * @param duration  - Animation duration in ms (default 1000)
 * @param delay     - Delay before animation starts (default 0)
 */
export function useAnimatedCounter(
  target: number,
  duration = 1000,
  delay = 0
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    let raf: number;
    let startTime: number | null = null;

    const delayTimer = setTimeout(() => {
      const animate = (now: number) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          raf = requestAnimationFrame(animate);
        }
      };
      raf = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}
