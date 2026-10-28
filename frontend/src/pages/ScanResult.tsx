import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldAlert, ShieldCheck, ExternalLink, Copy, Check, AlertTriangle,
  Search, Download, BookmarkPlus, ArrowLeft, Info, Globe, FileText, Code, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { ErrorState } from "../components/common/ErrorState";
import { api } from "../services/api";
import { downloadReport } from "../utils/reportGenerator";
import type { ScanResult as ScanResultType } from "../types";

const VERDICT = {
  high: { label: "High Risk", text: "text-destructive", bg: "bg-destructive/5", border: "border-l-destructive", chip: "bg-destructive/20 text-destructive", message: "Model assessment indicates a likely phishing URL." },
  suspicious: { label: "Suspicious", text: "text-warning", bg: "bg-warning/5", border: "border-l-warning", chip: "bg-warning/20 text-warning", message: "Some phishing indicators present. Manual review recommended." },
  safe: { label: "Low Risk", text: "text-success", bg: "bg-success/5", border: "border-l-success", chip: "bg-success/20 text-success", message: "Few phishing indicators found in the URL." },
} as const;

export function ScanResult() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanResultType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const close = () => setExportMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [exportMenuOpen]);

  const load = useCallback(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    api
      .getScanResult(id)
      .then(setScan)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(load, [load]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="h-8 w-48 bg-secondary rounded" />
        <div className="h-64 bg-secondary rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-96 bg-secondary rounded-xl" />
          <div className="h-96 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="py-12">
        <ErrorState message={error ?? "Unable to retrieve scan results."} onRetry={load} />
        <div className="text-center mt-2">
          <Button variant="ghost" asChild><Link to="/scan">New Scan</Link></Button>
        </div>
      </div>
    );
  }

  const v = VERDICT[scan.riskLevel];
  const f = scan.features ?? {};
  const pushing = scan.factors.filter((x) => (x.contribution ?? 0) > 0);
  const maxContribution = Math.max(1, ...scan.factors.map((x) => Math.abs(x.contribution ?? 0)));
  const shownUrl = scan.normalizedUrl ?? scan.url;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(scan.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleExport = (format: "html" | "json") => {
    if (scan) {
      downloadReport(scan, format);
      setExportMenuOpen(false);
    }
  };

  const openExternal = () => {
    setConfirmOpen(false);
    window.open(shownUrl, "_blank", "noopener,noreferrer");
  };

  const technical: [string, string][] = [
    ["Domain", scan.domain],
    ["Protocol", f.uses_https ? "HTTPS" : "HTTP (not encrypted)"],
    ["Host Type", f.has_ip ? "Raw IP address" : "Domain name"],
    ["URL Length", `${f.url_length ?? "—"} characters`],
    ["Domain Length", `${f.domain_length ?? "—"} characters`],
    ["Subdomains", String(f.num_subdomains ?? "—")],
    ["Hyphens / Dots", `${f.num_hyphens ?? "—"} / ${f.num_dots ?? "—"}`],
    ["Query Parameters", String(f.num_equals ?? "—")],
  ];
  const keywords = ["login", "verify", "secure", "account", "update"].filter((k) => f[`has_${k}`]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to="/history" aria-label="Back to history"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">URL Scan Result</h1>
            <Badge variant="outline" className="font-mono text-xs">{scan.id}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground md:ml-10">
            <span>{new Date(scan.scannedAt).toLocaleString()}</span>
            <span>Model: {scan.modelVersion}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" disabled title="Not available yet">
            <BookmarkPlus className="mr-2 h-4 w-4" /> Save Investigation
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setExportMenuOpen((prev) => !prev);
              }}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>Export Report</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
            </Button>

            {exportMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card p-1.5 shadow-2xl z-40 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleExport("html")}
                  className="w-full text-left p-3 rounded-md hover:bg-secondary/70 flex items-start gap-3 transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      Executive Report
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-primary/15 text-primary rounded">HTML / PDF</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Styled security briefing with risk meter, findings, and technical breakdown. Open & save as PDF.
                    </div>
                  </div>
                </button>

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="w-full text-left p-3 rounded-md hover:bg-secondary/70 flex items-start gap-3 transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-md bg-secondary text-muted-foreground mt-0.5 group-hover:bg-foreground group-hover:text-background transition-colors shrink-0">
                    <Code className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      Technical JSON
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-secondary text-muted-foreground rounded">SIEM</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Raw structured scan data, feature vectors, and weights for SIEM or automated pipelines.
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <Button asChild>
            <Link to="/scan"><Search className="mr-2 h-4 w-4" /> New Scan</Link>
          </Button>
        </div>
      </div>

      <Card className={`border-l-4 ${v.border} ${v.bg}`}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className={`p-4 rounded-full ${v.chip}`} aria-hidden="true">
                {scan.riskLevel === "high" ? <ShieldAlert className="h-10 w-10" /> : scan.riskLevel === "suspicious" ? <AlertTriangle className="h-10 w-10" /> : <ShieldCheck className="h-10 w-10" />}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Model prediction</p>
                <h2 className={`text-3xl font-bold uppercase tracking-wider mb-2 ${v.text}`}>{v.label}</h2>
                <p className="text-base">{v.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-8 bg-card border rounded-lg p-4 px-8">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Risk Score</p>
                <p className="text-3xl font-bold">{scan.riskScore} <span className="text-lg text-muted-foreground font-normal">/ 100</span></p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Confidence</p>
                <p className="text-3xl font-bold">{scan.confidence}%</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Scanned URL (untrusted)</p>
            <div className="flex items-center justify-between bg-card border rounded-md px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <span className="font-mono text-sm md:text-base break-all">{scan.url}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" aria-label="Copy URL" onClick={copyUrl}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" aria-label="Open URL in new tab (requires confirmation)" onClick={() => setConfirmOpen(true)}>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Domain: <span className="font-mono">{scan.domain}</span></p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>URL traits that pushed the model towards phishing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pushing.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No URL traits significantly increased the phishing score.</p>
            ) : pushing.map((factor) => (
              <div key={factor.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                <div className="mt-0.5" aria-hidden="true">
                  {factor.level === "high" ? <ShieldAlert className="h-5 w-5 text-destructive" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{factor.name}</h3>
                    <Badge variant={factor.level === "high" ? "destructive" : "warning"} className="text-[10px] uppercase shrink-0">
                      {factor.level === "high" ? "High" : "Medium"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why was this URL scored this way?</CardTitle>
            <CardDescription>SHAP feature contributions (points). Red raises risk, green lowers it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scan.factors.filter((x) => x.contribution !== undefined).map((factor) => {
                const c = factor.contribution ?? 0;
                const up = c > 0;
                return (
                  <div key={factor.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{factor.name}</span>
                      <span className={up ? "text-destructive" : "text-success"}>
                        {up ? "▲ +" : "▼ "}{c}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden" role="img" aria-label={`${factor.name}: ${up ? "increases" : "decreases"} risk by ${Math.abs(c)} points`}>
                      <div className={`h-full ${up ? "bg-destructive" : "bg-success"}`} style={{ width: `${(Math.abs(c) / maxContribution) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="bg-secondary/50 p-4 rounded-lg text-xs text-muted-foreground flex items-start gap-3 mt-4">
                <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p>Model assessment is probabilistic and should be reviewed alongside available threat intelligence. It is not proof that a URL is malicious or safe.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technical Observations</CardTitle>
          <CardDescription>Derived directly from the URL text. No network requests were made to the target.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {technical.map(([label, value]) => (
              <div key={label} className="p-4 border rounded-lg bg-card/50">
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</dt>
                <dd className="font-medium font-mono text-sm break-all">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            Suspicious keywords: {keywords.length ? keywords.map((k) => <Badge key={k} variant="warning" className="mr-1">{k}</Badge>) : "none found"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Threat Intelligence</CardTitle>
          <CardDescription>Multi-vendor threat feeds and network signals, evaluated independently from the model.</CardDescription>
        </CardHeader>
        <CardContent>
          {scan.threatIntel && scan.threatIntel.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase border-b">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Security Source</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Intelligence Finding</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scan.threatIntel.map((item, idx) => {
                    const badgeVariant =
                      item.severity === "high" ? "destructive"
                        : item.severity === "suspicious" ? "warning"
                          : "success";
                    const badgeText =
                      item.severity === "high" ? "High Risk"
                        : item.severity === "suspicious" ? "Suspicious"
                          : "Clean";

                    return (
                      <tr key={idx} className="bg-card hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-foreground flex items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                          <span>{item.source}</span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{item.finding}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={badgeVariant} className="text-[11px] font-semibold">
                            {badgeText}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {item.updated}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <p>No external threat intelligence signals recorded for this target.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Open this URL?"
        confirmLabel="Open in new tab"
        onConfirm={openExternal}
        onCancel={() => setConfirmOpen(false)}
        description={
          <>
            <p>This URL may be a phishing site. Opening it could expose you to credential theft or malware.</p>
            <p className="mt-2 font-mono text-xs break-all rounded bg-secondary p-2 text-foreground">{shownUrl}</p>
          </>
        }
      />
    </div>
  );
}
