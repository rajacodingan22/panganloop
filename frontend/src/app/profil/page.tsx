import type { Metadata } from "next";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Profil organisasi — PANGANLOOP",
  description: "Data organisasi dan status verifikasi akun Firebase Anda.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
