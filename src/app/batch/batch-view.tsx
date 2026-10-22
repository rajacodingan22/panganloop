"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  X,
  CheckCircle2,
  Box,
  Trash2,
  Check,
} from "lucide-react";
import { useAuth } from "../_components/auth-context";
import { TutupBatchModal } from "../_components/tutup-batch-modal";

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
  month?: string;
};

export const initialBatches: BatchItem[] = [
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
    notes: "Roti tawar gandum utuh siap konsumsi, kemasan higienis kedap udara.",
    month: "Oktober 2026",
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
    notes: "Nasi kotak ayam bakar lalapan, berhasil disalurkan ke Dapur Umum Warga.",
    month: "Oktober 2026",
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
    month: "Oktober 2026",
  },
];

export function BatchView({
  showNav = true,
}: {
  showNav?: boolean;
}) {
  const { user } = useAuth();
  const [batches, setBatches] = useState<BatchItem[]>(initialBatches);
  const [activeFilter, setActiveFilter] = useState<BatchStatus>("Semua");
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2026");
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);

  // Modals
  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [tutupBatchTarget, setTutupBatchTarget] = useState<BatchItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New batch form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<BatchItem["category"]>("Roti & kue");
  const [formPrepared, setFormPrepared] = useState("20");
  const [formSold, setFormSold] = useState("8");
  const [formDeadline, setFormDeadline] = useState("20 Okt 2026");
  const [formStatus, setFormStatus] = useState<"Dipublikasikan" | "Draft">("Dipublikasikan");
  const [formNotes, setFormNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const prep = Math.max(1, parseInt(formPrepared, 10) || 1);
    const sold = Math.max(0, parseInt(formSold, 10) || 0);
    const surplusVal = Math.max(0, prep - sold);

    let img = "/assets/surplus/surplus-roti.jpg";
    const nameLower = formName.toLowerCase();
    if (formCategory === "Makanan siap saji" || nameLower.includes("nasi") || nameLower.includes("ayam")) {
      img = "/assets/surplus/surplus-nasi.jpg";
    } else if (nameLower.includes("bolu") || nameLower.includes("kue") || nameLower.includes("cake")) {
      img = "/assets/surplus/surplus-kue.jpg";
    }

    const newBatch: BatchItem = {
      id: `batch-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      status: formStatus,
      deadline: formDeadline,
      prepared: prep,
      sold: sold,
      surplus: surplusVal,
      image: img,
      notes: formNotes || "Disiapkan dengan standar keamanan pangan PANGANLOOP.",
      month: selectedMonth,
    };

    startTransition(() => {
      setBatches((prev) => [newBatch, ...prev]);
      setModalNewOpen(false);
      // Reset form
      setFormName("");
      setFormPrepared("20");
      setFormSold("8");
      setFormNotes("");
      showToast(`Batch "${newBatch.name}" berhasil dicatat (${newBatch.status})!`);
    });
  };

  const handleUpdateStatus = (id: string, newStatus: "Dipublikasikan" | "Selesai" | "Draft") => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBatch && selectedBatch.id === id) {
      setSelectedBatch((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setRowMenuOpenId(null);
    showToast(`Status batch diubah ke "${newStatus}".`);
  };

  const handleDeleteBatch = (id: string) => {
    const item = batches.find((b) => b.id === id);
    setBatches((prev) => prev.filter((b) => b.id !== id));
    setRowMenuOpenId(null);
    if (selectedBatch?.id === id) setSelectedBatch(null);
    showToast(`Batch "${item?.name || ""}" berhasil dihapus.`);
  };

  // Filtered items
  const filteredBatches = batches.filter((b) => {
    if (activeFilter !== "Semua" && b.status !== activeFilter) return false;
    return true;
  });

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
                <span className="text-[#1c5c43] font-bold bg-[#e8f5ec] px-3 py-1 rounded-full">
                  Batch saya
                </span>
                <Link href="/dashboard" className="hover:text-[#1c5c43] transition-colors">
                  Dashboard
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] hover:bg-[#faf7ee] text-[#0d3527] transition-all"
              >
                <span>Dashboard utama</span>
                <ChevronRight className="w-3.5 h-3.5" />
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

      {/* ── Main Batch Feature Canvas (Pixel-matched to user mockup) ─ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
        {/* Top Header: Title + Subtitle on Left, CTA Button on Right */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d3527] tracking-tight">
              Batch saya
            </h1>
            <p className="text-sm sm:text-[15px] text-[#526359] mt-1.5 font-normal">
              Lacak setiap surplus dari persiapan sampai outcome.
            </p>
          </div>

          <Link
            href="/batch/baru"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#1b5e43] hover:bg-[#144934] text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Catat surplus baru</span>
          </Link>
        </div>

        {/* Filter Controls Row: Pills on Left, Month Dropdown on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Status Pills: Semua | Draft | Dipublikasikan | Selesai */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["Semua", "Draft", "Dipublikasikan", "Selesai"] as BatchStatus[]).map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#dbe7df] text-[#1c5c43] font-bold shadow-2xs"
                      : "bg-white text-[#526359] border border-[#e4ddcc] hover:bg-white/80"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Month Dropdown Selector: Oktober 2026 */}
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e4ddcc] text-sm text-[#0d3527] rounded-xl hover:border-[#1c5c43] transition-colors cursor-pointer shadow-2xs font-medium"
            >
              <Calendar className="w-4 h-4 text-[#526359]" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#526359]" />
            </button>

            {monthDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                {["Oktober 2026", "September 2026", "Agustus 2026"].map((month) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(month);
                      setMonthDropdownOpen(false);
                      showToast(`Menampilkan batch untuk ${month}`);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedMonth === month
                        ? "font-bold text-[#1c5c43] bg-[#faf6ea]"
                        : "text-[#526359] hover:bg-[#faf6ea]"
                    }`}
                  >
                    <span>{month}</span>
                    {selectedMonth === month && <Check className="w-3.5 h-3.5 text-[#1c5c43]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Card (Exact matching 7 columns) */}
        <div className="bg-white rounded-2xl border border-[#e4ddcc] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f0ede4] text-xs font-semibold text-[#738278]">
                  <th className="py-4 px-6 font-semibold">Item</th>
                  <th className="py-4 px-4 text-center font-semibold">Disiapkan</th>
                  <th className="py-4 px-4 text-center font-semibold">Terjual</th>
                  <th className="py-4 px-4 text-center font-semibold">Surplus</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Deadline</th>
                  <th className="py-4 px-6 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ede4] text-sm">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#526359]">
                      <Box className="w-8 h-8 mx-auto mb-2 text-[#8a958e] opacity-60" />
                      <p className="font-semibold text-sm text-[#0d3527]">
                        Tidak ada batch dengan status &ldquo;{activeFilter}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveFilter("Semua")}
                        className="mt-2 text-xs font-bold text-[#1c5c43] hover:underline cursor-pointer"
                      >
                        Lihat semua batch
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((item) => (
                    <tr key={item.id} className="hover:bg-[#faf9f4] transition-colors">
                      {/* Item: Photo Thumbnail + Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e6decf] bg-[#f8f5eb]">
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

                      {/* Status: Pill with Colored Dot */}
                      <td className="py-4 px-6">
                        {item.status === "Dipublikasikan" && (
                          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e8f5ec] text-[#1c6b4f]">
                            <span className="w-2 h-2 rounded-full bg-[#1c6b4f]" />
                            Dipublikasikan
                          </span>
                        )}
                        {item.status === "Selesai" && (
                          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e8f1fe] text-[#2563eb]">
                            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                            Selesai
                          </span>
                        )}
                        {item.status === "Draft" && (
                          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#fff3e0] text-[#b45309]">
                            <span className="w-2 h-2 rounded-full bg-[#b45309]" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="py-4 px-6 text-sm text-[#0d3527] whitespace-nowrap">
                        {item.deadline}
                      </td>

                      {/* Aksi: Buka Button + Three Dots */}
                      <td className="py-4 px-6 text-center relative whitespace-nowrap">
                        <div className="inline-flex items-center gap-2.5 justify-center">
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
                              className="p-1.5 text-[#8a958e] hover:text-[#0d3527] rounded-lg hover:bg-[#faf7ee] transition-colors cursor-pointer"
                              aria-label="Menu opsi lainnya"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {rowMenuOpenId === item.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#e4ddcc] py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8a958e]">
                                  Ubah Status
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item.id, "Dipublikasikan")}
                                  className="w-full px-3 py-1.5 text-xs text-[#0d3527] hover:bg-[#faf6ea] flex items-center justify-between cursor-pointer"
                                >
                                  <span>Dipublikasikan</span>
                                  {item.status === "Dipublikasikan" && (
                                    <Check className="w-3.5 h-3.5 text-[#1c6b4f]" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item.id, "Selesai")}
                                  className="w-full px-3 py-1.5 text-xs text-[#0d3527] hover:bg-[#faf6ea] flex items-center justify-between cursor-pointer"
                                >
                                  <span>Selesai</span>
                                  {item.status === "Selesai" && (
                                    <Check className="w-3.5 h-3.5 text-[#2563eb]" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTutupBatchTarget(item);
                                    setRowMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-[#1c5c43] hover:bg-[#eef7f1] flex items-center justify-between cursor-pointer font-semibold"
                                >
                                  <span>Tutup batch</span>
                                  <span className="text-[9px] bg-[#d2ebd9] text-[#164e39] font-bold px-1.5 py-0.5 rounded-full">
                                    Outcome
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item.id, "Draft")}
                                  className="w-full px-3 py-1.5 text-xs text-[#0d3527] hover:bg-[#faf6ea] flex items-center justify-between cursor-pointer"
                                >
                                  <span>Draft</span>
                                  {item.status === "Draft" && (
                                    <Check className="w-3.5 h-3.5 text-[#b45309]" />
                                  )}
                                </button>
                                <div className="border-t border-[#f0ede4] my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBatch(item.id)}
                                  className="w-full px-3 py-1.5 text-xs text-[#9b2c1a] hover:bg-[#fff0ed] flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus Batch</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Insight Card (Exact replica of mockup) */}
        <div className="bg-white rounded-2xl border border-[#e4ddcc] py-9 px-6 text-center shadow-xs">
          {/* Centered Circular Icon Container with 3-bar chart icon */}
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

          <h3 className="font-bold text-base text-[#0d3527]">
            Belum melihat pola?
          </h3>
          <p className="text-xs sm:text-sm text-[#526359] mt-1">
            Tutup beberapa batch untuk mendapatkan insight.
          </p>
        </div>
      </main>

      {/* ── Modal: Catat Surplus Baru ──────────────────────────────── */}
      {modalNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e4ddcc] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0ede4]">
              <div>
                <h2 className="text-lg font-bold text-[#0d3527]">Catat Surplus Baru</h2>
                <p className="text-xs text-[#526359] mt-0.5">
                  Tambahkan makanan surplus harian untuk dipantau dan disalurkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNewOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#faf6ea] text-[#526359] hover:text-[#0d3527] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d3527] mb-1">
                  Nama Produk / Makanan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Roti gandum, Nasi bento, Pastry apel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-[#faf8f2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d3527] mb-1">
                  Kategori
                </label>
                <select
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value as BatchItem["category"])
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-[#faf8f2]"
                >
                  <option value="Roti & kue">Roti & kue</option>
                  <option value="Makanan siap saji">Makanan siap saji</option>
                  <option value="Bahan segar">Bahan segar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d3527] mb-1">
                    Jumlah Disiapkan (unit) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrepared}
                    onChange={(e) => setFormPrepared(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-[#faf8f2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d3527] mb-1">
                    Jumlah Terjual (unit) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formSold}
                    onChange={(e) => setFormSold(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-[#faf8f2]"
                  />
                </div>
              </div>

              {/* Live surplus calculation banner */}
              <div className="bg-[#e8f5ec] border border-[#b8dfcb] rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-[#1c5c43] font-medium">Estimasi surplus tercatat:</span>
                <span className="font-bold text-sm text-[#1c5c43]">
                  {Math.max(
                    0,
                    (parseInt(formPrepared, 10) || 0) - (parseInt(formSold, 10) || 0)
                  )}{" "}
                  unit
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d3527] mb-1">
                    Batas Waktu / Deadline
                  </label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="Contoh: 24 Okt 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-[#faf8f2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d3527] mb-1">
                    Status Awal
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Dipublikasikan" | "Draft")
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-[#faf8f2]"
                  >
                    <option value="Dipublikasikan">Dipublikasikan</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d3527] mb-1">
                  Catatan Penanganan / Alergen (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Kemasan tertutup rapat, konsumsi sebelum jam 21:00..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-[#faf8f2]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0ede4]">
                <button
                  type="button"
                  onClick={() => setModalNewOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#526359] hover:text-[#0d3527] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-[#1b5e43] hover:bg-[#144934] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Simpan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Buka Detail Batch ───────────────────────────────── */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e4ddcc]">
            <div className="flex items-start justify-between pb-3 border-b border-[#f0ede4]">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#e6decf]">
                  <Image
                    src={selectedBatch.image}
                    alt={selectedBatch.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#0d3527]">
                    {selectedBatch.name}
                  </h2>
                  <p className="text-xs text-[#526359]">{selectedBatch.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="w-7 h-7 rounded-full hover:bg-[#faf6ea] text-[#526359] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Stat breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#faf8f2] p-3 rounded-xl border border-[#e8e2d5]">
                  <span className="text-[10px] uppercase font-bold text-[#738278] block">
                    Disiapkan
                  </span>
                  <span className="text-lg font-extrabold text-[#0d3527]">
                    {selectedBatch.prepared}
                  </span>
                </div>
                <div className="bg-[#faf8f2] p-3 rounded-xl border border-[#e8e2d5]">
                  <span className="text-[10px] uppercase font-bold text-[#738278] block">
                    Terjual
                  </span>
                  <span className="text-lg font-extrabold text-[#0d3527]">
                    {selectedBatch.sold}
                  </span>
                </div>
                <div className="bg-[#e8f5ec] p-3 rounded-xl border border-[#b8dfcb]">
                  <span className="text-[10px] uppercase font-bold text-[#1c6b4f] block">
                    Surplus
                  </span>
                  <span className="text-lg font-extrabold text-[#1c6b4f]">
                    {selectedBatch.surplus}
                  </span>
                </div>
              </div>

              {/* Status and deadline info */}
              <div className="bg-[#faf8f2] p-3 rounded-xl border border-[#e8e2d5] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#526359]">Status saat ini:</span>
                  <span className="font-bold text-[#0d3527]">
                    {selectedBatch.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#526359]">Batas waktu pengambilan:</span>
                  <span className="font-bold text-[#0d3527]">
                    {selectedBatch.deadline}
                  </span>
                </div>
              </div>

              {selectedBatch.notes && (
                <div className="text-xs text-[#526359] bg-[#faf8f2] p-3 rounded-xl border border-[#e8e2d5]">
                  <span className="font-bold text-[#0d3527] block mb-0.5">
                    Catatan penanganan:
                  </span>
                  {selectedBatch.notes}
                </div>
              )}

              {/* Status change buttons */}
              <div>
                <span className="text-[11px] font-bold text-[#0d3527] block mb-1.5">
                  Perbarui Status Batch:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBatch.id, "Dipublikasikan")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                      selectedBatch.status === "Dipublikasikan"
                        ? "bg-[#e8f5ec] text-[#1c6b4f] border-[#b8dfcb]"
                        : "bg-white text-[#526359] border-[#dfdbcf] hover:bg-[#faf8f2]"
                    }`}
                  >
                    Dipublikasikan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBatch.id, "Selesai")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                      selectedBatch.status === "Selesai"
                        ? "bg-[#e8f1fe] text-[#2563eb] border-[#b8d4fe]"
                        : "bg-white text-[#526359] border-[#dfdbcf] hover:bg-[#faf8f2]"
                    }`}
                  >
                    Selesai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBatch.id, "Draft")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                      selectedBatch.status === "Draft"
                        ? "bg-[#fff3e0] text-[#b45309] border-[#ffd8a8]"
                        : "bg-white text-[#526359] border-[#dfdbcf] hover:bg-[#faf8f2]"
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0ede4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteBatch(selectedBatch.id)}
                className="text-xs text-[#9b2c1a] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 bg-[#1b5e43] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#144934]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Tutup Batch (Matching user mockup) ─────────────── */}
      {tutupBatchTarget && (
        <TutupBatchModal
          isOpen={Boolean(tutupBatchTarget)}
          batch={{
            id: tutupBatchTarget.id,
            name: tutupBatchTarget.name,
            surplusAwal: tutupBatchTarget.surplus,
            berhasilDiambil: Math.min(4, Math.max(1, Math.round(tutupBatchTarget.surplus * 0.35))),
            sisa: Math.max(0, tutupBatchTarget.surplus - Math.min(4, Math.max(1, Math.round(tutupBatchTarget.surplus * 0.35)))),
          }}
          onClose={() => setTutupBatchTarget(null)}
          onConfirm={(outcome, notes) => {
            handleUpdateStatus(tutupBatchTarget.id, "Selesai");
            setTutupBatchTarget(null);
            showToast(
              `Batch "${tutupBatchTarget.name}" berhasil ditutup (${outcome}${notes ? `: ${notes}` : ""}).`
            );
          }}
        />
      )}

      {/* ── Toast Notification ────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d3527] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#f0aa3e] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
