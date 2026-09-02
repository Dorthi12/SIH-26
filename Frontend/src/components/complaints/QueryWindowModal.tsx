import { useState } from "react";
import {
    X,
    HelpCircle,
    Send,
    Search,
    Clock,
    CheckCircle2,
    MessageSquare,
    Sparkles,
    AlertCircle,
    Bot,
    ChevronDown,
    ChevronUp,
    FileText,
    Shield,
    PhoneCall,
    UserCheck,
    ArrowRight
} from "lucide-react";

export interface QueryWindowModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery?: string;
}

interface SubmittedQuery {
    id: string;
    topic: string;
    priority: string;
    question: string;
    createdAt: string;
    status: "Received" | "Under Review" | "Action Taken" | "Resolved";
    aiSummary: string;
    assignedOfficer: string;
    expectedResolution: string;
}

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const SAMPLE_FAQS: FAQItem[] = [
    {
        category: "Complaint Rules",
        question: "What documents are required to file a complaint against mandi price corruption?",
        answer: "You will need: 1) Proof of sale receipt / weighment slip, 2) Mandi trader license number or name, 3) Bank transaction proof showing excess deduction. Images can be attached directly in AgriSense."
    },
    {
        category: "Irrigation Delays",
        question: "How long does it take for District Water Board to act on canal water theft?",
        answer: "Under AgriSense Priority SLA guidelines, canal blockage and water diversion complaints trigger an mandatory site audit within 24 to 48 hours."
    },
    {
        category: "Panchayat Disputes",
        question: "Can I file an appeal if Panchayat misjudges a land / water allocation dispute?",
        answer: "Yes! If Panchayat resolution is biased or non-binding, AgriSense escalates your grievance directly to the District Development Officer (DDO) and Sub-Divisional Magistrate (SDM)."
    },
    {
        category: "Anonymity",
        question: "Are my personal details protected when complaining against organized crime?",
        answer: "Yes. AgriSense features end-to-end identity encryption. When reporting organized crime or extortion, your name is hidden from local authorities and accessible only to state-level oversight."
    }
];

const PRE_SEEDED_PROMPTS = [
    "What documents are required for Panchayat appeal?",
    "How to report mandi price manipulation?",
    "What is the timeline for canal water complaints?",
    "Can I file a complaint anonymously?"
];

