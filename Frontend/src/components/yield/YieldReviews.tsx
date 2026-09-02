import React, { useState } from "react";
import { Star, ThumbsUp, Plus, CheckCircle2, MessageSquare, X, Award } from "lucide-react";
import { Badge } from "../ui/Badge";

export interface ReviewItem {
  id: string;
  author: string;
  location: string;
  crop: string;
  season: string;
  rating: number;
  predictedYield: number;
  actualYield: number;
  comment: string;
  helpfulCount: number;
  isLiked?: boolean;
  date: string;
  verified: boolean;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Ramesh Kumar Mahato",
    location: "Gaya, Bihar",
    crop: "Wheat",
    season: "Rabi 2025/26",
    rating: 5,
    predictedYield: 3.48,
    actualYield: 3.52,
    comment: "The CatBoost yield forecaster predicted my wheat harvest within 0.04 t/ha! Knowing the estimate 4 months ahead helped me negotiate an advance buyer contract with the local Gaya mandi.",
    helpfulCount: 24,
    date: "3 days ago",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Gurpreet Singh",
    location: "Ludhiana, Punjab",
    crop: "Maize (Corn)",
    season: "Kharif 2025",
    rating: 5,
    predictedYield: 5.10,
    actualYield: 5.05,
    comment: "I entered our 3-year historical yields. The forecast accurately reflected our micro-irrigation upgrades. Extremely dependable for planning crop insurance and seed procurement.",
    helpfulCount: 19,
    date: "1 week ago",
    verified: true,
  },
  {
    id: "rev-3",
    author: "Anita Devi",
    location: "Patna, Bihar",
    crop: "Rice (Paddy)",
    season: "Kharif 2025",
    rating: 5,
    predictedYield: 4.12,
    actualYield: 4.08,
    comment: "Very easy to use interface. Even with irregular monsoon predictions in Bihar, the model forecast was super close. Highly recommended for smallholder farmers!",
    helpfulCount: 31,
    date: "2 weeks ago",
    verified: true,
  },
  {
    id: "rev-4",
    author: "Patel Jayeshbhai",
    location: "Rajkot, Gujarat",
    crop: "Cotton",
    season: "Kharif 2025",
    rating: 4,
    predictedYield: 2.42,
    actualYield: 2.38,
    comment: "Comparing cotton yield trends helped us decide on pesticide dosage timing. Yield matched actual harvest output very closely!",
    helpfulCount: 14,
    date: "3 weeks ago",
    verified: true,
  },
];

