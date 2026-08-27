import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { RecommendationProvider } from "./context/RecommendationContext";
import { AppLayout } from "./components/layout/AppLayout";

import { Home }           from "./pages/Home";
import { Dashboard }       from "./pages/Dashboard";
import { Recommendation } from "./pages/Recommendation";
import { Analyzing }      from "./pages/Analyzing";
import { Results }        from "./pages/Results";
import { Comparison }     from "./pages/Comparison";
import { Explain }        from "./pages/Explain";
import { Weather }        from "./pages/Weather";
import { History }        from "./pages/History";
import { About }          from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <RecommendationProvider>
        <Routes>
          {/* All app routes share the AppLayout shell */}
          <Route element={<AppLayout />}>
            <Route path="/"                element={<Home />} />
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/recommendation"  element={<Recommendation />} />
            <Route path="/analyzing"       element={<Analyzing />} />
            <Route path="/results"         element={<Results />} />
            <Route path="/comparison"      element={<Comparison />} />
            <Route path="/explain"         element={<Explain />} />
            <Route path="/weather"         element={<Weather />} />
            <Route path="/history"         element={<History />} />
            <Route path="/about"           element={<About />} />

            {/* Catch-all → dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </RecommendationProvider>
    </BrowserRouter>
  );
}
