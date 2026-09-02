import React, { useState } from "react";
import { HelpCircle, ThumbsUp, MessageSquare, Search, Plus, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/Badge";

export interface QueryItem {
  id: string;
  author: string;
  location: string;
  category: string;
  title: string;
  details: string;
  upvotes: number;
  isUpvoted?: boolean;
  answers: {
    id: string;
    responder: string;
    role: "AI Expert" | "Agronomist" | "Farmer";
    text: string;
    date: string;
  }[];
  date: string;
  status: "Answered" | "Open";
}

const INITIAL_QUERIES: QueryItem[] = [
  {
    id: "q-1",
    author: "Shivam Patel",
    location: "Anand, Gujarat",
    category: "Weather Impact",
    title: "How does CatBoost forecast yield when monsoon rainfall is erratic?",
    details: "Our district had delayed monsoons this year. Does the model account for rainfall variation in the final tonnes per hectare estimate?",
    upvotes: 18,
    date: "2 days ago",
    status: "Answered",
    answers: [
      {
        id: "ans-1",
        responder: "AgriSense AI Assistant",
        role: "AI Expert",
        text: "CatBoost evaluates multi-year historical yield baselines along with temporal momentum. If monsoon fluctuates, you can input your most recent year's actual recorded yield (e.g., 2025) to calibrate the trend accurately for next season.",
        date: "2 days ago",
      },
      {
        id: "ans-2",
        responder: "Dr. V. K. Sharma",
        role: "Agronomist",
        text: "In addition to the forecast tool, consider checking our Zero-Production Risk module to check climate risk scores for Anand district.",
        date: "1 day ago",
      },
    ],
  },
  {
    id: "q-2",
    author: "Devendra Prasad",
    location: "Gaya, Bihar",
    category: "Yield Forecast",
    title: "What historical yield inputs give maximum precision for Wheat in Bihar?",
    details: "Should I enter farm-level yield estimates or local block-level averages for 2023, 2024, and 2025?",
    upvotes: 27,
    date: "4 days ago",
    status: "Answered",
    answers: [
      {
        id: "ans-3",
        responder: "AgriSense AI Assistant",
        role: "AI Expert",
        text: "Entering your actual plot-level yields (t/ha or quintals per bigha converted to t/ha) yields the highest prediction accuracy (R² > 0.90). If plot data is missing for 2023, local panchayat average yield works as a close substitute.",
        date: "4 days ago",
      },
    ],
  },
  {
    id: "q-3",
    author: "Sunita Kurmi",
    location: "Samastipur, Bihar",
    category: "Market & Sales",
    title: "Can we present AgriSense yield forecasts for Kisan Credit Card (KCC) or crop insurance applications?",
    details: "I want to apply for seasonal credit. Do banks accept the forecasted yield output document?",
    upvotes: 15,
    date: "1 week ago",
    status: "Answered",
    answers: [
      {
        id: "ans-4",
        responder: "Ramanathan Iyer",
        role: "Agronomist",
        text: "Yes! Many rural financial institutions and NABARD-affiliated banks recognize CatBoost yield forecast certificates as baseline proof of expected farm productivity.",
        date: "6 days ago",
      },
    ],
  },
  {
    id: "q-4",
    author: "Harvinder Gill",
    location: "Amritsar, Punjab",
    category: "Soil & Fertilizers",
    title: "If pest infestation reduced my 2024 yield, will next year's 2026 forecast be artificially low?",
    details: "In 2024 our paddy crop suffered stem borer damage, but 2025 rebounded strongly after treatment.",
    upvotes: 22,
    date: "1 week ago",
    status: "Answered",
    answers: [
      {
        id: "ans-5",
        responder: "AgriSense AI Assistant",
        role: "AI Expert",
        text: "The CatBoost forecaster weighs overall multi-year trajectory. Because your 2025 yield rebounded strongly, the model automatically recognizes the 2024 dip as an anomaly rather than a permanent soil decline!",
        date: "1 week ago",
      },
    ],
  },
];

export function YieldQueries() {
  const [queries, setQueries] = useState<QueryItem[]>(INITIAL_QUERIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("q-1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Yield Forecast");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const categories = ["All", "Yield Forecast", "Weather Impact", "Soil & Fertilizers", "Market & Sales"];

  const handleUpvote = (id: string) => {
    setQueries((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const isUpvoted = !q.isUpvoted;
          return {
            ...q,
            isUpvoted,
            upvotes: isUpvoted ? q.upvotes + 1 : q.upvotes - 1,
          };
        }
        return q;
      })
    );
  };

  const generateAIAnswer = (cat: string, qTitle: string, qText: string): string => {
    const text = (qTitle + " " + qText).toLowerCase();
    if (text.includes("rain") || text.includes("monsoon") || text.includes("weather") || text.includes("drought")) {
      return "AgriSense AI Analysis: Climate & rainfall variations are integrated using CatBoost temporal lag coefficients. We recommend maintaining optimal irrigation scheduling during critical flowering stages.";
    }
    if (text.includes("fertilizer") || text.includes("nitrogen") || text.includes("urea") || text.includes("soil")) {
      return "AgriSense AI Analysis: Balanced NPK fertilizer application directly boosts your base historical yield coefficient. Consider soil testing before applying post-monsoon top dressing.";
    }
    if (text.includes("price") || text.includes("mandi") || text.includes("sell") || text.includes("market")) {
      return "AgriSense AI Analysis: You can cross-reference your forecasted harvest output with our Mandi Marketplace module to lock in early procurement prices with verified local buyers!";
    }
    return "AgriSense AI Analysis: Thank you for your question. The CatBoost yield model evaluates your crop type, location, and 3-year historical yields to project expected production with high reliability (R² ~0.90).";
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !location || !title || !details) return;

    const aiAnswerText = generateAIAnswer(category, title, details);

    const newQ: QueryItem = {
      id: `q-${Date.now()}`,
      author,
      location,
      category,
      title,
      details,
      upvotes: 1,
      isUpvoted: true,
      date: "Just now",
      status: "Answered",
      answers: [
        {
          id: `ans-${Date.now()}`,
          responder: "AgriSense AI Assistant",
          role: "AI Expert",
          text: aiAnswerText,
          date: "Just now",
        },
      ],
    };

    setQueries([newQ, ...queries]);
    setExpandedId(newQ.id);
    setIsModalOpen(false);

    // Reset Form
    setAuthor("");
    setLocation("");
    setTitle("");
    setDetails("");
  };

  const filteredQueries = queries.filter((q) => {
    const matchesCat = selectedCategory === "All" || q.category === selectedCategory;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-ivory-200">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-forest" />
            <h2 className="text-xl font-bold text-charcoal">Farmer Query & Discussion Window</h2>
            <Badge variant="amber" size="sm">
              Community & AI Q&A
            </Badge>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Ask questions about crop yield forecasts, CatBoost model parameters, or local farming strategies.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Ask a Question
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-charcoal-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farmer queries, crops, or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-ivory-300 bg-ivory/20 text-xs focus:ring-1 focus:ring-forest"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-forest text-white shadow-xs"
                  : "bg-ivory-100 text-charcoal-muted hover:bg-ivory-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {filteredQueries.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-muted space-y-2">
            <HelpCircle className="h-8 w-8 mx-auto text-charcoal-muted/40" />
            <p>No questions found matching your search.</p>
          </div>
        ) : (
          filteredQueries.map((q) => {
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className="border border-ivory-300 rounded-xl bg-white hover:border-forest/30 transition-all overflow-hidden"
              >
                {/* Question Summary Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-4 cursor-pointer space-y-2 hover:bg-ivory/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" size="sm">
                          {q.category}
                        </Badge>
                        <span className="text-[11px] font-semibold text-charcoal-muted">
                          {q.author} ({q.location})
                        </span>
                        <span className="text-[10px] text-charcoal-muted/60">• {q.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-charcoal hover:text-forest transition-colors">
                        {q.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(q.id);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          q.isUpvoted
                            ? "bg-forest/10 text-forest"
                            : "bg-ivory-100 text-charcoal-muted hover:bg-ivory-200"
                        }`}
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${q.isUpvoted ? "fill-forest" : ""}`} />
                        <span>{q.upvotes}</span>
                      </button>

                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-charcoal-muted" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-charcoal-muted" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-muted line-clamp-2">{q.details}</p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-charcoal-muted">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      {q.answers.length} {q.answers.length === 1 ? "Answer" : "Answers"}
                    </span>
                    <span className="text-2xs text-forest/70 font-medium">
                      {isExpanded ? "Hide Answers" : "Click to View Answers"}
                    </span>
                  </div>
                </div>

                {/* Expanded Answers Section */}
                {isExpanded && (
                  <div className="border-t border-ivory-200 bg-ivory/10 p-4 space-y-3.5 animate-fade-in">
                    <h4 className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted">
                      Answers & AI Insights
                    </h4>

                    {q.answers.map((ans) => (
                      <div
                        key={ans.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          ans.role === "AI Expert"
                            ? "bg-forest/[0.03] border-forest/20"
                            : "bg-white border-ivory-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {ans.role === "AI Expert" ? (
                              <div className="flex items-center gap-1 text-forest font-bold text-2xs bg-forest/10 px-2 py-0.5 rounded-md">
                                <Sparkles className="h-3 w-3 text-forest" />
                                {ans.responder}
                              </div>
                            ) : (
                              <span className="font-bold text-charcoal text-xs">{ans.responder}</span>
                            )}
                            <Badge variant={ans.role === "AI Expert" ? "emerald" : "amber"} size="sm">
                              {ans.role}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-charcoal-muted">{ans.date}</span>
                        </div>

                        <p className="text-charcoal leading-relaxed text-xs">{ans.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ask Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-ivory-300 animate-slide-up">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-forest" />
                <h3 className="text-lg font-bold text-charcoal">Ask Farmer Community & AI</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-muted hover:text-charcoal p-1 rounded-lg hover:bg-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-light">Your Name</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Shivam Patel"
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-light">District, State</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Anand, Gujarat"
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal-light">Topic Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                >
                  <option value="Yield Forecast">Yield Forecast</option>
                  <option value="Weather Impact">Weather Impact</option>
                  <option value="Soil & Fertilizers">Soil & Fertilizers</option>
                  <option value="Market & Sales">Market & Sales</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal-light">Question Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How does farm size impact prediction accuracy?"
                  className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal-light">Question Details</label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe your farm situation or what you'd like to ask the AI and community..."
                  className="w-full rounded-xl border border-ivory-300 p-3 text-xs focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-ivory-200 text-charcoal text-xs font-semibold hover:bg-ivory-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Post & Get AI Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
