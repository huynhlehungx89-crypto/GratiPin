import { BrandPanel } from "./BrandPanel";
import { DemoCorkboard } from "./DemoCorkboard";
import { HowItWorks } from "./HowItWorks";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="grid lg:grid-cols-2 lg:items-stretch">
        <BrandPanel />
        <DemoCorkboard />
      </section>
      <HowItWorks />
    </div>
  );
}
