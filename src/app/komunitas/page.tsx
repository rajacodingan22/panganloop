import type { Metadata } from "next";
import { RecipientDashboardView } from "../_components/recipient-dashboard-view";

export const metadata: Metadata = {
  title: "Surplus Tersedia — Komunitas Berbagi Pangan — PANGANLOOP",
  description:
    "Katalog surplus pangan tersedia dan reservasi aktif untuk organisasi penerima / komunitas di PANGANLOOP.",
  openGraph: {
    title: "Surplus Tersedia — Komunitas Berbagi Pangan",
    description: "Katalog surplus pangan dan reservasi aktif di PANGANLOOP.",
  },
};

export default function KomunitasPage() {
  return <RecipientDashboardView />;
}
