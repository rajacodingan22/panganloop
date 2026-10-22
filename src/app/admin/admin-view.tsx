"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Home,
  List,
  BarChart3,
  User as UserIcon,
  Store,
  MessageSquare,
  Settings,
  Bell,
  ChevronDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Info,
  MinusCircle,
  Users,
  Leaf,
  Check,
  LogOut,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS, UserProfile } from "../_components/auth-context";

export type AdminMenuKey =
  | "dasbor"
  | "listing"
  | "organisasi"
  | "laporan"
  | "pengguna"
  | "mitra"
  | "pesan"
  | "pengaturan";

export interface ModerationListing {
  id: string;
  code: string;
  name: string;
  provider: string;
  status: "Dilaporkan" | "Aktif" | "Dinonaktifkan";
  pickupTime: string;
  image: string;
  reportCount?: number;
}

export interface ModerationHistory {
  id: string;
  time: string;
  event: string;
  actor: string;
  listingName: string;
  listingCode: string;
  reason: string;
}

export interface OrganizationItem {
  id: string;
  code: string;
  name: string;
  type: string;
  categoryDesc: string;
  city: string;
  submissionDate: string;
  description: string;
  email: string;
  phone: string;
  pickupCapacity: string;
  status: "Pending" | "Disetujui" | "Ditolak";
  iconType: "users" | "heart" | "leaf" | "building";
}

const initialListings: ModerationListing[] = [
  {
    id: "list-1",
    code: "#LS001",
    name: "Nasi kotak ayam",
    provider: "Kantin Sehat",
    status: "Dilaporkan",
    pickupTime: "17.00",
    image: "/assets/surplus/surplus-nasi.jpg",
    reportCount: 3,
  },
  {
    id: "list-2",
    code: "#LS002",
    name: "Roti tawar",
    provider: "Dapur Pagi",
    status: "Aktif",
    pickupTime: "-",
    image: "/assets/surplus/surplus-roti.jpg",
  },
];

const initialHistory: ModerationHistory[] = [
  {
    id: "hist-1",
    time: "19 Okt 2026 15.42",
    event: "Listing dinonaktifkan",
    actor: "Admin",
    listingName: "Nasi kotak ayam",
    listingCode: "#LS001",
    reason: "Melanggar pedoman konten",
  },
];

const initialOrganizations: OrganizationItem[] = [
  {
    id: "org-1",
    code: "ID ORG-2026-0004",
    name: "Komunitas Berbagi Pangan",
    type: "Komunitas",
    categoryDesc: "Komunitas berbagi makanan",
    city: "Jakarta Selatan",
    submissionDate: "19 Oktober 2026",
    description:
      "Komunitas yang bergerak dalam distribusi pangan berlebih untuk masyarakat sekitar, dengan fokus pada pengurangan food waste dan dukungan bagi kelompok rentan di Jakarta Selatan.",
    email: "komunitas.berbagi@***.org",
    phone: "0812-9988-7711",
    pickupCapacity: "hingga 20 unit",
    status: "Pending",
    iconType: "users",
  },
  {
    id: "org-2",
    code: "ID ORG-2026-0003",
    name: "Yayasan Setara Hidup",
    type: "Yayasan Sosial",
    categoryDesc: "Panti asuhan & lansia dhuafa",
    city: "Bandung",
    submissionDate: "17 Oktober 2026",
    description:
      "Lembaga nirlaba yang mengelola dapur nutrisi bagi 40 anak asuh dan lansia prasejahtera di area Bandung Raya.",
    email: "setara.hidup@***.org",
    phone: "0813-2233-4455",
    pickupCapacity: "hingga 35 unit",
    status: "Pending",
    iconType: "heart",
  },
];

