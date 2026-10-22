"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../_components/auth-context";

export default function CatatSurplusBaruPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Current Step: 1 (form input) or 4 (publikasikan / konfirmasi)
  const [currentStep, setCurrentStep] = useState<1 | 4>(1);

  // Form Fields (Pre-filled to match user reference image precisely)
  const [namaMakanan, setNamaMakanan] = useState("Roti tawar");
  const [tanggalBatch, setTanggalBatch] = useState("19 Oktober 2026");
  const [jumlahDisiapkan, setJumlahDisiapkan] = useState<number | string>(20);
  const [jumlahTerjual, setJumlahTerjual] = useState<number | string>(8);

  const [mulaiTersedia, setMulaiTersedia] = useState("16.00");
  const [batasPengambilan, setBatasPengambilan] = useState("18.30");
  const [areaPickup, setAreaPickup] = useState("Tebet");

  const [caraPenyimpanan, setCaraPenyimpanan] = useState(
    "Suhu ruang (dekat waktu konsumsi)"
  );
  const [alergen, setAlergen] = useState("Mengandung gluten (gandum)");

  const [agreeKnowledge, setAgreeKnowledge] = useState(true);
  const [agreeSafety, setAgreeSafety] = useState(true);

  // Calculated Surplus
  const prepNum = Math.max(0, Number(jumlahDisiapkan) || 0);
  const soldNum = Math.max(0, Number(jumlahTerjual) || 0);
  const surplusUnit = Math.max(0, prepNum - soldNum);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  const handleSimpanDraft = () => {
    setNotification(`Batch "${namaMakanan}" disimpan sebagai draft.`);
    setTimeout(() => {
      router.push("/batch");
    }, 800);
  };

  const handleLanjutkan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeKnowledge || !agreeSafety) {
      alert("Harap centang persetujuan informasi dan ketentuan keamanan pangan.");
      return;
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublikasikan = () => {
    setNotification(`Batch "${namaMakanan}" berhasil dipublikasikan!`);
    setTimeout(() => {
      router.push("/batch");
    }, 900);
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] hover:bg-[#faf7ee] text-[#0d3527] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Batch</span>
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

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb: Batch > Catat surplus baru */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-[#738278]">
          <Link href="/batch" className="hover:text-[#1c5c43] hover:underline transition-colors">
            Batch
          </Link>
          <span className="text-[#a4b1a8]">&gt;</span>
          <span className="text-[#526359] font-semibold">Catat surplus baru</span>
        </nav>

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d3527] tracking-tight">
            Catat surplus baru
          </h1>
          <p className="text-sm sm:text-[15px] text-[#526359] mt-1.5 font-normal">
            Isi informasi berikut untuk mencatat makanan berlebih yang siap didonasikan.
          </p>
        </div>

        {/* Stepper Progress Bar (Data batch -> Rescue Window -> Informasi penanganan -> Publikasikan) */}
        <div className="pt-2 pb-2">
          <div className="flex items-center justify-between max-w-4xl">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#1c5c43] text-white flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1c5c43]">
                Data batch
              </span>
            </div>

            <div className="flex-1 mx-3 sm:mx-4 h-[1.5px] bg-[#dfdbcf]" />

            {/* Step 2 */}
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#e8e4dc] text-[#55695e] flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#738278] hidden sm:inline">
                Rescue Window
              </span>
            </div>

            <div className="flex-1 mx-3 sm:mx-4 h-[1.5px] bg-[#dfdbcf]" />

            {/* Step 3 */}
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#e8e4dc] text-[#55695e] flex items-center justify-center text-xs font-bold shrink-0">
                3
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#738278] hidden md:inline">
                Informasi penanganan
              </span>
            </div>

            <div className="flex-1 mx-3 sm:mx-4 h-[1.5px] bg-[#dfdbcf]" />

            {/* Step 4 */}
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep === 4
                    ? "bg-[#1c5c43] text-white font-bold"
                    : "bg-[#e8e4dc] text-[#55695e]"
                }`}
              >
                4
              </span>
              <span
                className={`text-xs sm:text-sm ${
                  currentStep === 4
                    ? "font-bold text-[#1c5c43]"
                    : "font-medium text-[#738278]"
                }`}
              >
                Publikasikan
              </span>
            </div>
          </div>
        </div>

        {/* ── STEP 1 TO 3: Form View (Matching Mockup Exact Layout) ── */}
        {currentStep === 1 && (
          <form onSubmit={handleLanjutkan}>
            <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 sm:p-8 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* ═════════════════════════════════════════════════════ */}
                {/* LEFT COLUMN: 1. Data batch                           */}
                {/* ═════════════════════════════════════════════════════ */}
                <div className="space-y-6">
                  {/* Section Title 1 */}
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center font-bold text-sm shrink-0">
                      1
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-[#0d3527]">Data batch</h2>
                      <p className="text-xs text-[#526359] mt-0.5">
                        Informasi dasar tentang makanan yang akan didonasikan.
                      </p>
                    </div>
                  </div>

                  {/* Nama makanan */}
                  <div>
                    <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                      Nama makanan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={namaMakanan}
                      onChange={(e) => setNamaMakanan(e.target.value)}
                      placeholder="Contoh: Roti tawar, Nasi box, Salad sayur, dll."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-white transition-all shadow-2xs"
                    />
                    <p className="text-[11px] text-[#8a958e] mt-1.5">
                      Contoh: Roti tawar, Nasi box, Salad sayur, dll.
                    </p>
                  </div>

                  {/* Tanggal batch */}
                  <div>
                    <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                      Tanggal batch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#526359] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={tanggalBatch}
                        onChange={(e) => setTanggalBatch(e.target.value)}
                        placeholder="Contoh: 19 Oktober 2026"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-white transition-all shadow-2xs"
                      />
                    </div>
                    <p className="text-[11px] text-[#8a958e] mt-1.5">
                      Pilih tanggal makanan diproduksi atau disiapkan.
                    </p>
                  </div>

                  {/* Jumlah Disiapkan & Jumlah Terjual */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                        Jumlah disiapkan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          required
                          value={jumlahDisiapkan}
                          onChange={(e) => setJumlahDisiapkan(e.target.value)}
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-white transition-all shadow-2xs"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#738278] pointer-events-none">
                          unit
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a958e] mt-1.5">
                        Total jumlah makanan yang disiapkan pada batch ini.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                        Jumlah terjual <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          required
                          value={jumlahTerjual}
                          onChange={(e) => setJumlahTerjual(e.target.value)}
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-white transition-all shadow-2xs"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#738278] pointer-events-none">
                          unit
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a958e] mt-1.5">
                        Jumlah makanan yang berhasil terjual pada batch ini.
                      </p>
                    </div>
                  </div>

                  {/* Surplus Terhitung Banner */}
                  <div className="bg-[#eef7f1] rounded-2xl p-5 border border-[#cbe4d4] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-[#1c6b4f]">
                        Surplus terhitung
                      </h3>
                      <p className="text-xs text-[#3a5848] mt-0.5">
                        Jumlah yang tersedia untuk didonasikan.
                      </p>
                    </div>
                    <div className="text-3xl font-extrabold text-[#1c6b4f] tracking-tight">
                      {surplusUnit} unit
                    </div>
                  </div>
                </div>

                {/* ═════════════════════════════════════════════════════ */}
                {/* RIGHT COLUMN: 2. Rescue Window & 3. Penanganan       */}
                {/* ═════════════════════════════════════════════════════ */}
                <div className="space-y-8">
                  {/* ─────────────────────────────────────────────────── */}
                  {/* SECTION 2: Rescue Window                            */}
                  {/* ─────────────────────────────────────────────────── */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center font-bold text-sm shrink-0">
                        2
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-[#0d3527]">Rescue Window</h2>
                        <p className="text-xs text-[#526359] mt-0.5">
                          Tentukan kapan makanan bisa diambil oleh penerima.
                        </p>
                      </div>
                    </div>

                    {/* Mulai tersedia & Batas pengambilan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                          Mulai tersedia <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-[#526359] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={mulaiTersedia}
                            onChange={(e) => setMulaiTersedia(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                          >
                            <option value="15.00">15.00</option>
                            <option value="16.00">16.00</option>
                            <option value="17.00">17.00</option>
                            <option value="18.00">18.00</option>
                            <option value="19.00">19.00</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#526359] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <p className="text-[11px] text-[#8a958e] mt-1.5">
                          Waktu mulai makanan dapat diambil.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                          Batas pengambilan <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-[#526359] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={batasPengambilan}
                            onChange={(e) => setBatasPengambilan(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                          >
                            <option value="17.30">17.30</option>
                            <option value="18.00">18.00</option>
                            <option value="18.30">18.30</option>
                            <option value="19.00">19.00</option>
                            <option value="20.00">20.00</option>
                            <option value="21.00">21.00</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#526359] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <p className="text-[11px] text-[#8a958e] mt-1.5">
                          Waktu terakhir makanan dapat diambil.
                        </p>
                      </div>
                    </div>

                    {/* Area pickup */}
                    <div>
                      <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                        Area pickup <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-[#526359] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={areaPickup}
                          onChange={(e) => setAreaPickup(e.target.value)}
                          placeholder="Tebet, Jakarta Selatan"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-sm text-[#0d3527] bg-white transition-all shadow-2xs"
                        />
                      </div>
                      <p className="text-[11px] text-[#8a958e] mt-1.5">
                        Tuliskan area atau alamat singkat lokasi pengambilan.
                      </p>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────── */}
                  {/* SECTION 3: Informasi penanganan                     */}
                  {/* ─────────────────────────────────────────────────── */}
                  <div className="space-y-5 pt-3 border-t border-[#f0ede4]">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center font-bold text-sm shrink-0">
                        3
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-[#0d3527]">
                          Informasi penanganan
                        </h2>
                        <p className="text-xs text-[#526359] mt-0.5">
                          Bantu penerima memahami cara penanganan makanan ini.
                        </p>
                      </div>
                    </div>

                    {/* Cara penyimpanan & Alergen */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                          Cara penyimpanan <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={caraPenyimpanan}
                            onChange={(e) => setCaraPenyimpanan(e.target.value)}
                            className="w-full px-3.5 pr-8 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-xs sm:text-sm text-[#0d3527] bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                          >
                            <option value="Suhu ruang (dekat waktu konsumsi)">
                              Suhu ruang (dekat waktu konsumsi)
                            </option>
                            <option value="Simpan dingin (kulkas 4°C)">
                              Simpan dingin (kulkas 4°C)
                            </option>
                            <option value="Simpan beku (freezer)">
                              Simpan beku (freezer)
                            </option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#526359] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <p className="text-[11px] text-[#8a958e] mt-1.5">
                          Pilih cara penyimpanan yang sesuai.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0d3527] mb-1.5">
                          Alergen
                        </label>
                        <div className="relative">
                          <select
                            value={alergen}
                            onChange={(e) => setAlergen(e.target.value)}
                            className="w-full px-3.5 pr-8 py-2.5 rounded-xl border border-[#dfdbcf] focus:border-[#1c5c43] focus:ring-1 focus:ring-[#1c5c43] focus:outline-none text-xs sm:text-sm text-[#0d3527] bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                          >
                            <option value="Mengandung gluten (gandum)">
                              Mengandung gluten (gandum)
                            </option>
                            <option value="Mengandung kacang (tree nuts/peanuts)">
                              Mengandung kacang
                            </option>
                            <option value="Mengandung produk susu (dairy)">
                              Mengandung produk susu
                            </option>
                            <option value="Mengandung telur">Mengandung telur</option>
                            <option value="Bebas dari alergen utama">
                              Bebas dari alergen utama
                            </option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#526359] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <p className="text-[11px] text-[#8a958e] mt-1.5">
                          Pilih alergen utama jika ada.
                        </p>
                      </div>
                    </div>

                    {/* Checkboxes matching the green check design */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <div
                          onClick={() => setAgreeKnowledge(!agreeKnowledge)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                            agreeKnowledge
                              ? "bg-[#1c5c43] border-[#1c5c43] text-white"
                              : "border-[#dfdbcf] bg-white"
                          }`}
                        >
                          {agreeKnowledge && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[#0d3527] leading-tight">
                          Informasi diisi sesuai pengetahuan penyedia.{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <div
                          onClick={() => setAgreeSafety(!agreeSafety)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                            agreeSafety
                              ? "bg-[#1c5c43] border-[#1c5c43] text-white"
                              : "border-[#dfdbcf] bg-white"
                          }`}
                        >
                          {agreeSafety && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[#0d3527] leading-tight">
                          Saya memahami PANGANLOOP tidak mensertifikasi keamanan pangan.{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                    </div>

                    {/* Action buttons (Simpan draft & Lanjutkan ->) */}
                    <div className="pt-4 flex items-center justify-end gap-3.5">
                      <button
                        type="button"
                        onClick={handleSimpanDraft}
                        className="px-6 py-2.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] bg-white hover:bg-[#faf7ee] text-xs sm:text-sm font-semibold text-[#0d3527] transition-all cursor-pointer shadow-2xs"
                      >
                        Simpan draft
                      </button>

                      <button
                        type="submit"
                        className="px-6 sm:px-7 py-2.5 bg-[#1b5e43] hover:bg-[#144934] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                      >
                        <span>Lanjutkan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ── STEP 4: Konfirmasi Publikasi ───────────────────────────── */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-[#e4ddcc] p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="w-12 h-12 rounded-full bg-[#e8f5ec] text-[#1c6b4f] flex items-center justify-center mx-auto text-xl font-bold">
                <Check className="w-6 h-6 stroke-[3]" />
              </span>
              <h2 className="text-2xl font-extrabold text-[#0d3527]">
                Konfirmasi Publikasi Batch
              </h2>
              <p className="text-xs sm:text-sm text-[#526359]">
                Tinjau rincian surplus Anda sebelum ditampilkan ke publik dan komunitas penjemput.
              </p>
            </div>

            <div className="bg-[#faf8f2] rounded-xl p-5 border border-[#e8e2d5] space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f0ede4]">
                <span className="text-[#526359]">Nama Produk:</span>
                <span className="font-bold text-[#0d3527]">{namaMakanan}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f0ede4]">
                <span className="text-[#526359]">Tanggal Batch:</span>
                <span className="font-medium text-[#0d3527]">{tanggalBatch}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f0ede4]">
                <span className="text-[#526359]">Disiapkan / Terjual:</span>
                <span className="font-medium text-[#0d3527]">
                  {prepNum} unit / {soldNum} unit
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f0ede4]">
                <span className="text-[#1c6b4f] font-bold">Surplus Didonasikan:</span>
                <span className="text-lg font-extrabold text-[#1c6b4f]">
                  {surplusUnit} unit
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f0ede4]">
                <span className="text-[#526359]">Rescue Window:</span>
                <span className="font-medium text-[#0d3527]">
                  {mulaiTersedia} - {batasPengambilan} WIB
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f0ede4]">
                <span className="text-[#526359]">Area Pickup:</span>
                <span className="font-medium text-[#0d3527]">{areaPickup}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#f0ede4]">
                <span className="text-[#526359]">Penyimpanan:</span>
                <span className="font-medium text-[#0d3527]">{caraPenyimpanan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#526359]">Alergen:</span>
                <span className="font-medium text-[#0d3527]">{alergen}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-[#dfdbcf] hover:border-[#1c5c43] text-xs sm:text-sm font-semibold text-[#0d3527] cursor-pointer"
              >
                ← Kembali Edit
              </button>
              <button
                type="button"
                onClick={handlePublikasikan}
                className="px-6 py-2.5 bg-[#1b5e43] hover:bg-[#144934] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Publikasikan Sekarang
              </button>
            </div>
          </div>
        )}
      </main>

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
