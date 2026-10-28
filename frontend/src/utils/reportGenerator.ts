import type { ScanResult } from "../types";

export function generateHtmlReport(scan: ScanResult): string {
  const f = scan.features ?? {};
  const isHigh = scan.riskLevel === "high";
  const isSusp = scan.riskLevel === "suspicious";

  const riskColor = isHigh ? "#ef4444" : isSusp ? "#f59e0b" : "#10b981";
  const riskBg = isHigh ? "#fef2f2" : isSusp ? "#fffbeb" : "#ecfdf5";
  const riskBorder = isHigh ? "#fca5a5" : isSusp ? "#fde68a" : "#a7f3d0";
  const riskLabel = isHigh ? "HIGH RISK (PHISHING DETECTED)" : isSusp ? "SUSPICIOUS (REVIEW REQUIRED)" : "LOW RISK (SAFE)";

  const factorRows = (scan.factors || [])
    .map((factor) => {
      const isPos = (factor.contribution ?? 0) > 0;
      const tagColor = factor.level === "high" ? "#dc2626" : factor.level === "suspicious" ? "#d97706" : "#059669";
      const tagBg = factor.level === "high" ? "#fee2e2" : factor.level === "suspicious" ? "#fef3c7" : "#d1fae5";
      const sign = isPos ? "+ " : "- ";
      const impactVal = factor.contribution !== undefined ? `${sign}${Math.abs(factor.contribution)} pts` : "N/A";
      const impactColor = isPos ? "#dc2626" : "#059669";

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
            ${factor.name}
            <div style="font-size: 12px; font-weight: normal; color: #6b7280; margin-top: 2px;">
              ${factor.description}
            </div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: ${tagBg}; color: ${tagColor};">
              ${factor.level}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: ${impactColor};">
            ${impactVal}
          </td>
        </tr>
      `;
    })
    .join("");

  const technicalRows = [
    ["Target Domain", scan.domain],
    ["Transport Security", f.uses_https ? "HTTPS (Encrypted)" : "HTTP (Unencrypted)"],
    ["Host Architecture", f.has_ip ? "Raw IP Host" : "Standard Domain Host"],
    ["URL Length", `${f.url_length ?? "—"} characters`],
    ["Domain Length", `${f.domain_length ?? "—"} characters`],
    ["Subdomain Count", String(f.num_subdomains ?? "—")],
    ["Path Depth (Slashes)", String(f.num_slashes ?? "—")],
    ["Hyphens / Dots", `${f.num_hyphens ?? "—"} / ${f.num_dots ?? "—"}`],
  ]
    .map(
      ([label, val]) => `
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.05em;">${label}</div>
        <div style="font-size: 14px; font-weight: 600; color: #111827; margin-top: 4px; font-family: monospace; word-break: break-all;">${val}</div>
      </div>
    `
    )
    .join("");

  const threatIntelRows = (scan.threatIntel || [])
    .map((item) => {
      const isHighRisk = item.severity === "high";
      const isSusp = item.severity === "suspicious";
      const badgeColor = isHighRisk ? "#dc2626" : isSusp ? "#d97706" : "#059669";
      const badgeBg = isHighRisk ? "#fee2e2" : isSusp ? "#fef3c7" : "#d1fae5";
      const statusText = isHighRisk ? "HIGH RISK" : isSusp ? "SUSPICIOUS" : "CLEAN";

      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${item.source}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${item.finding}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor};">
              ${statusText}
            </span>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 12px;">${item.updated}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Incident Report - ${scan.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f3f4f6; color: #1f2937; padding: 30px; line-height: 1.5; }
    .container { max-width: 850px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { font-size: 22px; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 8px; }
    .meta { text-align: right; font-size: 12px; color: #6b7280; }
    .verdict-card { border-left: 6px solid ${riskColor}; background: ${riskBg}; border: 1px solid ${riskBorder}; border-left-width: 6px; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .verdict-title { font-size: 22px; font-weight: 800; color: ${riskColor}; letter-spacing: 0.02em; }
    .verdict-url { font-family: monospace; font-size: 14px; word-break: break-all; margin-top: 6px; color: #374151; }
    .score-box { text-align: center; background: #ffffff; padding: 12px 24px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .score-num { font-size: 32px; font-weight: 800; color: #111827; }
    .score-label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
    .section-title { font-size: 16px; font-weight: 700; color: #111827; margin: 25px 0 12px 0; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { background: #f9fafb; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; border-bottom: 1px solid #e5e7eb; }
    .tech-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
    .print-btn { background: #10b981; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; float: right; margin-bottom: 15px; }
    .print-btn:hover { background: #059669; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div style="max-width: 850px; margin: 0 auto; text-align: right;">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="container">
    <div class="header">
      <div>
        <div class="logo">PhishGuard</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">Threat Analysis & Phishing Detection Platform</div>
      </div>
      <div class="meta">
        <div><strong>Report ID:</strong> ${scan.id}</div>
        <div><strong>Generated:</strong> ${new Date(scan.scannedAt).toLocaleString()}</div>
        <div><strong>Engine:</strong> ${scan.modelVersion}</div>
      </div>
    </div>

    <div class="verdict-card">
      <div>
        <div class="verdict-title">${riskLabel}</div>
        <div class="verdict-url"><strong>Target:</strong> ${scan.url}</div>
      </div>
      <div class="score-box">
        <div class="score-num">${scan.riskScore}<span style="font-size: 16px; font-weight: normal; color: #6b7280;">/100</span></div>
        <div class="score-label">Confidence: ${scan.confidence}%</div>
      </div>
    </div>

    <div class="section-title">Key Threat Indicators & Risk Assessment</div>
    <table>
      <thead>
        <tr>
          <th>Indicator & Details</th>
          <th style="text-align: center; width: 120px;">Risk Level</th>
          <th style="text-align: right; width: 110px;">Model Impact</th>
        </tr>
      </thead>
      <tbody>
        ${factorRows || '<tr><td colspan="3" style="padding: 16px; text-align: center; color: #6b7280;">No significant risk factors identified.</td></tr>'}
      </tbody>
    </table>

    <div class="section-title">Technical Observations</div>
    <div class="tech-grid">
      ${technicalRows}
    </div>

    ${threatIntelRows ? `
    <div class="section-title">External Threat Intelligence Feeds</div>
    <table>
      <thead>
        <tr>
          <th>Security Source</th>
          <th>Finding</th>
          <th style="text-align: center; width: 120px;">Status</th>
          <th style="text-align: right; width: 110px;">Updated</th>
        </tr>
      </thead>
      <tbody>
        ${threatIntelRows}
      </tbody>
    </table>
    ` : ""}

    <div class="footer">
      <div>CONFIDENTIAL - FOR INTERNAL SECURITY USE ONLY</div>
      <div>PhishGuard Automated Threat Intelligence</div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadReport(scan: ScanResult, format: "html" | "json" = "html") {
  let blob: Blob;
  let filename: string;

  if (format === "html") {
    const html = generateHtmlReport(scan);
    blob = new Blob([html], { type: "text/html;charset=utf-8" });
    filename = `phishguard-report-${scan.id}.html`;
  } else {
    blob = new Blob([JSON.stringify(scan, null, 2)], { type: "application/json" });
    filename = `phishguard-${scan.id}.json`;
  }

  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}
