import type { Metadata } from "next";
import { BatchListView } from "../_components/batch-views";

export const metadata: Metadata = {
  title: "Batch Saya — PANGANLOOP",
  description: "Lacak setiap surplus dari persiapan sampai outcome.",
};

export default function BatchPage() {
  return <BatchListView />;
}
