"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Edit2,
  Package,
  ShoppingCart,
  Leaf,
  Box,
  Check,
  CheckCircle2,
  Users,
  Snowflake,
  AlertTriangle,
  Info,
  X,
  PauseCircle,
  ArrowRight,
  QrCode,
} from "lucide-react";

import { BatchDetailData, getBatchDetail } from "./batch-data";
import { VerifikasiPickupModal } from "../../_components/verifikasi-pickup-modal";
import { TutupBatchModal } from "../../_components/tutup-batch-modal";

export function BatchDetailView({ initialBatchId }: { initialBatchId: string }) {
  const [batch, setBatch] = useState<BatchDetailData>(() =>
    getBatchDetail(initialBatchId)
  );

  const [notification, setNotification] = useState<string | null>(null);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalTutupOpen, setModalTutupOpen] = useState(false);
  const [verifikasiModalOpen, setVerifikasiModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(batch.name);
  const [editDisiapkan, setEditDisiapkan] = useState(batch.disiapkan);
  const [editTerjual, setEditTerjual] = useState(batch.terjual);
  const [editPenyimpanan, setEditPenyimpanan] = useState(batch.penyimpanan.label);
  const [editAlergen, setEditAlergen] = useState(batch.alergen.label);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleVerifikasiPickup = (resId: string) => {
    setBatch((prev) => {
      const updatedReservations = prev.reservations.map((r) =>
        r.id === resId ? { ...r, status: "Sudah diambil" as const } : r
      );
      const updatedTimeline = prev.timeline.map((t) => {
        if (t.title === "Pickup menunggu") {
          return { ...t, state: "completed" as const, title: "Pickup selesai" };
        }
        if (t.title === "Batch ditutup") {
          return { ...t, state: "completed" as const, time: "Baru saja" };
        }
        return t;
      });
      return {
        ...prev,
        statusLabel: "Selesai disalurkan",
        statusType: "selesai",
        tersedia: Math.max(0, prev.tersedia - 4),
        reservations: updatedReservations,
        timeline: updatedTimeline,
      };
    });
    showToast("Pickup berhasil diverifikasi! Pangan tercatat sebagai terselamatkan.");
  };

  const handleTutupBatch = (outcome?: string, notes?: string) => {
    setBatch((prev) => ({
      ...prev,
      statusLabel: "Batch ditutup",
      statusType: "selesai",
      tersedia: 0,
      timeline: prev.timeline.map((t) =>
        t.title === "Batch ditutup"
          ? {
              ...t,
              state: "completed" as const,
              time: "Baru saja",
              description: outcome ? `Outcome sisa: ${outcome}${notes ? ` • "${notes}"` : ""}` : t.description,
            }
          : t
      ),
    }));
    setModalTutupOpen(false);
    showToast(
      `Batch "${batch.name}" berhasil ditutup. Jalur akhir: ${outcome || "Kompos"}.`
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSurplus = Math.max(0, editDisiapkan - editTerjual);
    setBatch((prev) => ({
      ...prev,
      name: editName,
      disiapkan: editDisiapkan,
      terjual: editTerjual,
      surplus: newSurplus,
      tersedia: newSurplus,
      penyimpanan: { ...prev.penyimpanan, label: editPenyimpanan },
      alergen: { ...prev.alergen, label: editAlergen },
    }));
    setModalEditOpen(false);
    showToast("Perubahan informasi batch berhasil disimpan!");
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#0d3527] font-sans antialiased selection:bg-[#f0aa3e]/30">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e8e2d5] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <div className="relative h-9 w-36">
                <Image
                  src="/assets/panganloop-logo.png"
                  alt="PANGANLOOP"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#55695e]">
              <Link href="/" className="hover:text-[#1c5c43] transition-colors">
                Beranda
              </Link>
              <Link href="/#surplus" className="hover:text-[#1c5c43] transition-colors">
                Surplus aktif
              </Link>
              <Link href="/batch" className="text-[#1c5c43] font-bold hover:underline">
                Batch saya
              </Link>
              <Link href="/dashboard" className="hover:text-[#1c5c43] transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/batch"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] text-[#0d3527] bg-white transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Daftar Batch</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-[#e8e2d5]">
              <div className="w-8 h-8 rounded-full bg-[#1c5c43] text-white flex items-center justify-center font-bold text-xs">
                SP
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[#0d3527] leading-tight">
                  {batch.author}
                </p>
                <p className="text-[10px] text-[#55695e] leading-tight">Penyedia</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Detail Canvas ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb with Back Arrow */}
        <div className="flex items-center gap-3 text-xs font-medium text-[#738278]">
          <Link
            href="/batch"
            className="w-7 h-7 rounded-lg border border-[#dfdbcf] bg-white hover:bg-[#faf7ee] flex items-center justify-center text-[#0d3527] transition-colors"
            aria-label="Kembali ke batch"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link href="/batch" className="hover:text-[#1c5c43] hover:underline">
              Batch
            </Link>
            <span className="text-[#a4b1a8]">/</span>
            <span className="text-[#0d3527] font-semibold">{batch.name}</span>
          </nav>
        </div>

        {/* ── Hero Batch Summary Header Card ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Left: Thumbnail Image + Details */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[#e6decf] bg-[#faf8f2]">
                <Image
                  src={batch.image}
                  alt={batch.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d3527] tracking-tight">
                    {batch.name}
                  </h1>

                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fef3e2] text-[#b45309]">
                    <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>{batch.statusLabel}</span>
                  </span>
                </div>

                <p className="text-xs font-medium text-[#55695e]">
                  ID Batch <span className="font-bold text-[#0d3527]">{batch.code}</span>
                </p>

                <div className="flex items-center gap-4 text-xs text-[#526359] pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#738278]" />
                    <span>{batch.storeName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#738278]" />
                    <span>{batch.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions (Edit & Tutup batch) + Meta date */}
            <div className="flex flex-col md:items-end justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(true)}
                  className="px-4 py-2 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] bg-white hover:bg-[#faf7ee] text-xs font-semibold text-[#0d3527] transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#526359]" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTutupOpen(true)}
                  className="px-4 py-2 rounded-xl border border-[#fca5a5] hover:border-[#ef4444] bg-white hover:bg-[#fef2f2] text-xs font-semibold text-[#dc2626] transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-[#dc2626]" />
                  <span>Tutup batch</span>
                </button>
              </div>

              <div className="text-left md:text-right text-[11px] text-[#738278] leading-relaxed">
                <p>Dibuat {batch.createdDate}</p>
                <p>Oleh {batch.author}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 Metric Cards Row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Disiapkan */}
          <div className="bg-white rounded-2xl border border-[#e4ddcc] p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
              <Box className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0d3527] leading-none">
                {batch.disiapkan}
              </div>
              <div className="text-xs font-bold text-[#0d3527] mt-1">Disiapkan</div>
              <div className="text-[11px] text-[#738278] mt-0.5">Total unit pada batch ini</div>
            </div>
          </div>

          {/* 2. Terjual */}
          <div className="bg-white rounded-2xl border border-[#e4ddcc] p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#eaf4ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0d3527] leading-none">
                {batch.terjual}
              </div>
              <div className="text-xs font-bold text-[#0d3527] mt-1">Terjual</div>
              <div className="text-[11px] text-[#738278] mt-0.5">Unit yang sudah dipesan</div>
            </div>
          </div>

          {/* 3. Surplus */}
          <div className="bg-white rounded-2xl border border-[#e4ddcc] p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0d3527] leading-none">
                {batch.surplus}
              </div>
              <div className="text-xs font-bold text-[#0d3527] mt-1">Surplus</div>
              <div className="text-[11px] text-[#738278] mt-0.5">Perkiraan unit tidak terjual</div>
            </div>
          </div>

          {/* 4. Tersedia */}
          <div className="bg-white rounded-2xl border border-[#e4ddcc] p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0d3527] leading-none">
                {batch.tersedia}
              </div>
              <div className="text-xs font-bold text-[#0d3527] mt-1">Tersedia</div>
              <div className="text-[11px] text-[#738278] mt-0.5">Masih dapat dipesan</div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Main Content (Timeline & Reservations) ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* LEFT: Siklus Batch Timeline (5 cols)                         */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e4ddcc] p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-[#0d3527] mb-6">
              Siklus batch
            </h2>

            <div className="relative pl-6 space-y-7">
              {/* Vertical connecting line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-[#dfdbcf]" />

              {batch.timeline.map((item, idx) => {
                const isCompleted = item.state === "completed";
                const isCurrent = item.state === "current";
                const isPending = item.state === "pending";

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step Icon Indicator */}
                    <div className="absolute -left-6 mt-0.5">
                      {isCompleted && (
                        <div className="w-6 h-6 rounded-full bg-[#1c5c43] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      {isCurrent && (
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-[#1c5c43] flex items-center justify-center shadow-xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1c5c43]" />
                        </div>
                      )}
                      {isPending && (
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-dashed border-[#a4b1a8] flex items-center justify-center" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-bold leading-tight ${
                            isPending ? "text-[#738278]" : "text-[#0d3527]"
                          }`}
                        >
                          {item.title}
                        </h3>
                      </div>
                      {item.time && (
                        <p className="text-[11px] text-[#738278]">{item.time}</p>
                      )}
                      <p
                        className={`text-xs leading-relaxed ${
                          isPending ? "text-[#8a958e]" : "text-[#526359]"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* RIGHT: Reservasi, Penanganan & Info Note (7 cols)           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Reservasi Card */}
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0ede4]">
                <h2 className="text-base font-bold text-[#0d3527]">
                  Reservasi ({batch.reservations.length})
                </h2>
                <Link
                  href="/batch"
                  className="text-xs font-semibold text-[#1c5c43] hover:underline inline-flex items-center gap-1"
                >
                  <span>Lihat semua reservasi</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {batch.reservations.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#738278]">
                  Belum ada reservasi masuk untuk batch ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs mt-3">
                    <thead>
                      <tr className="border-b border-[#f0ede4] text-[#738278]">
                        <th className="py-2.5 font-semibold">Penerima</th>
                        <th className="py-2.5 font-semibold text-center">Jumlah</th>
                        <th className="py-2.5 font-semibold">Status</th>
                        <th className="py-2.5 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f1e8]">
                      {batch.reservations.map((res) => (
                        <tr key={res.id}>
                          <td className="py-3.5 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-[#0d3527]">
                                {res.recipientName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-center font-medium text-[#0d3527]">
                            {res.units} unit
                          </td>
                          <td className="py-3.5 px-2">
                            {res.status === "Menunggu pickup" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fef3e2] text-[#b45309]">
                                <Clock className="w-3 h-3" />
                                <span>Menunggu pickup</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8f5ec] text-[#1c6b4f]">
                                <Check className="w-3 h-3" />
                                <span>Sudah diambil</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 pl-2 text-right">
                            {res.status === "Menunggu pickup" ? (
                              <button
                                type="button"
                                onClick={() => setVerifikasiModalOpen(true)}
                                className="px-4 py-2 bg-[#1b5e43] hover:bg-[#144934] text-white font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                              >
                                Verifikasi pickup
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#738278] font-medium">
                                Selesai
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. Informasi Penanganan Card */}
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ede4]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[#0d3527]">
                    Informasi penanganan
                  </h2>
                  <span className="text-xs text-[#738278]">— Diisi oleh penyedia</span>
                </div>

                <button
                  type="button"
                  onClick={() => setModalEditOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] bg-white text-xs font-semibold text-[#0d3527] transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-[#526359]" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Penyimpanan */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center shrink-0 mt-0.5">
                  <Snowflake className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#0d3527]">Penyimpanan</p>
                  <p className="text-xs font-medium text-[#0d3527]">
                    {batch.penyimpanan.label}
                  </p>
                  <p className="text-[11px] text-[#738278]">
                    {batch.penyimpanan.desc}
                  </p>
                </div>
              </div>

              {/* Alergen */}
              <div className="flex items-start gap-3.5 pt-3 border-t border-[#f0ede4]">
                <div className="w-8 h-8 rounded-lg bg-[#fff3e0] text-[#b45309] flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#0d3527]">Alergen</p>
                  <p className="text-xs font-medium text-[#0d3527]">
                    {batch.alergen.label}
                  </p>
                  <p className="text-[11px] text-[#738278]">
                    {batch.alergen.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Aksi Card (matching background of user screenshot) */}
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 shadow-xs space-y-3.5">
              <h2 className="text-base font-bold text-[#0d3527]">Aksi</h2>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setVerifikasiModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-[#164e39] hover:bg-[#113d2c] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <QrCode className="w-4 h-4 text-white" />
                  <span>Verifikasi pickup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalEditOpen(true)}
                  className="w-full py-2.5 px-4 border border-[#dfdbcf] hover:border-[#1c5c43] bg-white hover:bg-[#faf7ee] text-[#0d3527] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Edit2 className="w-4 h-4 text-[#526359]" />
                  <span>Ubah informasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTutupOpen(true)}
                  className="w-full py-2.5 px-4 border border-[#fca5a5] hover:border-[#ef4444] bg-white hover:bg-[#fef2f2] text-[#dc2626] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <PauseCircle className="w-4 h-4 text-[#dc2626]" />
                  <span>Tutup batch</span>
                </button>
              </div>
            </div>

            {/* 4. Bottom Information Banner */}
            <div className="bg-[#eef7f1] rounded-2xl border border-[#cbe4d4] p-4 sm:p-5 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#1c5c43] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[#1c5c43] leading-snug">
                  Rescued baru dihitung setelah serah terima dikonfirmasi.
                </p>
                <p className="text-[#3a5848] leading-relaxed">
                  Jumlah unit yang terselamatkan (rescued) akan masuk ke statistik dampak setelah pickup berhasil diverifikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modal: Edit Batch ───────────────────────────────────────── */}
      {modalEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e4ddcc] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede4]">
              <h2 className="text-base font-bold text-[#0d3527]">Edit Batch</h2>
              <button
                type="button"
                onClick={() => setModalEditOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#faf6ea] text-[#526359] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0d3527] mb-1">Nama Makanan</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] text-sm text-[#0d3527] bg-[#faf8f2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0d3527] mb-1">Disiapkan (unit)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editDisiapkan}
                    onChange={(e) => setEditDisiapkan(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] text-sm text-[#0d3527] bg-[#faf8f2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0d3527] mb-1">Terjual (unit)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editTerjual}
                    onChange={(e) => setEditTerjual(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] text-sm text-[#0d3527] bg-[#faf8f2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0d3527] mb-1">Cara Penyimpanan</label>
                <input
                  type="text"
                  value={editPenyimpanan}
                  onChange={(e) => setEditPenyimpanan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] text-sm text-[#0d3527] bg-[#faf8f2]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0d3527] mb-1">Alergen</label>
                <textarea
                  rows={2}
                  value={editAlergen}
                  onChange={(e) => setEditAlergen(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] text-sm text-[#0d3527] bg-[#faf8f2]"
                />
              </div>

              <div className="pt-3 border-t border-[#f0ede4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(false)}
                  className="px-4 py-2 font-semibold text-[#526359] hover:text-[#0d3527] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1b5e43] text-white font-bold rounded-xl cursor-pointer hover:bg-[#144934]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Tutup Batch (Matching user mockup image_a010ab42.png) ── */}
      <TutupBatchModal
        isOpen={modalTutupOpen}
        batch={{
          id: batch.id,
          name: batch.name,
          surplusAwal: batch.surplus,
          berhasilDiambil: Math.max(0, batch.surplus - batch.tersedia),
          sisa: batch.tersedia,
        }}
        onClose={() => setModalTutupOpen(false)}
        onConfirm={(outcome, notes) => handleTutupBatch(outcome, notes)}
      />

      {/* ── Modal: Verifikasi Pickup (Matching exact design) ── */}
      {verifikasiModalOpen && (
        <VerifikasiPickupModal
          isOpen={verifikasiModalOpen}
          data={{
            recipientName: batch.reservations[0]?.recipientName || "Komunitas Berbagi Pangan",
            recipientVerified: true,
            batchName: batch.name,
            units: batch.reservations[0]?.units || 4,
            cutoffText: "19 Oktober 2026 • 18.30",
            defaultCode: "",
          }}
          onClose={() => setVerifikasiModalOpen(false)}
          onConfirm={() => {
            handleVerifikasiPickup(batch.reservations[0]?.id || "res-1");
            setVerifikasiModalOpen(false);
          }}
        />
      )}

      {/* ── Toast Notification ────────────────────────────────────────── */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d3527] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#f0aa3e] shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
