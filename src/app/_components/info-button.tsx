"use client";

import type { ReactNode } from "react";
import { usePanganloopUi } from "./ui-context";

export function InfoButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { openInfo } = usePanganloopUi();

  return (
    <button className={className} type="button" onClick={openInfo}>
      {children}
    </button>
  );
}
