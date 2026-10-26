import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminDashboard } from "../_components/role-dashboards";
import { Spinner } from "../_components/ui-kit";

export const metadata: Metadata = {
  title: "Admin — PANGANLOOP",
  description: "Tinjau organisasi, awasi listing, dan periksa jejak audit.",
};

export default function AdminPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminDashboard />
    </Suspense>
  );
}
