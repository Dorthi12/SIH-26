import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    FileText,
    Filter,
    Image as ImageIcon,
    Plus,
    RefreshCw,
} from "lucide-react";

// const API_URL = "http://localhost:5000";
// const ENDPOINT = "/complaints/me";
import { apiRequest } from "../utils/api";

interface Complaint {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    imageUrl?: string | null;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const categories = [
    {
        value: "IRRIGATION",
        label: "Irrigation",
    },
    {
        value: "CROP_STORAGE",
        label: "Crop Storage",
    },
    {
        value: "MARKET_MONOPOLY",
        label: "Market Monopoly",
    },
    {
        value: "ORGANISED_CRIME",
        label: "Organised Crime",
    },
    {
        value: "PANCHAYAT_MISJUDGEMENT",
        label: "Panchayat Misjudgement",
    },
    {
        value: "OTHERS",
        label: "Others",
    },
];

const statuses = [
    {
        value: "",
        label: "All Status",
    },
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "in_progress",
        label: "In Progress",
    },
    {
        value: "resolved",
        label: "Resolved",
    },
    {
        value: "rejected",
        label: "Rejected",
    },
];

const formatCategory = (category: string) => {
    const found = categories.find(
        (item) => item.value === category
    );

    return (
        found?.label ||
        category
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())
    );
};

