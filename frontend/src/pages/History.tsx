import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ErrorState } from "../components/common/ErrorState";
import { api } from "../services/api";
import type { ScanResult } from "../types";

const PAGE_SIZE = 10;

export function History() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .getScanHistory()
      .then(setScans)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scans.filter(
      (s) =>
        (risk === "all" || s.riskLevel === risk) &&
        (!q || s.url.toLowerCase().includes(q) || s.domain.includes(q) || s.id.toLowerCase().includes(q)),
    );
    list.sort((a, b) =>
      sort === "score"
        ? b.riskScore - a.riskScore
        : sort === "oldest"
          ? a.scannedAt.localeCompare(b.scannedAt)
          : b.scannedAt.localeCompare(a.scannedAt),
    );
    return list;
  }, [scans, query, risk, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const badge = (level: string) =>
    level === "high" ? <Badge variant="destructive">High Risk</Badge>
      : level === "suspicious" ? <Badge variant="warning">Suspicious</Badge>
        : <Badge variant="success">Low Risk</Badge>;

  const selectClass = "h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scan History</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review past URL scans and their model assessments.</p>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search scans"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search URL, domain or scan ID..."
                className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select aria-label="Filter by risk" className={selectClass} value={risk} onChange={(e) => { setRisk(e.target.value); setPage(1); }}>
                <option value="all">All risk levels</option>
                <option value="high">High Risk</option>
                <option value="suspicious">Suspicious</option>
                <option value="safe">Low Risk</option>
              </select>
              <select aria-label="Sort scans" className={selectClass} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="score">Highest score</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : isLoading ? (
            <div className="p-6 space-y-3" aria-busy="true">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-secondary/50 rounded animate-pulse" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-medium">No scans found.</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {scans.length === 0 ? "Start your first URL scan." : "Try adjusting your search or filters."}
              </p>
              {scans.length === 0 && <Button asChild><Link to="/scan">Scan a URL</Link></Button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase border-b">
                  <tr>
                    {["URL", "Risk", "Score", "Confidence", "Date", "Status", "Action"].map((h) => (
                      <th key={h} scope="col" className={`px-6 py-4 font-medium ${h === "Action" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((scan) => (
                    <tr key={scan.id} onClick={() => navigate(`/scan/${scan.id}`)} className="hover:bg-secondary/20 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="font-medium">{scan.domain}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[260px]">{scan.url}</div>
                      </td>
                      <td className="px-6 py-4">{badge(scan.riskLevel)}</td>
                      <td className="px-6 py-4 font-mono">{scan.riskScore}</td>
                      <td className="px-6 py-4">{scan.confidence}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                        {new Date(scan.scannedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="px-6 py-4">{scan.status}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" asChild><Link to={`/scan/${scan.id}`}>View</Link></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!error && !isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t text-sm text-muted-foreground">
              <div>
                Showing {(current - 1) * PAGE_SIZE + 1} to {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
