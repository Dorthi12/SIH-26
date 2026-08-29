/**
 * LandingPage — the "/" route for AgriSense.
 *
 * This is the full marketing/landing page ported from agrisense-insights.
 * It has its own Navbar and Footer, and is excluded from the shared AppLayout
 * sidebar shell via the PAGES_WITH_OWN_HEADER list in AppLayout.tsx.
 */

import { LandingNavbar } from "../components/landing/Navbar";
import { Hero }          from "../components/landing/Hero";
import { Footer }        from "../components/landing/Footer";
import {
  CropGuide,
  ImpactStats,
  Knowledge,
  PersonalizedAdvice,
  QuickAccess,
  Schemes,
  Weather,
} from "../components/landing/sections";

export function LandingPage() {
  return (
    // Outer wrapper: landing-page design system scope.
    // `landing-scope` resets variables to the landing-page palette
    // so they don't clash with the app's existing CSS vars.
    <div className="landing-scope min-h-screen">
      <LandingNavbar />
      <main>
        <Hero />
        <QuickAccess />
        <CropGuide />
        <Schemes />
        <Weather />
        <Knowledge />
        <PersonalizedAdvice />
        <ImpactStats />
      </main>
      <Footer />
    </div>
  );
}
