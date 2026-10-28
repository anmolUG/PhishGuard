import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { ErrorState } from "../common/ErrorState";
import { api } from "../../services/api";
import type { ScanResult } from "../../types";

interface RecentScansProps {
  refreshKey?: number;
}

export function RecentScans({ refreshKey = 0 }: RecentScansProps) {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .getRecentScans(5)
      .then(setScans)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load, refreshKey]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high": return <Badge variant="destructive">High Risk</Badge>;
      case "suspicious": return <Badge variant="warning">Suspicious</Badge>;
      default: return <Badge variant="success">Safe</Badge>;
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Scans</CardTitle>
        <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[74px] rounded-lg border bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : scans.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-medium">No scans found.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Start your first URL scan.</p>
            <Button asChild><Link to="/scan">Scan a URL</Link></Button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between gap-3 p-4 rounded-lg border bg-card/50 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-md bg-secondary/50 flex items-center justify-center text-muted-foreground">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{scan.domain}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(scan.scannedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} • {scan.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden md:flex flex-col items-end text-sm">
                    <span className="text-muted-foreground text-xs">Confidence</span>
                    <span className="font-medium">{scan.confidence}%</span>
                  </div>
                  {getRiskBadge(scan.riskLevel)}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/scan/${scan.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
