import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    ArrowLeft,
    ArrowRight,
    FilePlus2,
    Files,
    FileText,
} from "lucide-react";

interface ComplaintOption {
    title: string;
    description: string;
    icon: React.ElementType;
    path: string;
    buttonText: string;
}


export default function ComplaintsDashboard() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const isUser = user?.role=="USER";
    const complaintOptions: ComplaintOption[] = [
        {
            title: "Create Complaint",
            description:
                "Report a new issue or complaint and provide all the necessary details.",
            icon: FilePlus2,
            path: "/createcomplaints",
            buttonText: "Create Complaint",
        },
        {
            title: "See All Complaints",
            description:
                "View complaints submitted across the platform and track their status.",
            icon: Files,
            path:isUser?"/mycomplaints":"/viewcomplaints",
            buttonText: "View All Complaints",
        },
        {
            title: "My Complaints",
            description:
                "View and track the complaints that you have submitted.",
            icon: FileText,
            path: "/mycomplaints",
            buttonText: "View My Complaints",
        },
    ];

    return (<div className="min-h-screen bg-[#F7F5ED] px-4 py-8 sm:px-6 lg:px-8"> <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-10">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#315C3A] transition hover:text-[#23452B]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </button>

            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#315C3A] text-white shadow-sm">
                    <FileText className="h-7 w-7" />
                </div>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#26352A] sm:text-3xl">
                        Complaints
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B746D]">
                        Report issues, view submitted complaints, and
                        keep track of their progress.
                    </p>
                </div>
            </div>
        </div>

        {/* OPTIONS */}

        <div className="grid gap-6 md:grid-cols-3">
            {complaintOptions.map((option) => {
                const Icon = option.icon;

                return (
                    <div
                        key={option.title}
                        className="group flex flex-col rounded-2xl border border-[#E2E0D7] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                    >
                        {/* ICON */}

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EFE6] text-[#315C3A] transition group-hover:bg-[#315C3A] group-hover:text-white">
                            <Icon className="h-6 w-6" />
                        </div>

                        {/* CONTENT */}

                        <h2 className="mt-6 text-lg font-semibold text-[#26352A]">
                            {option.title}
                        </h2>

                        <p className="mt-2 flex-1 text-sm leading-6 text-[#6B746D]">
                            {option.description}
                        </p>

                        {/* BUTTON */}

                        <button
                            type="button"
                            onClick={() => navigate(option.path)}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#315C3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#274B2F]"
                        >
                            {option.buttonText}

                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                );
            })}
        </div>

        {/* INFO SECTION */}

        <div className="mt-8 rounded-2xl border border-[#DCE5D9] bg-[#EEF4EB] p-5 sm:p-6">
            <div className="flex gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE8D8] text-[#315C3A]">
                    <FileText className="h-4 w-4" />
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-[#315C3A]">
                        Complaint Management
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#5F6B61]">
                        Use the options above to report a new issue,
                        browse complaints, or check the current status
                        of complaints you have submitted.
                    </p>
                </div>
            </div>
        </div>

    </div>
    </div>


    );
}
