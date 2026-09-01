export const CROP_NAMES_HI: Record<string, string> = {
  Maize: "मक्का",
  Rice: "धान / चावल",
  Soybean: "सोयाबीन",
  Millet: "बाजरा",
  Wheat: "गेहूं",
  Cotton: "कपास",
  Pulses: "दालें",
  Groundnut: "मूंगफली",
};

export const METRIC_LEVELS_HI: Record<string, string> = {
  High: "उच्च",
  Medium: "मध्यम",
  Low: "कम",
  Improving: "सुधार",
  Stable: "स्थिर",
  Declining: "गिरावट",
};

export const CROP_THEMES: Record<
  string,
  {
    gradient: string;
    bgLight: string;
    text: string;
    border: string;
    badge: string;
    barGradient: string;
  }
> = {
  Maize: {
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    bgLight: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-400/40 dark:border-amber-500/40",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    barGradient: "from-amber-500 via-yellow-500 to-amber-400",
  },
  Rice: {
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgLight: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-400/40 dark:border-emerald-500/40",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    barGradient: "from-emerald-500 via-teal-500 to-cyan-400",
  },
  Soybean: {
    gradient: "from-lime-500 via-green-500 to-emerald-600",
    bgLight: "bg-lime-500/10 dark:bg-lime-500/20",
    text: "text-lime-700 dark:text-lime-300",
    border: "border-lime-400/40 dark:border-lime-500/40",
    badge: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300 border-lime-300 dark:border-lime-700",
    barGradient: "from-lime-500 via-green-500 to-emerald-500",
  },
  Millet: {
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    bgLight: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-400/40 dark:border-indigo-500/40",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
    barGradient: "from-indigo-500 via-purple-500 to-pink-400",
  },
};

export const DEFAULT_CROP_THEME = {
  gradient: "from-teal-500 to-emerald-600",
  bgLight: "bg-teal-500/10 dark:bg-teal-500/20",
  text: "text-teal-700 dark:text-teal-300",
  border: "border-teal-400/40",
  badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-300",
  barGradient: "from-teal-500 to-emerald-500",
};

export function getCropTheme(crop: string) {
  return CROP_THEMES[crop] || DEFAULT_CROP_THEME;
}

export function getCropName(crop: string, t: (en: string, hi: string) => string): string {
  const hi = CROP_NAMES_HI[crop] || crop;
  return t(crop, hi);
}

export function getMetricLevel(level: string, t: (en: string, hi: string) => string): string {
  const hi = METRIC_LEVELS_HI[level] || level;
  return t(level, hi);
}
