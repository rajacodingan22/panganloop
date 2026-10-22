"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Truck,
  Calendar,
  Clock,
  Check,
  MoreHorizontal,
  Users,
  Utensils,
  Home,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  FileText,
  Ban,
} from "lucide-react";
import { useAuth } from "../_components/auth-context";
import { VerifikasiPickupModal } from "../_components/verifikasi-pickup-modal";

export type ReservationStatus = "Semua" | "Menunggu pickup" | "Berhasil" | "Batal";

export interface ReservationData {
  id: string;
  recipientName: string;
  recipientLocation: string;
  recipientType: "komunitas" | "dapur" | "yayasan" | "shelter";
  recipientPic: string;
  recipientPhone: string;
  batchName: string;
  batchCode: string;
  units: number;
  pickupDate: string;
  pickupTime: string;
  pickupRemaining?: string;
  pickupCompleted?: boolean;
  status: "Menunggu pickup" | "Berhasil" | "Batal";
}

export const initialReservationsData: ReservationData[] = [
  {
    id: "res-1",
    recipientName: "Komunitas Berbagi Pangan",
    recipientLocation: "Jakarta Pusat",
    recipientType: "komunitas",
    recipientPic: "Ahmad Fauzi",
    recipientPhone: "0812-9988-7711",
    batchName: "Roti tawar",
    batchCode: "BTP-20241019-01",
    units: 4,
    pickupDate: "19 Okt",
    pickupTime: "17.30",
    pickupRemaining: "± 2 jam lagi",
    status: "Menunggu pickup",
  },
  {
    id: "res-2",
    recipientName: "Dapur Komunitas Tebet",
    recipientLocation: "Jakarta Selatan",
    recipientType: "dapur",
    recipientPic: "Siti Rahma",
    recipientPhone: "0813-2233-4455",
    batchName: "Nasi kotak ayam",
    batchCode: "BTP-20241019-02",
    units: 6,
    pickupDate: "19 Okt",
    pickupTime: "16.45",
    pickupCompleted: true,
    status: "Berhasil",
  },
  {
    id: "res-3",
    recipientName: "Yayasan Tumbuh Bersama",
    recipientLocation: "Jakarta Timur",
    recipientType: "yayasan",
    recipientPic: "Bambang Wijaya",
    recipientPhone: "0811-3344-5566",
    batchName: "Buah campur",
    batchCode: "BTP-20241019-03",
    units: 3,
    pickupDate: "19 Okt",
    pickupTime: "19.00",
    pickupRemaining: "± 3 jam lagi",
    status: "Menunggu pickup",
  },
  {
    id: "res-4",
    recipientName: "Rumah Singgah Harapan",
    recipientLocation: "Jakarta Barat",
    recipientType: "shelter",
    recipientPic: "Dewi Lestari",
    recipientPhone: "0815-6677-8899",
    batchName: "Nasi kotak sayur",
    batchCode: "BTP-20241018-07",
    units: 5,
    pickupDate: "18 Okt",
    pickupTime: "15.20",
    status: "Batal",
  },
  {
    id: "res-5",
    recipientName: "Gerakan Pangan Baik",
    recipientLocation: "Tangerang",
    recipientType: "komunitas",
    recipientPic: "Rian Pratama",
    recipientPhone: "0817-4455-6677",
    batchName: "Roti manis",
    batchCode: "BTP-20241018-06",
    units: 8,
    pickupDate: "18 Okt",
    pickupTime: "14.00",
    pickupCompleted: true,
    status: "Berhasil",
  },
];

