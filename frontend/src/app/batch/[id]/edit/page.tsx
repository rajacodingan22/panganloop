import type { Metadata } from "next";
import { Suspense } from "react";
import { BatchFormView } from "../../../_components/batch-views";
import { Spinner } from "../../../_components/ui-kit";

export const metadata: Metadata = {
  title: "Edit batch — PANGANLOOP",
  description: "Perbarui detail batch surplus.",
};

async function EditBatchContent(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <BatchFormView batchId={id} />;
}

export default function EditBatchPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Spinner label="Memuat form batch..." />}>
      <EditBatchContent params={props.params} />
    </Suspense>
  );
}
