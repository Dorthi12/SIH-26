
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    FileText,
    Filter,
    Image as ImageIcon,
    RefreshCw,
    Search,
    Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// const API_URL = "http://localhost:5000";
import { apiRequest } from "../utils/api";

interface ComplaintUser {
    id: string;
    name: string;
    email: string;
    preSignedUrl?: string | null;
}

interface Complaint {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    imageUrl?: string | null;
    createdAt: string;
    user?: ComplaintUser;
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

const complaintStatuses = [
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

export default function Complaints() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [pagination, setPagination] =
        useState<Pagination | null>(null);

    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingComplaintId, setUpdatingComplaintId] =
        useState<string | null>(null);

    const [deletingComplaintId, setDeletingComplaintId] =
        useState<string | null>(null);

    const limit = 10;

    // --------------------------------------------------
    // ROLE CHECK
    // --------------------------------------------------

    const canUpdateStatus =
        user?.role === "ADMINISTRATOR" ||
        user?.role === "LEADER" ||
        user?.role === "REPRESENTATIVE";

    // --------------------------------------------------
    // DELETE PERMISSION
    // --------------------------------------------------

    const canDeleteComplaint = (complaint: Complaint) => {
        // Administrator can delete any complaint
        if (user?.role === "ADMINISTRATOR") {
            return true;
        }

        // Other users can delete only their own
        // complaint while it is still pending
        return (
            complaint.user?.id === user?.id &&
            complaint.status === "pending"
        );
    };

    // --------------------------------------------------
    // FETCH COMPLAINTS
    // --------------------------------------------------

