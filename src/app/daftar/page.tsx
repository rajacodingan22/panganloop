import type { Metadata } from "next";
import { RegisterView } from "../register/register-view";

export const metadata: Metadata = {
  title: "Buat Akun — PANGANLOOP",
  description:
    "Bergabunglah dengan PANGANLOOP dan jadi bagian dari solusi untuk sistem pangan yang lebih adil dan berkelanjutan.",
};

export default function DaftarPage() {
  return <RegisterView />;
}
