/**
 * Farm Report Service — Backend Integration Boundary
 *
 * Single integration point for:
 *   POST /reports/generate  → initiates report generation
 *   GET  /reports/{id}      → polls / retrieves ready report
 *
 * To connect the real backend:
 *   1. Remove the stubs below.
 *   2. Uncomment the real fetch implementations.
 *   3. Set VITE_API_BASE_URL in .env.
 *   4. No changes needed in FarmReportModal component.
 */

import type {
  ReportGenerationRequest,
  ReportGenerationResponse,
} from "../types/farmReport";

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Initiates report generation.
 *
 * CURRENTLY: Stub — simulates network latency then resolves with a
 * placeholder response so the UI can show the "generating → success" flow.
 *
 * FUTURE:
 *   const res = await fetch(`${API_BASE}/reports/generate`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(request),
 *   });
 *   if (!res.ok) throw new Error(`Reports API error: ${res.status}`);
 *   return res.json() as Promise<ReportGenerationResponse>;
 */
export async function generateReport(
  request: ReportGenerationRequest
): Promise<ReportGenerationResponse> {
  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────
  // Simulate report preparation delay (2 s) so the loading state is meaningful
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Stub response — shows a realistic success state without real data.
  return {
    report_id: `rpt-stub-${request.prediction_id}-${request.format}-${Date.now()}`,
    status: "ready",
    // download_url intentionally left undefined — not connecting real storage yet
    download_url: undefined,
    created_at: new Date().toISOString(),
  };
}

/**
 * Retrieves a previously generated report.
 *
 * CURRENTLY: Stub — not called by the UI yet.
 *
 * FUTURE:
 *   const res = await fetch(`${API_BASE}/reports/${reportId}`);
 *   if (!res.ok) throw new Error(`Report fetch error: ${res.status}`);
 *   return res.json() as Promise<ReportGenerationResponse>;
 */
export async function getReport(
  reportId: string
): Promise<ReportGenerationResponse> {
  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────
  throw new Error(`STUB: Connect GET /reports/${reportId} to retrieve report.`);
}
