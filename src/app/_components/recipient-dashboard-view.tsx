"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Store,
  Calendar,
  User,
  Search,
  Clock,
  MapPin,
  ChevronDown,
  CheckCircle2,
  Bell,
  Heart,
  Leaf,
  ArrowRight,
  X,
  Phone,
  QrCode,
  RefreshCw,
  LogOut,
  Check,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS } from "./auth-context";

export type RecipientTab = "surplus" | "reservasi" | "profil";

export type SurplusCardItem = {
  id: string;
  name: string;
  category: "Roti & Kue" | "Makanan Siap Saji" | "Bahan Segar";
  availableUnits: number;
  pickupDeadline: string;
  providerName: string;
  providerLocation: string;
  providerAddress: string;
  providerPic: string;
  providerPhone: string;
  image: string;
  packagingNote: string;
  storageNote: string;
  allergens: string;
};

export type ActiveReservation = {
  id: string;
  code: string;
  batchId: string;
  foodName: string;
  units: number;
  pickupTime: string;
  pickupDate: string;
  providerName: string;
  providerAddress: string;
  providerPhone: string;
  status: "Menunggu pickup" | "Selesai" | "Dibatalkan";
  createdAt: string;
};

const initialSurplusItems: SurplusCardItem[] = [
  {
    id: "surplus-1",
    name: "Roti tawar",
    category: "Roti & Kue",
    availableUnits: 12,
    pickupDeadline: "18.30",
    providerName: "Dapur Pagi",
    providerLocation: "Jakarta Selatan",
    providerAddress: "Jl. Tebet Barat Dalam Raya No. 42, Tebet, Jakarta Selatan",
    providerPic: "Budi Santoso",
    providerPhone: "0812-3456-7890",
    image: "/assets/surplus/surplus-roti.jpg",
    packagingNote: "Kemasan plastik kedap udara higienis, kondisi sangat segar produksi pagi ini.",
    storageNote: "Simpan pada suhu ruang tertutup, hindari panas matahari langsung.",
    allergens: "Mengandung gandum, ragi, dan susu.",
  },
  {
    id: "surplus-2",
    name: "Nasi kotak ayam",
    category: "Makanan Siap Saji",
    availableUnits: 6,
    pickupDeadline: "17.00",
    providerName: "Dapur Pagi",
    providerLocation: "Jakarta Selatan",
    providerAddress: "Jl. Tebet Barat Dalam Raya No. 42, Tebet, Jakarta Selatan",
    providerPic: "Budi Santoso",
    providerPhone: "0812-3456-7890",
    image: "/assets/surplus/surplus-nasi.jpg",
    packagingNote: "Kotak bento higienis tersegel, lauk ayam bakar, tahu tempe, lalapan segar.",
    storageNote: "Disarankan dikonsumsi sebelum pukul 21.00 atau disimpan dalam chiller.",
    allergens: "Mengandung kedelai dan rempah nusantara.",
  },
  {
    id: "surplus-3",
    name: "Kue bolu",
    category: "Roti & Kue",
    availableUnits: 4,
    pickupDeadline: "19.00",
    providerName: "Dapur Pagi",
    providerLocation: "Jakarta Selatan",
    providerAddress: "Jl. Tebet Barat Dalam Raya No. 42, Tebet, Jakarta Selatan",
    providerPic: "Budi Santoso",
    providerPhone: "0812-3456-7890",
    image: "/assets/surplus/surplus-kue.jpg",
    packagingNote: "Bolu marmer mentega lembut dalam box mika bersih, potongan tebal siap saji.",
    storageNote: "Suhu ruang kering dan sejuk.",
    allergens: "Mengandung telur, mentega, dan susu.",
  },
  {
    id: "surplus-4",
    name: "Paket sayur & buah potong",
    category: "Bahan Segar",
    availableUnits: 8,
    pickupDeadline: "19.30",
    providerName: "Katering Sehat Lestari",
    providerLocation: "Jakarta Pusat",
    providerAddress: "Jl. Kebon Sirih No. 15, Menteng, Jakarta Pusat",
    providerPic: "Dewi Lestari",
    providerPhone: "0813-7788-9900",
    image: "/assets/surplus/surplus-roti.jpg",
    packagingNote: "Cup kedap udara dengan seal sanitasi, buah segar pilihan.",
    storageNote: "Simpan di kulkas / cooler box.",
    allergens: "Tanpa bahan pengawet.",
  },
];

