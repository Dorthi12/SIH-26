import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    FilePlus2,
    Files,
    FileText,
    Star,
    HelpCircle,
    MessageSquare,
    Sparkles,
    ShieldCheck,
    Search,
    ThumbsUp,
    Building2,
    CheckCircle2
} from "lucide-react";

import { DemoReviewModal } from "../components/complaints/DemoReviewModal";
import { QueryWindowModal } from "../components/complaints/QueryWindowModal";

interface ComplaintOption {
    title: string;
    description: string;
    icon: React.ElementType;
    path?: string;
    action?: string;
    buttonText: string;
    badge?: string;
}

export default function ComplaintsDashboard() {
    const navigate = useNavigate();

    // Modal States
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isQueryOpen, setIsQueryOpen] = useState(false);
    const [reviewInitialTab, setReviewInitialTab] = useState<"reviews" | "add" | "analytics">("reviews");
    const [quickQueryText, setQuickQueryText] = useState("");

    const complaintOptions: ComplaintOption[] = [
        {
            title: "Create Complaint",
            description:
                "Report a new issue or complaint and provide all the necessary details and evidence.",
            icon: FilePlus2,
            path: "/createcomplaints",
            buttonText: "Create Complaint",
        },
        {
            title: "See All Complaints",
            description:
                "View complaints submitted across the platform and track their status and resolutions.",
            icon: Files,
            path: "/viewcomplaints",
            buttonText: "View All Complaints",
        },
        {
            title: "My Complaints",
            description:
                "View and track the status of complaints that you have submitted.",
            icon: FileText,
            path: "/viewmycomplaints",
            buttonText: "View My Complaints",
        },
        {
            title: "Complaint Review Window",
            description:
                "Browse verified farmer reviews on resolved cases, officer ratings, and submit feedback.",
            icon: Star,
            action: "review_window",
            buttonText: "Open Review Window",
            badge: "Interactive Audit",
        },
        {
            title: "Query & Support Window",
            description:
                "Ask quick grievance questions, get instant AI assistance, track ticket IDs, and read FAQs.",
            icon: HelpCircle,
            action: "query_window",
            buttonText: "Open Query Window",
            badge: "24/7 AI Helper",
        },
    ];

    const handleCardClick = (option: ComplaintOption) => {
        if (option.path) {
            navigate(option.path);
        } else if (option.action === "review_window") {
            setReviewInitialTab("reviews");
            setIsReviewOpen(true);
        } else if (option.action === "query_window") {
            setIsQueryOpen(true);
        }
    };

    const handleQuickQuerySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsQueryOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#F7F5ED] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* HEADER */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#315C3A] transition hover:text-[#23452B]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#315C3A] text-white shadow-sm">
                                <FileText className="h-7 w-7" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-2xl font-semibold tracking-tight text-[#26352A] sm:text-3xl">
                                        Complaints & Grievance Hub
                                    </h1>
                                    <span className="rounded-full bg-[#E8EFE6] px-3 py-1 text-xs font-bold text-[#315C3A]">
                                        AgriSense Protection
                                    </span>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B746D]">
                                    Report issues, track submitted complaints, browse verified resolution reviews, and access instant legal & grievance support.
                                </p>
                            </div>
                        </div>

                        {/* TOP QUICK ACTION BUTTONS */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setReviewInitialTab("reviews");
                                    setIsReviewOpen(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE5D9] bg-white px-4 py-2.5 text-xs font-bold text-[#315C3A] shadow-sm transition hover:bg-[#EEF4EB]"
                            >
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                Complaint Review Window
                            </button>

                            <button
                                onClick={() => setIsQueryOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#315C3A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#274B2F]"
                            >
                                <HelpCircle className="h-4 w-4 text-emerald-300" />
                                Query Window
                            </button>
                        </div>
                    </div>
                </div>

                {/* QUICK QUERY INPUT BANNER */}
                <div className="mb-10 rounded-2xl border border-[#DCE5D9] bg-gradient-to-r from-[#EEF4EB] via-white to-[#EEF4EB] p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#315C3A] text-white">
                                <Sparkles className="h-5 w-5 text-amber-300" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#26352A]">Have a Quick Question or Grievance Query?</h3>
                                <p className="text-xs text-[#6B746D]">Type your query below to launch our instant AI Query & Legal Support Window.</p>
                            </div>
                        </div>

                        <form onSubmit={handleQuickQuerySubmit} className="flex w-full items-center gap-2 md:max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B746D]" />
                                <input
                                    type="text"
                                    placeholder="e.g. How to appeal a Panchayat land ruling?"
                                    value={quickQueryText}
                                    onChange={(e) => setQuickQueryText(e.target.value)}
                                    className="w-full rounded-xl border border-[#E2E0D7] bg-white pl-10 pr-4 py-2.5 text-xs text-[#26352A] outline-none focus:border-[#315C3A] focus:ring-1 focus:ring-[#315C3A]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#315C3A] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#274B2F]"
                            >
                                Ask Query
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* MAIN CARDS OPTIONS GRID */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {complaintOptions.map((option) => {
                        const Icon = option.icon;

                        return (
                            <div
                                key={option.title}
                                className="group relative flex flex-col justify-between rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#315C3A]/40 hover:shadow-md"
                            >
                                <div>
                                    {/* BADGE IF ANY */}
                                    {option.badge && (
                                        <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                            {option.badge}
                                        </span>
                                    )}

                                    {/* ICON */}
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EFE6] text-[#315C3A] transition group-hover:bg-[#315C3A] group-hover:text-white">
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    {/* CONTENT */}
                                    <h2 className="mt-5 text-lg font-semibold text-[#26352A]">
                                        {option.title}
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-[#6B746D]">
                                        {option.description}
                                    </p>
                                </div>

                                {/* BUTTON */}
                                <button
                                    type="button"
                                    onClick={() => handleCardClick(option)}
                                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#315C3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#274B2F]"
                                >
                                    {option.buttonText}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* DEMO REVIEW HIGHLIGHT WIDGET SECTION */}
                <div className="mt-10 rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#F0EFEA] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#26352A]">Verified Farmer Resolution Reviews</h3>
                                <p className="text-xs text-[#6B746D]">Live rating metrics from 1,240+ resolved agricultural grievances.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold text-[#26352A]">
                            <div className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span>4.8 / 5.0 Rating</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1.5 text-emerald-700">
                                <ShieldCheck className="h-4 w-4" />
                                <span>96.4% Verified Audit</span>
                            </div>
                            <button
                                onClick={() => {
                                    setReviewInitialTab("reviews");
                                    setIsReviewOpen(true);
                                }}
                                className="rounded-xl bg-[#EEF4EB] px-3.5 py-1.5 text-xs font-bold text-[#315C3A] hover:bg-[#DCE8D8] transition"
                            >
                                Open Full Review Window →
                            </button>
                        </div>
                    </div>

                    {/* RECENT REVIEW PREVIEW STRIP */}
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] p-4 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[#26352A]">Rameshwar Singh (Ludhiana, PB)</span>
                                <span className="flex items-center text-amber-500 font-bold">5.0 ⭐</span>
                            </div>
                            <p className="mt-1.5 text-[#5F6B61] italic">
                                "Pond Canal Water Supply Restored in 48 Hours! District Water Officer inspected on site within 24 hours."
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B746D]">
                                <span>Ref: CMP-8942 • Irrigation</span>
                                <span className="text-emerald-700 font-semibold">✓ Verified Resolution</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] p-4 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[#26352A]">Anita Devi (Muzaffarpur, BR)</span>
                                <span className="flex items-center text-amber-500 font-bold">4.0 ⭐</span>
                            </div>
                            <p className="mt-1.5 text-[#5F6B61] italic">
                                "Fair Commission Enforced at APMC Mandi. Agriculture Inspector intervened and refunded excess deduction."
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B746D]">
                                <span>Ref: CMP-7731 • Market Monopoly</span>
                                <span className="text-emerald-700 font-semibold">✓ Verified Resolution</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO SECTION */}
                <div className="mt-8 rounded-2xl border border-[#DCE5D9] bg-[#EEF4EB] p-5 sm:p-6">
                    <div className="flex gap-4">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE8D8] text-[#315C3A]">
                            <FileText className="h-4 w-4" />
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-[#315C3A]">
                                Complaint & Resolution Management System
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-[#5F6B61]">
                                Use the options above to report a new issue, browse all public complaints, monitor submitted cases, check verified reviews, or ask questions in the instant Query Window.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* MODALS */}
            <DemoReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                initialTab={reviewInitialTab}
            />

            <QueryWindowModal
                isOpen={isQueryOpen}
                onClose={() => setIsQueryOpen(false)}
                initialQuery={quickQueryText}
            />
        </div>
    );
}