const formatStatus = (status: string) => {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClasses = (status: string) => {
    switch (status) {
        case "pending":
            return "bg-amber-50 text-amber-700 border-amber-200";


        case "in_progress":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "resolved":
            return "bg-green-50 text-green-700 border-green-200";

        case "rejected":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-gray-50 text-gray-700 border-gray-200";


    }
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function MyComplaints() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [pagination, setPagination] =
        useState<Pagination | null>(null);

    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const limit = 10;

    // --------------------------------------------------
    // FETCH MY COMPLAINTS
    // --------------------------------------------------

  // --------------------------------------------------
  // FETCH MY COMPLAINTS
  // --------------------------------------------------
  const fetchMyComplaints = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (status) params.append("status", status);
      if (category) params.append("category", category);

      const data = await apiRequest<{
        complaints: Complaint[];
        pagination: Pagination;
      }>(`/complaints/me?${params.toString()}`);

      setComplaints(data.complaints || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Fetch my complaints error:", err);
      setError(err instanceof Error ? err.message : "Unable to load your complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
        fetchMyComplaints();
    }, [page, status, category]);

    // --------------------------------------------------
    // FILTER HANDLERS
    // --------------------------------------------------

    const handleStatusChange = (
        value: string
    ) => {
        setStatus(value);
        setPage(1);
    };

    const handleCategoryChange = (
        value: string
    ) => {
        setCategory(value);
        setPage(1);
    };

    const clearFilters = () => {
        setStatus("");
        setCategory("");
        setPage(1);
    };

    // --------------------------------------------------
    // PAGINATION
    // --------------------------------------------------

    const previousPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    const nextPage = () => {
        if (
            pagination &&
            page < pagination.totalPages
        ) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F5ED] dark:bg-[#0f1714] text-slate-900 dark:text-slate-100 px-4 py-8 sm:px-6 lg:px-8 transition-colors">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#315C3A] dark:text-emerald-400 transition hover:text-[#23452B] dark:hover:text-emerald-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#315C3A] dark:bg-emerald-600 text-white shadow-sm">
                                <FileText className="h-6 w-6 text-white" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-[#26352A] dark:text-white sm:text-3xl">
                                    My Complaints
                                </h1>

                                <p className="mt-1 text-sm leading-6 text-[#6B746D] dark:text-slate-300">
                                    Track the complaints you have submitted.
                                </p>
                            </div>
                        </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={fetchMyComplaints}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9DCD7] bg-white px-4 py-2.5 text-sm font-medium text-[#315C3A] transition hover:bg-[#F5F7F2] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""
                                }`}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/createcomplaints")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315C3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#274B2F]"
                    >
                        <Plus className="h-4 w-4" />
                        New Complaint
                    </button>
                </div>
            </div>
        </div>

        {/* FILTERS */}

        <div className="mb-6 rounded-2xl border border-[#E2E0D7] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#315C3A]" />

                <h2 className="text-sm font-semibold text-[#334238]">
                    Filter Complaints
                </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* STATUS */}

                <div>
                    <label
                        htmlFor="status"
                        className="mb-2 block text-xs font-medium text-[#667068]"
                    >
                        Status
                    </label>

                    <select
                        id="status"
                        value={status}
                        onChange={(e) =>
                            handleStatusChange(
                                e.target.value
                            )
                        }
                        className="w-full rounded-xl border border-[#D9DCD7] bg-[#FCFCF9] px-4 py-3 text-sm text-[#26352A] outline-none transition focus:border-[#315C3A] focus:ring-2 focus:ring-[#315C3A]/10"
                    >
                        {statuses.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CATEGORY */}

                <div>
                    <label
                        htmlFor="category"
                        className="mb-2 block text-xs font-medium text-[#667068]"
                    >
                        Category
                    </label>

                    <select
                        id="category"
                        value={category}
                        onChange={(e) =>
                            handleCategoryChange(
                                e.target.value
                            )
                        }
                        className="w-full rounded-xl border border-[#D9DCD7] bg-[#FCFCF9] px-4 py-3 text-sm text-[#26352A] outline-none transition focus:border-[#315C3A] focus:ring-2 focus:ring-[#315C3A]/10"
                    >
                        <option value="">
                            All Categories
                        </option>

                        {categories.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CLEAR */}

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={clearFilters}
                        disabled={!status && !category}
                        className="w-full rounded-xl border border-[#D9DCD7] px-4 py-3 text-sm font-medium text-[#4A554E] transition hover:bg-[#F7F7F2] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>

        {/* ERROR */}

        {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-center justify-between gap-4">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchMyComplaints}
                        className="shrink-0 font-medium underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )}

        {/* LOADING */}

        {loading && (
            <div className="rounded-2xl border border-[#E2E0D7] bg-white p-10 shadow-sm">
                <div className="flex flex-col items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D9DCD7] border-t-[#315C3A]" />

                    <p className="mt-4 text-sm text-[#6B746D]">
                        Loading your complaints...
                    </p>
                </div>
            </div>
        )}

        {/* EMPTY */}

        {!loading &&
            !error &&
            complaints.length === 0 && (
                <div className="rounded-2xl border border-[#E2E0D7] bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8EFE6] text-[#315C3A]">
                        <FileText className="h-6 w-6" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-[#26352A]">
                        No complaints found
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B746D]">
                        You haven't submitted any complaints
                        matching the selected filters.
                    </p>

                    {(status || category) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-5 rounded-xl bg-[#315C3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#274B2F]"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

        {/* COMPLAINTS */}

        {!loading &&
            complaints.length > 0 && (
                <div className="space-y-4">
                    {complaints.map((complaint) => (
                        <div
                            key={complaint.id}
                            className="overflow-hidden rounded-2xl border border-[#E2E0D7] bg-white shadow-sm transition hover:shadow-md"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row">

                                    {/* IMAGE */}

                                    {complaint.imageUrl ? (
                                        <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-[#F3F2EB] lg:h-36 lg:w-52">
                                            <img
                                                src={complaint.imageUrl}
                                                alt={complaint.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-44 w-full shrink-0 items-center justify-center rounded-xl bg-[#F3F2EB] text-[#A0A79F] lg:h-36 lg:w-52">
                                            <ImageIcon className="h-8 w-8" />
                                        </div>
                                    )}

                                    {/* DETAILS */}

                                    <div className="min-w-0 flex-1">

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <h2 className="break-words text-lg font-semibold text-[#26352A]">
                                                    {complaint.title}
                                                </h2>

                                                <p className="mt-1 text-xs text-[#8A918B]">
                                                    Filed on{" "}
                                                    {formatDate(
                                                        complaint.createdAt
                                                    )}
                                                </p>
                                            </div>

                                            <span
                                                className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                                    complaint.status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    complaint.status
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <span className="inline-flex rounded-lg bg-[#EAF0E7] px-3 py-1.5 text-xs font-medium text-[#315C3A]">
                                                {formatCategory(
                                                    complaint.category
                                                )}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-sm leading-6 text-[#5F6861]">
                                            {complaint.description}
                                        </p>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        {/* PAGINATION */}

        {!loading &&
            pagination &&
            pagination.totalPages > 0 && (
                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#E2E0D7] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-[#6B746D]">
                        Page{" "}
                        <span className="font-medium text-[#334238]">
                            {pagination.page}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-[#334238]">
                            {pagination.totalPages}
                        </span>

                        {" · "}

                        <span className="font-medium text-[#334238]">
                            {pagination.total}
                        </span>{" "}
                        complaints
                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={previousPage}
                            disabled={page <= 1}
                            className="inline-flex items-center gap-1 rounded-xl border border-[#D9DCD7] px-3 py-2 text-sm font-medium text-[#4A554E] transition hover:bg-[#F7F7F2] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>

                        <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-[#315C3A] px-3 text-sm font-semibold text-white">
                            {page}
                        </div>

                        <button
                            type="button"
                            onClick={nextPage}
                            disabled={
                                !pagination ||
                                page >=
                                pagination.totalPages
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-[#D9DCD7] px-3 py-2 text-sm font-medium text-[#4A554E] transition hover:bg-[#F7F7F2] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>

                    </div>
                </div>
            )}
    </div>
    </div>


    );
}
