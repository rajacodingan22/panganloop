"use client";

import { ArrowRightIcon } from "./icons";
import { usePanganloopUi } from "./ui-context";

export function ClaimButton() {
  const { runDemo } = usePanganloopUi();

  return (
    <button
      className="btn btn-primary detail-claim"
      type="button"
      onClick={() => runDemo("Masuk untuk klaim")}
    >
      <ArrowRightIcon className="icon" />
      Masuk untuk klaim
    </button>
  );
}
