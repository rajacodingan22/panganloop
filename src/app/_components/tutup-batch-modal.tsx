"use client";

import { useState } from "react";
import {
  X,
  Leaf,
  Users,
  Box,
  Info,
  AlertTriangle,
} from "lucide-react";

export interface TutupBatchData {
  id: string;
  name: string;
  surplusAwal: number;
  berhasilDiambil: number;
  sisa: number;
}

interface TutupBatchModalProps {
  isOpen: boolean;
  batch: TutupBatchData;
  onClose: () => void;
  onConfirm: (outcome: string, notes: string) => void;
}

const OUTCOME_OPTIONS = [
  {
    id: "Kompos",
    title: "Kompos",
    desc: "Diolah menjadi kompos.",
  },
  {
    id: "Digunakan internal",
    title: "Digunakan internal",
    desc: "Digunakan oleh operasional internal (mis. staf/dapur).",
  },
  {
    id: "Dibuang",
    title: "Dibuang",
    desc: "Tidak dapat dimanfaatkan dan dibuang.",
  },
  {
    id: "Disalurkan secara lain",
    title: "Disalurkan secara lain",
    desc: "Disalurkan melalui jalur lain di luar PANGANLOOP.",
  },
  {
    id: "Belum diketahui",
    title: "Belum diketahui",
    desc: "Status akhir sisa belum diketahui.",
  },
];

export function TutupBatchModal({
  isOpen,
  batch,
  onClose,
  onConfirm,
}: TutupBatchModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState("Kompos");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedOutcome, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e4ddcc] relative max-h-[95vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-tutup-batch-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[#faf6ea] text-[#738278] hover:text-[#0d3527] flex items-center justify-center absolute right-5 top-5 transition-colors cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <h2
            id="modal-tutup-batch-title"
            className="text-2xl font-extrabold text-[#0d3527] tracking-tight"
          >
            Tutup batch
          </h2>
          <p className="text-xs text-[#526359] mt-1 leading-relaxed">
            Catat <strong className="text-[#0d3527]">outcome akhir</strong> sebelum batch menjadi read-only.
          </p>
        </div>

        {/* 3 Metric Cards Row (Surplus awal, Berhasil diambil, Sisa belum tersalurkan) */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {/* 1. Surplus awal */}
          <div className="bg-[#eef7f1] rounded-2xl p-3 sm:p-3.5 border border-[#cbe4d4]">
            <div className="w-7 h-7 rounded-full bg-[#1c5c43] text-white flex items-center justify-center mb-1.5">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-[#526359] font-medium block">
              Surplus awal
            </span>
            <span className="text-lg font-extrabold text-[#0d3527] leading-tight block">
              {batch.surplusAwal} unit
            </span>
          </div>

          {/* 2. Berhasil diambil */}
          <div className="bg-[#eef7f1] rounded-2xl p-3 sm:p-3.5 border border-[#cbe4d4]">
            <div className="w-7 h-7 rounded-full bg-[#1c5c43] text-white flex items-center justify-center mb-1.5">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-[#526359] font-medium block">
              Berhasil diambil
            </span>
            <span className="text-lg font-extrabold text-[#0d3527] leading-tight block">
              {batch.berhasilDiambil} unit
            </span>
          </div>

          {/* 3. Sisa belum tersalurkan */}
          <div className="bg-[#fef8ee] rounded-2xl p-3 sm:p-3.5 border border-[#f5e6ce]">
            <div className="w-7 h-7 rounded-full bg-[#fde3be] text-[#c2410c] flex items-center justify-center mb-1.5">
              <Box className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] text-[#738278] font-medium block">
              Sisa belum tersalurkan
            </span>
            <span className="text-lg font-extrabold text-[#0d3527] leading-tight block">
              {batch.sisa} unit
            </span>
          </div>
        </div>

        {/* Small Notice */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#738278] mt-2.5">
          <Info className="w-3.5 h-3.5 text-[#8a958e] shrink-0" />
          <span>Unit rescued berasal dari pickup yang terkonfirmasi.</span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Section: Jalur akhir sisa */}
          <div className="space-y-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#0d3527]">Jalur akhir sisa</h3>
              <p className="text-xs text-[#526359]">
                Pilih bagaimana sisa pangan pada batch ini ditangani.
              </p>
            </div>

            {/* Radio Options */}
            <div className="space-y-2">
              {OUTCOME_OPTIONS.map((opt) => {
                const isSelected = selectedOutcome === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedOutcome(opt.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#faf8f2] border-[#1c5c43]"
                        : "border-[#e8e4dc] hover:bg-[#faf9f4]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "border-[#1c5c43] bg-white"
                          : "border-[#dfdbcf] bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#1c5c43]" />
                      )}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-[#0d3527] leading-tight">
                        {opt.title}
                      </p>
                      <p className="text-[#526359] leading-tight">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section: Catatan tambahan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0d3527] block">
              Catatan tambahan (opsional)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis catatan tambahan di sini..."
                className="w-full p-3 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-xs sm:text-sm text-[#0d3527] bg-[#faf8f2]"
              />
              <span className="absolute right-2.5 bottom-2 text-[10px] text-[#8a958e] pointer-events-none">
                {notes.length}/500
              </span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-[#fef8ee] rounded-xl p-3 border border-[#f5e6ce] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-[#b45309]">
                Pastikan semua reservasi aktif sudah diselesaikan.
              </p>
              <p className="text-[11px] text-[#738278] leading-tight">
                Setelah batch ditutup, data tidak dapat diubah lagi (read-only).
              </p>
            </div>
          </div>

          {/* Actions: Kembali & Tutup batch */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f0ede4]">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] bg-white hover:bg-[#faf7ee] text-xs font-semibold text-[#0d3527] transition-all cursor-pointer shadow-2xs"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-[#164e39] hover:bg-[#113d2c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Tutup batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
