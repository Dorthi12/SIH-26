// Shared utility helpers for AgriSense

/**
 * Format a number to a fixed number of decimal places, stripping trailing zeros.
 */
export function formatNumber(value: number, decimals = 2): string {
  return parseFloat(value.toFixed(decimals)).toString();
}

/**
 * Format acres for display.
 */
export function formatAcres(acres: number): string {
  return `${formatNumber(acres, 1)} ac`;
}

/**
 * Convert a suitability score (0-100) to a human-readable label.
 */
export function scoreToLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

/**
 * Return a CSS class string for a stability / compatibility level.
 */
export function levelToColorClass(level: "High" | "Medium" | "Low"): string {
  switch (level) {
    case "High":
      return "text-forest bg-forest/10";
    case "Medium":
      return "text-amber-700 bg-amber/10";
    case "Low":
      return "text-red-700 bg-red-50";
  }
}

/**
 * Return a CSS class string for a yield trend.
 */
export function trendToColorClass(
  trend: "Improving" | "Stable" | "Declining"
): string {
  switch (trend) {
    case "Improving":
      return "text-forest bg-forest/10";
    case "Stable":
      return "text-olive bg-olive/10";
    case "Declining":
      return "text-red-700 bg-red-50";
  }
}

/**
 * Format an ISO datetime string to a readable local format.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
