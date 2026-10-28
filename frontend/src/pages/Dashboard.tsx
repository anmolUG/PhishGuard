import { useCallback, useEffect, useState } from "react";
import { Activity, ShieldAlert, ShieldCheck, Target, RefreshCcw } from "lucide-react";
import { Button } from "../components/common/Button";
import { ErrorState } from "../components/common/ErrorState";
import { StatCard } from "../components/dashboard/StatCard";
import { DetectionChart } from "../components/dashboard/DetectionChart";
import { RiskDistribution } from "../components/dashboard/RiskDistribution";
import { RecentScans } from "../components/dashboard/RecentScans";
import { api } from "../services/api";
import type { DashboardStats } from "../types";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .getDashboardStats(days)
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [days]);

  useEffect(fetchStats, [fetchStats]);

  const refresh = () => {
    setRefreshKey((k) => k + 1);
    fetchStats();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor your phishing detection activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="Date range"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="outline" size="icon" aria-label="Refresh" onClick={refresh} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          {isLoading && !stats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-[120px] rounded-xl bg-card border animate-pulse" />)}
            </div>
          ) : stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Scans" value={stats.totalScans.toLocaleString()} subtitle="All recorded scans" icon={Activity} trend="neutral" />
              <StatCard title="High Risk" value={stats.highRisk} subtitle="Flagged results" icon={ShieldAlert} trend={stats.highRisk > 0 ? "down" : "neutral"} />
              <StatCard title="Safe URLs" value={stats.safe.toLocaleString()} subtitle={`${stats.safePercentage}% of total scans`} icon={ShieldCheck} trend="neutral" />
              <StatCard title="Detection Rate" value={`${stats.detectionRate}%`} subtitle="High-risk share of scans" icon={Target} trend="neutral" />
            </div>
          )}

          {stats && (
            <div className="grid gap-4 md:grid-cols-4">
              <DetectionChart data={stats.activity} days={days} />
              <RiskDistribution safe={stats.safe} suspicious={stats.suspicious} high={stats.highRisk} />
            </div>
          )}

          <RecentScans refreshKey={refreshKey} />
        </>
      )}
    </div>
  );
}
