"use client";

import { useState } from "react";
import {
  X,
  Users,
  Check,
  Box,
  FileText,
  Clock,
  Lock,
  Info,
  ShieldCheck,
  QrCode,
  Camera,
  RefreshCw,
} from "lucide-react";

export interface VerifikasiModalData {
  id?: string;
  recipientName: string;
  recipientVerified?: boolean;
  batchName: string;
  units: number;
  cutoffText: string;
  defaultCode?: string;
}

interface VerifikasiPickupModalProps {
  data: VerifikasiModalData;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
}

export function VerifikasiPickupModal({
  data,
  isOpen,
  onClose,
  onConfirm,
}: VerifikasiPickupModalProps) {
  const [code, setCode] = useState(data.defaultCode || "");
  const [qrScanning, setQrScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 4) {
      setErrorMsg("Harap masukkan 6 digit kode pickup yang valid.");
      return;
    }
    setErrorMsg(null);
    onConfirm(code);
  };

  const handleSimulateQr = () => {
    setQrScanning(true);
    setTimeout(() => {
      setCode("482910");
      setQrScanning(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md sm:max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e4ddcc] relative max-h-[95vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-verifikasi-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[#faf6ea] text-[#738278] hover:text-[#0d3527] flex items-center justify-center absolute right-5 top-5 transition-colors cursor-pointer"
          aria-label="Tutup dialog verifikasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <h2
            id="modal-verifikasi-title"
            className="text-2xl font-extrabold text-[#0d3527] tracking-tight"
          >
            Verifikasi pickup
          </h2>
          <p className="text-xs text-[#526359] mt-1.5 leading-relaxed">
            Pastikan penerima yang datang sesuai dengan reservasi dan masukkan kode pickup untuk mengonfirmasi serah terima.
          </p>
        </div>

        {/* Ringkasan Reservasi Box */}
        <div className="bg-white rounded-2xl border border-[#e8e4dc] p-4 sm:p-4.5 space-y-3 mt-4.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#8a958e] block">
            Ringkasan reservasi
          </span>

          {/* Recipient info row */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0d3527] leading-tight">
                {data.recipientName}
              </p>
              <p className="text-xs text-[#1c6b4f] font-medium flex items-center gap-1 mt-0.5">
                <span>Penerima terverifikasi</span>
                <Check className="w-3 h-3 stroke-[3]" />
              </p>
            </div>
          </div>

          <div className="border-t border-[#f2ede4] pt-2.5 space-y-2 text-xs">
            {/* Batch item */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 w-28 text-[#738278]">
                <Box className="w-4 h-4 shrink-0 text-[#8a958e]" />
                <span>Batch</span>
              </div>
              <span className="font-bold text-[#0d3527]">{data.batchName}</span>
            </div>

            {/* Jumlah */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 w-28 text-[#738278]">
                <FileText className="w-4 h-4 shrink-0 text-[#8a958e]" />
                <span>Jumlah</span>
              </div>
              <span className="font-bold text-[#0d3527]">{data.units} unit</span>
            </div>

            {/* Batas pickup */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 w-28 text-[#738278]">
                <Clock className="w-4 h-4 shrink-0 text-[#8a958e]" />
                <span>Batas pickup</span>
              </div>
              <span className="font-bold text-[#c2410c]">{data.cutoffText}</span>
            </div>
          </div>
        </div>

        {/* Form: Kode Pickup */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#0d3527]">
                Kode pickup
              </label>

              <button
                type="button"
                onClick={handleSimulateQr}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#dfdbcf] hover:border-[#1c5c43] text-xs font-semibold text-[#0d3527] bg-[#faf8f2] hover:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 text-[#1c5c43]" />
                <span>{qrScanning ? "Memindai..." : "Pindai QR"}</span>
              </button>
            </div>

            {/* QR Scanner simulation preview if active */}
            {qrScanning && (
              <div className="mb-2 bg-[#0d3527] text-white p-4 rounded-xl flex items-center justify-center gap-3 text-xs animate-pulse">
                <Camera className="w-4 h-4 text-[#f0aa3e]" />
                <span>Mendeteksi QR Code dari smartphone penerima...</span>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#f0aa3e]" />
              </div>
            )}

            <div className="relative">
              <Lock className="w-4 h-4 text-[#738278] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                maxLength={8}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Masukkan 6 digit kode"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#0d3527] focus:ring-2 focus:ring-[#1c5c43] focus:outline-none text-sm font-semibold tracking-wider text-[#0d3527] bg-white transition-all shadow-2xs"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-[#dc2626] font-medium mt-1">{errorMsg}</p>
            )}

            {/* Helper text */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#526359] mt-1.5">
              <Info className="w-3.5 h-3.5 text-[#738278] shrink-0" />
              <span>Rescued bertambah setelah verifikasi berhasil.</span>
            </div>
          </div>

          {/* Green Notice Banner */}
          <div className="bg-[#eef7f1] rounded-2xl p-3.5 border border-[#cbe4d4] flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#1c5c43] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-[#1c5c43]">
                Kode salah tidak mengubah stok.
              </p>
              <p className="text-[11px] text-[#3a5848] leading-relaxed">
                Anda dapat meminta penerima untuk mengecek kembali kode pickup mereka.
              </p>
            </div>
          </div>

          {/* Action Buttons: Batal & Konfirmasi serah terima */}
          <div className="flex items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] bg-white hover:bg-[#faf7ee] text-xs font-semibold text-[#0d3527] transition-all cursor-pointer shadow-2xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-[#164e39] hover:bg-[#113d2c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Konfirmasi serah terima
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
