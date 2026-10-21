import type { ReactNode } from "react";
import { InfoDialog } from "../_components/info-dialog";
import { SiteFooter } from "../_components/site-footer";
import { SiteHeader } from "../_components/site-header";
import { Toast } from "../_components/toast";
import { PanganloopUiProvider } from "../_components/ui-context";

export default function SurplusLayout({ children }: { children: ReactNode }) {
  return (
    <PanganloopUiProvider>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>

      <SiteHeader />

      <main id="main">{children}</main>

      <SiteFooter />

      <InfoDialog />
      <Toast />
    </PanganloopUiProvider>
  );
}
