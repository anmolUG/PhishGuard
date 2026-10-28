import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, AlertTriangle, Bug, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ErrorState } from "../components/common/ErrorState";
import { api } from "../services/api";
import type { Threat } from "../types";
import { StatCard } from "../components/dashboard/StatCard";

const FILTERS = ["All", "High Risk", "Suspicious", "Resolved"] as const;

export function Threats() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .getThreats()
      .then(setThreats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load]);

  const active = threats.filter((t) => t.status === "Active");
  const high = threats.filter((t) => t.riskLevel === "high").length;
  const suspicious = threats.filter((t) => t.riskLevel === "suspicious").length;
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const recent = threats.filter((t) => new Date(t.lastSeen).getTime() > dayAgo).length;

  const shown = useMemo(
    () =>
      threats.filter((t) =>
        filter === "All" ? true
          : filter === "High Risk" ? t.riskLevel === "high"
            : filter === "Suspicious" ? t.riskLevel === "suspicious"
              : t.status === "Resolved",
      ),
    [threats, filter],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Threats</h1>
        <p className="text-muted-foreground mt-1 text-sm">Domains flagged by the model across your scans.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Threats" value={active.length} subtitle="Flagged domains" icon={Bug} trend="neutral" />
        <StatCard title="High Risk" value={high} subtitle="Likely phishing" icon={ShieldAlert} trend={high > 0 ? "down" : "neutral"} />
        <StatCard title="Suspicious Domains" value={suspicious} subtitle="Need review" icon={AlertTriangle} trend="neutral" />
        <StatCard title="Recent Detections" value={recent} subtitle="Last 24 hours" icon={Clock} trend="neutral" />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Recent Threats</CardTitle>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter threats">
            {FILTERS.map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "secondary" : "ghost"} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : isLoading ? (
            <div className="space-y-3" aria-busy="true">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-secondary/50 rounded animate-pulse" />)}
            </div>
          ) : shown.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium">No threats found.</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Flagged domains appear here after scans.</p>
              <Button asChild><Link to="/scan">Scan a URL</Link></Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase border-b">
                  <tr>
                    {["Threat", "Domain", "Risk", "First Detected", "Last Seen", "Status"].map((h) => (
                      <th key={h} scope="col" className="px-6 py-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shown.map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">{t.threatType}</td>
                      <td className="px-6 py-4 font-mono">{t.domain}</td>
                      <td className="px-6 py-4">
                        <Badge variant={t.riskLevel === "high" ? "destructive" : "warning"}>
                          {t.riskLevel === "high" ? "High Risk" : "Suspicious"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">{new Date(t.firstDetected).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">{new Date(t.lastSeen).toLocaleString()}</td>
                      <td className="px-6 py-4">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