export function ReservasiView({ showNav = true }: { showNav?: boolean }) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationData[]>(initialReservationsData);
  const [filter, setFilter] = useState<ReservationStatus>("Semua");
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ReservationData | null>(null);
  const [verifikasiModal, setVerifikasiModal] = useState<ReservationData | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleVerifikasi = (res: ReservationData) => {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === res.id
          ? {
              ...item,
              status: "Berhasil" as const,
              pickupCompleted: true,
              pickupRemaining: undefined,
            }
          : item
      )
    );
    setVerifikasiModal(null);
    showToast(`Serah terima dengan ${res.recipientName} berhasil diverifikasi!`);
  };

  const handleBatalkan = (resId: string) => {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === resId
          ? {
              ...item,
              status: "Batal" as const,
              pickupRemaining: undefined,
            }
          : item
      )
    );
    setRowMenuOpenId(null);
    if (selectedDetail?.id === resId) setSelectedDetail(null);
    showToast("Reservasi telah dibatalkan.");
  };

  // Filter items
  const filteredList = reservations.filter((item) => {
    if (filter === "Semua") return true;
    return item.status === filter;
  });

  // Calculate active today count
  const pendingTodayCount = reservations.filter(
    (item) => item.status === "Menunggu pickup"
  ).length;

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#0d3527] font-sans antialiased selection:bg-[#f0aa3e]/30">
      {/* ── Optional Top Navigation Bar ────────────────────────────── */}
      {showNav && (
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
                <Link href="/batch" className="hover:text-[#1c5c43] transition-colors">
                  Batch saya
                </Link>
                <span className="text-[#1c5c43] font-bold bg-[#e8f5ec] px-3 py-1 rounded-full">
                  Reservasi
                </span>
                <Link href="/dashboard" className="hover:text-[#1c5c43] transition-colors">
                  Dashboard
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/batch"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] hover:bg-[#faf7ee] text-[#0d3527] transition-all"
              >
                <span>Kelola Batch</span>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-[#e8e2d5]">
                <div className="w-8 h-8 rounded-full bg-[#1c5c43] text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || "DP"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-[#0d3527] leading-tight">
                    {user?.name || "Dapur Pagi"}
                  </p>
                  <p className="text-[10px] text-[#55695e] leading-tight">Pengelola Usaha</p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ── Main Canvas (Matching User Reference Image Pixel-by-Pixel) ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
        {/* Top Section: Header on Left + 2 Pickup Hari Ini Summary Card on Right */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Title, Subtitle, Filter Pills */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d3527] tracking-tight">
                Reservasi masuk
              </h1>
              <p className="text-sm sm:text-[15px] text-[#526359] mt-1.5 font-normal">
                Konfirmasi serah terima tanpa kehilangan jejak.
              </p>
            </div>

            {/* Filter Pills: Semua | Menunggu pickup | Berhasil | Batal */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {(["Semua", "Menunggu pickup", "Berhasil", "Batal"] as ReservationStatus[]).map(
                (tab) => {
                  const isActive = filter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilter(tab)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#164e39] text-white shadow-2xs font-bold"
                          : "bg-white text-[#526359] border border-[#e4ddcc] hover:bg-white/80"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Right: Summary Card (2 pickup hari ini | Tenggat terdekat 16.45) */}
          <div className="bg-[#fef8ee] border border-[#f5e6ce] rounded-2xl p-5 shadow-xs flex items-center justify-between gap-5 sm:gap-8 self-start lg:self-auto shrink-0 w-full sm:w-auto">
            {/* Left part of card */}
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-full bg-[#fde3be] text-[#d97706] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 stroke-[1.8] text-[#c2410c]" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#0d3527] leading-tight">
                  {pendingTodayCount} pickup hari ini
                </h2>
                <p className="text-xs text-[#526359] mt-0.5 leading-relaxed max-w-[210px]">
                  Ada {pendingTodayCount} reservasi yang perlu diproses sebelum tenggat waktu.
                </p>
              </div>
            </div>

            {/* Right part: Tenggat terdekat */}
            <div className="pl-6 border-l border-[#ecd7b7] text-right">
              <span className="text-xs font-semibold text-[#c2410c] block">
                Tenggat terdekat
              </span>
              <span className="text-3xl font-extrabold text-[#c2410c] leading-tight block">
                16.45
              </span>
              <span className="text-xs font-medium text-[#c2410c] block mt-0.5">
                Hari ini
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Reservations Table ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#e4ddcc] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f0ede4] text-xs font-semibold text-[#738278]">
                  <th className="py-4 px-6 font-semibold">Penerima</th>
                  <th className="py-4 px-6 font-semibold">Batch</th>
                  <th className="py-4 px-4 font-semibold">Jumlah</th>
                  <th className="py-4 px-6 font-semibold">Pickup</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ede4] text-sm">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#526359]">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-[#8a958e] opacity-60" />
                      <p className="font-semibold text-sm text-[#0d3527]">
                        Tidak ada reservasi dalam status &ldquo;{filter}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => setFilter("Semua")}
                        className="mt-2 text-xs font-bold text-[#1c5c43] hover:underline cursor-pointer"
                      >
                        Lihat semua reservasi
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    // Receiver type icon
                    let IconComp = Users;
                    if (item.recipientType === "dapur") IconComp = Utensils;
                    else if (item.recipientType === "shelter") IconComp = Home;

                    return (
                      <tr key={item.id} className="hover:bg-[#faf9f4] transition-colors">
                        {/* Penerima */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
                              <IconComp className="w-5 h-5 stroke-[1.8]" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[#0d3527] leading-snug">
                                {item.recipientName}
                              </div>
                              <div className="text-xs text-[#738278] mt-0.5">
                                {item.recipientLocation}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Batch */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-sm text-[#0d3527] leading-snug">
                            {item.batchName}
                          </div>
                          <div className="text-xs text-[#738278] mt-0.5">
                            {item.batchCode}
                          </div>
                        </td>

                        {/* Jumlah */}
                        <td className="py-4 px-4 font-medium text-sm text-[#0d3527] whitespace-nowrap">
                          {item.units} unit
                        </td>

                        {/* Pickup: Date + Time + Relative badge */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-[#0d3527]">
                            <Calendar className="w-4 h-4 text-[#738278] shrink-0" />
                            <span>
                              {item.pickupDate}, {item.pickupTime}
                            </span>
                          </div>
                          {item.pickupRemaining && (
                            <div className="flex items-center gap-1 text-xs text-[#b45309] font-medium mt-0.5">
                              <Clock className="w-3 h-3 text-[#b45309]" />
                              <span>{item.pickupRemaining}</span>
                            </div>
                          )}
                          {item.pickupCompleted && (
                            <div className="flex items-center gap-1 text-xs text-[#1c6b4f] font-semibold mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Selesai</span>
                            </div>
                          )}
                        </td>

                        {/* Status Pill */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {item.status === "Menunggu pickup" && (
                            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#fef3e2] text-[#b45309]">
                              Menunggu pickup
                            </span>
                          )}
                          {item.status === "Berhasil" && (
                            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e8f5ec] text-[#1c6b4f]">
                              Berhasil
                            </span>
                          )}
                          {item.status === "Batal" && (
                            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#dc2626]">
                              Batal
                            </span>
                          )}
                        </td>

                        {/* Aksi: Verifikasi vs Lihat detail + More button */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 justify-center">
                            {item.status === "Menunggu pickup" ? (
                              <button
                                type="button"
                                onClick={() => setVerifikasiModal(item)}
                                className="px-5 py-2 bg-[#1b5e43] hover:bg-[#144934] text-white font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
                              >
                                Verifikasi
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedDetail(item)}
                                className="px-4 py-2 border border-[#dfdbcf] hover:border-[#1c5c43] bg-white hover:bg-[#faf7ee] text-[#0d3527] font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                              >
                                Lihat detail
                              </button>
                            )}

                            {/* Three dots menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setRowMenuOpenId(rowMenuOpenId === item.id ? null : item.id)
                                }
                                className="p-1.5 text-[#8a958e] hover:text-[#0d3527] rounded-lg hover:bg-[#faf7ee] transition-colors cursor-pointer"
                                aria-label="Menu opsi lainnya"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>

                              {rowMenuOpenId === item.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDetail(item);
                                      setRowMenuOpenId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs text-[#0d3527] hover:bg-[#faf6ea] flex items-center gap-2 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#526359]" />
                                    <span>Rincian Reservasi</span>
                                  </button>
                                  <a
                                    href={`tel:${item.recipientPhone}`}
                                    className="w-full px-3.5 py-2 text-xs text-[#0d3527] hover:bg-[#faf6ea] flex items-center gap-2 cursor-pointer"
                                    onClick={() => setRowMenuOpenId(null)}
                                  >
                                    <Phone className="w-3.5 h-3.5 text-[#526359]" />
                                    <span>Hubungi PIC</span>
                                  </a>
                                  {item.status !== "Batal" && (
                                    <>
                                      <div className="border-t border-[#f0ede4] my-1" />
                                      <button
                                        type="button"
                                        onClick={() => handleBatalkan(item.id)}
                                        className="w-full px-3.5 py-2 text-xs text-[#dc2626] hover:bg-[#fef2f2] flex items-center gap-2 cursor-pointer font-medium"
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                        <span>Batalkan Reservasi</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Menampilkan 1-5 dari 5 reservasi + Pagination */}
          <div className="px-6 py-4 border-t border-[#f0ede4] flex items-center justify-between text-xs text-[#738278]">
            <p>Menampilkan 1–{filteredList.length} dari {reservations.length} reservasi</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="w-8 h-8 rounded-lg border border-[#e4ddcc] flex items-center justify-center text-[#a4b1a8] cursor-not-allowed"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-[#0d3527] text-white font-bold flex items-center justify-center text-xs"
              >
                1
              </button>

              <button
                type="button"
                disabled
                className="w-8 h-8 rounded-lg border border-[#e4ddcc] flex items-center justify-center text-[#a4b1a8] cursor-not-allowed"
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modal: Verifikasi Pickup (Matching exact design) ── */}
      {verifikasiModal && (
        <VerifikasiPickupModal
          isOpen={!!verifikasiModal}
          data={{
            recipientName: verifikasiModal.recipientName,
            recipientVerified: true,
            batchName: verifikasiModal.batchName,
            units: verifikasiModal.units,
            cutoffText: `${verifikasiModal.pickupDate} Oktober 2026 • ${verifikasiModal.pickupTime}`,
            defaultCode: "",
          }}
          onClose={() => setVerifikasiModal(null)}
          onConfirm={() => handleVerifikasi(verifikasiModal)}
        />
      )}

      {/* ── Modal: Detail Reservasi ─────────────────────────────────── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e4ddcc] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0d3527]">
                    {selectedDetail.recipientName}
                  </h2>
                  <p className="text-[11px] text-[#738278]">
                    {selectedDetail.recipientLocation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="w-7 h-7 rounded-full hover:bg-[#faf6ea] text-[#526359] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#faf8f2] p-3 rounded-xl border border-[#e8e2d5]">
                  <span className="text-[10px] text-[#738278] uppercase font-bold block">
                    Makanan
                  </span>
                  <span className="font-bold text-sm text-[#0d3527] mt-0.5 block">
                    {selectedDetail.batchName}
                  </span>
                  <span className="text-[11px] text-[#738278]">
                    {selectedDetail.batchCode}
                  </span>
                </div>

                <div className="bg-[#faf8f2] p-3 rounded-xl border border-[#e8e2d5]">
                  <span className="text-[10px] text-[#738278] uppercase font-bold block">
                    Jumlah Dipesan
                  </span>
                  <span className="font-extrabold text-lg text-[#1c6b4f] mt-0.5 block">
                    {selectedDetail.units} unit
                  </span>
                </div>
              </div>

              <div className="bg-[#faf8f2] p-3.5 rounded-xl border border-[#e8e2d5] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#526359]">Waktu Penjemputan:</span>
                  <span className="font-bold text-[#0d3527]">
                    {selectedDetail.pickupDate}, {selectedDetail.pickupTime} WIB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526359]">Status:</span>
                  <span className="font-bold text-[#0d3527]">
                    {selectedDetail.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526359]">Kontak PIC:</span>
                  <span className="font-bold text-[#0d3527]">
                    {selectedDetail.recipientPic} ({selectedDetail.recipientPhone})
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0ede4] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 bg-[#1b5e43] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#144934]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
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