export function AdminView() {
  const { user, quickLogin, logout } = useAuth();

  // Active Menu: Defaults to "listing" as in the user's latest screenshot
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>("listing");

  // Sub-tabs in listing view: "daftar" | "audit"
  const [subTab, setSubTab] = useState<"daftar" | "audit">("audit");

  // Listings data
  const [listings, setListings] = useState<ModerationListing[]>(initialListings);
  const [history, setHistory] = useState<ModerationHistory[]>(initialHistory);

  // Selected listings for mass actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter dropdown states
  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [reportFilter, setReportFilter] = useState("Ada laporan");
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("Tanggal");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // Nonaktifkan Flyout Panel State
  const [flyoutOpen, setFlyoutOpen] = useState(true); // Open by default matching the screenshot
  const [flyoutItem, setFlyoutItem] = useState<ModerationListing>(initialListings[0]);
  const [deactivateReason, setDeactivateReason] = useState("");

  // Organization module states
  const [organizations] = useState<OrganizationItem[]>(initialOrganizations);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("org-1");

  // Notifications & User Menu
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === listings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listings.map((l) => l.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeactivatePanel = (item: ModerationListing) => {
    setFlyoutItem(item);
    setDeactivateReason("");
    setFlyoutOpen(true);
  };

  const handleConfirmDeactivation = () => {
    if (!deactivateReason.trim()) {
      alert("Harap tuliskan alasan wajib sebelum menonaktifkan listing.");
      return;
    }

    // Update listing status
    setListings((prev) =>
      prev.map((l) => (l.id === flyoutItem.id ? { ...l, status: "Dinonaktifkan" } : l))
    );

    // Add entry to history
    const newEntry: ModerationHistory = {
      id: `hist-${Date.now()}`,
      time: "22 Okt 2026 15.42",
      event: "Listing dinonaktifkan",
      actor: "Admin",
      listingName: flyoutItem.name,
      listingCode: flyoutItem.code,
      reason: deactivateReason,
    };
    setHistory((prev) => [newEntry, ...prev]);

    setFlyoutOpen(false);
    showToast(`Listing "${flyoutItem.name}" berhasil dinonaktifkan.`);
  };

  const handleExportLog = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Waktu,Peristiwa,Pelaku,Listing,Alasan"]
        .concat(
          history.map(
            (h) => `"${h.time}","${h.event}","${h.actor}","${h.listingName} (${h.listingCode})","${h.reason}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `riwayat-moderasi-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Riwayat moderasi berhasil diekspor (.csv)");
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#0d3527] font-sans antialiased flex flex-col md:flex-row selection:bg-[#f0aa3e]/30">
      {/* ── LEFT SIDEBAR (Light Theme Matching Screenshot) ─────────── */}
      <aside className="w-full md:w-60 lg:w-64 bg-[#f8f9f6] text-[#0d3527] flex flex-col justify-between shrink-0 border-r border-[#e5e7df] shadow-xs">
        <div>
          {/* Logo Header */}
          <div className="p-6 pb-6 border-b border-[#ecefe6]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-[#1c5c43] flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
                <Leaf className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="font-black text-base text-[#0d3527] tracking-wider leading-none">
                  PANGANLOOP
                </div>
                <div className="text-[10px] text-[#5e6f64] font-medium tracking-tight mt-1 leading-tight">
                  Pangan berputar, manfaat berlanjut
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Menu (Dasbor, Listing, Laporan, Pengguna, Mitra, Pesan, Pengaturan) */}
          <nav className="p-3.5 space-y-1" aria-label="Menu navigasi admin">
            {/* 1. Dasbor */}
            <button
              type="button"
              onClick={() => setActiveMenu("dasbor")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "dasbor"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <Home className="w-4 h-4 stroke-[2]" />
              <span>Dasbor</span>
            </button>

            {/* 2. Listing (Active in user screenshot) */}
            <button
              type="button"
              onClick={() => setActiveMenu("listing")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "listing"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <List className="w-4 h-4 stroke-[2.2]" />
              <span>Listing</span>
            </button>

            {/* Organisasi (Direct access from previous turn) */}
            <button
              type="button"
              onClick={() => setActiveMenu("organisasi")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "organisasi"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <Users className="w-4 h-4 stroke-[2]" />
              <span>Organisasi</span>
            </button>

            {/* 3. Laporan */}
            <button
              type="button"
              onClick={() => setActiveMenu("laporan")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "laporan"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <BarChart3 className="w-4 h-4 stroke-[2]" />
              <span>Laporan</span>
            </button>

            {/* 4. Pengguna */}
            <button
              type="button"
              onClick={() => setActiveMenu("pengguna")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "pengguna"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <UserIcon className="w-4 h-4 stroke-[2]" />
              <span>Pengguna</span>
            </button>

            {/* 5. Mitra */}
            <button
              type="button"
              onClick={() => setActiveMenu("mitra")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "mitra"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <Store className="w-4 h-4 stroke-[2]" />
              <span>Mitra</span>
            </button>

            {/* 6. Pesan */}
            <button
              type="button"
              onClick={() => setActiveMenu("pesan")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "pesan"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <MessageSquare className="w-4 h-4 stroke-[2]" />
              <span>Pesan</span>
            </button>

            {/* 7. Pengaturan */}
            <button
              type="button"
              onClick={() => setActiveMenu("pengaturan")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "pengaturan"
                  ? "bg-[#e2ebe3] text-[#133e2b] font-bold shadow-2xs"
                  : "text-[#5e6f64] hover:bg-[#edf0e9] hover:text-[#0d3527]"
              }`}
            >
              <Settings className="w-4 h-4 stroke-[2]" />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-[#ecefe6] flex items-center gap-3 text-xs text-[#5e6f64]">
          <Leaf className="w-5 h-5 text-[#1c5c43] shrink-0" />
          <span className="leading-snug text-[11px] font-medium">
            Lebih sedikit pangan terbuang, lebih banyak kebaikan.
          </span>
        </div>
      </aside>

      {/* ── MAIN CONTENT VIEW ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TOP BAR / USER & NOTIFICATIONS */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#ece7dc] px-6 sm:px-8 py-3 flex items-center justify-end gap-3 sticky top-0 z-30">
          {/* Bell Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-9 h-9 rounded-full border border-[#dfdbcf] bg-white hover:bg-[#faf7ee] flex items-center justify-center text-[#526359] hover:text-[#0d3527] transition-colors cursor-pointer relative"
              aria-label="Lihat notifikasi"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e4ddcc] p-4 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-[#f0ede4]">
                  <span className="font-bold text-xs text-[#0d3527]">
                    Notifikasi Admin
                  </span>
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
                    <div className="font-bold text-rose-700">
                      Listing #LS001 Dilaporkan
                    </div>
                    <div className="text-[#738278] text-[11px] mt-0.5">
                      Nasi kotak ayam dari Kantin Sehat dilaporkan oleh pengguna.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill: [A] Admin Super admin v */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#dfdbcf] bg-white hover:bg-[#faf7ee] transition-colors cursor-pointer text-xs font-semibold text-[#0d3527]"
            >
              <div className="w-7 h-7 rounded-full bg-[#c8dcce] text-[#133e2b] flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-[#0d3527] leading-tight">Admin</div>
                <div className="text-[10px] text-[#738278] leading-none">Super admin</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#738278]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e4ddcc] p-3 z-40 text-left animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-2 border-b border-[#f0ede4] mb-2">
                  <div className="font-bold text-xs text-[#0d3527]">
                    {user?.name || "Admin Platform"}
                  </div>
                  <div className="text-[11px] text-[#738278]">
                    {user?.email || "admin@panganloop.id"}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold bg-[#e8f5ec] px-2 py-0.5 rounded-full inline-block mt-1.5">
                    Peran: Super Admin
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
                          {acc.role === "donor"
                            ? "Donor"
                            : acc.role === "recipient"
                            ? "Penerima"
                            : "Admin"}
                        </div>
                      </div>
                      {user?.email === acc.email && (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                    </button>
                  ))}

                  <div className="pt-2 border-t border-[#f0ede4] mt-2 space-y-1">
                    <Link
                      href="/dashboard"
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#faf7ee] font-medium flex items-center gap-2 text-xs text-[#0d3527]"
                    >
                      <Store className="w-3.5 h-3.5 text-[#1c5c43]" />
                      <span>Buka Dashboard Donor / Komunitas</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
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
        </header>

        {/* ── VIEW 1: MODERASI LISTING (EXACT MATCH TO USER SCREENSHOT) ── */}
        {activeMenu === "listing" && (
          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#738278]">
              <span className="text-[#55695e]">Listing</span>
              <span>&gt;</span>
              <span className="text-[#0d3527] font-semibold">Audit log</span>
            </div>

            {/* Page Title & Subtitle */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d3527] tracking-tight">
                Moderasi listing
              </h1>
              <p className="text-xs sm:text-sm text-[#526359] mt-1 font-normal">
                Tinjau laporan dan nonaktifkan listing dengan alasan.
              </p>
            </div>

            {/* Filter Dropdowns: [Semua status v] [Ada laporan v] [Calendar Tanggal v] */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter 1: Status */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#dfdbcf] text-xs sm:text-sm font-medium text-[#0d3527] flex items-center gap-2 hover:bg-[#faf7ee] cursor-pointer"
                >
                  <span>{statusFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#738278]" />
                </button>
                {statusDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1 z-30 text-xs">
                    {["Semua status", "Dilaporkan", "Aktif", "Dinonaktifkan"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setStatusFilter(st);
                          setStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-[#e8f5ec] ${
                          statusFilter === st ? "font-bold text-[#1c5c43] bg-[#e8f5ec]" : ""
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 2: Ada laporan */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#dfdbcf] text-xs sm:text-sm font-medium text-[#0d3527] flex items-center gap-2 hover:bg-[#faf7ee] cursor-pointer"
                >
                  <span>{reportFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#738278]" />
                </button>
                {reportDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1 z-30 text-xs">
                    {["Ada laporan", "Semua listing", "Tanpa laporan"].map((rf) => (
                      <button
                        key={rf}
                        type="button"
                        onClick={() => {
                          setReportFilter(rf);
                          setReportDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-[#e8f5ec] ${
                          reportFilter === rf ? "font-bold text-[#1c5c43] bg-[#e8f5ec]" : ""
                        }`}
                      >
                        {rf}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 3: Tanggal */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#dfdbcf] text-xs sm:text-sm font-medium text-[#0d3527] flex items-center gap-2 hover:bg-[#faf7ee] cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#738278]" />
                  <span>{dateFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#738278]" />
                </button>
                {dateDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1 z-30 text-xs">
                    {["Tanggal", "Hari ini (22 Okt)", "Minggu ini", "Bulan ini"].map((df) => (
                      <button
                        key={df}
                        type="button"
                        onClick={() => {
                          setDateFilter(df);
                          setDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-[#e8f5ec] ${
                          dateFilter === df ? "font-bold text-[#1c5c43] bg-[#e8f5ec]" : ""
                        }`}
                      >
                        {df}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── MAIN LISTING TABLE ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#e4ddcc] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#f0ede4] text-xs font-semibold text-[#738278]">
                      <th className="py-4 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === listings.length}
                          onChange={toggleSelectAll}
                          className="rounded border-[#dfdbcf] accent-[#1c5c43] cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-6 font-semibold">Nama listing</th>
                      <th className="py-4 px-6 font-semibold">Penyedia</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                      <th className="py-4 px-6 font-semibold">Batas pengambilan</th>
                      <th className="py-4 px-6 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2ede4]">
                    {listings.map((item) => {
                      const isSelected = selectedIds.includes(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-[#faf9f4] transition-colors ${
                            isSelected ? "bg-[#f4f8f5]" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(item.id)}
                              className="rounded border-[#dfdbcf] accent-[#1c5c43] cursor-pointer"
                            />
                          </td>

                          {/* Nama Listing + Thumbnail + Code */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#eee9dd]">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-[#0d3527] leading-snug">
                                  {item.name}
                                </div>
                                <div className="text-xs text-[#738278] mt-0.5">
                                  ID {item.code}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Penyedia */}
                          <td className="py-4 px-6 font-medium text-[#0d3527]">
                            {item.provider}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            {item.status === "Dilaporkan" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#dc2626]">
                                <AlertCircle className="w-3.5 h-3.5 fill-[#dc2626] text-white" />
                                <span>Dilaporkan</span>
                              </span>
                            )}
                            {item.status === "Aktif" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f5ec] text-[#1c6b4f]">
                                <CheckCircle2 className="w-3.5 h-3.5 fill-[#1c6b4f] text-white" />
                                <span>Aktif</span>
                              </span>
                            )}
                            {item.status === "Dinonaktifkan" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
                                <MinusCircle className="w-3.5 h-3.5 text-stone-500" />
                                <span>Dinonaktifkan</span>
                              </span>
                            )}
                          </td>

                          {/* Batas Pengambilan */}
                          <td className="py-4 px-6 text-[#526359] font-medium">
                            {item.pickupTime}
                          </td>

                          {/* Aksi Button + 3 Dots */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {item.status === "Dilaporkan" ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeactivatePanel(item)}
                                  className="px-5 py-2 rounded-xl bg-[#1c4e38] hover:bg-[#143c2b] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                                >
                                  Tinjau
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeactivatePanel(item)}
                                  className="px-5 py-2 rounded-xl border border-[#dfdbcf] bg-white hover:bg-[#faf7ee] text-[#0d3527] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                >
                                  Buka
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => showToast(`Menu opsi untuk listing ${item.code}`)}
                                className="p-1.5 text-[#8a988f] hover:text-[#0d3527] rounded-lg hover:bg-[#faf7ee] cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer: Menampilkan 1-2 dari 2 listing + Pagination */}
              <div className="px-6 py-4 border-t border-[#f0ede4] flex items-center justify-between text-xs text-[#738278]">
                <p>Menampilkan 1–{listings.length} dari {listings.length} listing</p>

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
                    className="w-8 h-8 rounded-lg bg-[#e2ebe3] text-[#133e2b] font-bold flex items-center justify-center text-xs"
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

            {/* ── TABS: Daftar listing | Audit log (Active) ──────────── */}
            <div className="flex items-center gap-8 border-b border-[#dfdbcf] text-sm pt-2">
              <button
                type="button"
                onClick={() => setSubTab("daftar")}
                className={`pb-3 font-semibold transition-all cursor-pointer relative ${
                  subTab === "daftar"
                    ? "text-[#1c5c43] font-bold"
                    : "text-[#738278] hover:text-[#0d3527]"
                }`}
              >
                <span>Daftar listing</span>
                {subTab === "daftar" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1c5c43] rounded-t-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSubTab("audit")}
                className={`pb-3 font-semibold transition-all cursor-pointer relative ${
                  subTab === "audit"
                    ? "text-[#1c5c43] font-bold"
                    : "text-[#738278] hover:text-[#0d3527]"
                }`}
              >
                <span>Audit log</span>
                {subTab === "audit" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1c5c43] rounded-t-full" />
                )}
              </button>
            </div>

            {/* ── LOWER SECTION: Riwayat Moderasi Table ───────────────── */}
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-[#0d3527]">
                  Riwayat moderasi
                </h2>

                <button
                  type="button"
                  onClick={handleExportLog}
                  className="px-4 py-2 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] bg-white hover:bg-[#faf7ee] text-xs font-semibold text-[#0d3527] flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#55695e]" />
                  <span>Ekspor log</span>
                </button>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#f0ede4] text-xs font-semibold text-[#738278]">
                      <th className="py-3 px-4 font-semibold">Waktu</th>
                      <th className="py-3 px-4 font-semibold">Peristiwa</th>
                      <th className="py-3 px-4 font-semibold">Pelaku</th>
                      <th className="py-3 px-4 font-semibold">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f2ea]">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-[#faf9f4] transition-colors">
                        <td className="py-3.5 px-4 text-[#526359] whitespace-nowrap">
                          {h.time}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-bold text-xs text-[#0d3527]">
                            <span className="w-4 h-4 rounded-full bg-[#dc2626] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                              −
                            </span>
                            <span>{h.event}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0d3527]">
                          {h.actor}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0d3527]">
                            {h.listingName} (ID {h.listingCode})
                          </div>
                          <div className="text-xs text-[#738278] mt-0.5">
                            Alasan: {h.reason}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ── VIEW 2: VERIFIKASI ORGANISASI ─────────────────────────── */}
        {activeMenu === "organisasi" && (
          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d3527]">
                  Verifikasi organisasi
                </h1>
                <p className="text-xs sm:text-sm text-[#526359] mt-1">
                  Periksa informasi sebelum menyetujui akses reservasi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMenu("listing")}
                className="px-4 py-2 rounded-xl bg-[#1c5c43] text-white text-xs font-bold"
              >
                Buka Moderasi Listing &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-3">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      selectedOrgId === org.id
                        ? "bg-[#e8efe9] border-[#c6dad0]"
                        : "bg-white border-[#e4ddcc] hover:bg-[#faf9f4]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#dff0e6] text-[#1c6b4f] flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#0d3527]">{org.name}</h3>
                        <p className="text-xs text-[#738278]">{org.city} • {org.submissionDate}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#92400e]">
                      {org.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e4ddcc] p-6 space-y-4">
                <h3 className="font-extrabold text-xl text-[#0d3527]">
                  {organizations.find((o) => o.id === selectedOrgId)?.name}
                </h3>
                <p className="text-xs text-[#526359] leading-relaxed">
                  {organizations.find((o) => o.id === selectedOrgId)?.description}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => showToast("Organisasi berhasil disetujui!")}
                    className="flex-1 py-2.5 bg-[#1c4e38] text-white font-bold text-xs rounded-xl"
                  >
                    Setujui organisasi
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── VIEW 3: DASBOR (ADMIN OVERVIEW) ───────────────────────── */}
        {activeMenu === "dasbor" && (
          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d3527]">
              Admin overview
            </h1>
            <p className="text-xs sm:text-sm text-[#526359]">
              Pantau aktivitas platform dan jaga integritas operasional.
            </p>
            <div className="p-6 bg-white rounded-2xl border border-[#e4ddcc]">
              <p className="text-xs text-[#526359]">
                Silakan beralih ke menu <strong>Listing</strong> untuk moderasi penonaktifan makanan atau <strong>Organisasi</strong> untuk verifikasi permohonan.
              </p>
            </div>
          </main>
        )}

        {/* ── VIEW 4: PLACEHOLDERS FOR REMAINING SUBMENUS ───────────── */}
        {(activeMenu === "laporan" ||
          activeMenu === "pengguna" ||
          activeMenu === "mitra" ||
          activeMenu === "pesan" ||
          activeMenu === "pengaturan") && (
          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-10 text-center space-y-3">
              <Info className="w-8 h-8 text-[#1c6b4f] mx-auto" />
              <h2 className="font-extrabold text-lg text-[#0d3527] capitalize">
                Menu {activeMenu}
              </h2>
              <p className="text-xs text-[#738278] max-w-sm mx-auto">
                Kelola data {activeMenu} platform PANGANLOOP.
              </p>
              <button
                type="button"
                onClick={() => setActiveMenu("listing")}
                className="px-5 py-2 bg-[#1c5c43] text-white text-xs font-bold rounded-xl"
              >
                Buka Moderasi Listing
              </button>
            </div>
          </main>
        )}

        {/* ── FLOATING FLYOUT PANEL: "Nonaktifkan listing" (MATCHING SCREENSHOT) ── */}
        {flyoutOpen && (
          <div className="fixed right-6 top-20 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-[#e4ddcc] p-6 space-y-5 animate-in slide-in-from-right-4 duration-200">
            {/* Header: Title + X */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede4]">
              <h3 className="font-extrabold text-base text-[#0d3527]">
                Nonaktifkan listing
              </h3>
              <button
                type="button"
                onClick={() => setFlyoutOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#faf7ee] text-[#526359] flex items-center justify-center cursor-pointer"
                aria-label="Tutup panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Item Summary */}
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#eee9dd]">
                <Image
                  src={flyoutItem.image}
                  alt={flyoutItem.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#0d3527] leading-tight">
                  {flyoutItem.name}
                </h4>
                <p className="text-xs text-[#738278] mt-0.5">
                  ID {flyoutItem.code} • {flyoutItem.provider}
                </p>
              </div>
            </div>

            {/* Reason Form */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0d3527]">
                Alasan wajib <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={deactivateReason}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setDeactivateReason(e.target.value);
                    }
                  }}
                  rows={4}
                  placeholder="Tulis alasan penonaktifan listing..."
                  className="w-full p-3 rounded-2xl bg-white border border-[#dfdbcf] text-xs text-[#0d3527] placeholder-[#8a988f] focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/30 focus:border-[#1c5c43] resize-none"
                />
                <span className="absolute bottom-2.5 right-3 text-[10px] text-[#8a988f]">
                  {deactivateReason.length}/500
                </span>
              </div>
            </div>

            {/* Info Notice Box */}
            <div className="bg-[#f2f8f4] border border-[#dcebe1] rounded-2xl p-3.5 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#1c6b4f] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#40564b] leading-relaxed">
                Listing akan disembunyikan dari pengguna dan tidak dapat diakses hingga diaktifkan kembali oleh admin.
              </p>
            </div>

            {/* Action Buttons: Batal vs Nonaktifkan */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFlyoutOpen(false)}
                className="flex-1 py-3 rounded-xl border border-[#dfdbcf] hover:bg-[#faf7ee] text-xs font-bold text-[#0d3527] cursor-pointer transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivation}
                className="flex-1 py-3 rounded-xl bg-[#1c4e38] hover:bg-[#143c2b] text-white text-xs font-bold cursor-pointer transition-all shadow-xs active:scale-[0.98]"
              >
                Nonaktifkan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#0d3527] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#f0aa3e] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
