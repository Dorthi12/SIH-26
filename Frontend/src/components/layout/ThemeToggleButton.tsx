import { MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";

interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggleButton({ className, showLabel = false }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
        "border-ivory-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-light shadow-sm hover:border-forest/30 hover:text-forest",
        className
      )}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {showLabel && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}