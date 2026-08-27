// Shared weather icon renderer — used by multiple weather components
import { Sun, Cloud, CloudRain, CloudSun, CloudLightning } from "lucide-react";
import { cn } from "../../utils/cn";

export type IconKey = "sun" | "partly" | "cloud" | "rain" | "storm";

interface WeatherIconProps {
  icon: IconKey;
  className?: string;
}

const ICON_MAP: Record<IconKey, React.ReactNode> = {
  sun:    <Sun />,
  partly: <CloudSun />,
  cloud:  <Cloud />,
  rain:   <CloudRain />,
  storm:  <CloudLightning />,
};

const COLOR_MAP: Record<IconKey, string> = {
  sun:    "text-amber-500",
  partly: "text-amber-400",
  cloud:  "text-charcoal-muted",
  rain:   "text-blue-400",
  storm:  "text-charcoal",
};

export function WeatherIcon({ icon, className }: WeatherIconProps) {
  return (
    <span className={cn(COLOR_MAP[icon], className)} aria-hidden="true">
      {ICON_MAP[icon]}
    </span>
  );
}
