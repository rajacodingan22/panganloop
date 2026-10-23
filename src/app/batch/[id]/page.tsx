import type { Metadata } from "next";
import { Suspense } from "react";
import { BatchDetailView } from "../../_components/batch-views";
import { Spinner } from "../../_components/ui-kit";

export const metadata: Metadata = {
  title: "Detail batch — PANGANLOOP",
  description: "Kelola batch, verifikasi pickup, dan tutup surplus.",
};

async function BatchDetailContent(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <BatchDetailView batchId={id} />;
}

export default function BatchDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Spinner label="Memuat detail batch..." />}>
      <BatchDetailContent params={props.params} />
    </Suspense>
  );
}
