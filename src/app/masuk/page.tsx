import type { Metadata } from "next";
import { LoginView } from "../login/login-view";

export const metadata: Metadata = {
  title: "Masuk ke PANGANLOOP — Kelola surplus, pickup, dan outcome batch",
  description:
    "Masuk ke akun PANGANLOOP Anda untuk mengelola surplus makanan, jadwal pickup, dan dampak pangan berputar.",
};

export default function MasukPage() {
  return <LoginView />;
}