export function QueryWindowModal({ isOpen, onClose, initialQuery = "" }: QueryWindowModalProps) {
    const [activeTab, setActiveTab] = useState<"submit" | "ai" | "track" | "faq">("submit");
    const [queryText, setQueryText] = useState(initialQuery);
    const [topic, setTopic] = useState("Panchayat Misjudgement");
    const [priority, setPriority] = useState<"Low" | "Normal" | "Urgent">("Normal");
    
    // Submitted queries state
    const [submittedQueries, setSubmittedQueries] = useState<SubmittedQuery[]>([
        {
            id: "QRY-89021",
            topic: "Irrigation & Water Access",
            priority: "Urgent",
            question: "Village tube-well motor burnt out 5 days ago and Panchayat has not released repair fund.",
            createdAt: "Aug 30, 2026",
            status: "Under Review",
            aiSummary: "Grievance identified as critical public utility failure under Gram Panchayat Maintenance Policy. Assigned to Block Development Officer.",
            assignedOfficer: "Shri R. K. Bishnoi (BDO Office)",
            expectedResolution: "Within 24 Hours",
        }
    ]);

    const [lastSubmitted, setLastSubmitted] = useState<SubmittedQuery | null>(null);

    // AI Chat State inside window
    const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
        {
            sender: "ai",
            text: "Hello! I am AgriSense AI Grievance Assistant. Ask me anything regarding agricultural legal rights, complaint timelines, or mandi dispute rules.",
            time: "Just now"
        }
    ]);
    const [chatInput, setChatInput] = useState("");

    // Tracking state
    const [trackId, setTrackId] = useState("QRY-89021");
    const [trackedResult, setTrackedResult] = useState<SubmittedQuery | null>(submittedQueries[0]);

    // FAQ Accordion State
    const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
    const [faqSearch, setFaqSearch] = useState("");

    if (!isOpen) return null;

    // Handle Quick Query Submission
    const handleSubmitQuery = (e: React.FormEvent) => {
        e.preventDefault();
        if (!queryText.trim()) return;

        const newId = `QRY-${Math.floor(10000 + Math.random() * 90000)}`;
        const newQuery: SubmittedQuery = {
            id: newId,
            topic: topic,
            priority: priority,
            question: queryText,
            createdAt: "Just now",
            status: "Received",
            aiSummary: `AI Analysis: Query regarding ${topic} processed. Priority [${priority}] logged into AgriSense Helpdesk.`,
            assignedOfficer: priority === "Urgent" ? "Nodal Grievance Officer (Priority Desk)" : "District Helpdesk Officer",
            expectedResolution: priority === "Urgent" ? "12 to 24 Hours" : "24 to 48 Hours"
        };

        setSubmittedQueries([newQuery, ...submittedQueries]);
        setLastSubmitted(newQuery);
        setTrackId(newId);
        setTrackedResult(newQuery);
        setQueryText("");
    };

    // Handle AI Chat Submit
    const handleAiSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setAiMessages(prev => [...prev, { sender: "user", text: userMsg, time: now }]);
        setChatInput("");

        // Generate response
        setTimeout(() => {
            let aiReply = "Based on AgriSense Agricultural Grievance Norms: ";
            if (userMsg.toLowerCase().includes("mandi") || userMsg.toLowerCase().includes("price")) {
                aiReply += "Under APMC Act section 14, traders cannot deduct more than 1% mandi fee. If overcharged, file a complaint under 'Market Monopoly' with digital weighment receipt.";
            } else if (userMsg.toLowerCase().includes("water") || userMsg.toLowerCase().includes("irrigation")) {
                aiReply += "Canal water allocation is protected under the Northern India Canal and Drainage Act. Illegal diversion is a non-bailable offense. Nodal officers inspect within 24h.";
            } else if (userMsg.toLowerCase().includes("panchayat") || userMsg.toLowerCase().includes("land")) {
                aiReply += "Panchayat decisions can be formally challenged by submitting an appeal to the District Collector within 15 days of resolution issuance.";
            } else {
                aiReply += "Your query has been analyzed against government guidelines. You can officially register this under 'Create Complaint' or track your existing query using ticket ID.";
            }

            setAiMessages(prev => [...prev, { sender: "ai", text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }, 1000);
    };

    // Handle Track lookup
    const handleTrackLookup = (e: React.FormEvent) => {
        e.preventDefault();
        const found = submittedQueries.find(q => q.id.toLowerCase() === trackId.trim().toLowerCase());
        if (found) {
            setTrackedResult(found);
        } else {
            setTrackedResult(null);
        }
    };

    const filteredFaqs = SAMPLE_FAQS.filter(f =>
        f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#DCE5D9] bg-[#F7F5ED] shadow-2xl">
                
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-[#E2E0D7] bg-white px-6 py-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#315C3A] text-white shadow-sm">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[#26352A]">
                                    AgriSense Grievance Query & Support Hub
                                </h2>
                                <span className="rounded-full bg-[#E8EFE6] px-2.5 py-0.5 text-xs font-semibold text-[#315C3A]">
                                    24/7 Active
                                </span>
                            </div>
                            <p className="text-xs text-[#6B746D] sm:text-sm">
                                Ask quick queries, consult AI legal guidance, search FAQs, or track query ticket status.
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

                {/* TAB CONTROLS */}
                <div className="flex border-b border-[#E2E0D7] bg-white px-6 py-3 overflow-x-auto gap-2">
                    <button
                        onClick={() => setActiveTab("submit")}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                            activeTab === "submit"
                                ? "bg-[#315C3A] text-white shadow-sm"
                                : "text-[#6B746D] hover:bg-[#EEF4EB] hover:text-[#26352A]"
                        }`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Ask Quick Query
                    </button>

                    <button
                        onClick={() => setActiveTab("ai")}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                            activeTab === "ai"
                                ? "bg-[#315C3A] text-white shadow-sm"
                                : "text-[#6B746D] hover:bg-[#EEF4EB] hover:text-[#26352A]"
                        }`}
                    >
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        AI Legal & Grievance Assistant
                    </button>

                    <button
                        onClick={() => setActiveTab("track")}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                            activeTab === "track"
                                ? "bg-[#315C3A] text-white shadow-sm"
                                : "text-[#6B746D] hover:bg-[#EEF4EB] hover:text-[#26352A]"
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        Track Ticket Status
                    </button>

                    <button
                        onClick={() => setActiveTab("faq")}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                            activeTab === "faq"
                                ? "bg-[#315C3A] text-white shadow-sm"
                                : "text-[#6B746D] hover:bg-[#EEF4EB] hover:text-[#26352A]"
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        Helpdesk FAQs
                    </button>
                </div>

                {/* MODAL BODY */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    
                    {/* TAB 1: SUBMIT QUERY */}
                    {activeTab === "submit" && (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm">
                                <h3 className="text-base font-bold text-[#26352A] flex items-center gap-2">
                                    <Send className="h-4 w-4 text-[#315C3A]" />
                                    Submit a Quick Grievance Query
                                </h3>
                                <p className="mt-1 text-xs text-[#6B746D]">
                                    Have a question before filing an official complaint? Submit your query here to get instant automated analysis and routing.
                                </p>

                                <form onSubmit={handleSubmitQuery} className="mt-5 space-y-4 text-xs sm:text-sm">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block font-semibold text-[#26352A]">Query Topic *</label>
                                            <select
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A]"
                                            >
                                                <option value="Irrigation & Water Access">Irrigation & Water Access</option>
                                                <option value="Market Price & Mandi Monopoly">Market Price & Mandi Monopoly</option>
                                                <option value="Panchayat Misjudgement">Panchayat Misjudgement</option>
                                                <option value="Crop Storage & Humidity">Crop Storage & Humidity</option>
                                                <option value="Organised Crime & Extortion">Organised Crime & Extortion</option>
                                                <option value="General Legal Aid">General Legal Aid</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-[#26352A]">Urgency Priority Level *</label>
                                            <div className="mt-1 flex gap-2">
                                                {(["Low", "Normal", "Urgent"] as const).map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setPriority(p)}
                                                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition border ${
                                                            priority === p
                                                                ? p === "Urgent"
                                                                    ? "bg-red-600 text-white border-red-600"
                                                                    : "bg-[#315C3A] text-white border-[#315C3A]"
                                                                : "bg-[#F7F5ED] text-[#6B746D] border-[#E2E0D7]"
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* QUICK PROMPT CHIPS */}
                                    <div>
                                        <span className="text-xs font-semibold text-[#6B746D]">Or click a sample question:</span>
                                        <div className="mt-1.5 flex flex-wrap gap-2">
                                            {PRE_SEEDED_PROMPTS.map((chip, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setQueryText(chip)}
                                                    className="rounded-lg bg-[#EEF4EB] px-2.5 py-1 text-xs text-[#315C3A] hover:bg-[#DCE8D8] transition"
                                                >
                                                    + {chip}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-[#26352A]">Describe Your Query *</label>
                                        <textarea
                                            rows={4}
                                            required
                                            placeholder="Write your query or question here..."
                                            value={queryText}
                                            onChange={(e) => setQueryText(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-3.5 py-2.5 text-[#26352A] outline-none focus:border-[#315C3A]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#315C3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#274B2F] shadow-sm"
                                    >
                                        <Send className="h-4 w-4" />
                                        Submit Query Ticket
                                    </button>
                                </form>
                            </div>

                            {/* LAST SUBMITTED RESULT BANNER */}
                            {lastSubmitted && (
                                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 animate-fadeIn">
                                    <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            <span className="font-bold text-sm">Query Ticket Generated: {lastSubmitted.id}</span>
                                        </div>
                                        <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                            Status: {lastSubmitted.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 text-xs space-y-2">
                                        <p><strong>Topic:</strong> {lastSubmitted.topic} ({lastSubmitted.priority} Priority)</p>
                                        <p><strong>Question:</strong> "{lastSubmitted.question}"</p>
                                        <div className="mt-2 rounded-xl bg-white p-3 border border-emerald-200 text-xs text-[#26352A]">
                                            <span className="font-bold text-[#315C3A] block mb-1">🤖 AgriSense Automated Dispatch Summary:</span>
                                            {lastSubmitted.aiSummary}
                                        </div>
                                        <div className="flex justify-between items-center pt-2 text-[11px] text-emerald-800">
                                            <span>Assigned: {lastSubmitted.assignedOfficer}</span>
                                            <span>SLA Target: {lastSubmitted.expectedResolution}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveTab("track")}
                                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#315C3A] hover:underline"
                                    >
                                        Track Progress Timeline <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: LIVE AI ASSISTANT CHAT */}
                    {activeTab === "ai" && (
                        <div className="flex flex-col h-[480px] rounded-2xl border border-[#E2E0D7] bg-white overflow-hidden shadow-sm">
                            <div className="flex items-center gap-2 border-b border-[#E2E0D7] bg-[#EEF4EB] px-5 py-3 text-xs font-bold text-[#315C3A]">
                                <Bot className="h-4 w-4 text-[#315C3A]" />
                                <span>AgriSense Legal & Grievance AI Helper</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F5ED]">
                                {aiMessages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col ${
                                            msg.sender === "user" ? "items-end" : "items-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                                msg.sender === "user"
                                                    ? "bg-[#315C3A] text-white rounded-br-none"
                                                    : "bg-white text-[#26352A] border border-[#E2E0D7] rounded-bl-none shadow-sm"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="mt-1 text-[10px] text-[#6B746D] px-1">{msg.time}</span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAiSend} className="flex items-center gap-2 border-t border-[#E2E0D7] bg-white p-3">
                                <input
                                    type="text"
                                    placeholder="Type your query for AI legal assistance..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    className="flex-1 rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-4 py-2.5 text-xs text-[#26352A] outline-none focus:border-[#315C3A]"
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#315C3A] p-2.5 text-white transition hover:bg-[#274B2F]"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* TAB 3: TRACK TICKET STATUS */}
                    {activeTab === "track" && (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm">
                                <h3 className="text-base font-bold text-[#26352A]">Track Grievance Query Status</h3>
                                <p className="mt-1 text-xs text-[#6B746D]">
                                    Enter your ticket ID (e.g. `QRY-89021`) to monitor real-time resolution workflow.
                                </p>

                                <form onSubmit={handleTrackLookup} className="mt-4 flex gap-3">
                                    <input
                                        type="text"
                                        value={trackId}
                                        onChange={(e) => setTrackId(e.target.value)}
                                        placeholder="Enter Query Ticket ID..."
                                        className="flex-1 rounded-xl border border-[#E2E0D7] bg-[#F7F5ED] px-4 py-2.5 text-xs text-[#26352A] font-mono outline-none focus:border-[#315C3A]"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#315C3A] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#274B2F]"
                                    >
                                        Track Ticket
                                    </button>
                                </form>
                            </div>

                            {trackedResult ? (
                                <div className="rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm space-y-6">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D7] pb-4">
                                        <div>
                                            <span className="font-mono text-xs font-bold text-[#315C3A]">{trackedResult.id}</span>
                                            <h4 className="text-sm font-bold text-[#26352A] mt-0.5">{trackedResult.topic}</h4>
                                        </div>
                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                            Status: {trackedResult.status}
                                        </span>
                                    </div>

                                    {/* TIMELINE VISUAL */}
                                    <div className="space-y-4 text-xs">
                                        <h5 className="font-bold text-[#26352A]">Resolution Progress Lifecycle:</h5>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { step: "1. Logged", done: true },
                                                { step: "2. Dispatched", done: true },
                                                { step: "3. Officer Review", done: trackedResult.status !== "Received" },
                                                { step: "4. Resolved", done: trackedResult.status === "Resolved" },
                                            ].map((s, i) => (
                                                <div
                                                    key={i}
                                                    className={`rounded-xl p-3 text-center border font-semibold ${
                                                        s.done
                                                            ? "bg-[#EEF4EB] text-[#315C3A] border-[#DCE5D9]"
                                                            : "bg-gray-50 text-gray-400 border-gray-200"
                                                    }`}
                                                >
                                                    {s.step}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-[#F7F5ED] p-4 text-xs space-y-2 border border-[#E2E0D7]">
                                        <p><strong>Question:</strong> "{trackedResult.question}"</p>
                                        <p><strong>Assigned Officer:</strong> {trackedResult.assignedOfficer}</p>
                                        <p><strong>Target SLA Timeline:</strong> {trackedResult.expectedResolution}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[#E2E0D7] bg-white p-8 text-center text-xs text-[#6B746D]">
                                    No ticket found matching ID "{trackId}". Try searching `QRY-89021`.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: HELPDESK FAQS */}
                    {activeTab === "faq" && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B746D]" />
                                <input
                                    type="text"
                                    placeholder="Search FAQ rules, policies, mandi regulations..."
                                    value={faqSearch}
                                    onChange={(e) => setFaqSearch(e.target.value)}
                                    className="w-full rounded-xl border border-[#E2E0D7] bg-white pl-10 pr-4 py-2.5 text-xs text-[#26352A] outline-none focus:border-[#315C3A]"
                                />
                            </div>

                            <div className="space-y-3">
                                {filteredFaqs.map((faq, index) => {
                                    const isExpanded = expandedFaqIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-[#E2E0D7] bg-white overflow-hidden shadow-sm transition"
                                        >
                                            <button
                                                onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                                                className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-[#26352A] hover:bg-[#F7F5ED]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-[#EEF4EB] px-2 py-0.5 text-[10px] font-semibold text-[#315C3A]">
                                                        {faq.category}
                                                    </span>
                                                    <span>{faq.question}</span>
                                                </div>
                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>

                                            {isExpanded && (
                                                <div className="border-t border-[#E2E0D7] bg-[#F7F5ED] p-4 text-xs leading-relaxed text-[#5F6B61] animate-fadeIn">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* MODAL FOOTER */}
                <div className="flex items-center justify-between border-t border-[#E2E0D7] bg-white px-6 py-4 sm:px-8">
                    <div className="flex items-center gap-2 text-xs text-[#6B746D]">
                        <PhoneCall className="h-3.5 w-3.5 text-[#315C3A]" />
                        <span>Kisan Nodal Helpline: 1800-180-1551 (Toll-Free)</span>
                    </div>
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
