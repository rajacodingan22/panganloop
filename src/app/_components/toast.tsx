"use client";

import { usePanganloopUi } from "./ui-context";

export function Toast() {
  const { toast } = usePanganloopUi();

  return (
    <div
      className={`toast${toast.visible ? " is-visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  );
}
