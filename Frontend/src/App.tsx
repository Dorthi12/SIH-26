import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { RecommendationProvider } from "./context/RecommendationContext";
import { ThemeProvider }          from "./context/ThemeContext";
import { AuthProvider }           from "./context/AuthContext";
import { LanguageProvider }       from "./context/LanguageContext";
import { AppLayout }              from "./components/layout/AppLayout";
import { ProtectedRoute }         from "./components/auth/ProtectedRoute";
import { ScrollToTop }            from "./components/layout/ScrollToTop";

import { LandingPage }            from "./pages/LandingPage";
import { Login }                  from "./pages/Login";
import { Signup }                 from "./pages/Signup";
import { Dashboard }              from "./pages/Dashboard";
import { Recommendation }         from "./pages/Recommendation";
import { Analyzing }              from "./pages/Analyzing";
import { Results }                from "./pages/Results";
import { Comparison }             from "./pages/Comparison";
import { Explain }                from "./pages/Explain";
import { Weather }                from "./pages/Weather";
import { History }                from "./pages/History";
import { About }                  from "./pages/About";
import { Assistant }              from "./pages/Assistant";
import { ScenarioSimulator }      from "./pages/ScenarioSimulator";
import { DistrictIntelligencePage } from "./pages/DistrictIntelligence";
import { DiseaseDetection }       from "./pages/DiseaseDetection";
import { YieldForecast }          from "./pages/YieldForecast";
import { ZeroProductionRisk }     from "./pages/ZeroProductionRisk";
import { Community }              from "./pages/Community";
import { Profile }                from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <RecommendationProvider>
              <Routes>
                {/* ── Public standalone pages (no sidebar, no auth required) ── */}
                <Route path="/"       element={<LandingPage />} />
                <Route path="/login"  element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* ── Protected app routes (require login → redirect to /login) ── */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard"             element={<Dashboard />} />
                    <Route path="/recommendation"        element={<Recommendation />} />
                    <Route path="/analyzing"             element={<Analyzing />} />
                    <Route path="/results"               element={<Results />} />
                    <Route path="/comparison"            element={<Comparison />} />
                    <Route path="/explain"               element={<Explain />} />
                    <Route path="/weather"               element={<Weather />} />
                    <Route path="/history"               element={<History />} />
                    <Route path="/about"                 element={<About />} />
                    <Route path="/assistant"             element={<Assistant />} />
                    <Route path="/scenarios"             element={<ScenarioSimulator />} />
                     <Route path="/district-intelligence" element={<DistrictIntelligencePage />} />
                    <Route path="/disease-detection"     element={<DiseaseDetection />} />
                    <Route path="/yield-forecast"        element={<YieldForecast />} />
                    <Route path="/zero-production-risk"  element={<ZeroProductionRisk />} />
                    <Route path="/community"             element={<Community />} />
                    <Route path="/profile"               element={<Profile />} />

                    {/* Catch-all inside protected area → dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Route>
              </Routes>
            </RecommendationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
