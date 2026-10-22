"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type RoleType = "business" | "recipient";

export function RegisterView() {
  const router = useRouter();
  const [role, setRole] = useState<RoleType>("business");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !orgName || !email || !password) {
      setFeedbackType("error");
      setFeedbackMessage("Silakan lengkapi semua data pendaftaran.");
      return;
    }

    if (!agreed) {
      setFeedbackType("error");
      setFeedbackMessage(
        "Harap centang persetujuan informasi pangan untuk melanjutkan."
      );
      return;
    }

    startTransition(async () => {
      // Simulate registration
      await new Promise((resolve) => setTimeout(resolve, 900));
      setFeedbackType("success");
      setFeedbackMessage(
        `Akun ${
          role === "business" ? "Pengelola Usaha" : "Organisasi Penerima"
        } untuk ${fullName} (${orgName}) berhasil didaftarkan! Mengarahkan ke dasbor...`
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    });
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(900px_640px_at_96%_-6%,rgba(246,214,150,0.35),transparent_62%),radial-gradient(820px_560px_at_-8%_102%,rgba(197,214,190,0.3),transparent_64%),#faf6ea] text-[#0d3527] font-sans antialiased selection:bg-[#f0aa3e]/30 selection:text-[#0d3527]">
      {/* ────────────────────────────────────────────────────────── */}
      {/* TOP HEADER: BRAND LOGO + MASUK LINK                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <header className="w-full border-b border-[#0d3527]/8 bg-[#faf6ea]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="brand inline-flex transition-opacity hover:opacity-90"
            aria-label="PANGANLOOP — Kembali ke Beranda"
          >
            <Image
              src="/assets/panganloop-logo.png"
              alt="PANGANLOOP — Lebih Banyak Manfaat. Lebih Sedikit Terbuang."
              width={2172}
              height={724}
              priority
              className="w-[185px] sm:w-[205px] h-auto mix-blend-multiply"
            />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs sm:text-sm text-[#526359]">
              Sudah punya akun?
            </span>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-[#0d3527]/25 hover:border-[#0d3527]/60 text-xs sm:text-sm font-semibold text-[#0d3527] bg-[#fffdf8]/60 hover:bg-[#fffdf8] transition-all"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER: 3-COLUMN LAYOUT                            */}
      {/* ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-8 sm:py-12 lg:py-14">
        {/* Feedback notification toast */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`max-w-xl mx-auto mb-8 p-4 rounded-2xl text-sm flex items-start gap-3 border shadow-sm ${
                feedbackType === "success"
                  ? "bg-[#eaf4ec] border-[#b8dec0] text-[#155c43]"
                  : "bg-[#fdf0ed] border-[#f4c2b9] text-[#9b2c1a]"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {feedbackType === "success" ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 font-medium">{feedbackMessage}</div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="text-current opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 1 (LEFT): HEADLINE + CRATE ILLUSTRATION           */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-between self-stretch pt-2">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold text-[#0d3527] leading-[1.12] tracking-tight">
                Pangan
                <br />
                Tidak Harus
                <br />
                Terbuang
              </h1>

              <p className="mt-4 text-sm sm:text-base text-[#40564b] leading-relaxed max-w-sm">
                Bersama PANGANLOOP, kita hubungkan kelebihan pangan dengan mereka
                yang membutuhkan.
              </p>
            </div>

            {/* Bottom Crate with fresh vegetables matching screenshot */}
            <div className="mt-8 lg:mt-16 xl:mt-24 relative w-full max-w-[270px] sm:max-w-[300px]">
              <div className="relative aspect-[780/834] w-full">
                <Image
                  src="/assets/crate-vegetables-hd.png"
                  alt="Pangan Lebih Bermakna Untuk Semua — Kotak kayu berisi sayuran segar"
                  fill
                  priority
                  className="object-contain object-bottom-left mix-blend-multiply"
                />
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 2 (CENTER): REGISTRATION FORM CARD                */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-[0_12px_40px_-16px_rgba(13,53,39,0.12)] border border-[#e8e2d4]">
              {/* Form Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-[30px] font-extrabold text-[#0d3527] tracking-tight">
                  Buat akun
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#526359] leading-relaxed">
                  Bergabunglah dengan PANGANLOOP dan jadi bagian dari solusi untuk
                  sistem pangan yang lebih berkelanjutan.
                </p>
              </div>

              {/* Role Selector Tabs (Pengelola usaha vs Organisasi penerima) */}
              <div className="bg-[#f5f1e7] p-1.5 rounded-2xl border border-[#e2dccd] grid grid-cols-2 gap-1.5 mb-6">
                <button
                  type="button"
                  onClick={() => setRole("business")}
                  className={`p-3 rounded-xl flex items-start gap-2.5 text-left transition-all cursor-pointer ${
                    role === "business"
                      ? "bg-[#1c5c43] text-white shadow-sm"
                      : "text-[#0d3527] hover:bg-white/60"
                  }`}
                >
                  <Store
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      role === "business" ? "text-white" : "text-[#1c5c43]"
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm leading-tight">
                      Pengelola usaha
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 ${
                        role === "business" ? "text-[#c2dfd3]" : "text-[#5e6f64]"
                      }`}
                    >
                      Restoran, toko, hotel, dll.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("recipient")}
                  className={`p-3 rounded-xl flex items-start gap-2.5 text-left transition-all cursor-pointer ${
                    role === "recipient"
                      ? "bg-[#1c5c43] text-white shadow-sm"
                      : "text-[#0d3527] hover:bg-white/60"
                  }`}
                >
                  <Users
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      role === "recipient" ? "text-white" : "text-[#1c5c43]"
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm leading-tight">
                      Organisasi penerima
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 ${
                        role === "recipient" ? "text-[#c2dfd3]" : "text-[#5e6f64]"
                      }`}
                    >
                      Bank pangan, yayasan, dll.
                    </div>
                  </div>
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama lengkap */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs sm:text-sm font-semibold text-[#0d3527] mb-1.5"
                  >
                    Nama lengkap
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-[#fdfdfc] border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/25 focus:border-[#1c5c43] transition-all"
                  />
                </div>

                {/* Nama organisasi */}
                <div>
                  <label
                    htmlFor="orgName"
                    className="block text-xs sm:text-sm font-semibold text-[#0d3527] mb-1.5"
                  >
                    Nama organisasi
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={
                      role === "business"
                        ? "Contoh: Toko Segar Abadi"
                        : "Contoh: Yayasan Peduli Sesama"
                    }
                    className="w-full bg-[#fdfdfc] border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/25 focus:border-[#1c5c43] transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-semibold text-[#0d3527] mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    className="w-full bg-[#fdfdfc] border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/25 focus:border-[#1c5c43] transition-all"
                  />
                </div>

                {/* Kata sandi */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-semibold text-[#0d3527] mb-1.5"
                  >
                    Kata sandi
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full bg-[#fdfdfc] border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c5c43]/25 focus:border-[#1c5c43] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#8a958e] hover:text-[#0d3527] p-1 cursor-pointer"
                      aria-label={
                        showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="pt-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        agreed
                          ? "bg-[#1c5c43] text-white"
                          : "border border-[#8a9890] bg-white"
                      }`}
                    >
                      {agreed && (
                        <svg
                          viewBox="0 0 14 14"
                          fill="none"
                          className="w-3 h-3 stroke-white stroke-[2.5]"
                        >
                          <path d="M2.5 7L5.5 10L11.5 4" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs sm:text-[13px] text-[#40564b] leading-relaxed">
                      Saya memahami bahwa informasi pangan diisi oleh penyedia
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-3 bg-[#1c5c43] hover:bg-[#154a36] active:scale-[0.99] text-white font-semibold text-sm sm:text-base py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isPending ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Buat akun</span>
                  )}
                </button>
              </form>

              {/* Bottom text */}
              <div className="mt-6 text-center text-xs sm:text-sm text-[#526359]">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#1c5c43] hover:underline"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 3 (RIGHT): "LANGKAH SELANJUTNYA" CARD             */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-between self-stretch">
            <div className="bg-[#f5efe4] rounded-3xl p-6 sm:p-8 border border-[#e6decf]">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0d3527] tracking-tight">
                Langkah selanjutnya
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#526359] leading-relaxed mb-7">
                Proses pendaftaran mudah dan cepat. Ikuti 3 langkah berikut:
              </p>

              {/* Stepper with connector line */}
              <div className="space-y-6 relative">
                {/* Step 1 */}
                <div className="flex items-start gap-3.5 relative">
                  <div className="w-8 h-8 rounded-full bg-[#1c5c43] text-white font-bold text-sm flex items-center justify-center shrink-0 z-10 shadow-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-[15px] text-[#0d3527]">
                      Lengkapi profil
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#526359] mt-0.5 leading-relaxed">
                      Isi informasi diri dan organisasi Anda dengan lengkap.
                    </p>
                  </div>
                  {/* Dashed connector down */}
                  <div className="absolute left-4 top-8 w-[1px] h-9 border-l border-dashed border-[#8ba596]" />
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5 relative">
                  <div className="w-8 h-8 rounded-full bg-[#1c5c43] text-white font-bold text-sm flex items-center justify-center shrink-0 z-10 shadow-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-[15px] text-[#0d3527]">
                      Tunggu persetujuan organisasi
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#526359] mt-0.5 leading-relaxed">
                      Tim kami akan meninjau data Anda untuk memastikan keamanan
                      dan kualitas platform.
                    </p>
                  </div>
                  {/* Dashed connector down */}
                  <div className="absolute left-4 top-8 w-[1px] h-9 border-l border-dashed border-[#8ba596]" />
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5 relative">
                  <div className="w-8 h-8 rounded-full bg-[#1c5c43] text-white font-bold text-sm flex items-center justify-center shrink-0 z-10 shadow-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-[15px] text-[#0d3527]">
                      Mulai catat atau klaim surplus
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#526359] mt-0.5 leading-relaxed">
                      Setelah disetujui, Anda dapat mulai mencatat pangan berlebih
                      atau melakukan reservasi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Yellow Alert Box */}
              <div className="mt-8 bg-[#fbeece]/90 border border-[#f0d8a8] rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#c2842e] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-[13px] text-[#714d18] leading-relaxed font-medium">
                  Organisasi penerima perlu disetujui sebelum membuat reservasi.
                </p>
              </div>
            </div>

            {/* Bottom sprout note */}
            <div className="mt-8 pt-2 flex items-center gap-3">
              <div className="relative w-7 h-9 shrink-0">
                <Image
                  src="/assets/sprout-icon-transparent.png"
                  alt="Bibit tanaman"
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </div>
              <p className="text-xs sm:text-[13px] text-[#526359] leading-tight">
                Pangan hari ini,
                <br />
                masa depan yang lebih baik esok hari.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
