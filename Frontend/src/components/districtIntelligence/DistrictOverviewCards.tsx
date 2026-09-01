import { Sprout, Star, TrendingUp, CloudLightning, Award } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../utils/cn";
import type { DistrictIntelligence, WeatherRiskLevel } from "../../types/districtIntelligence";

interface DistrictOverviewCardsProps {
  intelligence: DistrictIntelligence;
}

export function DistrictOverviewCards({ intelligence }: DistrictOverviewCardsProps) {
  const { t } = useLanguage();
  const { best_crop_id, crops, avg_district_suitability, avg_district_yield, overall_risk } = intelligence;
  const bestCrop = crops.find((c) => c.crop_id === best_crop_id) ?? crops[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Best Performing Crop */}
      <OverviewCard
        icon={<Sprout className="h-5 w-5" />}
        label={t("Best Performing Crop", "सर्वश्रेष्ठ प्रदर्शन वाली फ़सल")}
        accent="emerald"
      >
        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
          {bestCrop?.crop_name ?? "—"}
        </p>
        {bestCrop && (
          <Badge variant="amber" size="sm" className="mt-1.5 font-extrabold shadow-2xs">
            <Award className="h-3 w-3 mr-1" />
            {t("Rank #1 Pick", "रैंक #1 पसंद")}
          </Badge>
        )}
      </OverviewCard>

      {/* Average Suitability */}
      <OverviewCard
        icon={<Star className="h-5 w-5" />}
        label={t("Avg. Suitability", "औसत उपयुक्तता")}
        accent="emerald"
      >
        <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
          {avg_district_suitability}
          <span className="text-sm font-bold text-slate-400 ml-0.5">%</span>
        </p>
        <SuitabilityBar value={avg_district_suitability} className="mt-2" />
      </OverviewCard>

      {/* Average Yield */}
      <OverviewCard
        icon={<TrendingUp className="h-5 w-5" />}
        label={t("Avg. Expected Yield", "औसत अनुमानित उपज")}
        accent="teal"
      >
        <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 tabular-nums">
          {avg_district_yield.toFixed(1)}
          <span className="text-sm font-semibold text-slate-400 ml-1">{t("t/ha", "टन/हेक्टेयर")}</span>
        </p>
      </OverviewCard>

      {/* Overall Risk */}
      <OverviewCard
        icon={<CloudLightning className="h-5 w-5" />}
        label={t("Overall Weather Risk", "कुल मौसम जोखिम")}
        accent={overall_risk === "Low" ? "emerald" : overall_risk === "Medium" ? "amber" : "danger"}
      >
        <RiskBadge risk={overall_risk} large />
        <p className="text-2xs font-medium text-slate-400 mt-2">
          {t("Across all evaluated crops", "मूल्यांकन की गई सभी फ़सलों में")}
        </p>
      </OverviewCard>
    </div>
  );
}

interface OverviewCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  accent: "emerald" | "teal" | "amber" | "danger";
}

const accentStyle: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

function OverviewCard({ icon, label, children, accent }: OverviewCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm shrink-0", accentStyle[accent])}>
          {icon}
        </span>
        <p className="text-2xs font-extrabold uppercase tracking-widest text-slate-400 leading-tight">
          {label}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SuitabilityBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 shadow-inner", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out shadow-sm", color)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function RiskBadge({ risk, large }: { risk: WeatherRiskLevel; large?: boolean }) {
  const { t } = useLanguage();
  const map: Record<WeatherRiskLevel, { variant: "success" | "warning" | "danger"; textHi: string }> = {
    Low: { variant: "success", textHi: "कम जोखिम" },
    Medium: { variant: "warning", textHi: "मध्यम जोखिम" },
    High: { variant: "danger", textHi: "उच्च जोखिम" },
  };
  const { variant, textHi } = map[risk];
  return (
    <Badge variant={variant} size={large ? "md" : "sm"} dot className="font-extrabold">
      {t(`${risk} Risk`, textHi)}
    </Badge>
  );
}
