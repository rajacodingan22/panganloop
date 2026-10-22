import type { Metadata } from "next";
import { AdminView } from "./admin-view";

export const metadata: Metadata = {
  title: "Admin Platform Overview — PANGANLOOP",
  description:
    "Pantau aktivitas platform, tinjau organisasi baru, audit integritas, dan kelola listing pangan di PANGANLOOP.",
  openGraph: {
    title: "Admin Platform Overview — PANGANLOOP",
    description: "Pantau aktivitas, tinjau permintaan, dan jaga keamanan platform PANGANLOOP.",
  },
};

export default function AdminPage() {
  return <AdminView />;
}
