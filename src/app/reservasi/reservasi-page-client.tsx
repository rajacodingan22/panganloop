"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../_components/auth-context";
import { ReservasiView } from "./reservasi-view";
import { ReservasiSayaView } from "./reservasi-saya-view";

export function ReservasiPageClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  // Determine perspective from query param, active user role, or manual toggle
  const initialPerspective =
    viewParam === "donor" || viewParam === "masuk"
      ? "donor"
      : viewParam === "saya" || viewParam === "penerima"
      ? "penerima"
      : user?.role === "donor"
      ? "donor"
      : "penerima";

  const [manualPerspective, setManualPerspective] = useState<"penerima" | "donor" | null>(null);
  const activePerspective = manualPerspective ?? initialPerspective;

  return (
    <div>
      {/* Perspective Switcher */}
      <div className="bg-[#0e3828] text-white px-4 py-2 text-xs border-b border-[#1c5542]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#a4c9b8]">Tampilan Reservasi:</span>
            <div className="inline-flex rounded-lg bg-black/30 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setManualPerspective("penerima")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activePerspective === "penerima"
                    ? "bg-[#1c6b4f] text-white shadow-xs"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Reservasi Saya (Penerima)
              </button>
              <button
                type="button"
                onClick={() => setManualPerspective("donor")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activePerspective === "donor"
                    ? "bg-[#1c6b4f] text-white shadow-xs"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Reservasi Masuk (Donor)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#a4c9b8] hidden sm:block">
            Akun aktif: <strong>{user?.name}</strong> ({user?.roleLabel || "Penerima"})
          </div>
        </div>
      </div>

      {activePerspective === "penerima" ? (
        <ReservasiSayaView showRoleToggle={false} />
      ) : (
        <ReservasiView showNav={true} />
      )}
    </div>
  );
}
