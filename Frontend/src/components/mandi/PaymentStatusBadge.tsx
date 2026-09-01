import type { PaymentStatus } from "../../types/mandi";
import {
  Clock,
  ShieldCheck,
  Truck,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Banknote,
} from "lucide-react";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md" | "lg";
}

export function PaymentStatusBadge({ status, size = "md" }: PaymentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "Pending":
        return {
          icon: Clock,
          label: "Pending",
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-800 dark:text-amber-300",
          border: "border-amber-300 dark:border-amber-700/60",
          dot: "bg-amber-500",
        };
      case "Protection Requested":
        return {
          icon: ShieldCheck,
          label: "Protection Requested",
          bg: "bg-blue-50 dark:bg-blue-950/40",
          text: "text-blue-800 dark:text-blue-300",
          border: "border-blue-300 dark:border-blue-700/60",
          dot: "bg-blue-500",
        };
      case "Payment Protected":
        return {
          icon: ShieldCheck,
          label: "🟢 Protected (Escrow Held)",
          bg: "bg-emerald-50 dark:bg-emerald-950/50",
          text: "text-emerald-800 dark:text-emerald-300",
          border: "border-emerald-400 dark:border-emerald-600",
          dot: "bg-emerald-500",
        };
      case "Awaiting Delivery":
        return {
          icon: Truck,
          label: "Awaiting Delivery",
          bg: "bg-indigo-50 dark:bg-indigo-950/40",
          text: "text-indigo-800 dark:text-indigo-300",
          border: "border-indigo-300 dark:border-indigo-700/60",
          dot: "bg-indigo-500",
        };
      case "Delivery Submitted":
        return {
          icon: FileCheck,
          label: "Delivery Submitted",
          bg: "bg-purple-50 dark:bg-purple-950/40",
          text: "text-purple-800 dark:text-purple-300",
          border: "border-purple-300 dark:border-purple-700/60",
          dot: "bg-purple-500",
        };
      case "Delivery Confirmed":
        return {
          icon: CheckCircle2,
          label: "Delivery Confirmed",
          bg: "bg-teal-50 dark:bg-teal-950/40",
          text: "text-teal-800 dark:text-teal-300",
          border: "border-teal-300 dark:border-teal-700/60",
          dot: "bg-teal-500",
        };
      case "Release Pending":
        return {
          icon: Banknote,
          label: "Release Pending",
          bg: "bg-amber-100 dark:bg-amber-900/60",
          text: "text-amber-900 dark:text-amber-200",
          border: "border-amber-400 dark:border-amber-600",
          dot: "bg-amber-600",
        };
      case "Payment Released":
      case "Completed":
        return {
          icon: CheckCircle2,
          label: "🟢 Payment Released",
          bg: "bg-emerald-100 dark:bg-emerald-900/80",
          text: "text-emerald-900 dark:text-emerald-100",
          border: "border-emerald-500 dark:border-emerald-400",
          dot: "bg-emerald-600",
        };
      case "Disputed":
        return {
          icon: AlertTriangle,
          label: "⚠ Dispute Under Review",
          bg: "bg-rose-50 dark:bg-rose-950/50",
          text: "text-rose-800 dark:text-rose-300",
          border: "border-rose-300 dark:border-rose-700/60",
          dot: "bg-rose-500",
        };
      case "Cancelled":
        return {
          icon: XCircle,
          label: "Cancelled",
          bg: "bg-gray-100 dark:bg-charcoal",
          text: "text-gray-700 dark:text-gray-300",
          border: "border-gray-300 dark:border-charcoal-light",
          dot: "bg-gray-400",
        };
      default:
        return {
          icon: HelpCircle,
          label: status,
          bg: "bg-gray-100 dark:bg-charcoal",
          text: "text-gray-800 dark:text-gray-200",
          border: "border-gray-300",
          dot: "bg-gray-500",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-3xs font-bold"
      : size === "lg"
      ? "px-4 py-2 text-sm font-black"
      : "px-3 py-1 text-xs font-extrabold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full animate-pulse ${config.dot}`} />
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
