import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { InfoDialog } from "./_components/info-dialog";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import { SurplusSection } from "./_components/surplus-section";
import { Toast } from "./_components/toast";
import { PanganloopUiProvider } from "./_components/ui-context";
import { ValuesStrip } from "./_components/values-strip";

export default function Home() {
  return (
    <PanganloopUiProvider>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />
        <ValuesStrip />
        <SurplusSection />
        <HowItWorks />
      </main>

      <SiteFooter />

      <InfoDialog />
      <Toast />
    </PanganloopUiProvider>
  );
}
