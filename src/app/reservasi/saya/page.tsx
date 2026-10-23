import type { Metadata } from "next";
import { RecipientReservationsView } from "../../_components/reservation-views";

export const metadata: Metadata = {
  title: "Reservasi saya — PANGANLOOP",
  description: "Lihat kode pickup dan riwayat reservasi Anda.",
};

export default function MyReservationsPage() {
  return <RecipientReservationsView />;
}
