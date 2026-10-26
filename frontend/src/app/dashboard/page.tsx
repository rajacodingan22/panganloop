import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";
import { Spinner } from "../_components/ui-kit";

export const metadata: Metadata = {
  title: "Dashboard — PANGANLOOP",
  description: "Ringkasan surplus, batch, dan reservasi sesuai peran Anda.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DashboardClient />
    </Suspense>
  );
}
