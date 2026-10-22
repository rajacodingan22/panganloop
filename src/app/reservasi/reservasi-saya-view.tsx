"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Clock,
  Package,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Check,
  BookOpen,
  XCircle,
  X,
  Phone,
  Copy,
  CheckCircle2,
  Utensils,
  LogOut,
  RefreshCw,
  User as UserIcon,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS, UserProfile } from "../_components/auth-context";

export interface ReservasiDetailProps {
  id?: string;
  foodName?: string;
  providerName?: string;
  categoryLabel?: string;
  units?: number;
  pickupDate?: string;
  pickupTimeRange?: string;
  pickupArea?: string;
  fullAddress?: string;
  providerPhone?: string;
  providerPic?: string;
  pickupCode?: string;
  createdAtDate?: string;
  createdAtTime?: string;
  imageSrc?: string;
  initialStatus?: "Menunggu pickup" | "Selesai" | "Dibatalkan";
  onBack?: () => void;
  showRoleToggle?: boolean;
}

export function ReservasiSayaView({
  id = "res-rec-1",
  foodName = "Roti tawar",
  providerName = "Dapur Pagi",
  categoryLabel = "Makanan siap konsumsi",
  units = 4,
  pickupDate = "19 Oktober 2026",
  pickupTimeRange = "17.30 – 18.30",
  pickupArea = "Kawasan Tebet, Jakarta Selatan",
  fullAddress = "Jl. Tebet Barat Dalam Raya No. 42, RT.05/RW.02, Tebet, Jakarta Selatan 12810",
  providerPhone = "0812-3456-7890",
  providerPic = "Budi Santoso",
  pickupCode = "PL-8924",
  createdAtDate = "18 Oktober 2026",
  createdAtTime = "10.24",
  imageSrc = "/assets/surplus/surplus-roti.jpg",
  initialStatus = "Menunggu pickup",
  onBack,
  showRoleToggle = true,
}: ReservasiDetailProps) {
  const router = useRouter();
  const { user, quickLogin, logout } = useAuth();

  // Code reveal toggle
  const [showCode, setShowCode] = useState(false);

  // Status state (can be canceled or marked completed)
  const [status, setStatus] = useState<"Menunggu pickup" | "Selesai" | "Dibatalkan">(
    initialStatus
  );

  // Modals & Popovers
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [petunjukModalOpen, setPetunjukModalOpen] = useState(false);
  const [batalModalOpen, setBatalModalOpen] = useState(false);
  const [batalReason, setBatalReason] = useState("Kendala transportasi / logistik");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pickupCode);
      showToast("Kode pickup disalin ke clipboard!");
    } else {
      showToast(`Kode pickup: ${pickupCode}`);
    }
  };

  const handleCopyAddress = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullAddress);
      showToast("Alamat pickup berhasil disalin!");
    }
  };

  const handleConfirmBatal = () => {
    setStatus("Dibatalkan");
    setBatalModalOpen(false);
    showToast("Reservasi telah dibatalkan.");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#0d3527] font-sans antialiased selection:bg-[#f0aa3e]/30">
      {/* ── Top Role Switcher Bar (For Seamless Testing between Recipient & Donor) ── */}
      {showRoleToggle && (
        <aside aria-label="Role Switcher" className="bg-[#11382b] text-[#d6ede2] px-4 py-1.5 text-xs border-b border-[#1c5542]">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-white">Mode Akun Aktif:</span>
              <span className="bg-emerald-900/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/60">
                Penerima • {user?.name || "Komunitas Berbagi Pangan"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/reservasi"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Lihat Tampilan Donor (Reservasi Masuk)</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* ── Top Header Navigation Bar ───────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#ece7dc] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
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

            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#55695e] pl-4 border-l border-[#e8e2d5]">
              <Link href="/" className="hover:text-[#1c5c43] transition-colors">
                Beranda
              </Link>
              <Link href="/#surplus" className="hover:text-[#1c5c43] transition-colors">
                Surplus aktif
              </Link>
              <Link href="/dashboard" className="hover:text-[#1c5c43] transition-colors">
                Dashboard
              </Link>
              <span className="text-[#1c5c43] font-bold bg-[#e8f5ec] px-3 py-1 rounded-full">
                Reservasi saya
              </span>
            </nav>
          </div>

          {/* Right Header: Notification Bell & Account Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 rounded-full border border-[#dfdbcf] bg-white hover:bg-[#faf7ee] flex items-center justify-center text-[#526359] hover:text-[#0d3527] transition-colors cursor-pointer relative"
                aria-label="Lihat notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600"></span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e4ddcc] p-4 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0ede4]">
                    <span className="font-bold text-xs text-[#0d3527]">Notifikasi</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-[#738278] hover:text-[#0d3527]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-[#f5f2ea] text-xs mt-2 space-y-2">
                    <div className="pt-2">
                      <div className="font-bold text-[#1c5c43]">
                        Reservasi Roti tawar aktif
                      </div>
                      <div className="text-[#738278] text-[11px] mt-0.5">
                        Jadwal pickup hari ini pukul 17.30 – 18.30 di Dapur Pagi.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu (Avatar + "Penerima" + Chevron) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#dfdbcf] bg-white hover:bg-[#faf7ee] transition-colors cursor-pointer text-xs font-semibold text-[#0d3527]"
              >
                <div className="w-6 h-6 rounded-full bg-[#1c5c43] text-white flex items-center justify-center font-bold text-[10px]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span>Penerima</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#738278]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e4ddcc] p-3 z-40 text-left animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-2 border-b border-[#f0ede4] mb-2">
                    <div className="font-bold text-xs text-[#0d3527]">
                      {user?.name || "Komunitas Berbagi Pangan"}
                    </div>
                    <div className="text-[11px] text-[#738278]">
                      {user?.email || "komunitas@panganloop.id"}
                    </div>
                    <div className="text-[10px] text-emerald-800 font-bold bg-[#e8f5ec] px-2 py-0.5 rounded-full inline-block mt-1.5">
                      Peran: Penerima (Organisasi Terverifikasi)
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#8a988f]">
                      Ganti Akun Demo
                    </div>
                    {DEMO_ACCOUNTS.map((acc: UserProfile) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          quickLogin(acc);
                          setUserMenuOpen(false);
                          if (acc.role === "donor") {
                            router.push("/reservasi");
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          user?.email === acc.email
                            ? "bg-[#e8f5ec] text-[#1c5c43] font-bold"
                            : "text-[#0d3527] hover:bg-[#faf7ee]"
                        }`}
                      >
                        <div>
                          <div>{acc.name}</div>
                          <div className="text-[10px] text-[#738278]">
                            {acc.role === "donor" ? "Donor (Penyedia)" : "Penerima (Komunitas)"}
                          </div>
                        </div>
                        {user?.email === acc.email && (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                      </button>
                    ))}

                    <div className="pt-2 border-t border-[#f0ede4] mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push("/login");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Canvas (Exact 1:1 Match to User Reference Screenshot) ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
        {/* Header Row: Back Button + Title + Subtitle on Left, Status Badge on Right */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="mt-1 w-10 h-10 rounded-xl border border-[#dfdbcf] bg-white hover:bg-[#f6f3ea] flex items-center justify-center text-[#0d3527] transition-all cursor-pointer shadow-2xs shrink-0"
              aria-label="Kembali ke halaman sebelumnya"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d3527] tracking-tight">
                Reservasi saya
              </h1>
              <p className="text-sm sm:text-[15px] text-[#526359] mt-1 font-normal">
                Berikut detail reservasi pangan yang telah kamu buat.
              </p>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="self-start sm:self-auto shrink-0">
            {status === "Menunggu pickup" && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#fef3e2] border border-[#fed7aa] text-[#b45309] font-bold text-sm shadow-2xs">
                <Clock className="w-4 h-4 stroke-[2.2] text-[#b45309]" />
                <span>Menunggu pickup</span>
              </div>
            )}
            {status === "Selesai" && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#e8f5ec] border border-[#bfe2cb] text-[#1c5c43] font-bold text-sm shadow-2xs">
                <CheckCircle2 className="w-4 h-4 stroke-[2.2] text-[#1c5c43]" />
                <span>Serah terima selesai</span>
              </div>
            )}
            {status === "Dibatalkan" && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] font-bold text-sm shadow-2xs">
                <XCircle className="w-4 h-4 stroke-[2.2] text-[#dc2626]" />
                <span>Reservasi dibatalkan</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 2-Column Grid (Detail Reservasi on Left, Kode Pickup & Status on Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT COLUMN: Detail Reservasi (Col 6) ────────────────── */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#e4ddcc] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#0d3527] pb-5">
                Detail reservasi
              </h2>

              {/* Product Header Card (Image + Title + Subtitle + Tag) */}
              <div className="flex items-start gap-4 pb-6 border-b border-[#f0ede4]">
                <div className="relative w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-[#eee9dd] bg-[#faf8f2]">
                  <Image
                    src={imageSrc}
                    alt={foodName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 112px, 128px"
                    priority
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#0d3527] leading-tight">
                    {foodName}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#526359] font-medium">
                    Dari {providerName}
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f3efe6] text-[#526359]">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{categoryLabel}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Metadata Rows (Jumlah, Tanggal pickup, Waktu pickup, Area pickup) */}
              <div className="pt-6 space-y-5">
                {/* 1. Jumlah */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] text-[#526359] flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#738278] block">Jumlah</span>
                    <span className="text-base font-extrabold text-[#0d3527] block mt-0.5">
                      {units} unit
                    </span>
                  </div>
                </div>

                {/* 2. Tanggal pickup */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] text-[#526359] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#738278] block">Tanggal pickup</span>
                    <span className="text-base font-extrabold text-[#0d3527] block mt-0.5">
                      {pickupDate}
                    </span>
                  </div>
                </div>

                {/* 3. Waktu pickup */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] text-[#526359] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#738278] block">Waktu pickup</span>
                    <span className="text-base font-extrabold text-[#0d3527] block mt-0.5">
                      {pickupTimeRange}
                    </span>
                  </div>
                </div>

                {/* 4. Area pickup */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] text-[#526359] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#738278] block">Area pickup</span>
                    <span className="text-base font-extrabold text-[#0d3527] block mt-0.5">
                      {pickupArea}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note on Bottom of Left Card */}
            <div className="mt-8 pt-4 border-t border-[#f0ede4] flex items-center justify-between text-xs text-[#738278]">
              <span>ID Reservasi: <strong className="text-[#0d3527] font-mono">{id}</strong></span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-[#1c5c43] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Alamat</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Kode Pickup & Status Reservasi (Col 6) ─── */}
          <div className="lg:col-span-6 space-y-6">
            {/* ── CARD 1: Kode pickup ──────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 sm:p-7 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0d3527]">
                  Kode pickup
                </h2>
                <p className="text-xs sm:text-sm text-[#526359] mt-0.5">
                  Tunjukkan kode pickup saat serah terima.
                </p>
              </div>

              {/* Mint Container (QR Code on Left, Divider, Masked/Unmasked Code on Right) */}
              <div className="bg-[#f2f7f4] border border-[#dcebe1] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
                {/* Left: Crisp QR Code Box */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-2.5 rounded-xl border border-[#d6e5db] shadow-2xs flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                  <svg
                    className="w-full h-full text-[#0d3527]"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                    aria-label="QR Code Reservasi"
                  >
                    {/* Top-left marker */}
                    <rect x="6" y="6" width="26" height="26" rx="4" fill="#0d3527" />
                    <rect x="11" y="11" width="16" height="16" rx="2" fill="white" />
                    <rect x="15" y="15" width="8" height="8" rx="1" fill="#0d3527" />

                    {/* Top-right marker */}
                    <rect x="68" y="6" width="26" height="26" rx="4" fill="#0d3527" />
                    <rect x="73" y="11" width="16" height="16" rx="2" fill="white" />
                    <rect x="77" y="15" width="8" height="8" rx="1" fill="#0d3527" />

                    {/* Bottom-left marker */}
                    <rect x="6" y="68" width="26" height="26" rx="4" fill="#0d3527" />
                    <rect x="11" y="73" width="16" height="16" rx="2" fill="white" />
                    <rect x="15" y="77" width="8" height="8" rx="1" fill="#0d3527" />

                    {/* Grid Pattern Modules */}
                    <rect x="36" y="8" width="5" height="5" />
                    <rect x="45" y="8" width="5" height="5" />
                    <rect x="54" y="8" width="5" height="5" />
                    <rect x="36" y="18" width="5" height="5" />
                    <rect x="50" y="18" width="5" height="5" />
                    <rect x="41" y="27" width="5" height="5" />
                    <rect x="55" y="27" width="5" height="5" />

                    <rect x="8" y="38" width="5" height="5" />
                    <rect x="18" y="38" width="5" height="5" />
                    <rect x="27" y="44" width="5" height="5" />
                    <rect x="8" y="52" width="5" height="5" />
                    <rect x="18" y="55" width="5" height="5" />

                    <rect x="38" y="38" width="7" height="7" />
                    <rect x="49" y="38" width="7" height="7" />
                    <rect x="42" y="48" width="8" height="8" />
                    <rect x="54" y="48" width="6" height="6" />
                    <rect x="36" y="60" width="6" height="6" />
                    <rect x="48" y="60" width="7" height="7" />

                    <rect x="68" y="38" width="5" height="5" />
                    <rect x="77" y="44" width="5" height="5" />
                    <rect x="86" y="38" width="5" height="5" />
                    <rect x="68" y="52" width="6" height="6" />
                    <rect x="80" y="55" width="6" height="6" />

                    <rect x="38" y="74" width="6" height="6" />
                    <rect x="50" y="74" width="6" height="6" />
                    <rect x="42" y="84" width="7" height="7" />
                    <rect x="54" y="84" width="6" height="6" />

                    <rect x="68" y="68" width="7" height="7" />
                    <rect x="80" y="72" width="6" height="6" />
                    <rect x="72" y="82" width="7" height="7" />
                    <rect x="84" y="82" width="6" height="6" />
                  </svg>
                </div>

                {/* Vertical Divider Line */}
                <div className="hidden sm:block w-[1.5px] h-28 bg-[#d2e4d9]" />

                {/* Right: Masked / Revealed Code + Toggle Button */}
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <span className="text-xs text-[#526359] font-medium block">
                      Kode pickup Anda
                    </span>

                    <div className="h-9 flex items-center justify-center sm:justify-start">
                      {showCode ? (
                        <span className="font-mono text-2xl font-black text-[#144934] tracking-wider select-all">
                          {pickupCode}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 text-[#0d3527] font-black text-xl tracking-widest pt-1">
                          <span className="w-3 h-3 rounded-full bg-[#0d3527]" />
                          <span className="w-3 h-3 rounded-full bg-[#0d3527]" />
                          <span className="w-3 h-3 rounded-full bg-[#0d3527]" />
                          <span className="w-3 h-3 rounded-full bg-[#0d3527]" />
                          <span className="w-3 h-3 rounded-full bg-[#0d3527]" />
                          <span className="w-3 h-3 rounded-full bg-[#0d3527]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="px-5 py-2.5 rounded-xl bg-[#144934] hover:bg-[#0e3525] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                    >
                      {showCode ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Sembunyikan kode</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Tampilkan kode</span>
                        </>
                      )}
                    </button>

                    {showCode && (
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="p-2.5 rounded-xl border border-[#dcebe1] bg-white hover:bg-[#faf7ee] text-[#144934] transition-colors cursor-pointer"
                        title="Salin kode"
                        aria-label="Salin kode pickup"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Caption */}
              <p className="text-xs text-[#526359] flex items-center gap-1.5 pt-1">
                <span className="w-4 h-4 rounded-full border border-[#526359] flex items-center justify-center text-[10px] font-bold shrink-0">
                  i
                </span>
                <span>Kode ini hanya berlaku untuk reservasi ini.</span>
              </p>
            </div>

            {/* ── CARD 2: Status reservasi ─────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 sm:p-7 shadow-xs space-y-6">
              <h2 className="text-lg font-extrabold text-[#0d3527]">
                Status reservasi
              </h2>

              {/* Horizontal Stepper */}
              <div className="relative pt-2 pb-1">
                <div className="flex items-start justify-between">
                  {/* Step 1: Reservasi dibuat */}
                  <div className="flex flex-col items-center text-center w-32 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[#1c5c43] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-5 h-5 stroke-[2.8]" />
                    </div>
                    <span className="font-bold text-xs text-[#0d3527] mt-3 block leading-tight">
                      Reservasi dibuat
                    </span>
                    <span className="text-[11px] text-[#738278] mt-1 block leading-tight">
                      {createdAtDate}
                      <br />
                      {createdAtTime}
                    </span>
                  </div>

                  {/* Connecting Line 1 (Green) */}
                  <div className="flex-1 mx-2 h-[2px] bg-[#1c5c43] mt-4" />

                  {/* Step 2: Menunggu pickup */}
                  <div className="flex flex-col items-center text-center w-36 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs ${
                        status === "Dibatalkan"
                          ? "bg-stone-300 text-stone-600"
                          : "bg-[#1c5c43] text-white"
                      }`}
                    >
                      <Clock className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-[#0d3527] mt-3 block leading-tight">
                      {status === "Dibatalkan" ? "Dibatalkan" : "Menunggu pickup"}
                    </span>
                    <span className="text-[11px] text-[#738278] mt-1 block leading-tight max-w-[130px]">
                      {status === "Dibatalkan"
                        ? "Reservasi tidak dilanjutkan."
                        : "Silakan datang sesuai jadwal yang tersedia."}
                    </span>
                  </div>

                  {/* Connecting Line 2 (Gray or Green if completed) */}
                  <div
                    className={`flex-1 mx-2 h-[2px] mt-4 ${
                      status === "Selesai" ? "bg-[#1c5c43]" : "bg-[#dfdbcf]"
                    }`}
                  />

                  {/* Step 3: Konfirmasi oleh donor */}
                  <div className="flex flex-col items-center text-center w-36 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        status === "Selesai"
                          ? "bg-[#1c5c43] text-white"
                          : "border-2 border-[#8a988f] bg-white text-[#8a988f]"
                      }`}
                    >
                      {status === "Selesai" ? (
                        <Check className="w-5 h-5 stroke-[2.8]" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8a988f]" />
                      )}
                    </div>
                    <span
                      className={`font-bold text-xs mt-3 block leading-tight ${
                        status === "Selesai" ? "text-[#0d3527]" : "text-[#738278]"
                      }`}
                    >
                      Konfirmasi oleh donor
                    </span>
                    <span className="text-[11px] text-[#738278] mt-1 block leading-tight max-w-[130px]">
                      {status === "Selesai"
                        ? "Pangan berhasil diserahterimakan."
                        : "Akan dikonfirmasi setelah serah terima."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BANNER & ACTION STRIP ───────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
          {/* Left Banner Pill: Sprout + Advice */}
          <div className="bg-[#ecf5ef] border border-[#d0e5d7] rounded-2xl px-5 py-4 flex items-center gap-3.5 flex-1">
            <div className="w-8 h-8 rounded-full bg-[#d7edd0] text-[#1c6b4f] flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current"
                aria-hidden="true"
              >
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8Z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-xs sm:text-sm text-[#0d3527] leading-snug">
                Datang sesuai kapasitas dan waktu yang tersedia.
              </p>
              <p className="text-xs text-[#526359] mt-0.5 leading-snug">
                Ini membantu pangan tersalurkan dengan aman dan adil untuk semua.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Button 1: Buka petunjuk pickup */}
            <button
              type="button"
              onClick={() => setPetunjukModalOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3.5 rounded-2xl border border-[#0d3527] bg-white hover:bg-[#faf7ee] text-[#0d3527] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 stroke-[2]" />
              <span>Buka petunjuk pickup</span>
            </button>

            {/* Button 2: Batalkan reservasi */}
            {status !== "Dibatalkan" ? (
              <button
                type="button"
                onClick={() => setBatalModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-3.5 rounded-2xl border border-[#ef4444] bg-white hover:bg-[#fef2f2] text-[#dc2626] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <XCircle className="w-4 h-4 stroke-[2]" />
                <span>Batalkan reservasi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatus("Menunggu pickup");
                  showToast("Reservasi berhasil dipulihkan!");
                }}
                className="flex-1 sm:flex-none px-5 py-3.5 rounded-2xl border border-[#1c5c43] bg-white hover:bg-[#e8f5ec] text-[#1c5c43] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4 stroke-[2]" />
                <span>Aktifkan Kembali</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── MODAL 1: Petunjuk Pickup ─────────────────────────────────── */}
      {petunjukModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#dfdbcf] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede4]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ecf5ef] text-[#1c5c43] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0d3527]">
                    Petunjuk Pengambilan Pangan
                  </h3>
                  <p className="text-xs text-[#738278]">
                    Panduan serah terima surplus di lokasi donor
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPetunjukModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#faf7ee] text-[#526359] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guide Steps */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] space-y-1">
                <span className="font-bold text-[#0d3527] block">
                  1. Alamat Lokasi Donor
                </span>
                <p className="text-[#526359] leading-relaxed">
                  {fullAddress}
                </p>
                <p className="text-[11px] text-[#1c5c43] font-semibold mt-1">
                  Kontak PIC: {providerPic} ({providerPhone})
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] space-y-1">
                <span className="font-bold text-[#0d3527] block">
                  2. Waktu Serah Terima
                </span>
                <p className="text-[#526359]">
                  Harap hadir pada <strong>{pickupDate}</strong>, antara pukul <strong>{pickupTimeRange} WIB</strong>. Makanan tidak dijamin tersedia setelah batas waktu berakhir.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] space-y-1">
                <span className="font-bold text-[#0d3527] block">
                  3. Bawa Wadah & Dokumen
                </span>
                <p className="text-[#526359]">
                  Siapkan tas/wadah bersih sendiri untuk meminimalkan sampah kemasan sekali pakai.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e8e2d5] space-y-1">
                <span className="font-bold text-[#0d3527] block">
                  4. Verifikasi di Tempat
                </span>
                <p className="text-[#526359]">
                  Tunjukkan layar QR code atau sebutkan kode pickup <strong>{pickupCode}</strong> kepada staf Dapur Pagi sebelum membawa pangan.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <a
                href={`tel:${providerPhone}`}
                className="px-4 py-2.5 rounded-xl border border-[#dfdbcf] hover:bg-[#faf7ee] text-xs font-bold text-[#0d3527] flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi Toko</span>
              </a>

              <button
                type="button"
                onClick={() => setPetunjukModalOpen(false)}
                className="px-5 py-2.5 bg-[#144934] hover:bg-[#0e3525] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Konfirmasi Pembatalan ───────────────────────────── */}
      {batalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#dfdbcf] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-[#0d3527]">
                Batalkan Reservasi Ini?
              </h3>
              <p className="text-xs text-[#526359] leading-relaxed">
                Surplus sebanyak <strong>{units} unit {foodName}</strong> akan dilepas kembali ke katalog publik agar dapat dimanfaatkan oleh komunitas lain.
              </p>
            </div>

            {/* Radio Reasons */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="font-bold text-[#0d3527] block text-[11px] uppercase tracking-wider">
                Alasan Pembatalan:
              </span>
              {[
                "Kendala transportasi / logistik penjemputan",
                "Kebutuhan porsi komunitas sudah terpenuhi",
                "Perubahan jadwal tim operasional",
                "Lainnya",
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    batalReason === reason
                      ? "bg-[#ecf5ef] border-[#1c5c43] text-[#0d3527] font-semibold"
                      : "bg-[#faf8f2] border-[#e8e2d5] text-[#526359] hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="batalReason"
                    value={reason}
                    checked={batalReason === reason}
                    onChange={() => setBatalReason(reason)}
                    className="accent-[#1c5c43]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBatalModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-[#dfdbcf] hover:bg-[#faf7ee] text-xs font-bold text-[#0d3527] cursor-pointer"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={handleConfirmBatal}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Toast Notification ─────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d3527] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#f0aa3e] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
