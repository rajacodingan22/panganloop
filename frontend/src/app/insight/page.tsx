import type { Metadata } from "next";
import { InsightView } from "../_components/role-dashboards";

export const metadata: Metadata = {
  title: "Insight — PANGANLOOP",
  description: "Analisis outcome batch dan pola surplus yang sudah ditutup.",
};

export default function InsightPage() {
  return <InsightView />;
}
