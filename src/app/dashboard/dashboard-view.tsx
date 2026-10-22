"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Home,
  Info,
  Leaf,
  LogOut,
  Megaphone,
  MoreVertical,
  Package,
  Plus,
  ShieldCheck,
  TrendingUp,
  User,
  X,
  RefreshCw,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS } from "../_components/auth-context";
import { ReservasiView } from "../reservasi/reservasi-view";
import { RecipientDashboardView } from "../_components/recipient-dashboard-view";

export type TabKey = "ringkasan" | "batch" | "reservasi" | "insight" | "profil";
export type BatchStatus = "Semua" | "Draft" | "Dipublikasikan" | "Selesai";

export type BatchItem = {
  id: string;
  name: string;
  category: "Roti & kue" | "Makanan siap saji" | "Bahan segar";
  status: "Dipublikasikan" | "Selesai" | "Draft";
  deadline: string;
  prepared: number;
  sold: number;
  surplus: number;
  image: string;
  notes?: string;
};

const initialBatches: BatchItem[] = [
  {
    id: "batch-1",
    name: "Roti tawar",
    category: "Roti & kue",
    status: "Dipublikasikan",
    deadline: "14 Okt 2026",
    prepared: 20,
    sold: 8,
    surplus: 12,
    image: "/assets/surplus/surplus-roti.jpg",
    notes: "Roti tawar gandum utuh siap konsumsi, kemasan kedap udara.",
  },
  {
    id: "batch-2",
    name: "Nasi kotak ayam",
    category: "Makanan siap saji",
    status: "Selesai",
    deadline: "12 Okt 2026",
    prepared: 30,
    sold: 18,
    surplus: 12,
    image: "/assets/surplus/surplus-nasi.jpg",
    notes: "Nasi kotak ayam bakar lengkap lalapan, berhasil diserahkan ke komunitas.",
  },
  {
    id: "batch-3",
    name: "Kue bolu",
    category: "Roti & kue",
    status: "Draft",
    deadline: "18 Okt 2026",
    prepared: 16,
    sold: 12,
    surplus: 4,
    image: "/assets/surplus/surplus-kue.jpg",
    notes: "Bolu marmer mentega siap rilis setelah closing toko sore ini.",
  },
];

