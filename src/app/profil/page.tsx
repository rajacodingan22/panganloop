import type { Metadata } from "next";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Profil organisasi — PANGANLOOP",
  description: "Data organisasi, status verifikasi, dan reset data demo.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
