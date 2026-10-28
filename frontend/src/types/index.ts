export type RiskLevel = "safe" | "suspicious" | "high";

export interface RiskFactor {
  id: string;
  name: string;
  level: RiskLevel;
  description: string;
  /** Signed SHAP impact in points; positive pushes towards phishing. */
  contribution?: number;
}

export interface ThreatIntelItem {
  source: string;
  finding: string;
  severity: RiskLevel | "info";
  updated: string;
}

export interface ScanResult {
  id: string;
  url: string;
  normalizedUrl?: string;
  domain: string;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: number;
  scannedAt: string;
  modelVersion: string;
  factors: RiskFactor[];
  features?: Record<string, number>;
  threatIntel?: ThreatIntelItem[];
  status: "Flagged" | "Safe" | "Review";
}

export interface DashboardStats {
  totalScans: number;
  highRisk: number;
  suspicious: number;
  safe: number;
  detectionRate: number;
  safePercentage: number;
  activity: { name: string; detections: number }[];
}

export interface Threat {
  id: string;
  domain: string;
  threatType: string;
  riskLevel: RiskLevel;
  firstDetected: string;
  lastSeen: string;
  status: "Active" | "Resolved";
}

export interface Investigation {
  id: string;
  name: string;
  description: string;
  artifactsCount: number;
  riskLevel: RiskLevel;
  lastUpdated: string;
  status: "Open" | "Investigating" | "Resolved";
}
