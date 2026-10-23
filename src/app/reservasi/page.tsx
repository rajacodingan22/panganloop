import type { Metadata } from "next";
import { DonorReservationsView } from "../_components/reservation-views";

export const metadata: Metadata = {
  title: "Reservasi masuk — PANGANLOOP",
  description: "Pantau organisasi yang mengklaim batch surplus Anda.",
};

export default function ReservationsPage() {
  return <DonorReservationsView />;
}
