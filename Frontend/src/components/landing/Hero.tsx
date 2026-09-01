/**
 * Landing page Hero — ported from agrisense-insights.
 * Replaced @tanstack/react-router Link with react-router-dom Link.
 * Asset imports use relative paths.
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroFarmer from "../../assets/hero-farmer.jpg";
import { Reveal } from "./primitives";
import { useLanguage } from "../../context/LanguageContext";

export function Hero() {
  const { t } = useLanguage();

  const chipsData = [
    { en: "Which crop to grow?", hi: "कौन सी फसल लगाएं?" },
    { en: "PM Kisan Scheme", hi: "PM किसान योजना" },
    { en: "Weather forecast", hi: "मौसम कैसा रहेगा?" },
    { en: "Crop Insurance", hi: "बीमा कैसे प्राप्त करें?" },
  ];

  return (
    <section id="top" className="relative isolate overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroFarmer}
          alt="Indian farmer standing at the edge of a green crop field at sunrise"
          width={1408}
          height={1200}
          className="size-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-landing-ivory via-landing-ivory/85 to-landing-ivory/10 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-landing-bg to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pt-8 pb-16 sm:px-8 md:pt-14 md:pb-20">
        <div className="max-w-2xl">
          <Reveal>
            <h1 className="text-[2.7rem] leading-[1.18] font-extrabold text-emerald-950 dark:text-emerald-100 sm:text-6xl lg:text-[4.2rem] tracking-tight">
              {t("Right Guidance.", "सही जानकारी।")}
              <br />
              <span className="text-emerald-700 dark:text-emerald-400">
                {t("Better Harvest.", "बेहतर फसल।")}
              </span>
            </h1>
          </Reveal>
          <Reveal delay={110}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-landing-fg/80 sm:text-xl font-medium">
              {t(
                "Get expert insights for your land, climate and government schemes to make smart agricultural decisions.",
                "अपने खेत, मौसम और सरकारी योजनाओं की जानकारी पाएं और खेती के सही फैसले लें।"
              )}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <form
              className="mt-8 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-emerald-500/20 bg-landing-card/95 p-2 shadow-landing-soft sm:flex-row sm:items-center sm:rounded-full"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="hero-question">
                {t("Ask your query", "अपना सवाल पूछें")}
              </label>
              <input
                id="hero-question"
                type="text"
                placeholder={t(
                  "e.g. — Which crop is best for my region this season?",
                  "जैसे — मेरे क्षेत्र में कौन सी फसल अच्छी रहेगी?"
                )}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-landing-fg outline-none placeholder:text-landing-fg-muted font-medium"
              />
              <Link
                to="/recommendation"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-base font-bold text-white shadow-md shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                {t("Ask Now", "पूछें")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </form>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {chipsData.map((c) => (
                <Link
                  key={c.en}
                  to="/recommendation"
                  className="rounded-full border border-emerald-500/20 bg-landing-card/85 px-4 py-2 text-sm font-semibold text-landing-fg/80 transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  {t(c.en, c.hi)}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
