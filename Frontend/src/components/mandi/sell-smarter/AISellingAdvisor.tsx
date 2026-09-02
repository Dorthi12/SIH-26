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
    <div className="bg-[#0b1d16] text-white p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-6">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
              AI Decision Support
            </span>
            <span className="text-xs text-emerald-300 font-semibold">
              Powered by Agrisense Multi-Factor Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-amber-400 animate-pulse shrink-0" />
            <span>🧠 Agrisense AI Selling Advisor</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl font-medium leading-relaxed">
            Get a data-backed view of your selling options based on costs, market trends, storage buffer, and buyer reliability.
          </p>
        </div>

        <button
          onClick={() => setShowFactors(!showFactors)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#122e23] border border-emerald-500/50 text-emerald-200 hover:bg-emerald-800/60 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          {showFactors ? "Hide Factors Considered" : "✓ Factors Considered"}
        </button>
      </div>

      {/* Factors Considered Drawer */}
      {showFactors && (
        <div className="p-4 rounded-2xl bg-[#071610] border border-emerald-500/30 space-y-2.5 animate-in fade-in duration-200">
          <span className="text-2xs font-black uppercase text-amber-400 tracking-wider block">
            Integrated Data Factors Analyzed by AI:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-emerald-100">
            {crop.advisor.factorsConsidered.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0e271d] border border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Input Section */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-amber-300 block">
          Ask Agrisense Selling Advisor:
        </label>

        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Should I sell my wheat now or wait?"
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-[#06140e] border border-emerald-500/40 text-white placeholder-emerald-300/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
            <HelpCircle className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl font-black text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
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
              className={`px-3.5 py-1.5 rounded-xl text-2xs font-extrabold transition-all cursor-pointer ${
                selectedQuestion === q
                  ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50"
                  : "bg-[#071610] text-emerald-100 hover:bg-[#112d21] border border-emerald-500/30"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* AI RESPONSE DISPLAY CARD */}
      <div className="bg-[#05140d] rounded-3xl p-6 border border-emerald-500/40 space-y-6 shadow-xl animate-in zoom-in-95">
        {/* Top Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#030a07] border border-emerald-800/40 text-xs font-bold">
          <div>
            <span className="text-emerald-400 uppercase text-3xs font-black tracking-wider block">Best Net Realization</span>
            <span className="text-sm sm:text-base font-black text-amber-300 block mt-0.5">₹{crop.directBuyers[0].estimatedNetRealizationPerQ.toLocaleString("en-IN")}/q</span>
          </div>

          <div>
            <span className="text-emerald-400 uppercase text-3xs font-black tracking-wider block">Best Buyer</span>
            <span className="text-xs sm:text-sm font-black text-white truncate block mt-0.5">{crop.directBuyers[0].businessName}</span>
          </div>

          <div>
            <span className="text-emerald-400 uppercase text-3xs font-black tracking-wider block">Fair Price Range</span>
            <span className="text-xs sm:text-sm font-black text-emerald-300 block mt-0.5">₹{crop.fairPriceRangeMinPerQ}–₹{crop.fairPriceRangeMaxPerQ}/q</span>
          </div>

          <div>
            <span className="text-emerald-400 uppercase text-3xs font-black tracking-wider block">Market Trend</span>
            <span className="text-xs sm:text-sm font-black text-emerald-300 block mt-0.5">↗ {crop.marketTrend.trend7d}</span>
          </div>
        </div>

        {/* Main Recommendation Text */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Recommendation View</span>
            </span>

            <span className="text-2xs font-extrabold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Confidence: {activeResponse.confidence}%
            </span>
          </div>

          <p className="text-sm sm:text-base font-bold text-white leading-relaxed p-4 sm:p-5 rounded-2xl bg-[#0c241a] border border-emerald-500/50 shadow-inner">
            "{activeResponse.recommendationText}"
          </p>
        </div>

        {/* Why Bullets */}
        <div className="space-y-2.5">
          <span className="text-xs font-black uppercase text-amber-300 tracking-wider block">
            Why this recommendation?
          </span>

          <ul className="space-y-2 text-xs font-medium text-emerald-100">
            {activeResponse.whyBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#040d09] border border-emerald-900/60 leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="text-emerald-100 font-semibold">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Non-Overconfident Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5 text-2xs font-semibold text-amber-200 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            ⚠️ <strong className="text-amber-300">Decision Support Guarantee Disclaimer:</strong> {activeResponse.disclaimer} Recommendations provide data-backed scenarios; market conditions remain subject to weather, supply fluctuations, and localized buyer decisions.
          </span>
        </div>
      </div>
    </div>
  );
}