const initialReservations: ActiveReservation[] = [
  {
    id: "res-rec-1",
    code: "BTP-20241019-01",
    batchId: "surplus-1",
    foodName: "Roti tawar",
    units: 4,
    pickupTime: "17.30",
    pickupDate: "Hari ini",
    providerName: "Dapur Pagi",
    providerAddress: "Jl. Tebet Barat Dalam Raya No. 42, Jakarta Selatan",
    providerPhone: "0812-3456-7890",
    status: "Menunggu pickup",
    createdAt: "20 Okt 2026, 14:15",
  },
];

export function RecipientDashboardView({
  onSwitchToDonor,
}: {
  onSwitchToDonor?: () => void;
}) {
  const { user, quickLogin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<RecipientTab>("surplus");

  // Data states
  const [surplusList, setSurplusList] = useState<SurplusCardItem[]>(initialSurplusItems);
  const [reservations, setReservations] = useState<ActiveReservation[]>(initialReservations);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedPickupTime, setSelectedPickupTime] = useState("Semua");
  const [selectedArea, setSelectedArea] = useState("Semua");

  // Filter dropdown state
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Modals
  const [detailModalItem, setDetailModalItem] = useState<SurplusCardItem | null>(null);
  const [reserveUnits, setReserveUnits] = useState(1);
  const [reserveNotes, setReserveNotes] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const [activeReservationModal, setActiveReservationModal] = useState<ActiveReservation | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  // Active reservations count
  const pendingReservations = reservations.filter((r) => r.status === "Menunggu pickup");
  const latestActiveReservation = pendingReservations[0] || null;

  // Filtered surplus list
  const filteredSurplus = useMemo(() => {
    return surplusList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.name.toLowerCase().includes(q);
        const matchProvider = item.providerName.toLowerCase().includes(q);
        const matchLocation = item.providerLocation.toLowerCase().includes(q);
        if (!matchTitle && !matchProvider && !matchLocation) return false;
      }
      // Category
      if (selectedCategory !== "Semua") {
        if (selectedCategory === "Roti & kue" && item.category !== "Roti & Kue") return false;
        if (selectedCategory === "Makanan siap saji" && item.category !== "Makanan Siap Saji") return false;
        if (selectedCategory === "Bahan segar" && item.category !== "Bahan Segar") return false;
      }
      // Pickup Time
      if (selectedPickupTime !== "Semua") {
        if (selectedPickupTime === "Sebelum 17.00" && item.pickupDeadline > "17.00") return false;
        if (selectedPickupTime === "Sebelum 18.30" && item.pickupDeadline > "18.30") return false;
        if (selectedPickupTime === "Sebelum 19.30" && item.pickupDeadline > "19.30") return false;
      }
      // Area
      if (selectedArea !== "Semua") {
        if (!item.providerLocation.toLowerCase().includes(selectedArea.toLowerCase())) return false;
      }
      return true;
    });
  }, [surplusList, searchQuery, selectedCategory, selectedPickupTime, selectedArea]);

  const handleOpenDetail = (item: SurplusCardItem) => {
    setDetailModalItem(item);
    setReserveUnits(1);
    setReserveNotes("");
    setReserveSuccess(false);
  };

  const handleConfirmReservation = () => {
    if (!detailModalItem) return;

    const newRes: ActiveReservation = {
      id: `res-rec-${Date.now()}`,
      code: `BTP-20241019-${Math.floor(10 + Math.random() * 90)}`,
      batchId: detailModalItem.id,
      foodName: detailModalItem.name,
      units: reserveUnits,
      pickupTime: detailModalItem.pickupDeadline,
      pickupDate: "Hari ini",
      providerName: detailModalItem.providerName,
      providerAddress: detailModalItem.providerAddress,
      providerPhone: detailModalItem.providerPhone,
      status: "Menunggu pickup",
      createdAt: "Baru saja",
    };

    // Update reservations
    setReservations((prev) => [newRes, ...prev]);

    // Decrease surplus count
    setSurplusList((prev) =>
      prev.map((s) =>
        s.id === detailModalItem.id
          ? { ...s, availableUnits: Math.max(0, s.availableUnits - reserveUnits) }
          : s
      )
    );

    setReserveSuccess(true);
  };

  const handleCompletePickup = (resId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: "Selesai" } : r))
    );
    if (activeReservationModal && activeReservationModal.id === resId) {
      setActiveReservationModal({ ...activeReservationModal, status: "Selesai" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col font-sans text-[#1c2826]">
      {/* ─── TOP NOTIFICATION / DEMO BAR ─────────────────────────── */}
      <div className="bg-[#11382b] text-[#d6ede2] px-4 py-2 text-xs flex items-center justify-between border-b border-[#1c5542]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">Mode Tampilan:</span>
          <span className="bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/50">
            Penerima / Komunitas Pangan
          </span>
          <span className="hidden md:inline text-white/70">
            • Mockup Surplus Tersedia & Reservasi
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const donor = DEMO_ACCOUNTS.find((a) => a.role === "donor");
              if (donor) quickLogin(donor);
              if (onSwitchToDonor) onSwitchToDonor();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ganti ke Dashboard Donor (Dapur Pagi)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* ─── LEFT SIDEBAR ────────────────────────────────────────── */}
        <aside className="w-full md:w-64 bg-white border-r border-[#e8e4da] flex flex-col justify-between shrink-0">
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-[#f1ede4]">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1c5c43] flex items-center justify-center text-white font-black text-lg shadow-sm">
                  P
                </div>
                <div>
                  <div className="font-extrabold text-lg text-[#0d3527] tracking-tight">
                    PANGANLOOP
                  </div>
                  <div className="text-[10px] text-[#5e6f64] font-medium tracking-wide uppercase">
                    Portal Komunitas
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("surplus")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "surplus"
                    ? "bg-[#eaf4ed] text-[#14532d] font-bold shadow-xs border border-[#cfe6d6]"
                    : "text-[#4b5563] hover:bg-[#f6f5f1] hover:text-[#111827]"
                }`}
              >
                <Store
                  className={`w-4 h-4 ${
                    activeTab === "surplus" ? "text-[#166534]" : "text-[#6b7280]"
                  }`}
                />
                <span>Surplus tersedia</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reservasi")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "reservasi"
                    ? "bg-[#eaf4ed] text-[#14532d] font-bold shadow-xs border border-[#cfe6d6]"
                    : "text-[#4b5563] hover:bg-[#f6f5f1] hover:text-[#111827]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar
                    className={`w-4 h-4 ${
                      activeTab === "reservasi" ? "text-[#166534]" : "text-[#6b7280]"
                    }`}
                  />
                  <span>Reservasi saya</span>
                </div>
                {pendingReservations.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#14532d] text-white">
                    {pendingReservations.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profil")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "profil"
                    ? "bg-[#eaf4ed] text-[#14532d] font-bold shadow-xs border border-[#cfe6d6]"
                    : "text-[#4b5563] hover:bg-[#f6f5f1] hover:text-[#111827]"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    activeTab === "profil" ? "text-[#166534]" : "text-[#6b7280]"
                  }`}
                />
                <span>Profil</span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar Note & Slogan */}
          <div className="p-4 m-3 rounded-2xl bg-[#f5f8f5] border border-[#d6e8dc]">
            <div className="flex items-center gap-2.5 text-[#14532d]">
              <div className="w-7 h-7 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#15803d]">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold leading-snug">
                Pangan baik tak boleh terbuang.
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[#4b6354] leading-relaxed">
              Setiap batch yang Anda reservasi langsung mengurangi limbah makanan di kota kita.
            </p>
          </div>
        </aside>

        {/* ─── MAIN COLUMN ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* TOP BAR / HEADER */}
          <header className="bg-white border-b border-[#e8e4da] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#102d23] tracking-tight">
                Halo, {user?.name || "Komunitas Berbagi Pangan"}
              </h1>
              <p className="text-sm text-[#5a6e63] font-medium flex items-center gap-1.5 mt-0.5">
                <span>Terima kasih sudah menjadi bagian dari solusi.</span>
                <span>💚</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Badge: Organisasi disetujui */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Organisasi disetujui</span>
              </div>

              {/* Notification bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-9 h-9 rounded-full border border-[#ded9cb] flex items-center justify-center text-[#55675c] hover:bg-[#f6f5f1] transition-colors relative cursor-pointer"
                  aria-label="Notifikasi"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600"></span>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e4ded0] p-4 z-30">
                    <div className="flex items-center justify-between pb-2 border-b border-[#f1eee7]">
                      <span className="font-bold text-xs text-[#0d3527]">Notifikasi</span>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-[#f7f5f0] text-xs mt-2 space-y-2">
                      <div className="pt-2">
                        <div className="font-semibold text-emerald-800">
                          Pickup Roti Tawar hari ini
                        </div>
                        <div className="text-[#64748b] text-[11px] mt-0.5">
                          Jadwal pickup sebelum 17.30 di Dapur Pagi. Bawa kode BTP-20241019-01.
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="font-semibold text-[#0d3527]">
                          Surplus baru ditambahkan
                        </div>
                        <div className="text-[#64748b] text-[11px] mt-0.5">
                          Dapur Pagi baru saja merilis batch Kue Bolu (4 unit).
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ded9cb] bg-white hover:bg-[#f8f6f0] transition-colors cursor-pointer text-xs font-semibold text-[#102d23]"
                >
                  <div className="w-6 h-6 rounded-full bg-[#1c5c43] text-white flex items-center justify-center font-bold text-[10px]">
                    KP
                  </div>
                  <span className="max-w-[120px] truncate sm:max-w-none">
                    {user?.name || "Komunitas Berbagi Pangan"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6c7d73]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e4ded0] p-3 z-30">
                    <div className="px-2 py-1.5 border-b border-[#f1eee7] mb-2">
                      <div className="font-bold text-xs text-[#0d3527]">{user?.name}</div>
                      <div className="text-[11px] text-[#6b7280]">{user?.email}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Peran: Komunitas Penerima (Terverifikasi)
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#8c9c91]">
                        Ganti Akun Demo
                      </div>
                      {DEMO_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            quickLogin(acc);
                            setUserMenuOpen(false);
                            if (acc.role === "donor" && onSwitchToDonor) {
                              onSwitchToDonor();
                            }
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                            user?.email === acc.email
                              ? "bg-emerald-50 text-emerald-900 font-bold"
                              : "text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          <div>
                            <div>{acc.name}</div>
                            <div className="text-[10px] text-stone-400">
                              {acc.role === "donor" ? "Donor (Penyedia)" : "Penerima (Komunitas)"}
                            </div>
                          </div>
                          {user?.email === acc.email && (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      ))}

                      <div className="pt-2 border-t border-[#f1eee7] mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
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
          </header>

          {/* CONTENT AREA: TAB 1 (SURPLUS TERSEDIA) */}
          {activeTab === "surplus" && (
            <div className="p-6 max-w-7xl w-full mx-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Center Content: Search, Filter, and Card List (Col 8) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Section Title */}
                  <div>
                    <h2 className="text-2xl font-black text-[#102d23] tracking-tight">
                      Surplus tersedia
                    </h2>
                    <p className="text-sm text-[#5b7064] font-medium mt-0.5">
                      Pilih sesuai kapasitas pickup organisasi.
                    </p>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#e4ded0] shadow-xs space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#8a988f] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari makanan, lokasi, atau penyedia..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f9f8f5] border border-[#e3ded2] text-sm text-[#102d23] placeholder-[#909e95] focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills / Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {/* Kategori Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryOpen(!categoryOpen);
                            setPickupTimeOpen(false);
                            setAreaOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            selectedCategory !== "Semua"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-[#fbfaf8] border-[#dfdbcf] text-[#42544a] hover:bg-stone-100"
                          }`}
                        >
                          <span>
                            {selectedCategory === "Semua" ? "Kategori" : selectedCategory}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                        </button>
                        {categoryOpen && (
                          <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#e4ded0] py-1.5 z-20">
                            {["Semua", "Roti & kue", "Makanan siap saji", "Bahan segar"].map(
                              (cat) => (
                                <button
                                  key={cat}
                                  onClick={() => {
                                    setSelectedCategory(cat);
                                    setCategoryOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 hover:bg-emerald-50 transition-colors ${
                                    selectedCategory === cat
                                      ? "text-emerald-800 font-bold bg-emerald-50/50"
                                      : "text-stone-700"
                                  }`}
                                >
                                  {cat}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Waktu Pickup Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setPickupTimeOpen(!pickupTimeOpen);
                            setCategoryOpen(false);
                            setAreaOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            selectedPickupTime !== "Semua"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-[#fbfaf8] border-[#dfdbcf] text-[#42544a] hover:bg-stone-100"
                          }`}
                        >
                          <span>
                            {selectedPickupTime === "Semua"
                              ? "Waktu pickup"
                              : selectedPickupTime}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                        </button>
                        {pickupTimeOpen && (
                          <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#e4ded0] py-1.5 z-20">
                            {[
                              "Semua",
                              "Sebelum 17.00",
                              "Sebelum 18.30",
                              "Sebelum 19.30",
                            ].map((w) => (
                              <button
                                key={w}
                                onClick={() => {
                                  setSelectedPickupTime(w);
                                  setPickupTimeOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-emerald-50 transition-colors ${
                                  selectedPickupTime === w
                                    ? "text-emerald-800 font-bold bg-emerald-50/50"
                                    : "text-stone-700"
                                }`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Area Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setAreaOpen(!areaOpen);
                            setCategoryOpen(false);
                            setPickupTimeOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            selectedArea !== "Semua"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-[#fbfaf8] border-[#dfdbcf] text-[#42544a] hover:bg-stone-100"
                          }`}
                        >
                          <span>{selectedArea === "Semua" ? "Area" : selectedArea}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                        </button>
                        {areaOpen && (
                          <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#e4ded0] py-1.5 z-20">
                            {[
                              "Semua",
                              "Jakarta Selatan",
                              "Jakarta Pusat",
                              "Jakarta Timur",
                            ].map((area) => (
                              <button
                                key={area}
                                onClick={() => {
                                  setSelectedArea(area);
                                  setAreaOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-emerald-50 transition-colors ${
                                  selectedArea === area
                                    ? "text-emerald-800 font-bold bg-emerald-50/50"
                                    : "text-stone-700"
                                }`}
                              >
                                {area}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {(selectedCategory !== "Semua" ||
                        selectedPickupTime !== "Semua" ||
                        selectedArea !== "Semua" ||
                        searchQuery) && (
                        <button
                          onClick={() => {
                            setSelectedCategory("Semua");
                            setSelectedPickupTime("Semua");
                            setSelectedArea("Semua");
                            setSearchQuery("");
                          }}
                          className="text-stone-500 hover:text-stone-800 font-medium underline pl-2"
                        >
                          Reset filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Surplus Cards List */}
                  {filteredSurplus.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#e4ded0] p-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400 mb-3">
                        <Store className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-stone-800">Tidak ada surplus yang cocok</h3>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        Coba ubah kata kunci pencarian atau reset filter kategori/waktu pickup.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredSurplus.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-[#e4ded0] hover:border-[#ccd7ce] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs hover:shadow-md"
                        >
                          {/* Image & Info */}
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-[#eee9dd] bg-stone-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-extrabold text-[#102d23] leading-tight">
                                  {item.name}
                                </h3>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e3f4e8] text-[#14532d] border border-[#c3e6cd]">
                                  {item.availableUnits} tersedia
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#52665a]">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-[#166534]" />
                                  <span>Pickup sebelum {item.pickupDeadline}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Store className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{item.providerName}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f4efe3] text-[#5c4a2a] border border-[#e7decb]">
                                  {item.category}
                                </span>
                                <span className="text-[11px] text-[#78887e]">
                                  • {item.providerLocation}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f4023] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Lihat detail</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Widgets (Col 4) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Widget 1: Reservasi aktif */}
                  <div className="bg-white rounded-2xl border border-[#e4ded0] p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#f1ede4]">
                      <h3 className="font-extrabold text-base text-[#102d23] flex items-center gap-2">
                        <span>Reservasi aktif</span>
                      </h3>
                      <span className="w-6 h-6 rounded-full bg-[#11382b] text-white font-bold text-xs flex items-center justify-center">
                        {pendingReservations.length}
                      </span>
                    </div>

                    <div className="pt-4">
                      {latestActiveReservation ? (
                        <div className="space-y-3.5">
                          <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[#e8e4da] space-y-2">
                            <div className="font-extrabold text-[#102d23] text-base leading-tight">
                              {latestActiveReservation.foodName}
                            </div>
                            <div className="text-xs text-[#52665a] font-medium leading-relaxed">
                              {latestActiveReservation.units} unit • {latestActiveReservation.pickupDate}{" "}
                              {latestActiveReservation.pickupTime} •{" "}
                              {latestActiveReservation.providerName}
                            </div>
                            <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Kode: {latestActiveReservation.code}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveReservationModal(latestActiveReservation)}
                              className="w-full mt-2 py-2.5 rounded-xl border border-[#14532d] text-[#14532d] hover:bg-[#14532d] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Buka reservasi</span>
                            </button>
                          </div>

                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => setActiveTab("reservasi")}
                              className="text-xs font-bold text-[#14532d] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Lihat semua</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-stone-500 text-xs">
                          <p>Belum ada reservasi aktif yang berjalan saat ini.</p>
                          <p className="mt-1 text-stone-400">
                            Pilih makanan dari daftar surplus di sebelah kiri.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Widget 2: Bersama kurangi food waste */}
                  <div className="bg-gradient-to-br from-[#eaf4ed] to-[#f4faf5] rounded-2xl border border-[#cde4d4] p-5 shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center mb-3.5 shadow-sm">
                      <Heart className="w-5 h-5 fill-white/20" />
                    </div>

                    <h3 className="font-extrabold text-base text-[#14532d] leading-tight">
                      Bersama kurangi food waste
                    </h3>

                    <p className="text-xs text-[#446551] leading-relaxed mt-2 font-medium">
                      Setiap surplus yang tersalurkan, membawa manfaat lebih luas bagi komunitas.
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#cde4d4]/80 grid grid-cols-2 gap-3 text-center">
                      <div className="p-2.5 rounded-xl bg-white/70 border border-[#bfe0c9]">
                        <div className="font-extrabold text-sm text-[#14532d]">48 Porsi</div>
                        <div className="text-[10px] text-[#557662]">Pangan Terselamatkan</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/70 border border-[#bfe0c9]">
                        <div className="font-extrabold text-sm text-[#14532d]">24 kg</div>
                        <div className="text-[10px] text-[#557662]">Jejak CO2 Tercegah</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT AREA: TAB 2 (RESERVASI SAYA) */}
          {activeTab === "reservasi" && (
            <div className="p-6 max-w-7xl w-full mx-auto flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-[#102d23] tracking-tight">
                    Reservasi saya
                  </h2>
                  <p className="text-sm text-[#5b7064] font-medium mt-0.5">
                    Daftar makanan yang sudah direservasi dan siap di-pickup.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("surplus")}
                  className="px-4 py-2 rounded-xl bg-[#14532d] text-white font-bold text-xs hover:bg-[#0f4023] transition-colors self-start"
                >
                  + Tambah Reservasi Surplus
                </button>
              </div>

              {reservations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#e4ded0] p-12 text-center">
                  <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-bold text-stone-800">Belum ada riwayat reservasi</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Silakan buka menu Surplus Tersedia untuk melakukan reservasi makanan.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#e4ded0] overflow-hidden shadow-xs">
                  <div className="divide-y divide-[#f1eee7]">
                    {reservations.map((res) => (
                      <div
                        key={res.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-extrabold text-base text-[#102d23]">
                              {res.foodName}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                res.status === "Menunggu pickup"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : res.status === "Selesai"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : "bg-stone-100 text-stone-700"
                              }`}
                            >
                              {res.status}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {res.code}
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                            <span>
                              <strong>Jumlah:</strong> {res.units} unit
                            </span>
                            <span>
                              <strong>Batas Pickup:</strong> {res.pickupDate}, pukul {res.pickupTime}
                            </span>
                            <span>
                              <strong>Penyedia:</strong> {res.providerName}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-400">
                            Lokasi: {res.providerAddress}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveReservationModal(res)}
                            className="px-4 py-2 rounded-xl bg-[#14532d] text-white hover:bg-[#0f4023] font-bold text-xs transition-colors"
                          >
                            Buka Tiket Pickup
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTENT AREA: TAB 3 (PROFIL ORGANISASI) */}
          {activeTab === "profil" && (
            <div className="p-6 max-w-4xl w-full mx-auto flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#102d23] tracking-tight">
                  Profil Organisasi
                </h2>
                <p className="text-sm text-[#5b7064] font-medium mt-0.5">
                  Informasi penerima terverifikasi di jaringan PANGANLOOP.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#e4ded0] p-6 shadow-xs space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-[#f1eee7]">
                  <div className="w-16 h-16 rounded-2xl bg-[#14532d] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                    KP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-[#102d23]">
                        {user?.name || "Komunitas Berbagi Pangan"}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Terverifikasi
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Kategori: Organisasi Food Rescue Komunitas • ID: ORG-REC-2024
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#fbfaf8] border border-[#e8e4da] space-y-1">
                    <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                      Penanggung Jawab (PIC)
                    </span>
                    <div className="font-bold text-sm text-[#102d23]">{user?.pic || "Ahmad Fauzi"}</div>
                    <div className="text-stone-500">Nomor Telepon: {user?.phone || "0812-9988-7711"}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#fbfaf8] border border-[#e8e4da] space-y-1">
                    <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                      Alamat Posko / Titik Distribusi
                    </span>
                    <div className="font-bold text-sm text-[#102d23]">Posko Utama Jakarta Pusat</div>
                    <div className="text-stone-500">{user?.address || "Jl. Kramat Raya No. 12, Senen, Jakarta Pusat"}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#fbfaf8] border border-[#e8e4da] space-y-1">
                    <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                      Kapasitas Armada Pickup
                    </span>
                    <div className="font-bold text-sm text-[#102d23]">Motor Box + Cooler Box (± 50 porsi/trip)</div>
                    <div className="text-stone-500">Standar higienitas termal terkalibrasi</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#fbfaf8] border border-[#e8e4da] space-y-1">
                    <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                      Target Penyaluran
                    </span>
                    <div className="font-bold text-sm text-[#102d23]">Panti Asuhan, Dhuafa & Rumah Singgah</div>
                    <div className="text-stone-500">Dokumentasi distribusi terbuka untuk audit donor</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── MODAL 1: DETAIL & BUAT RESERVASI ───────────────────────── */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#ded9cb] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="relative h-44 w-full bg-stone-100">
              <Image
                src={detailModalItem.image}
                alt={detailModalItem.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-[#11382b]/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
                {detailModalItem.category}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {!reserveSuccess ? (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-[#102d23]">
                        {detailModalItem.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e3f4e8] text-[#14532d] border border-[#c3e6cd]">
                        {detailModalItem.availableUnits} unit tersedia
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-[#52665a]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#14532d]">
                        <Clock className="w-4 h-4" />
                        <span>Pickup paling lambat: Hari ini sebelum {detailModalItem.pickupDeadline} WIB</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-stone-400" />
                        <span>Penyedia: <strong>{detailModalItem.providerName}</strong> ({detailModalItem.providerLocation})</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-stone-500">
                        <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        <span>{detailModalItem.providerAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Sanitasi & Alergen */}
                  <div className="p-3.5 rounded-2xl bg-[#f9f8f5] border border-[#e4ded0] space-y-1.5 text-xs">
                    <div>
                      <span className="font-bold text-[#102d23]">Kondisi Kemasan: </span>
                      <span className="text-[#52665a]">{detailModalItem.packagingNote}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#102d23]">Penyimpanan: </span>
                      <span className="text-[#52665a]">{detailModalItem.storageNote}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#102d23]">Alergen: </span>
                      <span className="text-[#845323]">{detailModalItem.allergens}</span>
                    </div>
                  </div>

                  {/* Unit Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#102d23]">
                      Jumlah yang ingin direservasi:
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#ded9cb] rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setReserveUnits((u) => Math.max(1, u - 1))}
                          className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 font-black text-sm text-[#102d23]">
                          {reserveUnits}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setReserveUnits((u) =>
                              Math.min(detailModalItem.availableUnits, u + 1)
                            )
                          }
                          className="px-3 py-2 text-stone-600 hover:bg-stone-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-stone-500">
                        (Maksimal {detailModalItem.availableUnits} unit untuk batch ini)
                      </span>
                    </div>
                  </div>

                  {/* Catatan Penjemputan */}
                  <div className="space-y-1 text-xs">
                    <label className="block font-bold text-[#102d23]">
                      Catatan penjemputan (opsional):
                    </label>
                    <input
                      type="text"
                      value={reserveNotes}
                      onChange={(e) => setReserveNotes(e.target.value)}
                      placeholder="Contoh: Diambil relawan pukul 16.45 membawa cooler box"
                      className="w-full px-3 py-2 rounded-xl border border-[#ded9cb] bg-white text-xs text-[#102d23] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDetailModalItem(null)}
                      className="flex-1 py-3 rounded-xl border border-[#ded9cb] text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReservation}
                      className="flex-2 py-3 rounded-xl bg-[#14532d] hover:bg-[#0f4023] text-white font-extrabold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Konfirmasi Reservasi</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Success Confirmation State */
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#102d23]">
                      Reservasi Berhasil Dibuat!
                    </h4>
                    <p className="text-xs text-[#52665a] mt-1.5 max-w-sm mx-auto">
                      Sebanyak <strong>{reserveUnits} unit {detailModalItem.name}</strong> telah dicadangkan untuk {user?.name}. Silakan lakukan pickup sebelum jam yang ditentukan.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#eaf4ed] border border-[#c7e3cf] text-xs text-[#14532d] font-semibold">
                    Simpan kode pickup dan tunjukkan kepada staf Dapur Pagi saat pengambilan.
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDetailModalItem(null)}
                      className="flex-1 py-3 rounded-xl bg-[#14532d] text-white font-bold text-xs hover:bg-[#0f4023]"
                    >
                      Kembali ke Katalog
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailModalItem(null);
                        setActiveTab("reservasi");
                      }}
                      className="flex-1 py-3 rounded-xl border border-[#14532d] text-[#14532d] font-bold text-xs hover:bg-emerald-50"
                    >
                      Buka Reservasi Saya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: TIKET RESERVASI DIGITAL ──────────────────────── */}
      {activeReservationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#ded9cb] animate-in fade-in zoom-in-95 duration-150">
            {/* Ticket Header */}
            <div className="bg-[#11382b] text-white p-5 text-center relative">
              <button
                type="button"
                onClick={() => setActiveReservationModal(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold">
                Tiket Pengambilan Pangan
              </div>
              <div className="font-mono text-2xl font-black mt-1 tracking-wider text-white">
                {activeReservationModal.code}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pickup: {activeReservationModal.pickupDate}, {activeReservationModal.pickupTime} WIB</span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4">
              {/* QR / Barcode mockup */}
              <div className="p-4 rounded-2xl bg-[#f8f6f0] border border-[#e8e4da] text-center">
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-[#ded9cb] flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-[#11382b]" />
                </div>
                <div className="text-[11px] text-stone-500 mt-2 font-mono">
                  Scan untuk verifikasi serah terima di lokasi
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#f1eee7]">
                  <span className="text-stone-500">Item:</span>
                  <span className="font-bold text-[#102d23]">
                    {activeReservationModal.foodName} ({activeReservationModal.units} unit)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1eee7]">
                  <span className="text-stone-500">Penyedia:</span>
                  <span className="font-bold text-[#102d23]">
                    {activeReservationModal.providerName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1eee7]">
                  <span className="text-stone-500">Alamat:</span>
                  <span className="font-medium text-[#102d23] text-right max-w-[220px]">
                    {activeReservationModal.providerAddress}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1eee7]">
                  <span className="text-stone-500">Penerima:</span>
                  <span className="font-bold text-emerald-800">
                    {user?.name || "Komunitas Berbagi Pangan"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Status:</span>
                  <span
                    className={`font-bold ${
                      activeReservationModal.status === "Selesai"
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {activeReservationModal.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {activeReservationModal.status === "Menunggu pickup" ? (
                  <button
                    type="button"
                    onClick={() => handleCompletePickup(activeReservationModal.id)}
                    className="w-full py-3 rounded-xl bg-[#14532d] hover:bg-[#0f4023] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Makanan Sudah Diambil</span>
                  </button>
                ) : (
                  <div className="py-2.5 text-center text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                    ✓ Pickup Berhasil Diselesaikan
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/62${activeReservationModal.providerPhone.replace(/[^0-9]/g, "").slice(1)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl border border-[#ded9cb] hover:bg-stone-50 text-stone-700 font-bold text-xs text-center flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Hubungi Donor</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveReservationModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-[#ded9cb] hover:bg-stone-50 text-stone-700 font-bold text-xs text-center"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
