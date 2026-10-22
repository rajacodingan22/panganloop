import { Suspense } from "react";
import type { Metadata } from "next";
import { BatchDetailView } from "./batch-detail-view";
import { getBatchDetail } from "./batch-data";

export function generateStaticParams() {
  return [
    { id: "batch-1" },
    { id: "batch-2" },
    { id: "batch-3" },
    { id: "BT-2024-00123" },
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const item = getBatchDetail(id);

  return {
    title: `${item.name} (${item.code}) — Detail Batch Donor | PANGANLOOP`,
    description: `Kelola siklus batch, reservasi, dan serah terima surplus untuk ${item.name}.`,
  };
}

export default async function BatchDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f2]" />}>
      <BatchDetailView initialBatchId={id} />
    </Suspense>
  );
}
