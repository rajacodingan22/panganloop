"use client";

import { usePanganloop } from "../_components/store";
import { Spinner } from "../_components/ui-kit";
import {
  AdminDashboard,
  DonorDashboard,
  RecipientDashboard,
} from "../_components/role-dashboards";

export function DashboardClient() {
  const { ready, user } = usePanganloop();

  if (!ready) return <Spinner />;
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "recipient") return <RecipientDashboard />;
  return <DonorDashboard />;
}
