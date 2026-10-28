import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Scan } from "./pages/Scan";
import { ScanResult } from "./pages/ScanResult";
import { History } from "./pages/History";
import { Threats } from "./pages/Threats";
import { Investigations } from "./pages/Investigations";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="scan" element={<Scan />} />
          <Route path="scan/:id" element={<ScanResult />} />
          <Route path="history" element={<History />} />
          <Route path="threats" element={<Threats />} />
          <Route path="investigations" element={<Investigations />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
