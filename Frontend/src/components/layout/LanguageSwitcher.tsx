import { Globe } from "lucide-react";
import { useLanguage, type LanguageMode } from "../../context/LanguageContext";
import { cn } from "../../utils/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const options: { id: LanguageMode; label: string; sub?: string }[] = [
    { id: "en", label: "EN", sub: "English" },
    { id: "hi", label: "हिंदी", sub: "Hindi" },
    { id: "both", label: "Both", sub: "दोनों" },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-600/20 bg-emerald-500/5 p-1 backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-950/30 shadow-sm",
        className
      )}
      role="group"
      aria-label="Select Language"
    >
      <div className="pl-2 pr-1 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-xs font-semibold select-none">
        <Globe className="h-3.5 w-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
      </div>

      {options.map((opt) => {
        const active = language === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLanguage(opt.id)}
            title={`Switch language to ${opt.sub}`}
            className={cn(
              "relative px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer select-none",
              active
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.03]"
                : "text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/10"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
