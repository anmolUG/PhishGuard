# PhishGuard 🛡️
> Intelligent protection against phishing threats and malicious URLs.

PhishGuard is an enterprise-grade cybersecurity threat detection and investigation platform designed for SOC analysts. It combines real-time URL structure analysis, a hybrid machine learning engine (Random Forest + SHAP explainability), and multi-vendor threat intelligence feeds.

---

## 🌟 Key Features

- **Hybrid Phishing Detection Pipeline**:
  - **Verified Apex Domain Whitelist**: Zero false-positives on legitimate major domains (e.g. `github.com/login`, `google.com`).
  - **Brand Impersonation & Typosquatting Engine**: Detects spoofed brand domains (e.g. `paypal-security-update.com`).
  - **Numeric IP & Disposable TLD Heuristics**: Flags raw IP address hosts and burner phishing TLDs (`.xyz`, `.top`, `.buzz`).
  - **Random Forest ML Model with SHAP**: Feature contribution breakdown showing exactly why a URL was flagged.
- **Security Operations Center (SOC) Dashboard**:
  - Real-time KPI threat cards (Total Scans, High Risk, Detection Rate).
  - 7/30/90-Day detection activity area charts and risk distribution donut chart (Recharts).
  - Live recent scans feed with direct investigation links.
- **Deep URL Inspection & Explainable AI (XAI)**:
  - Severity assessment: Safe, Suspicious, or High Risk.
  - Transparent SHAP feature contribution charts.
  - Multi-vendor threat intelligence breakdown (VirusTotal, URLhaus, PhishTank, DNS signals).
- **Executive Audit Reports**:
  - Export professional, printable HTML/PDF executive incident briefings.
  - Raw JSON export for SIEM log ingestion.
- **Persistent Scan History & Threat Intelligence Monitor**.

---

## 🏗️ Architecture

```
PhishGuard/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # UI & Dashboard components (shadcn/ui style)
│   │   ├── pages/        # Dashboard, Scan, ScanResult, History, Threats, etc.
│   │   ├── services/     # Decoupled API service layer
│   │   └── utils/        # Report generator (HTML/PDF)
│   └── package.json
└── backend/              # Python + Flask REST API
    ├── app.py            # Hybrid detection REST API (port 5000)
    ├── predict.py        # ML inference with SHAP TreeExplainer
    ├── feature_engineering.py # URL lexical & structural feature extractor
    ├── phishing_model.pkl # Trained Random Forest model
    └── requirements.txt
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The Flask API starts at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔒 Security UX
PhishGuard treats all URLs as untrusted input:
- URLs are strictly parsed as text strings and **never** automatically executed or loaded in iframes.
- Outbound link testing requires explicit user confirmation via modal dialog.
- Model predictions are explicitly framed as probabilistic assists rather than absolute certainty.

---

## 📄 License
MIT License.
