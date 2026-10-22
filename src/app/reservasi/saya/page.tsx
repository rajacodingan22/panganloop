import type { Metadata } from "next";
import { ReservasiSayaView } from "../reservasi-saya-view";

export const metadata: Metadata = {
  title: "Reservasi Saya — PANGANLOOP",
  description:
    "Detail reservasi pangan surplus untuk komunitas penerima, lengkap dengan QR code dan kode pickup serah terima.",
  openGraph: {
    title: "Reservasi Saya — PANGANLOOP",
    description: "Detail reservasi pangan dan tiket pickup.",
  },
};

export default function ReservasiSayaPage() {
  return <ReservasiSayaView />;
}