   const fetchComplaints = async () => {
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
      }>(`/complaints?${params.toString()}`);
      setComplaints(data.complaints || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Fetch complaints error:", err);
      setError(err instanceof Error ? err.message : "Unable to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // --------------------------------------------------
  // UPDATE COMPLAINT STATUS
  // --------------------------------------------------
  const handleComplaintStatusChange = async (
    complaintId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingComplaintId(complaintId);
      setError("");
      await apiRequest(`/complaints/${complaintId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
    } catch (err) {
      console.error("Update complaint status error:", err);
      setError(err instanceof Error ? err.message : "Failed to update complaint status.");
    } finally {
      setUpdatingComplaintId(null);
    }
  };
  // --------------------------------------------------
  // DELETE COMPLAINT
  // --------------------------------------------------
  const handleDeleteComplaint = async (complaintId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?"
    );
    if (!confirmed) return;
    try {
      setDeletingComplaintId(complaintId);
      setError("");
      await apiRequest(`/complaints/${complaintId}`, {
        method: "DELETE",
      });
      setComplaints((prev) =>
        prev.filter((complaint) => complaint.id !== complaintId)
      );
      setPagination((prev) => {
        if (!prev) return prev;
        const newTotal = Math.max(0, prev.total - 1);
        return {
          ...prev,
          total: newTotal,
          totalPages: Math.ceil(newTotal / prev.limit),
        };
      });
    } catch (err) {
      console.error("Delete complaint error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete complaint. Please try again.");
    } finally {
      setDeletingComplaintId(null);
    }
  };

    // --------------------------------------------------
    // FETCH WHEN FILTER/PAGE CHANGES
    // --------------------------------------------------

    useEffect(() => {
        fetchComplaints();
    }, [page, status, category]);

    // --------------------------------------------------
    // FILTER HANDLERS
    // --------------------------------------------------

    const handleStatusFilterChange = (
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

    const goToPreviousPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    const goToNextPage = () => {
        if (
            pagination &&
            page < pagination.totalPages
        ) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F5ED] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* -------------------------------------------------- */}
                {/* HEADER */}
                {/* -------------------------------------------------- */}

                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#315C3A] transition hover:text-[#23452B]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#315C3A] text-white shadow-sm">
                                <FileText className="h-6 w-6" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-[#26352A] sm:text-3xl">
                                    Complaints
                                </h1>

                                <p className="mt-1 text-sm leading-6 text-[#6B746D]">
                                    View and track submitted complaints.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={fetchComplaints}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9DCD7] bg-white px-4 py-2.5 text-sm font-medium text-[#315C3A] transition hover:bg-[#F5F7F2] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* -------------------------------------------------- */}
                {/* FILTERS */}
                {/* -------------------------------------------------- */}

                <div className="mb-6 rounded-2xl border border-[#E2E0D7] bg-white p-5 shadow-sm">

                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-4 w-4 text-[#315C3A]" />

                        <h2 className="text-sm font-semibold text-[#334238]">
                            Filters
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {/* STATUS FILTER */}

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
                                    handleStatusFilterChange(
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

                        {/* CATEGORY FILTER */}

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

                        {/* CLEAR FILTER */}

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

                {/* -------------------------------------------------- */}
                {/* ERROR */}
                {/* -------------------------------------------------- */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <div className="flex items-center justify-between gap-4">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    fetchComplaints();
                                }}
                                className="shrink-0 font-medium underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* -------------------------------------------------- */}
                {/* LOADING */}
                {/* -------------------------------------------------- */}

                {loading && (
                    <div className="rounded-2xl border border-[#E2E0D7] bg-white p-10 shadow-sm">
                        <div className="flex flex-col items-center justify-center">

                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D9DCD7] border-t-[#315C3A]" />

                            <p className="mt-4 text-sm text-[#6B746D]">
                                Loading complaints...
                            </p>
                        </div>
                    </div>
                )}

                {/* -------------------------------------------------- */}
                {/* EMPTY STATE */}
                {/* -------------------------------------------------- */}

                {!loading &&
                    !error &&
                    complaints.length === 0 && (
                        <div className="rounded-2xl border border-[#E2E0D7] bg-white px-6 py-16 text-center shadow-sm">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8EFE6] text-[#315C3A]">
                                <Search className="h-6 w-6" />
                            </div>

                            <h2 className="mt-5 text-lg font-semibold text-[#26352A]">
                                No complaints found
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B746D]">
                                There are no complaints matching
                                your current filters.
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

                {/* -------------------------------------------------- */}
                {/* COMPLAINT LIST */}
                {/* -------------------------------------------------- */}

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
                                                        src={
                                                            complaint.imageUrl
                                                        }
                                                        alt={
                                                            complaint.title
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />

                                                </div>
                                            ) : (
                                                <div className="flex h-44 w-full shrink-0 items-center justify-center rounded-xl bg-[#F3F2EB] text-[#A0A79F] lg:h-36 lg:w-52">

                                                    <ImageIcon className="h-8 w-8" />

                                                </div>
                                            )}

                                            {/* CONTENT */}

                                            <div className="min-w-0 flex-1">

                                                {/* TITLE + STATUS */}

                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                    <div className="min-w-0">

                                                        <h2 className="break-words text-lg font-semibold text-[#26352A]">
                                                            {
                                                                complaint.title
                                                            }
                                                        </h2>

                                                        <p className="mt-1 text-xs text-[#8A918B]">
                                                            Filed on{" "}
                                                            {formatDate(
                                                                complaint.createdAt
                                                            )}
                                                        </p>

                                                    </div>

                                                    {/* STATUS CONTROLS */}

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        {/* CURRENT STATUS */}

                                                        <span
                                                            className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                                                complaint.status
                                                            )}`}
                                                        >
                                                            {formatStatus(
                                                                complaint.status
                                                            )}
                                                        </span>

                                                        {/* CHANGE STATUS */}

                                                        {canUpdateStatus && (
                                                            <select
                                                                value={
                                                                    complaint.status
                                                                }
                                                                disabled={
                                                                    updatingComplaintId ===
                                                                        complaint.id ||
                                                                    deletingComplaintId ===
                                                                        complaint.id
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleComplaintStatusChange(
                                                                        complaint.id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="rounded-xl border border-[#D9DCD7] bg-white px-3 py-1.5 text-xs font-medium text-[#334238] outline-none transition focus:border-[#315C3A] focus:ring-2 focus:ring-[#315C3A]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {complaintStatuses.map(
                                                                    (
                                                                        item
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                item.value
                                                                            }
                                                                            value={
                                                                                item.value
                                                                            }
                                                                        >
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        )}

                                                        {/* DELETE */}

                                                        {canDeleteComplaint(
                                                            complaint
                                                        ) && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteComplaint(
                                                                        complaint.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingComplaintId ===
                                                                        complaint.id ||
                                                                    updatingComplaintId ===
                                                                        complaint.id
                                                                }
                                                                title="Delete complaint"
                                                                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                {deletingComplaintId ===
                                                                complaint.id ? (
                                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        )}

                                                    </div>
                                                </div>

                                                {/* CATEGORY */}

                                                <div className="mt-4">
                                                    <span className="inline-flex rounded-lg bg-[#EAF0E7] px-3 py-1.5 text-xs font-medium text-[#315C3A]">
                                                        {formatCategory(
                                                            complaint.category
                                                        )}
                                                    </span>
                                                </div>

                                                {/* DESCRIPTION */}

                                                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#5F6861]">
                                                    {
                                                        complaint.description
                                                    }
                                                </p>

                                                {/* USER */}

                                                {complaint.user && (
                                                    <div className="mt-5 border-t border-[#ECEAE2] pt-4">

                                                        <p className="text-xs font-medium uppercase tracking-wide text-[#8A918B]">
                                                            Submitted By
                                                        </p>

                                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">

                                                            <span className="font-medium text-[#334238]">
                                                                {
                                                                    complaint
                                                                        .user
                                                                        .name
                                                                }
                                                            </span>

                                                            <span className="text-[#B0B5B0]">
                                                                •
                                                            </span>

                                                            <span className="text-[#6B746D]">
                                                                {
                                                                    complaint
                                                                        .user
                                                                        .email
                                                                }
                                                            </span>

                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                {/* -------------------------------------------------- */}
                {/* PAGINATION */}
                {/* -------------------------------------------------- */}

                {!loading &&
                    pagination &&
                    pagination.totalPages > 0 && (
                        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#E2E0D7] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm text-[#6B746D]">
                                Showing page{" "}
                                <span className="font-medium text-[#334238]">
                                    {pagination.page}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-[#334238]">
                                    {pagination.totalPages}
                                </span>{" "}
                                ·{" "}
                                <span className="font-medium text-[#334238]">
                                    {pagination.total}
                                </span>{" "}
                                complaints
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        goToPreviousPage
                                    }
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
                                    onClick={
                                        goToNextPage
                                    }
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

