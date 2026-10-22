import type { Metadata } from "next";
import { ReservasiView } from "./reservasi-view";

export const metadata: Metadata = {
  title: "Reservasi Masuk — PANGANLOOP",
  description: "Konfirmasi serah terima pangan surplus tanpa kehilangan jejak.",
  openGraph: {
    title: "Reservasi Masuk — PANGANLOOP",
    description: "Konfirmasi serah terima pangan surplus tanpa kehilangan jejak.",
  },
};

export default function ReservasiPage() {
  return <ReservasiView showNav={true} />;
}
