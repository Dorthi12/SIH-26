import { Trophy, Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getCropTheme } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

interface CurrentLeaderProps {
  crops: CropRecommendation[];
}

export function CurrentLeader({ crops }: CurrentLeaderProps) {
  const { t } = useLanguage();
  if (crops.length === 0) return null;

  const leader = [...crops].sort((a, b) => b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha)[0];
  const theme = getCropTheme(leader.crop);
  const cropName = getCropName(leader.crop, t);

  return (
    <div className="relative overflow-hidden flex items-center gap-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-emerald-500/10 dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-emerald-950/40 shadow-lg shadow-amber-500/5 px-6 py-4 backdrop-blur-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold border border-amber-300">
        <Trophy className="h-6 w-6 animate-bounce-subtle" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <p className="text-2xs font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300">
            {t("Current Leader", "वर्तमान अग्रणी फ़सल")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-xl font-black text-slate-900 dark:text-white">{cropName}</p>
          <Badge variant="amber" size="sm" className="font-extrabold shadow-sm">
            {t("TOP OPTION", "शीर्ष विकल्प")}
          </Badge>
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {leader.predicted_yield_t_per_ha} {t("t/ha predicted yield", "टन/हेक्टेयर अनुमानित उपज")}
        </p>
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-right max-w-[170px] leading-relaxed hidden sm:block">
        {t("Based on predicted yield among selected candidates.", "चयनित उम्मीदवारों में अनुमानित उपज के आधार पर।")}
      </p>
    </div>
  );
}

