import type { Metadata } from "next";
import { BatchFormView } from "../../_components/batch-views";

export const metadata: Metadata = {
  title: "Catat batch baru — PANGANLOOP",
  description: "Catat surplus makanan dan publikasikan ke penerima.",
};

export default function NewBatchPage() {
  return <BatchFormView />;
}