export function DashboardView({ initialTab = "ringkasan" }: { initialTab?: TabKey }) {
  const { user, logout } = useAuth();
  const [overrideRole, setOverrideRole] = useState<"donor" | "recipient" | null>(null);
  const effectiveRole = overrideRole || (user?.role === "recipient" ? "recipient" : "donor");

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [batches, setBatches] = useState<BatchItem[]>(initialBatches);
  const [batchFilter, setBatchFilter] = useState<BatchStatus>("Semua");
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2026");
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);

  // New batch form states
  const [newProductName, setNewProductName] = useState("");
  const [newCategory, setNewCategory] = useState<BatchItem["category"]>("Roti & kue");
  const [newPrepared, setNewPrepared] = useState("20");
  const [newSold, setNewSold] = useState("8");
  const [newDeadline, setNewDeadline] = useState("24 Okt 2026");
  const [newNotes, setNewNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;

    const prep = parseInt(newPrepared, 10) || 10;
    const sold = parseInt(newSold, 10) || 0;
    const surplusVal = Math.max(0, prep - sold);

    let img = "/assets/surplus/surplus-roti.jpg";
    if (newCategory === "Makanan siap saji") {
      img = "/assets/surplus/surplus-nasi.jpg";
    } else if (newProductName.toLowerCase().includes("kue") || newProductName.toLowerCase().includes("bolu")) {
      img = "/assets/surplus/surplus-kue.jpg";
    }

    const created: BatchItem = {
      id: `batch-${Date.now()}`,
      name: newProductName,
      category: newCategory,
      status: "Dipublikasikan",
      deadline: newDeadline,
      prepared: prep,
      sold: sold,
      surplus: surplusVal,
      image: img,
      notes: newNotes || "Kondisi sangat baik, dikemas rapi dan higienis.",
    };

    startTransition(() => {
      setBatches([created, ...batches]);
      setModalNewOpen(false);
      setNewProductName("");
      setNewNotes("");
    });
  };

  const handleUpdateStatus = (id: string, newStatus: BatchItem["status"]) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    setRowMenuOpenId(null);
  };

  const handleDeleteBatch = (id: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
    setRowMenuOpenId(null);
  };

  // Filtered batch list
  const filteredBatches = batches.filter((b) => {
    if (batchFilter === "Semua") return true;
    return b.status === batchFilter;
  });

  if (effectiveRole === "recipient") {
    return (
      <RecipientDashboardView
        onSwitchToDonor={() => setOverrideRole("donor")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5ed] flex flex-col md:flex-row text-[#0d3527] font-sans antialiased">
      {/* ────────────────────────────────────────────────────────── */}
      {/* SIDEBAR NAVIGATION                                         */}
      {/* ────────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#0e3828] text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Brand header */}
          <div className="p-6 pb-5 border-b border-white/10">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <div className="relative h-12 w-44">
                <Image
                  src="/assets/dashboard-logo-white.png"
                  alt="PANGANLOOP"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5" aria-label="Menu navigasi dashboard">
            <button
              type="button"
              onClick={() => setActiveTab("ringkasan")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "ringkasan"
                  ? "bg-[#1c5c43] text-white shadow-sm"
                  : "text-[#b2cebe] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>Ringkasan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("batch")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "batch"
                  ? "bg-[#1c5c43] text-white shadow-sm"
                  : "text-[#b2cebe] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Package className="w-5 h-5 shrink-0" />
                <span>Batch</span>
              </div>
              <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full font-medium">
                {batches.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reservasi")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "reservasi"
                  ? "bg-[#1c5c43] text-white shadow-sm"
                  : "text-[#b2cebe] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Calendar className="w-5 h-5 shrink-0" />
                <span>Reservasi</span>
              </div>
              <span className="text-xs bg-[#f0aa3e] text-[#0d3527] font-bold px-2 py-0.5 rounded-full">
                1 aktif
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("insight")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "insight"
                  ? "bg-[#1c5c43] text-white shadow-sm"
                  : "text-[#b2cebe] hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              <span>Insight</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profil")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "profil"
                  ? "bg-[#1c5c43] text-white shadow-sm"
                  : "text-[#b2cebe] hover:bg-white/5 hover:text-white"
              }`}
            >
              <User className="w-5 h-5 shrink-0" />
              <span>Profil</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Tagline */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-start gap-3">
            <Leaf className="w-5 h-5 text-[#8cbda8] shrink-0 mt-0.5" />
            <p className="text-xs text-[#a0c5b3] leading-relaxed">
              Pangan tidak seharusnya terbuang. Bersama, kita bisa mengalirkannya kembali.
            </p>
          </div>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-[#e6decf] px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0d3527] tracking-tight">
                Selamat sore, {user?.name || "Dapur Pagi"}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e7f3ec] text-[#1c6b4f] border border-[#b8dfcb]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Organisasi disetujui
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#526359] mt-0.5">
              Terima kasih telah berkontribusi mengurangi pangan terbuang.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Role Switcher */}
            <button
              type="button"
              onClick={() => setOverrideRole("recipient")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e7f3ec] hover:bg-[#d5ebd0] text-[#1c6b4f] border border-[#b8dfcb] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Buka tampilan dashboard penerima makanan surplus"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tampilan Penerima / Komunitas</span>
              <span className="sm:hidden">Komunitas</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-10 h-10 rounded-xl bg-white border border-[#dfdbcf] hover:border-[#1c6b4f] text-[#0d3527] flex items-center justify-center transition-colors relative cursor-pointer"
                aria-label="Pemberitahuan"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f0aa3e]" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e4ddcc] p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#eee]">
                    <span className="font-bold text-sm text-[#0d3527]">Pemberitahuan</span>
                    <span className="text-[11px] text-[#1c6b4f] font-semibold">Tandai dibaca</span>
                  </div>
                  <div className="divide-y divide-[#f4f2ea] text-xs">
                    <div className="py-2.5">
                      <p className="font-semibold text-[#0d3527]">Batch Roti tawar aktif</p>
                      <p className="text-[#526359] mt-0.5">12 unit surplus siap diambil komunitas.</p>
                      <span className="text-[10px] text-[#8a958e] mt-1 block">Baru saja</span>
                    </div>
                    <div className="py-2.5">
                      <p className="font-semibold text-[#0d3527]">Nasi kotak ayam selesai</p>
                      <p className="text-[#526359] mt-0.5">Telah berhasil dijemput dan disalurkan.</p>
                      <span className="text-[10px] text-[#8a958e] mt-1 block">1 jam lalu</span>
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
                className="flex items-center gap-3 bg-white border border-[#dfdbcf] hover:border-[#1c6b4f] pl-2 pr-3 py-1.5 rounded-2xl transition-all cursor-pointer shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0e3828] text-white flex items-center justify-center font-bold text-xs">
                  <Box className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#0d3527] leading-tight">
                    {user?.name || "Dapur Pagi"}
                  </div>
                  <div className="text-[10px] text-[#526359] leading-tight">
                    {user?.roleLabel || "Donor"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#526359]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#e4ddcc] py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("profil");
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#0d3527] hover:bg-[#faf6ea] flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profil Organisasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("batch");
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#0d3527] hover:bg-[#faf6ea] flex items-center gap-2 cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Batch Saya</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const recipient = DEMO_ACCOUNTS.find((a) => a.role === "recipient");
                      if (recipient) {
                        setOverrideRole("recipient");
                      }
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mode Penerima (Komunitas)</span>
                  </button>
                  <div className="border-t border-[#eee] my-1" />
                  <Link
                    href="/login"
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#9b2c1a] hover:bg-[#faf6ea] flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main View Switcher ─────────────────────────────────── */}
        <main className="p-6 sm:p-8 space-y-8 flex-1">
          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB: BATCH SAYA (Exact match to user reference screenshot)*/}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "batch" && (
            <div className="space-y-6">
              {/* Header: Title + CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#0d3527] tracking-tight">
                    Batch saya
                  </h1>
                  <p className="text-sm text-[#526359] mt-1">
                    Lacak setiap surplus dari persiapan sampai outcome.
                  </p>
                </div>

                <Link
                  href="/batch/baru"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#1c5c43] hover:bg-[#154a36] text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Catat surplus baru</span>
                </Link>
              </div>

              {/* Filter controls row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* Status pills: Semua | Draft | Dipublikasikan | Selesai */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {(["Semua", "Draft", "Dipublikasikan", "Selesai"] as BatchStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setBatchFilter(st)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        batchFilter === st
                          ? "bg-[#d9e7dd] text-[#1c5c43] shadow-sm font-bold"
                          : "bg-white text-[#526359] border border-[#e4ddcc] hover:bg-white/80"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Date Dropdown: Oktober 2026 */}
                <div className="relative self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMonthMenuOpen(!monthMenuOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e4ddcc] text-sm text-[#0d3527] rounded-xl hover:border-[#1c5c43] transition-colors cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-[#526359]" />
                    <span>{selectedMonth}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#526359]" />
                  </button>

                  {monthMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1 z-30">
                      {["Oktober 2026", "September 2026", "Agustus 2026"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setSelectedMonth(m);
                            setMonthMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs ${
                            selectedMonth === m ? "font-bold text-[#1c5c43] bg-[#faf6ea]" : "text-[#526359] hover:bg-[#faf6ea]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-2xl border border-[#e6decf] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#f0ede4] text-xs font-semibold text-[#75857b]">
                        <th className="py-4 px-6 font-semibold">Item</th>
                        <th className="py-4 px-4 text-center font-semibold">Disiapkan</th>
                        <th className="py-4 px-4 text-center font-semibold">Terjual</th>
                        <th className="py-4 px-4 text-center font-semibold">Surplus</th>
                        <th className="py-4 px-4 font-semibold">Status</th>
                        <th className="py-4 px-4 font-semibold">Deadline</th>
                        <th className="py-4 px-6 text-right font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f1e8] text-sm">
                      {filteredBatches.map((item) => (
                        <tr key={item.id} className="hover:bg-[#faf8f2] transition-colors">
                          {/* Item with photo thumbnail */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e6decf]">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-bold text-sm text-[#0d3527]">
                                {item.name}
                              </span>
                            </div>
                          </td>

                          {/* Disiapkan */}
                          <td className="py-4 px-4 text-center font-medium text-[#0d3527]">
                            {item.prepared}
                          </td>

                          {/* Terjual */}
                          <td className="py-4 px-4 text-center font-medium text-[#0d3527]">
                            {item.sold}
                          </td>

                          {/* Surplus */}
                          <td className="py-4 px-4 text-center font-medium text-[#0d3527]">
                            {item.surplus}
                          </td>

                          {/* Status pill with color dot */}
                          <td className="py-4 px-4">
                            {item.status === "Dipublikasikan" && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f4ec] text-[#1c6b4f]">
                                <span className="w-2 h-2 rounded-full bg-[#1c6b4f]" />
                                Dipublikasikan
                              </span>
                            )}
                            {item.status === "Selesai" && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4ff] text-[#2c6ecb]">
                                <span className="w-2 h-2 rounded-full bg-[#2c6ecb]" />
                                Selesai
                              </span>
                            )}
                            {item.status === "Draft" && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff3e0] text-[#b87c28]">
                                <span className="w-2 h-2 rounded-full bg-[#b87c28]" />
                                Draft
                              </span>
                            )}
                          </td>

                          {/* Deadline */}
                          <td className="py-4 px-4 text-xs font-medium text-[#0d3527]">
                            {item.deadline}
                          </td>

                          {/* Aksi: Buka button + Three dots */}
                          <td className="py-4 px-6 text-right relative">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={`/batch/${item.id}`}
                                className="px-4 py-1.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] hover:bg-white text-xs font-bold text-[#0d3527] transition-all cursor-pointer shadow-2xs inline-block"
                              >
                                Buka
                              </Link>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRowMenuOpenId(rowMenuOpenId === item.id ? null : item.id)
                                  }
                                  className="p-1 text-[#8a958e] hover:text-[#0d3527] cursor-pointer"
                                  aria-label="Menu aksi lainnya"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {rowMenuOpenId === item.id && (
                                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1 z-30 text-left">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(item.id, "Dipublikasikan")}
                                      className="w-full px-3 py-1.5 text-xs text-[#0d3527] hover:bg-[#faf6ea] text-left block"
                                    >
                                      Ubah: Dipublikasikan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(item.id, "Selesai")}
                                      className="w-full px-3 py-1.5 text-xs text-[#0d3527] hover:bg-[#faf6ea] text-left block"
                                    >
                                      Ubah: Selesai
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(item.id, "Draft")}
                                      className="w-full px-3 py-1.5 text-xs text-[#0d3527] hover:bg-[#faf6ea] text-left block"
                                    >
                                      Ubah: Draft
                                    </button>
                                    <div className="border-t border-[#eee] my-1" />
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBatch(item.id)}
                                      className="w-full px-3 py-1.5 text-xs text-[#9b2c1a] hover:bg-[#faf6ea] text-left block"
                                    >
                                      Hapus Batch
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Insight Card matching screenshot */}
              <div className="bg-white rounded-2xl border border-[#e4ddcc] py-9 px-6 text-center shadow-xs">
                <div className="w-11 h-11 rounded-full bg-[#f2ede4] flex items-center justify-center mx-auto mb-3 text-[#3d5045]">
                  <svg
                    className="w-5 h-5 text-[#3d5045]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <rect x="4" y="13" width="3.5" height="7" rx="1.5" />
                    <rect x="10.25" y="8" width="3.5" height="12" rx="1.5" />
                    <rect x="16.5" y="4" width="3.5" height="16" rx="1.5" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-[#0d3527]">Belum melihat pola?</h3>
                <p className="text-xs sm:text-sm text-[#526359] mt-1">
                  Tutup beberapa batch untuk mendapatkan insight.
                </p>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB: RINGKASAN                                           */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "ringkasan" && (
            <>
              {/* Top Metrics Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
                <div className="bg-white rounded-2xl p-5 border border-[#e4ddcc] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#e7f3ec] text-[#1c6b4f] flex items-center justify-center shrink-0">
                      <Box className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-semibold text-[#526359]">Batch aktif</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-[#0d3527]">
                      {batches.filter((b) => b.status === "Dipublikasikan").length}
                    </span>
                    <p className="text-[11px] text-[#526359] mt-1">Batch yang sedang berjalan</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e4ddcc] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#eef4ff] text-[#2c6ecb] flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-semibold text-[#526359]">Dipublikasikan</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold text-[#0d3527]">
                      86 <span className="text-base font-semibold text-[#526359]">unit</span>
                    </div>
                    <p className="text-[11px] text-[#526359] mt-1">Total unit yang dipublikasikan</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e4ddcc] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#eaf4ec] text-[#155c43] flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-semibold text-[#526359]">Rescued</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold text-[#0d3527]">
                      54 <span className="text-base font-semibold text-[#526359]">unit</span>
                    </div>
                    <p className="text-[11px] text-[#526359] mt-1">Unit yang berhasil tersalurkan</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e4ddcc] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#fff4e5] text-[#b87c28] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-semibold text-[#526359]">Belum ditutup</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-[#0d3527]">2</span>
                    <p className="text-[11px] text-[#526359] mt-1">Batch menunggu penyelesaian</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => setModalNewOpen(true)}
                    className="w-full h-full min-h-[105px] bg-[#0e3828] hover:bg-[#154e38] active:scale-[0.99] text-white p-5 rounded-2xl shadow-md transition-all flex flex-col justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm sm:text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 rounded-full bg-white/20 p-0.5" />
                        Catat surplus baru
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-[#a0c5b3] mt-2 leading-tight">
                      Catat surplus pangan Anda dan bantu lebih banyak orang hari ini.
                    </p>
                  </button>
                </div>
              </div>

              {/* Lower Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e6decf] shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-extrabold text-[#0d3527] tracking-tight">
                      Batch aktif
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("batch")}
                      className="text-xs sm:text-sm font-semibold text-[#1c6b4f] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Lihat semua batch
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-[#f2eee3]">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="py-4 flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-3 sm:gap-2 hover:bg-[#faf8f2] px-2 rounded-2xl transition-colors"
                      >
                        <div className="sm:col-span-4 flex items-center gap-3 w-full">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#e6decf]">
                            <Image src={batch.image} alt={batch.name} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#0d3527] leading-tight">
                              {batch.name}
                            </div>
                            <div className="text-xs text-[#526359] mt-0.5">{batch.category}</div>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              batch.status === "Dipublikasikan"
                                ? "bg-[#eaf4ec] text-[#1c6b4f]"
                                : batch.status === "Selesai"
                                ? "bg-[#eef4ff] text-[#2c6ecb]"
                                : "bg-[#fff3e0] text-[#b87c28]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                batch.status === "Dipublikasikan"
                                  ? "bg-[#1c6b4f]"
                                  : batch.status === "Selesai"
                                  ? "bg-[#2c6ecb]"
                                  : "bg-[#b87c28]"
                              }`}
                            />
                            {batch.status}
                          </span>
                        </div>

                        <div className="sm:col-span-3 text-xs text-[#0d3527]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#526359]" />
                            <span>{batch.deadline}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2 text-xs text-[#0d3527]">
                          <div className="font-bold text-sm">{batch.surplus} unit</div>
                          <div className="text-[11px] text-[#526359]">
                            surplus dari {batch.prepared}
                          </div>
                        </div>

                        <div className="sm:col-span-1 text-right w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedBatch(batch)}
                            className="px-3 py-1.5 rounded-xl border border-[#d6cfbe] hover:border-[#1c6b4f] hover:bg-white text-xs font-semibold text-[#0d3527] transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <span>Buka</span>
                            <ChevronRight className="w-3 h-3 text-[#526359]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pola yang terlihat */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#e6decf] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#1c6b4f]" />
                    <h2 className="text-xl font-extrabold text-[#0d3527] tracking-tight">
                      Pola yang terlihat
                    </h2>
                  </div>

                  <div className="bg-[#eef6f0] border border-[#cbe4d3] rounded-2xl p-4 flex items-start gap-3 mb-5">
                    <TrendingUp className="w-5 h-5 text-[#1c6b4f] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-bold text-[#0d3527] leading-tight">
                      3 dari 4 batch roti minggu ini memiliki surplus &gt;20%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#0d3527]">
                      Persentase surplus batch roti (4 minggu terakhir)
                    </div>

                    <div className="h-44 w-full pt-4 pb-2 flex items-end justify-between gap-3 border-b border-[#e4ddcc] relative">
                      <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                        <span className="text-[10px] font-bold text-[#526359]">15%</span>
                        <div className="w-full max-w-[42px] bg-[#1c5c43] rounded-t-md h-[25%]" />
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                        <span className="text-[10px] font-bold text-[#526359]">28%</span>
                        <div className="w-full max-w-[42px] bg-[#1c5c43] rounded-t-md h-[46%]" />
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                        <span className="text-[10px] font-bold text-[#526359]">35%</span>
                        <div className="w-full max-w-[42px] bg-[#1c5c43] rounded-t-md h-[58%]" />
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                        <span className="text-[10px] font-bold text-[#526359]">48%</span>
                        <div className="w-full max-w-[42px] bg-[#1c5c43] rounded-t-md h-[80%]" />
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-[#75857b] font-medium pt-1 px-1">
                      <span>Minggu 1</span>
                      <span>Minggu 2</span>
                      <span>Minggu 3</span>
                      <span>Minggu 4</span>
                    </div>

                    <div className="mt-5 bg-[#f5f9f6] border border-[#dceade] rounded-xl p-3 flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#2c6ecb] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#526359] leading-tight">
                        Saran berdasarkan catatan, bukan prediksi pasti.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB: RESERVASI                                           */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "reservasi" && (
            <ReservasiView showNav={false} />
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB: INSIGHT                                             */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "insight" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6decf] shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[#0d3527] tracking-tight">
                  Laporan & Evaluasi Produksi
                </h2>
                <p className="text-xs sm:text-sm text-[#526359] mt-0.5">
                  Wawasan berkala untuk menekan sisa makanan dan memaksimalkan efisiensi dapur Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-[#f7f5ed] border border-[#e6decf]">
                  <span className="text-xs font-bold text-[#526359] uppercase tracking-wider">
                    Karbon Dicegah
                  </span>
                  <div className="text-3xl font-extrabold text-[#1c6b4f] mt-2">135 kg CO₂e</div>
                  <p className="text-xs text-[#526359] mt-1">Setara dengan penanaman 6 pohon.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#f7f5ed] border border-[#e6decf]">
                  <span className="text-xs font-bold text-[#526359] uppercase tracking-wider">
                    Nilai Diselamatkan
                  </span>
                  <div className="text-3xl font-extrabold text-[#c2842e] mt-2">Rp 2.160.000</div>
                  <p className="text-xs text-[#526359] mt-1">Dari 54 unit makanan terserap.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#f7f5ed] border border-[#e6decf]">
                  <span className="text-xs font-bold text-[#526359] uppercase tracking-wider">
                    Tingkat Keberhasilan
                  </span>
                  <div className="text-3xl font-extrabold text-[#0d3527] mt-2">94%</div>
                  <p className="text-xs text-[#526359] mt-1">Diambil tepat waktu sebelum batas.</p>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB: PROFIL                                              */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTab === "profil" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6decf] shadow-sm max-w-3xl">
              <h2 className="text-2xl font-extrabold text-[#0d3527] tracking-tight mb-1">
                Profil Toko / Dapur
              </h2>
              <p className="text-xs sm:text-sm text-[#526359] mb-6">
                Informasi identitas bisnis yang terhubung dengan komunitas penerima pangan.
              </p>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-b border-[#eee]">
                  <span className="text-[#526359] font-medium">Nama Bisnis</span>
                  <span className="sm:col-span-2 font-bold text-[#0d3527]">
                    {user?.name || "Dapur Pagi Bakery & Kitchen"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-b border-[#eee]">
                  <span className="text-[#526359] font-medium">Email Akun</span>
                  <span className="sm:col-span-2 text-[#0d3527] font-semibold">
                    {user?.email || "dapurpagi@panganloop.id"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-b border-[#eee]">
                  <span className="text-[#526359] font-medium">Kategori Usaha</span>
                  <span className="sm:col-span-2 text-[#0d3527]">
                    {user?.orgType || "Toko Roti & Katering Harian"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-b border-[#eee]">
                  <span className="text-[#526359] font-medium">Alamat Pickup</span>
                  <span className="sm:col-span-2 text-[#0d3527]">
                    {user?.address || "Jl. Tebet Barat Dalam Raya No. 42, Tebet, Jakarta Selatan 12810"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-b border-[#eee]">
                  <span className="text-[#526359] font-medium">Kontak PIC</span>
                  <span className="sm:col-span-2 text-[#0d3527]">
                    {user?.pic || "Budi Santoso"} ({user?.phone || "0812-3456-7890"})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-b border-[#eee]">
                  <span className="text-[#526359] font-medium">Status Verifikasi</span>
                  <span className="sm:col-span-2 font-semibold text-[#1c6b4f] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Terverifikasi Resmi oleh PANGANLOOP
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: CATAT SURPLUS BARU                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      {modalNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#faf6ea] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ded5c2] text-[#0d3527] relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalNewOpen(false)}
              className="absolute top-5 right-5 text-[#5e6f64] hover:text-[#0d3527] p-1 cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#1c5c43]/10 text-[#1c5c43] flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight">Catat Surplus Baru</h3>
            <p className="text-xs sm:text-sm text-[#526359] mt-1 mb-5">
              Publikasikan kelebihan porsi makanan agar komunitas penerima dapat melakukan klaim tepat waktu.
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Nama Produk Makanan
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Contoh: Roti Manis Aneka Rasa"
                  className="w-full bg-white border border-[#d6cfbe] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as BatchItem["category"])}
                  className="w-full bg-white border border-[#d6cfbe] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/30"
                >
                  <option value="Roti & kue">Roti & kue</option>
                  <option value="Makanan siap saji">Makanan siap saji</option>
                  <option value="Bahan segar">Bahan segar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Disiapkan (Porsi)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPrepared}
                    onChange={(e) => setNewPrepared(e.target.value)}
                    className="w-full bg-white border border-[#d6cfbe] text-sm rounded-xl px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Terjual (Porsi)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newSold}
                    onChange={(e) => setNewSold(e.target.value)}
                    className="w-full bg-white border border-[#d6cfbe] text-sm rounded-xl px-4 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Tanggal Batas Penjemputan
                </label>
                <input
                  type="text"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  placeholder="Contoh: 24 Okt 2026"
                  className="w-full bg-white border border-[#d6cfbe] text-sm rounded-xl px-4 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Catatan Kemasan & Penanganan
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Contoh: Dikemas bersih dalam kotak mika, simpan suhu ruang."
                  className="w-full bg-white border border-[#d6cfbe] text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNewOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#d8d0bf] text-xs font-semibold hover:bg-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-[#0e3828] hover:bg-[#154e38] text-white text-xs font-semibold cursor-pointer"
                >
                  Publikasikan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: DETAIL BATCH                                        */}
      {/* ────────────────────────────────────────────────────────── */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ded5c2] text-[#0d3527] relative">
            <button
              type="button"
              onClick={() => setSelectedBatch(null)}
              className="absolute top-5 right-5 text-[#5e6f64] hover:text-[#0d3527] p-1 cursor-pointer"
              aria-label="Tutup detail"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#e6decf]">
                <Image
                  src={selectedBatch.image}
                  alt={selectedBatch.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0d3527]">
                  {selectedBatch.name}
                </h3>
                <span className="text-xs text-[#526359]">{selectedBatch.category}</span>
              </div>
            </div>

            <div className="space-y-3 bg-[#f7f5ed] p-4 rounded-2xl text-xs mb-5 border border-[#e6decf]">
              <div className="flex justify-between">
                <span className="text-[#526359]">Status Publikasi:</span>
                <span className="font-bold text-[#1c6b4f]">{selectedBatch.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526359]">Batas Pengambilan:</span>
                <span className="font-bold text-[#0d3527]">{selectedBatch.deadline}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#dfdbcf] text-center">
                <div className="bg-white p-2 rounded-xl border border-[#eee]">
                  <span className="text-[10px] text-[#526359] block">Disiapkan</span>
                  <span className="font-bold text-sm text-[#0d3527]">{selectedBatch.prepared}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#eee]">
                  <span className="text-[10px] text-[#526359] block">Terjual</span>
                  <span className="font-bold text-sm text-[#0d3527]">{selectedBatch.sold}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#eee]">
                  <span className="text-[10px] text-[#526359] block">Surplus</span>
                  <span className="font-bold text-sm text-[#1c6b4f]">{selectedBatch.surplus}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#dfdbcf]">
                <span className="text-[#526359] block mb-0.5">Catatan:</span>
                <span className="text-[#0d3527] leading-relaxed">{selectedBatch.notes}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 rounded-xl border border-[#d8d0bf] text-xs font-semibold hover:bg-[#faf6ea] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
