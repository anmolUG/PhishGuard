import type { DashboardStats, Investigation, ScanResult, Threat } from "../types";

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new Error("Unable to reach the PhishGuard API. Is the backend running?");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// Investigations have no backend yet; kept as local sample data.
const mockInvestigations: Investigation[] = [
  { id: "INV-042", name: "Targeted Spear Phishing Campaign", description: "Multiple employees reported fake HR emails.", artifactsCount: 12, riskLevel: "high", lastUpdated: "2026-10-06T10:00:00Z", status: "Open" },
  { id: "INV-043", name: "Suspicious Vendor Invoices", description: "Vendor email compromise suspected.", artifactsCount: 4, riskLevel: "suspicious", lastUpdated: "2026-10-05T16:30:00Z", status: "Investigating" },
];

export const api = {
  getDashboardStats: (days = 7) => request<DashboardStats>(`/api/stats?days=${days}`),
  getRecentScans: (limit = 5) => request<ScanResult[]>(`/api/scans?limit=${limit}`),
  scanUrl: (url: string) =>
    request<ScanResult>("/api/scan", { method: "POST", body: JSON.stringify({ url }) }),
  getScanResult: (id: string) => request<ScanResult>(`/api/scans/${encodeURIComponent(id)}`),
  getScanHistory: () => request<ScanResult[]>("/api/scans"),
  getThreats: () => request<Threat[]>("/api/threats"),
  getInvestigations: async (): Promise<Investigation[]> => mockInvestigations,
};
