import type { Metadata } from "next";
import { BatchView } from "./batch-view";

export const metadata: Metadata = {
  title: "Batch Saya — PANGANLOOP",
  description: "Lacak setiap surplus dari persiapan sampai outcome.",
  openGraph: {
    title: "Batch Saya — PANGANLOOP",
    description: "Lacak setiap surplus dari persiapan sampai outcome.",
  },
};

export default function BatchPage() {
  return <BatchView showNav={true} />;
}
