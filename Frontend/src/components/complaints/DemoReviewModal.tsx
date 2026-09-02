import { useState } from "react";
import {
    X,
    Star,
    Filter,
    Search,
    ShieldCheck,
    ThumbsUp,
    MessageSquare,
    CheckCircle2,
    BarChart3,
    TrendingUp,
    UserCheck,
    Send,
    Plus,
    Building2,
    Award
} from "lucide-react";

export interface DemoReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "reviews" | "add" | "analytics";
}

interface DemoReview {
    id: string;
    complaintId: string;
    author: string;
    location: string;
    category: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
    officerName: string;
    officerRole: string;
    officerNote: string;
    helpfulCount: number;
    verified: boolean;
    satisfactionScores: {
        speed: number;
        transparency: number;
        fairness: number;
    };
}

const INITIAL_REVIEWS: DemoReview[] = [
    {
        id: "REV-101",
        complaintId: "CMP-8942",
        author: "Rameshwar Singh",
        location: "Ludhiana, Punjab",
        category: "Irrigation",
        rating: 5,
        title: "Pond Canal Water Supply Restored in 48 Hours!",
        comment: "Our village canal pipeline had been blocked due to unauthorized illegal diversion. After submitting the complaint on AgriSense, District Water Officer inspected within 24 hours and restored normal flow. Excellent responsiveness!",
        date: "Aug 29, 2026",
        officerName: "Er. S. K. Verma",
        officerRole: "Executive Engineer, Irrigation Dept",
        officerNote: "Inspection conducted on site on Aug 28. Illegal obstruction removed and supply restored to 120 hectares of farmland.",
        helpfulCount: 38,
        verified: true,
        satisfactionScores: { speed: 5, transparency: 5, fairness: 5 },
    },
    {
        id: "REV-102",
        complaintId: "CMP-7731",
        author: "Anita Devi",
        location: "Muzaffarpur, Bihar",
        category: "Market Monopoly",
        rating: 4,
        title: "Fair Commission Enforced at APMC Mandi",
        comment: "Local middleman was charging 4% illegal commission over MSP for maize sales. Reported with digital receipt proof. Agriculture Inspector intervened and refunded excess deduction.",
        date: "Aug 26, 2026",
        officerName: "Rajesh Kumar Jha",
        officerRole: "APMC Secretary & Inspector",
        officerNote: "Mandi license of non-compliant trader suspended for 7 days. Excess fee refunded directly to farmer's UPI account.",
        helpfulCount: 29,
        verified: true,
        satisfactionScores: { speed: 4, transparency: 5, fairness: 4 },
    },
    {
        id: "REV-103",
        complaintId: "CMP-6510",
        author: "Gurpreet Singh Gill",
        location: "Bhatinda, Punjab",
        category: "Crop Storage",
        rating: 5,
        title: "Cold Storage Humidity Meter Calibrated",
        comment: "District cold storage facility was overcharging moisture penalty claiming high grain moisture. AgriSense inspection verified accurate 12% moisture level and saved us ₹45,000 in unfair fees.",
        date: "Aug 21, 2026",
        officerName: "Dr. Manmohan Chawla",
        officerRole: "Quality Assurance Officer",
        officerNote: "Third-party digital moisture meter audit completed. Storage facility instructed to adhere strictly to standardized testing.",
        helpfulCount: 42,
        verified: true,
        satisfactionScores: { speed: 5, transparency: 5, fairness: 5 },
    },
    {
        id: "REV-104",
        complaintId: "CMP-5421",
        author: "Suresh Bhai Patel",
        location: "Anand, Gujarat",
        category: "Panchayat Misjudgement",
        rating: 5,
        title: "Community Well Usage Rights Restored",
        comment: "Panchayat resolution was illegally restricting small landholders from accessing community solar irrigation pump. Grievance escalated to District Collectorate and resolved amicably.",
        date: "Aug 15, 2026",
        officerName: "Priyanka Desai",
        officerRole: "District Development Officer",
        officerNote: "Revised Panchayat allocation schedule issued ensuring equitable 4-hour daily water slot for small farmers.",
        helpfulCount: 51,
        verified: true,
        satisfactionScores: { speed: 4, transparency: 5, fairness: 5 },
    },
];

