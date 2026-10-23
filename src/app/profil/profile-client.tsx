"use client";

import { usePanganloop } from "../_components/store";
import { ProfileView } from "../_components/role-dashboards";

export function ProfileClient() {
  const { user } = usePanganloop();
  return <ProfileView role={user?.role ?? "donor"} />;
}
