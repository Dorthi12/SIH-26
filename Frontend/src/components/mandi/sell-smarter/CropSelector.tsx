import type { SellSmarterCropOption } from "../../../types/sellSmarter";
import { Sprout, MapPin, Package, CheckCircle2 } from "lucide-react";

interface CropSelectorProps {
  crops: SellSmarterCropOption[];
  selectedCropId: string;
  onSelectCrop: (cropId: string) => void;
}

export function CropSelector({
  crops,
  selectedCropId,
  onSelectCrop,
}: CropSelectorProps) {
  return (
    <div className="bg-white dark:bg-charcoal-dark p-5 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm uppercase font-black tracking-wider text-forest dark:text-emerald-400 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-amber" />
            <span>Select Crop Listing</span>
          </h2>
          <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            Choose a crop from your active harvest inventory to analyze selling options
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {crops.map((crop) => {
          const isSelected = crop.id === selectedCropId;
          const icon = crop.cropName.includes("Wheat")
            ? "🌾"
            : crop.cropName.includes("Rice")
            ? "🌾"
            : crop.cropName.includes("Chana")
            ? "🫘"
            : "🍅";

          return (
            <button
              key={crop.id}
              onClick={() => onSelectCrop(crop.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? "bg-forest/5 dark:bg-emerald-950/40 border-forest dark:border-emerald-500 ring-2 ring-forest/20 dark:ring-emerald-500/20 shadow-md"
                  : "bg-ivory-50 dark:bg-charcoal border-ivory-300 dark:border-charcoal-light hover:border-forest/50 dark:hover:border-emerald-600"
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 text-forest dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 fill-current text-white dark:text-charcoal-dark" />
                </span>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100 group-hover:text-forest dark:group-hover:text-emerald-400 transition-colors">
                    {crop.cropName}
                  </span>
                </div>

                <div className="text-2xs font-bold text-charcoal-muted dark:text-ivory-300">
                  Variety: {crop.variety}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-ivory-200 dark:border-charcoal-light/60 flex items-center justify-between text-3xs font-semibold text-charcoal-muted dark:text-ivory-400">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-amber" />
                  <strong className="text-charcoal dark:text-ivory-200">{crop.quantityQuintals} q</strong>
                </span>
                <span className="flex items-center gap-1 truncate max-w-[110px]">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{crop.location.split(",")[0]}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