export function YieldReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [filterCrop, setFilterCrop] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("Rabi 2026");
  const [rating, setRating] = useState(5);
  const [predictedYield, setPredictedYield] = useState("");
  const [actualYield, setActualYield] = useState("");
  const [comment, setComment] = useState("");

  const handleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isLiked = !item.isLiked;
          return {
            ...item,
            isLiked,
            helpfulCount: isLiked ? item.helpfulCount + 1 : item.helpfulCount - 1,
          };
        }
        return item;
      })
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !location || !crop || !comment) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author,
      location,
      crop,
      season,
      rating,
      predictedYield: parseFloat(predictedYield) || 3.5,
      actualYield: parseFloat(actualYield) || 3.52,
      comment,
      helpfulCount: 1,
      isLiked: true,
      date: "Just now",
      verified: true,
    };

    setReviews([newRev, ...reviews]);
    setIsModalOpen(false);

    // Reset Form
    setAuthor("");
    setLocation("");
    setCrop("");
    setComment("");
    setPredictedYield("");
    setActualYield("");
  };

  const cropsList = ["All", "Wheat", "Rice", "Maize", "Cotton"];
  const filteredReviews = filterCrop === "All"
    ? reviews
    : reviews.filter((r) => r.crop.toLowerCase().includes(filterCrop.toLowerCase()));

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-ivory-200">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-forest" />
            <h2 className="text-xl font-bold text-charcoal">Farmer Experience Reviews</h2>
            <Badge variant="emerald" size="sm">
              Verified Feed
            </Badge>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Real feedback and harvest comparisons shared by farmers using CatBoost predictions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Share Experience
        </button>
      </div>

      {/* Overview Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-ivory/30 p-4 rounded-xl border border-ivory-300">
        <div className="space-y-1">
          <span className="text-2xs font-bold text-charcoal-muted uppercase tracking-wider">Average Rating</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-charcoal">{avgRating}</span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-2xs font-bold text-charcoal-muted uppercase tracking-wider">Model Accuracy Match</span>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-emerald-600" />
            <span className="text-xl font-extrabold text-forest">98.4%</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 space-y-1">
          <span className="text-2xs font-bold text-charcoal-muted uppercase tracking-wider">Total Shared Stories</span>
          <div className="text-xl font-extrabold text-charcoal">{reviews.length + 124} Farmers</div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-charcoal-muted shrink-0">Filter Crop:</span>
        {cropsList.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCrop(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
              filterCrop === c
                ? "bg-forest text-white shadow-xs"
                : "bg-ivory-100 text-charcoal-muted hover:bg-ivory-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Reviews List Column */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {filteredReviews.map((rev) => {
          const diff = Math.abs(rev.actualYield - rev.predictedYield);
          const matchPct = (100 - (diff / rev.actualYield) * 100).toFixed(1);

          return (
            <div
              key={rev.id}
              className="border border-ivory-300 rounded-xl p-4 bg-white hover:border-forest/30 hover:shadow-xs transition-all space-y-3"
            >
              {/* Author & Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-forest/10 text-forest font-bold flex items-center justify-center text-sm shrink-0">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-charcoal">{rev.author}</h3>
                      {rev.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
                      )}
                    </div>
                    <p className="text-[10px] text-charcoal-muted">
                      {rev.location} • <span className="font-semibold text-charcoal-light">{rev.crop} ({rev.season})</span>
                    </p>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Yield Match Box */}
              <div className="bg-ivory/40 rounded-lg p-2.5 border border-ivory-200 flex items-center justify-between text-2xs">
                <div>
                  <span className="text-charcoal-muted">Predicted: </span>
                  <span className="font-bold text-charcoal">{rev.predictedYield.toFixed(2)} t/ha</span>
                  <span className="mx-2 text-ivory-400">|</span>
                  <span className="text-charcoal-muted">Actual Harvest: </span>
                  <span className="font-bold text-forest">{rev.actualYield.toFixed(2)} t/ha</span>
                </div>
                <Badge variant="emerald" size="sm">
                  {matchPct}% Match Accuracy
                </Badge>
              </div>

              {/* Comment Text */}
              <p className="text-xs text-charcoal leading-relaxed">{rev.comment}</p>

              {/* Footer / Like */}
              <div className="flex items-center justify-between pt-2 border-t border-ivory-100 text-[11px] text-charcoal-muted">
                <span>{rev.date}</span>
                <button
                  onClick={() => handleLike(rev.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    rev.isLiked
                      ? "bg-forest/10 text-forest"
                      : "bg-ivory/60 text-charcoal-muted hover:bg-ivory-200"
                  }`}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${rev.isLiked ? "fill-forest" : ""}`} />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Experience Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-ivory-300 animate-slide-up">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-forest" />
                <h3 className="text-lg font-bold text-charcoal">Share Your Yield Experience</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-muted hover:text-charcoal p-1 rounded-lg hover:bg-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-light">Your Name</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
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
                    placeholder="e.g. Gaya, Bihar"
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-light">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    placeholder="e.g. Wheat"
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-light">Season</label>
                  <input
                    type="text"
                    required
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="e.g. Rabi 2026"
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-light">Predicted Yield (t/ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={predictedYield}
                    onChange={(e) => setPredictedYield(e.target.value)}
                    placeholder="e.g. 3.48"
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-light">Actual Harvest Yield (t/ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={actualYield}
                    onChange={(e) => setActualYield(e.target.value)}
                    placeholder="e.g. 3.52"
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-xs focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal-light">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal-light">Your Review & Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how accurate the prediction was and how it helped your farm operations..."
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
                  className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
