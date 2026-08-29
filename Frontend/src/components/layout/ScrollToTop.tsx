/**
 * ScrollToTop — Scrolls the window to the top on every route change.
 *
 * React Router does not restore scroll position automatically.
 * Without this, navigating via the sidebar keeps the previous page's
 * scroll offset, so pages appear to open from the middle.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant scroll (no animation) so it feels like a fresh page load
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
