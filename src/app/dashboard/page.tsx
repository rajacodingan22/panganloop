import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard Pengelola Usaha — PANGANLOOP",
  description:
    "Pantau batch aktif, surplus pangan, reservasi pickup, dan laporan analitik Dapur Pagi di PANGANLOOP.",
  openGraph: {
    title: "Dashboard Pengelola Usaha — PANGANLOOP",
    description: "Pantau batch aktif, surplus pangan, dan analitik di PANGANLOOP.",
  },
};

export default function DashboardPage() {
  return <DashboardView />;
}
