import { useState } from "react";
import type { SellSmarterCropOption } from "../../../types/sellSmarter";
import { sellSmarterService } from "../../../services/sellSmarterService";
import { Brain, Send, CheckCircle2, AlertTriangle, Sparkles, HelpCircle } from "lucide-react";

interface AISellingAdvisorProps {
  crop: SellSmarterCropOption;
}

export function AISellingAdvisor({ crop }: AISellingAdvisorProps) {
  const suggestedQuestions = sellSmarterService.getSuggestedAdvisorQuestions();
  const [selectedQuestion, setSelectedQuestion] = useState<string>(suggestedQuestions[0]);
  const [customInput, setCustomInput] = useState<string>("");
  const [activeResponse, setActiveResponse] = useState(() =>
    sellSmarterService.getAIAdvisorResponse(crop, suggestedQuestions[0])
  );
  const [showFactors, setShowFactors] = useState<boolean>(false);

  const handleAsk = (q: string) => {
    setSelectedQuestion(q);
    const resp = sellSmarterService.getAIAdvisorResponse(crop, q);
    setActiveResponse(resp);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleAsk(customInput);
    setCustomInput("");
  };

  return (
    <div className="bg-gradient-to-br from-charcoal-dark via-charcoal to-forest-dark text-white p-6 sm:p-8 rounded-3xl border-2 border-forest/50 shadow-2xl space-y-6">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber text-charcoal font-black text-3xs uppercase tracking-wider">
              AI Decision Support
            </span>
            <span className="text-3xs text-ivory-200 font-bold">
              Powered by Agrisense Multi-Factor Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-amber animate-pulse" />
            <span>🧠 Agrisense AI Selling Advisor</span>
          </h2>
          <p className="text-xs text-ivory-200 mt-1 max-w-xl">
            Get a data-backed view of your selling options based on costs, market trends, storage buffer, and buyer reliability.
          </p>
        </div>

        <button
          onClick={() => setShowFactors(!showFactors)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 border border-white/20 text-ivory-100 hover:bg-white/20 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          {showFactors ? "Hide Factors Considered" : "✓ Factors Considered"}
        </button>
      </div>

      {/* Factors Considered Drawer */}
      {showFactors && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-2 animate-in fade-in duration-200">
          <span className="text-3xs font-black uppercase text-amber tracking-wider block">
            Integrated Data Factors Analyzed by AI:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-3xs font-semibold text-ivory-200">
            {crop.advisor.factorsConsidered.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-2 rounded-lg bg-black/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Input Section */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-ivory-200 block">
          Ask Agrisense Selling Advisor:
        </label>

        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Should I sell my wheat now or wait?"
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-ivory-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <HelpCircle className="w-4 h-4 text-ivory-300 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl font-black text-xs bg-amber text-charcoal hover:bg-amber-dark transition-colors shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Ask Advisor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Preset Question Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className={`px-3 py-1.5 rounded-xl text-3xs font-extrabold transition-all cursor-pointer ${
                selectedQuestion === q
                  ? "bg-amber text-charcoal shadow-sm"
                  : "bg-white/10 text-ivory-200 hover:bg-white/20 border border-white/10"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* AI RESPONSE DISPLAY CARD */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 space-y-6 animate-in zoom-in-95">
        {/* Top Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/30 text-3xs font-bold">
          <div>
            <span className="text-ivory-400 block uppercase">Best Net Realization</span>
            <span className="text-sm font-black text-amber block">₹{crop.directBuyers[0].estimatedNetRealizationPerQ}/q</span>
          </div>

          <div>
            <span className="text-ivory-400 block uppercase">Best Buyer</span>
            <span className="text-xs font-black text-white truncate block">{crop.directBuyers[0].businessName}</span>
          </div>

          <div>
            <span className="text-ivory-400 block uppercase">Fair Price Range</span>
            <span className="text-xs font-black text-emerald-400 block">₹{crop.fairPriceRangeMinPerQ}–₹{crop.fairPriceRangeMaxPerQ}/q</span>
          </div>

          <div>
            <span className="text-ivory-400 block uppercase">Market Trend</span>
            <span className="text-xs font-black text-emerald-400 block">↗ {crop.marketTrend.trend7d}</span>
          </div>
        </div>

        {/* Main Recommendation Text */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-amber flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Recommendation View</span>
            </span>

            <span className="text-3xs font-black px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Confidence: {activeResponse.confidence}%
            </span>
          </div>

          <p className="text-base sm:text-lg font-bold text-white leading-relaxed p-4 rounded-2xl bg-white/5 border border-white/10">
            "{activeResponse.recommendationText}"
          </p>
        </div>

        {/* Why Bullets */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-ivory-200 tracking-wider block">
            Why this recommendation?
          </span>

          <ul className="space-y-2 text-xs font-medium text-ivory-200">
            {activeResponse.whyBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber mt-1.5 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Non-Overconfident Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5 text-3xs font-semibold text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <span>
            ⚠️ <strong>Decision Support Guarantee Disclaimer:</strong> {activeResponse.disclaimer} Recommendations provide data-backed scenarios; market conditions remain subject to weather, supply fluctuations, and localized buyer decisions.
          </span>
        </div>
      </div>
    </div>
  );
}
