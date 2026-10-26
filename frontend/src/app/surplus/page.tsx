import type { Metadata } from "next";
import { SurplusBrowseView } from "../_components/surplus-views";

export const metadata: Metadata = {
  title: "Jelajahi surplus — PANGANLOOP",
  description: "Temukan makanan layak yang siap diselamatkan dari donor di sekitar Anda.",
};

export default function SurplusPage() {
  return <SurplusBrowseView />;
}
