import { useNavigate } from "react-router-dom";
import { ChevronRight, Leaf, Sparkles } from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Button } from "../components/ui/Button";

/**
 * Home — simple placeholder.
 * The real landing page is built separately in Lovable and will be linked here.
 */
export function Home() {
  const navigate = useNavigate();

  return (
    <PageContainer maxWidth="md" className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8">
      {/* Icon mark */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-forest shadow-card mx-auto">
        <Leaf className="h-8 w-8 text-white" strokeWidth={2} />
        <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-amber" strokeWidth={2} />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest/60">
          AgriSense Application
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-charcoal leading-tight tracking-tight">
          Agricultural Intelligence<br />Platform
        </h1>
        <p className="text-charcoal-muted leading-relaxed max-w-sm mx-auto">
          The landing page for AgriSense is built separately. This is the
          farmer-facing application shell.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="group"
        icon={<ChevronRight className="h-4 w-4" />}
        iconPosition="right"
        onClick={() => navigate("/recommendation")}
      >
        Get Crop Recommendation
      </Button>
    </PageContainer>
  );
}