const CATEGORIES = [
    "All Categories",
    "Irrigation",
    "Crop Storage",
    "Market Monopoly",
    "Organised Crime",
    "Panchayat Misjudgement",
    "Others",
];

export function DemoReviewModal({ isOpen, onClose, initialTab = "reviews" }: DemoReviewModalProps) {
    const [activeTab, setActiveTab] = useState<"reviews" | "add" | "analytics">(initialTab);
    const [reviews, setReviews] = useState<DemoReview[]>(INITIAL_REVIEWS);
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [minRating, setMinRating] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState("");

    // Form state for adding review
    const [formData, setFormData] = useState({
        complaintId: "CMP-" + Math.floor(1000 + Math.random() * 9000),
        author: "",
        location: "",
        category: "Irrigation",
        rating: 5,
        title: "",
        comment: "",
        speed: 5,
        transparency: 5,
        fairness: 5,
    });
    const [submitSuccess, setSubmitSuccess] = useState(false);

    if (!isOpen) return null;

    // Helpful counter increment
    const handleHelpful = (id: string) => {
        setReviews((prev) =>
            prev.map((rev) => (rev.id === id ? { ...rev, helpfulCount: rev.helpfulCount + 1 } : rev))
        );
    };

    // Filter reviews
    const filteredReviews = reviews.filter((rev) => {
        const matchesCategory =
            selectedCategory === "All Categories" || rev.category === selectedCategory;
        const matchesRating = rev.rating >= minRating;
        const matchesSearch =
            rev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rev.complaintId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesRating && matchesSearch;
    });

    // Handle Form Submit
    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.author || !formData.title || !formData.comment) return;

        const newRev: DemoReview = {
            id: `REV-${100 + reviews.length + 1}`,
            complaintId: formData.complaintId,
            author: formData.author,
            location: formData.location || "District Headquarters",
            category: formData.category,
            rating: Number(formData.rating),
            title: formData.title,
            comment: formData.comment,
            date: "Just Now",
            officerName: "AgriSense Resolution Cell",
            officerRole: "Verified Grievance Desk",
            officerNote: "Resolution feedback verified and logged into AgriSense Trust Registry.",
            helpfulCount: 1,
            verified: true,
            satisfactionScores: {
                speed: Number(formData.speed),
                transparency: Number(formData.transparency),
                fairness: Number(formData.fairness),
            },
        };

        setReviews([newRev, ...reviews]);
        setSubmitSuccess(true);
        setTimeout(() => {
            setSubmitSuccess(false);
            setActiveTab("reviews");
            setFormData({
                complaintId: "CMP-" + Math.floor(1000 + Math.random() * 9000),
                author: "",
                location: "",
                category: "Irrigation",
                rating: 5,
                title: "",
                comment: "",
                speed: 5,
                transparency: 5,
                fairness: 5,
            });
        }, 1800);
    };

    // Statistics calculations
    const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
    const totalVerified = reviews.filter((r) => r.verified).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#DCE5D9] bg-[#F7F5ED] shadow-2xl">
                
                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-[#E2E0D7] bg-white px-6 py-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#315C3A] text-white shadow-sm">
                            <Star className="h-6 w-6 fill-amber-300 text-amber-300" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[#26352A]">
                                    Complaint Review & Feedback Portal
                                </h2>
                                <span className="rounded-full bg-[#E8EFE6] px-2.5 py-0.5 text-xs font-semibold text-[#315C3A]">
                                    Verified Case Audit
                                </span>
                            </div>
                            <p className="text-xs text-[#6B746D] sm:text-sm">
                                Review resolved grievances, officer response metrics, and farmer satisfaction audit notes.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-[#6B746D] transition hover:bg-[#EEF4EB] hover:text-[#26352A]"
                        title="Close Window"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* STATS HIGHLIGHT BAR */}
                <div className="grid grid-cols-2 gap-4 border-b border-[#E2E0D7] bg-[#EEF4EB] px-6 py-3.5 sm:grid-cols-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-[#26352A]">{avgRating} / 5.0 ⭐</div>
                            <div className="text-xs text-[#6B746D]">Avg Resolution Score</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCE8D8] text-[#315C3A]">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-[#26352A]">{totalVerified + 1240}+ Cases</div>
                            <div className="text-xs text-[#6B746D]">Verified Resolutions</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-[#26352A]">96.4%</div>
                            <div className="text-xs text-[#6B746D]">48h SLA Adherence</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-[#26352A]">98.2%</div>
                            <div className="text-xs text-[#6B746D]">Officer Audit Rating</div>
                        </div>
                    </div>
                </div>

                {/* TAB CONTROLS & SEARCH */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#E2E0D7] bg-white px-6 py-4 sm:flex-row sm:items-center sm:px-8">
                    <div className="flex items-center gap-2 rounded-xl bg-[#F7F5ED] p-1 border border-[#E2E0D7]">
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                                activeTab === "reviews"
                                    ? "bg-[#315C3A] text-white shadow-sm"
                                    : "text-[#6B746D] hover:text-[#26352A]"
                            }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Browse Reviews ({filteredReviews.length})
                        </button>

                        <button
                            onClick={() => setActiveTab("add")}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                                activeTab === "add"
                                    ? "bg-[#315C3A] text-white shadow-sm"
                                    : "text-[#6B746D] hover:text-[#26352A]"
                            }`}
                        >
                            <Plus className="h-4 w-4" />
                            Submit Review
                        </button>

                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                                activeTab === "analytics"
                                    ? "bg-[#315C3A] text-white shadow-sm"
                                    : "text-[#6B746D] hover:text-[#26352A]"
                            }`}
                        >
                            <BarChart3 className="h-4 w-4" />
                            Audit Analytics
                        </button>
                    </div>

                    {activeTab === "reviews" && (
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B746D]" />
                            <input
                                type="text"
                                placeholder="Search by district, title, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] pl-9 pr-4 py-2 text-xs text-[#26352A] placeholder-[#6B746D] outline-none focus:border-[#315C3A] focus:ring-1 focus:ring-[#315C3A]"
                            />
                        </div>
                    )}
                </div>

                {/* MODAL CONTENT BODY */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    
                    {/* TAB 1: BROWSE REVIEWS */}
                    {activeTab === "reviews" && (
                        <div className="space-y-6">
                            {/* FILTERS BAR */}
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E0D7] bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold text-[#315C3A]">
                                    <Filter className="h-4 w-4" />
                                    <span>Filter Reviews:</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                                selectedCategory === cat
                                                    ? "bg-[#315C3A] text-white"
                                                    : "bg-[#EEF4EB] text-[#315C3A] hover:bg-[#DCE8D8]"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1 border-l border-[#E2E0D7] pl-3 text-xs">
                                    <span className="text-[#6B746D]">Min Rating:</span>
                                    {[0, 4, 5].map((stars) => (
                                        <button
                                            key={stars}
                                            onClick={() => setMinRating(stars)}
                                            className={`rounded-lg px-2 py-1 font-semibold transition ${
                                                minRating === stars
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-[#F7F5ED] text-[#6B746D] hover:bg-[#E2E0D7]"
                                            }`}
                                        >
                                            {stars === 0 ? "All" : `${stars}★`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* REVIEWS LIST */}
                            {filteredReviews.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#DCE5D9] bg-white p-12 text-center">
                                    <MessageSquare className="mx-auto h-10 w-10 text-[#6B746D]" />
                                    <h3 className="mt-3 text-sm font-semibold text-[#26352A]">No Reviews Found</h3>
                                    <p className="mt-1 text-xs text-[#6B746D]">Try clearing search or changing category filters.</p>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory("All Categories");
                                            setMinRating(0);
                                            setSearchQuery("");
                                        }}
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#315C3A] px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {filteredReviews.map((rev) => (
                                        <div
                                            key={rev.id}
                                            className="group rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm transition hover:border-[#315C3A]/40 hover:shadow-md"
                                        >
                                            {/* HEADER INFO */}
                                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0EFEA] pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EFE6] font-bold text-[#315C3A]">
                                                        {rev.author.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-[#26352A]">{rev.author}</h4>
                                                            {rev.verified && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                                                    <ShieldCheck className="h-3 w-3" />
                                                                    Verified Farmer
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-[#6B746D]">
                                                            <span>📍 {rev.location}</span>
                                                            <span>•</span>
                                                            <span>📅 {rev.date}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-xl bg-[#EEF4EB] px-3 py-1 text-xs font-semibold text-[#315C3A]">
                                                        {rev.category}
                                                    </span>
                                                    <span className="rounded-xl bg-[#F7F5ED] px-2.5 py-1 text-xs font-bold text-[#6B746D] border border-[#E2E0D7]">
                                                        Ref: {rev.complaintId}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* RATING & TITLE */}
                                            <div className="mt-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-4 w-4 ${
                                                                    star <= rev.rating
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-gray-300"
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-bold text-[#26352A]">{rev.rating}.0 / 5.0</span>
                                                </div>

                                                <h3 className="mt-2 text-base font-bold text-[#26352A]">{rev.title}</h3>
                                                <p className="mt-2 text-xs leading-relaxed text-[#5F6B61] sm:text-sm">
                                                    "{rev.comment}"
                                                </p>
                                            </div>

                                            {/* SATISFACTION SCORES BREAKDOWN */}
                                            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#F7F5ED] p-3 text-center text-xs">
                                                <div>
                                                    <span className="block text-[11px] text-[#6B746D]">Speed</span>
                                                    <span className="font-bold text-[#315C3A]">{rev.satisfactionScores.speed}/5 ⭐</span>
                                                </div>
                                                <div className="border-x border-[#E2E0D7]">
                                                    <span className="block text-[11px] text-[#6B746D]">Transparency</span>
                                                    <span className="font-bold text-[#315C3A]">{rev.satisfactionScores.transparency}/5 ⭐</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[11px] text-[#6B746D]">Fairness</span>
                                                    <span className="font-bold text-[#315C3A]">{rev.satisfactionScores.fairness}/5 ⭐</span>
                                                </div>
                                            </div>

                                            {/* OFFICIAL OFFICER RESPONSE BOX */}
                                            <div className="mt-4 rounded-xl border border-[#DCE5D9] bg-[#EEF4EB] p-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-[#315C3A]">
                                                    <Building2 className="h-4 w-4" />
                                                    <span>Official Officer Resolution Note:</span>
                                                </div>
                                                <p className="mt-1.5 text-xs text-[#4A574C] italic">
                                                    "{rev.officerNote}"
                                                </p>
                                                <div className="mt-2 text-[11px] font-semibold text-[#6B746D]">
                                                    — {rev.officerName} ({rev.officerRole})
                                                </div>
                                            </div>

                                            {/* FOOTER ACTIONS */}
                                            <div className="mt-4 flex items-center justify-between pt-2">
                                                <button
                                                    onClick={() => handleHelpful(rev.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E0D7] bg-white px-3 py-1.5 text-xs font-medium text-[#6B746D] transition hover:bg-[#F7F5ED] hover:text-[#315C3A]"
                                                >
                                                    <ThumbsUp className="h-3.5 w-3.5" />
                                                    <span>Helpful ({rev.helpfulCount})</span>
                                                </button>

                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Resolution Audit
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: WRITE A DEMO REVIEW */}
                    {activeTab === "add" && (
                        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6 border-b border-[#E2E0D7] pb-4">
                                <h3 className="text-lg font-bold text-[#26352A]">Submit Complaint Resolution Review</h3>
                                <p className="mt-1 text-xs text-[#6B746D]">
                                    Share your experience regarding grievance handling, officer response time, and fairness.
                                </p>
                            </div>

                            {submitSuccess ? (
                                <div className="rounded-2xl bg-emerald-50 p-8 text-center text-emerald-800 border border-emerald-200 animate-fadeIn">
                                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                                    <h4 className="mt-3 text-lg font-bold">Review Submitted Successfully!</h4>
                                    <p className="mt-1 text-xs text-emerald-700">
                                        Your review has been logged into the AgriSense resolution registry and audit log.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-5 text-xs sm:text-sm">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block font-semibold text-[#26352A]">Farmer / Reviewer Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Baldev Singh"
                                                value={formData.author}
                                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A] focus:ring-1 focus:ring-[#315C3A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-[#26352A]">District / State *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Karnal, Haryana"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A] focus:ring-1 focus:ring-[#315C3A]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block font-semibold text-[#26352A]">Complaint Category *</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A]"
                                            >
                                                {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-[#26352A]">Complaint Ref Number</label>
                                            <input
                                                type="text"
                                                value={formData.complaintId}
                                                onChange={(e) => setFormData({ ...formData, complaintId: e.target.value })}
                                                className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A]"
                                            />
                                        </div>
                                    </div>

                                    {/* STAR RATING PICKER */}
                                    <div>
                                        <label className="block font-semibold text-[#26352A]">Overall Rating *</label>
                                        <div className="mt-2 flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    className="p-1 transition transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`h-7 w-7 ${
                                                            star <= formData.rating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="ml-2 font-bold text-[#315C3A]">{formData.rating} Stars</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-[#26352A]">Review Title *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Summary of resolution experience..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-[#26352A]">Detailed Review & Comments *</label>
                                        <textarea
                                            rows={4}
                                            required
                                            placeholder="Describe how the complaint officer handled your case, resolution time, and outcome..."
                                            value={formData.comment}
                                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#315C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#274B2F] shadow-sm"
                                    >
                                        <Send className="h-4 w-4" />
                                        Submit Resolution Review
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* TAB 3: AUDIT ANALYTICS */}
                    {activeTab === "analytics" && (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm">
                                    <h4 className="text-sm font-bold text-[#26352A] flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-[#315C3A]" />
                                        Rating Distribution
                                    </h4>

                                    <div className="mt-4 space-y-3">
                                        {[
                                            { stars: "5 Stars", pct: 78, count: "1,107" },
                                            { stars: "4 Stars", pct: 16, count: "228" },
                                            { stars: "3 Stars", pct: 4, count: "57" },
                                            { stars: "2 Stars", pct: 1.5, count: "21" },
                                            { stars: "1 Star", pct: 0.5, count: "7" },
                                        ].map((item) => (
                                            <div key={item.stars} className="flex items-center gap-3 text-xs">
                                                <span className="w-14 font-semibold text-[#26352A]">{item.stars}</span>
                                                <div className="flex-1 overflow-hidden rounded-full bg-[#EEF4EB] h-2.5">
                                                    <div
                                                        className="h-full bg-amber-400 rounded-full"
                                                        style={{ width: `${item.pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-right font-medium text-[#6B746D]">{item.pct}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm">
                                    <h4 className="text-sm font-bold text-[#26352A] flex items-center gap-2">
                                        <Award className="h-4 w-4 text-[#315C3A]" />
                                        Top Performing Resolution Offices
                                    </h4>

                                    <div className="mt-4 space-y-3 text-xs">
                                        {[
                                            { district: "Ludhiana District Agri Desk", avg: "4.9 ⭐", resolved: "340 Cases" },
                                            { district: "Anand District Panchayat Cell", avg: "4.8 ⭐", resolved: "290 Cases" },
                                            { district: "Muzaffarpur APMC Inspectorate", avg: "4.7 ⭐", resolved: "215 Cases" },
                                            { district: "Karnal Irrigation Board", avg: "4.7 ⭐", resolved: "190 Cases" },
                                        ].map((dept, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-xl bg-[#F7F5ED] p-3 border border-[#E2E0D7]">
                                                <div>
                                                    <span className="font-bold text-[#26352A]">{dept.district}</span>
                                                    <div className="text-[11px] text-[#6B746D]">{dept.resolved}</div>
                                                </div>
                                                <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-bold text-emerald-800">
                                                    {dept.avg}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* MODAL FOOTER */}
                <div className="flex items-center justify-between border-t border-[#E2E0D7] bg-white px-6 py-4 sm:px-8">
                    <span className="text-xs text-[#6B746D]">
                        AgriSense Grievance Audit & Review System • 100% Verified Farmer Feedback
                    </span>
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-[#315C3A] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#274B2F]"
                    >
                        Close Window
                    </button>
                </div>

            </div>
        </div>
    );
}
