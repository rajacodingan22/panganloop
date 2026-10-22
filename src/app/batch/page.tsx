import type { Metadata } from "next";
import { DashboardView } from "../dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Batch Saya — PANGANLOOP",
  description: "Lacak setiap surplus dari persiapan sampai outcome.",
};

export default function BatchPage() {
  return <DashboardView initialTab="batch" />;
}
