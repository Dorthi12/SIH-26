import { Leaf, Sparkles, Brain, Database, Cloud, TrendingUp } from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const PILLARS = [
  {
    icon: <Brain className="h-5 w-5" />,
    label: "ML Yield Prediction",
    description: "Machine learning models trained on multi-year agricultural datasets predict expected yield per hectare.",
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    label: "Weather Intelligence",
    description: "Real-time and forecast weather data is matched against crop-specific climatic requirements.",
  },
  {
    icon: <Database className="h-5 w-5" />,
    label: "Historical Analytics",
    description: "Decades of district-level agricultural records inform crop suitability and stability scoring.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    label: "Suitability Scoring",
    description: "A composite score ranks candidate crops across multiple dimensions to surface the best decision.",
  },
];

/**
 * About — Platform overview, methodology, and system information.
 */
export function About() {
  return (
    <PageContainer maxWidth="lg">
      <div className="space-y-10 animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-4 py-6">
          <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-forest shadow-card mx-auto">
            <Leaf className="h-7 w-7 text-white" strokeWidth={2} />
            <Sparkles className="absolute -top-1.5 -right-1.5 h-4 w-4 text-amber" strokeWidth={2} />
          </div>
          <Badge variant="default" size="md">Smart India Hackathon 2024</Badge>
          <h1 className="text-3xl font-semibold text-charcoal tracking-tight">
            About AgriSense
          </h1>
          <p className="text-charcoal-muted leading-relaxed max-w-lg mx-auto">
            AgriSense is an AI-powered crop decision-support system that helps Indian farmers
            choose the right crop for their district, season, and land by combining weather
            intelligence, historical agricultural data, and machine learning yield prediction.
          </p>
        </div>

        {/* Intelligence pillars */}
        <div>
          <h2 className="text-base font-semibold text-charcoal mb-4">How It Works</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PILLARS.map((pillar) => (
              <Card key={pillar.label} className="flex gap-4">
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-forest/8 text-forest">
                  {pillar.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal mb-1">{pillar.label}</p>
                  <p className="text-sm text-charcoal-muted leading-relaxed">{pillar.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tech stack note */}
        <Card className="border-forest/15 bg-forest/3">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest/60 mb-2">Tech Stack</p>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            Frontend: React + TypeScript + Vite + Tailwind CSS &bull;
            Backend: FastAPI (Python) &bull;
            ML: scikit-learn / XGBoost &bull;
            Data: IMD weather + government agricultural records
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}
