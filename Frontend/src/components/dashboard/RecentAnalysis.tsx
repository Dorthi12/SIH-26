import { Clock, Sprout, CloudSun, BarChart3 } from "lucide-react";

const RECENT_ITEMS = [
  {
    icon: <Sprout className="h-4 w-4" />,
    title: "Crop Recommendation",
    detail: "Maize · 92 / 100",
    time: "Today",
    color: "text-forest",
    bg: "bg-forest/8",
  },
  {
    icon: <CloudSun className="h-4 w-4" />,
    title: "Weather Analysis",
    detail: "High Compatibility",
    time: "Today",
    color: "text-amber-600",
    bg: "bg-amber/10",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Historical Analysis",
    detail: "5-year yield trend reviewed",
    time: "Yesterday",
    color: "text-charcoal-muted",
    bg: "bg-charcoal/6",
  },
] as const;

export function RecentAnalysis() {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-ivory-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-charcoal-muted/60" />
          <p className="text-sm font-bold text-charcoal">Recent Analysis</p>
        </div>
        <p className="text-2xs text-charcoal-muted/50 italic">Recent data</p>
      </div>
      <ul className="divide-y divide-ivory-200">
        {RECENT_ITEMS.map((item, i) => (
          <li key={i} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-forest/[0.02] transition-colors">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-charcoal truncate">{item.title}</p>
              <p className="text-xs text-charcoal-muted truncate">{item.detail}</p>
            </div>
            <p className="text-2xs text-charcoal-muted/50 shrink-0">{item.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
