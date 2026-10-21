"use client";

import type { ReactNode } from "react";
import { usePanganloopUi } from "./ui-context";

export function DemoLink({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { runDemo } = usePanganloopUi();

  return (
    <a
      className={className}
      href="#"
      onClick={(event) => {
        event.preventDefault();
        runDemo(label);
      }}
    >
      {children}
    </a>
  );
}
