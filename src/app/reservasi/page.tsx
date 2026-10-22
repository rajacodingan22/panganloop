import { Suspense } from "react";
import type { Metadata } from "next";
import { ReservasiPageClient } from "./reservasi-page-client";

export const metadata: Metadata = {
  title: "Reservasi — PANGANLOOP",
  description:
    "Detail reservasi pangan surplus untuk komunitas penerima dan donor di PANGANLOOP.",
  openGraph: {
    title: "Reservasi — PANGANLOOP",
    description: "Detail reservasi pangan dan tiket pickup.",
  },
};

export default function ReservasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f2]" />}>
      <ReservasiPageClient />
    </Suspense>
  );
}
