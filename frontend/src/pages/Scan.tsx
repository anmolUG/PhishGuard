import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldAlert, Globe, Shield, Activity, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { api } from "../services/api";

function validateUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return "Enter a URL to analyze.";
  if (/\s/.test(value)) return "URL must not contain spaces.";
  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!parsed.hostname.includes(".") && !/^\[.*\]$/.test(parsed.hostname)) {
      return "Enter a valid domain, e.g. example.com.";
    }
  } catch {
    return "Enter a valid URL, e.g. https://example.com.";
  }
  return null;
}

export function Scan() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    "Initializing scanner...",
    "Analyzing URL structure...",
    "Checking domain signals...",
    "Evaluating threat indicators...",
    "Running phishing model...",
    "Generating risk assessment..."
  ];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validateUrl(url);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setIsScanning(true);
    setScanStep(0);

    // Progress display only; the verdict comes from the backend model.
    const interval = setInterval(() => {
      setScanStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 450);
    const minDisplay = new Promise((resolve) => setTimeout(resolve, 2700));

    try {
      const [result] = await Promise.all([api.scanUrl(url.trim()), minDisplay]);
      navigate(`/scan/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze this URL.");
      setIsScanning(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-10 animate-in fade-in duration-500">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <ShieldAlert className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Scan a URL</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Analyze a URL for potential phishing threats. Our advanced models evaluate 
          domain signals, heuristics, and threat intelligence to determine risk.
        </p>
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-8">
          {!isScanning ? (
            <form onSubmit={handleScan} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Enter a URL to analyze
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); }}
                    placeholder="https://example.com"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "url-error" : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-background text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                {error && (
                  <p id="url-error" role="alert" className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" size="lg" className="flex-1 text-base font-semibold" disabled={!url}>
                  <Search className="mr-2 h-5 w-5" /> Analyze URL
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => setUrl("")}>
                  Clear
                </Button>
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p className="font-medium mb-2">Examples:</p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setUrl("https://github.com/login")} className="hover:text-primary transition-colors hover:underline">
                    https://github.com/login
                  </button>
                  <button type="button" onClick={() => setUrl("secure-paypal-check.com")} className="hover:text-primary transition-colors hover:underline">
                    secure-paypal-check.com
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center space-y-8 text-center min-h-[300px]">
              <div className="relative">
                <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
                <div className="relative bg-card border border-primary/50 p-4 rounded-full">
                  <Activity className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2 w-full max-w-sm">
                <h3 className="text-xl font-semibold">Scanning in progress...</h3>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${((scanStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse pt-2">
                  {steps[scanStep]}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-6 pt-8">
        <div className="text-center space-y-2">
          <div className="mx-auto bg-secondary w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium">Real-time Analysis</h3>
          <p className="text-sm text-muted-foreground">Instant verdicts from a trained model. URLs are analyzed as text and never opened.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto bg-secondary w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium">Machine Learning</h3>
          <p className="text-sm text-muted-foreground">Random Forest classifier trained on labelled phishing and legitimate URLs.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto bg-secondary w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium">Deep Inspection</h3>
          <p className="text-sm text-muted-foreground">SHAP explanations show which URL traits drove each result.</p>
        </div>
      </div>
    </div>
  );
}
