import type { Metadata } from "next";
import { Suspense } from "react";
import { SurplusDetailView } from "../../_components/surplus-views";
import { Spinner } from "../../_components/ui-kit";

export const metadata: Metadata = {
  title: "Detail surplus — PANGANLOOP",
  description: "Lihat detail surplus dan ajukan pickup sebagai penerima terverifikasi.",
};

async function SurplusDetailContent(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <SurplusDetailView batchId={id} />;
}

export default function SurplusDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Spinner label="Memuat detail surplus..." />}>
      <SurplusDetailContent params={props.params} />
    </Suspense>
  );
}
