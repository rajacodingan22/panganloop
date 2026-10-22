"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useAuth } from "../_components/auth-context";

type Mode = "login" | "register";

export function LoginView() {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states: pre-filled with demo account for instant 1-click login
  const [email, setEmail] = useState("dapurpagi@panganloop.id");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"donor" | "recipient">("donor");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedbackType("error");
      setFeedbackMessage("Silakan masukkan alamat email dan kata sandi.");
      return;
    }

    startTransition(async () => {
      login(email, "donor");
      await new Promise((resolve) => setTimeout(resolve, 600));
      setFeedbackType("success");
      setFeedbackMessage(
        `Selamat datang kembali! Masuk sebagai ${email}. Mengarahkan ke dasbor...`
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setFeedbackType("error");
      setFeedbackMessage("Lengkapi seluruh informasi pendaftaran.");
      return;
    }

    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setFeedbackType("success");
      setFeedbackMessage(
        `Pendaftaran akun ${accountType === "donor" ? "Penyedia" : "Penerima"} untuk ${name} berhasil!`
      );
      setTimeout(() => {
        setMode("login");
      }, 1200);
    });
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotOpen(false);
    setFeedbackType("success");
    setFeedbackMessage(
      `Tautan pemulihan kata sandi telah dikirim ke ${forgotEmail}. Silakan periksa kotak masuk Anda.`
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#faf6ea] text-[#0d3527] font-sans antialiased selection:bg-[#f0aa3e]/30 selection:text-[#0d3527]">
      {/* ────────────────────────────────────────────────────────── */}
      {/* LEFT COLUMN: AUTHENTICATION FORM                           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[48%] xl:w-[46%] min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-14 xl:px-16 py-8 sm:py-10 bg-[radial-gradient(900px_640px_at_96%_-6%,rgba(246,214,150,0.35),transparent_62%),radial-gradient(820px_560px_at_-8%_102%,rgba(197,214,190,0.3),transparent_64%),#faf6ea]">
        {/* Top Header: Landing Page Logo */}
        <header className="w-full max-w-[430px] mx-auto flex items-center justify-start">
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
              className="w-[185px] sm:w-[210px] h-auto mix-blend-multiply"
            />
          </Link>
        </header>

        {/* Center Card Content */}
        <div className="w-full max-w-[430px] mx-auto my-auto py-6 sm:py-8">
          {/* Notification banner */}
          <AnimatePresence>
            {feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 border ${
                  feedbackType === "success"
                    ? "bg-[#eaf4ec] border-[#b8dec0] text-[#155c43]"
                    : "bg-[#fdf0ed] border-[#f4c2b9] text-[#9b2c1a]"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {feedbackType === "success" ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 font-medium">{feedbackMessage}</div>
                <button
                  type="button"
                  onClick={() => setFeedbackMessage(null)}
                  className="text-current opacity-70 hover:opacity-100 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" ? (
            /* ─── LOGIN FORM ─────────────────────────────────── */
            <div>
              <div className="mb-7">
                <h1 className="text-3xl sm:text-[34px] font-extrabold tracking-tight text-[#0d3527] leading-tight">
                  Masuk ke PANGANLOOP
                </h1>
                <p className="mt-2 text-sm sm:text-[15px] text-[#526359]">
                  Kelola surplus, pickup, dan outcome batch.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                {/* Pilihan Akun Demo Siap Pakai */}
                <div className="p-3.5 rounded-2xl bg-[#f4efe3] border border-[#e4ddcc]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#526359] mb-2 flex items-center justify-between">
                    <span>Pilih Akun Demo:</span>
                    <span className="text-[10px] text-[#1c6b4f] font-semibold">1-Klik Isi Otomatis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("dapurpagi@panganloop.id");
                        setPassword("password123");
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        email === "dapurpagi@panganloop.id"
                          ? "bg-[#1c5c43] text-white border-[#1c5c43] font-bold shadow-sm"
                          : "bg-white text-[#0d3527] border-[#d8d0bf] hover:bg-white/80"
                      }`}
                    >
                      <div className="font-bold leading-tight">Dapur Pagi</div>
                      <div className={`text-[10px] ${email === "dapurpagi@panganloop.id" ? "text-[#c2dfd3]" : "text-[#5e6f64]"}`}>
                        Donor (Restoran/Bakery)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail("opower5431@gmail.com");
                        setPassword("password123");
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        email === "opower5431@gmail.com"
                          ? "bg-[#1c5c43] text-white border-[#1c5c43] font-bold shadow-sm"
                          : "bg-white text-[#0d3527] border-[#d8d0bf] hover:bg-white/80"
                      }`}
                    >
                      <div className="font-bold leading-tight">Akun Anda</div>
                      <div className={`text-[10px] ${email === "opower5431@gmail.com" ? "text-[#c2dfd3]" : "text-[#5e6f64]"}`}>
                        opower5431@gmail.com
                      </div>
                    </button>
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-semibold text-[#0d3527] mb-2"
                  >
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#8a958e] pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@contoh.com"
                      className="w-full bg-[#fdfdfc]/90 border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl pl-10 pr-4 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-[#1c6b4f]/25 focus:border-[#1c6b4f] transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-semibold text-[#0d3527] mb-2"
                  >
                    Kata sandi
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#8a958e] pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full bg-[#fdfdfc]/90 border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl pl-10 pr-11 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-[#1c6b4f]/25 focus:border-[#1c6b4f] transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#8a958e] hover:text-[#0d3527] transition-colors p-1"
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        rememberMe
                          ? "bg-[#0f3d2e] text-white"
                          : "border border-[#8a9890] bg-white"
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="font-medium text-[#0d3527] text-sm">
                      Ingat saya
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotOpen(true);
                    }}
                    className="font-medium text-sm text-[#1b6b4e] hover:text-[#0b3f2d] hover:underline"
                  >
                    Lupa kata sandi?
                  </button>
                </div>

                {/* Submit button: Warm golden caramel matching #c5852c in screenshot */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 bg-[#c5852c] hover:bg-[#b27622] active:scale-[0.99] text-white font-semibold text-base py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isPending ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 sm:my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#dfdbcf]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#faf6ea] px-3.5 text-[#75837a] font-normal">
                    atau
                  </span>
                </div>
              </div>

              {/* Secondary button: Outline with dark green border */}
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl border-[1.5px] border-[#134f3a] bg-transparent hover:bg-[#134f3a]/5 text-[#134f3a] font-semibold text-sm transition-all shadow-sm cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#134f3a]" />
                <span>Daftar sebagai pengelola atau penerima</span>
              </Link>
            </div>
          ) : (
            /* ─── REGISTER FORM ──────────────────────────────── */
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#0d3527] leading-tight">
                  Daftar Akun Baru
                </h1>
                <p className="mt-1.5 text-sm text-[#526359]">
                  Bergabung dalam jejaring penyelamatan pangan PANGANLOOP.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Account Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#0d3527] uppercase tracking-wider mb-2">
                    Peran Anda
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType("donor")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        accountType === "donor"
                          ? "border-[#155c43] bg-white ring-2 ring-[#155c43]/20 shadow-sm"
                          : "border-[#dfdbcf] bg-white/40 hover:bg-white"
                      }`}
                    >
                      <Store
                        className={`w-5 h-5 mb-1.5 ${
                          accountType === "donor" ? "text-[#155c43]" : "text-[#5e6f64]"
                        }`}
                      />
                      <div className="font-semibold text-sm text-[#0d3527]">
                        Penyedia Pangan
                      </div>
                      <div className="text-[11px] text-[#5e6f64] leading-tight mt-0.5">
                        Restoran, bakery, katering
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("recipient")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        accountType === "recipient"
                          ? "border-[#155c43] bg-white ring-2 ring-[#155c43]/20 shadow-sm"
                          : "border-[#dfdbcf] bg-white/40 hover:bg-white"
                      }`}
                    >
                      <UserPlus
                        className={`w-5 h-5 mb-1.5 ${
                          accountType === "recipient"
                            ? "text-[#155c43]"
                            : "text-[#5e6f64]"
                        }`}
                      />
                      <div className="font-semibold text-sm text-[#0d3527]">
                        Komunitas Penerima
                      </div>
                      <div className="text-[11px] text-[#5e6f64] leading-tight mt-0.5">
                        Panti, relawan, dapur umum
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block text-sm font-semibold text-[#0d3527] mb-1.5"
                  >
                    {accountType === "donor"
                      ? "Nama Toko / Bisnis"
                      : "Nama Organisasi / Komunitas"}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#8a958e] pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        accountType === "donor"
                          ? "Contoh: Bakery Suka Rasa"
                          : "Contoh: Dapur Komunitas Peduli"
                      }
                      className="w-full bg-[#fdfdfc]/90 border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c6b4f]/25 focus:border-[#1c6b4f] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-sm font-semibold text-[#0d3527] mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#8a958e] pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kontak@organisasi.id"
                      className="w-full bg-[#fdfdfc]/90 border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c6b4f]/25 focus:border-[#1c6b4f] transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-sm font-semibold text-[#0d3527] mb-1.5"
                  >
                    Kata sandi baru
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#8a958e] pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full bg-[#fdfdfc]/90 border border-[#dfdbcf] text-[#0d3527] placeholder-[#9aa59e] text-sm rounded-xl pl-10 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c6b4f]/25 focus:border-[#1c6b4f] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#8a958e] hover:text-[#0d3527] p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 bg-[#134f3a] hover:bg-[#0e3b2b] text-white font-semibold text-sm py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs sm:text-sm font-semibold text-[#1b6b4e] hover:underline cursor-pointer"
                  >
                    Sudah memiliki akun? Masuk di sini
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Left Bottom Tagline */}
        <footer className="w-full max-w-[430px] mx-auto pt-4 flex items-center gap-2 text-xs sm:text-[13px] text-[#526359]">
          <Leaf className="w-4 h-4 text-[#1c6b4f] shrink-0" />
          <span>Lebih sedikit terbuang. Lebih banyak manfaat.</span>
        </footer>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* RIGHT COLUMN: FULL GRAPHIC IMAGE BANNER                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[52%] xl:w-[54%] bg-[#133c2a] relative overflow-hidden flex flex-col justify-center min-h-[560px] lg:min-h-screen">
        <div className="relative w-full h-full min-h-[560px] lg:min-h-screen">
          <Image
            src="/assets/login-banner-right-hd.png"
            alt="PANGANLOOP — Surplus hari ini, manfaat hari ini. Menghubungkan kelebihan pangan dengan mereka yang membutuhkan."
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* FORGOT PASSWORD MODAL                                      */}
      {/* ────────────────────────────────────────────────────────── */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#faf6ea] w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#ded5c2] text-[#0d3527] relative">
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="absolute top-5 right-5 text-[#5e6f64] hover:text-[#0d3527] p-1 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#155c43]/10 text-[#155c43] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold tracking-tight">
              Atur Ulang Kata Sandi
            </h3>
            <p className="text-xs sm:text-sm text-[#5e6f64] mt-1.5 leading-relaxed">
              Masukkan email akun Anda. Kami akan mengirimkan instruksi pengaturan
              kata sandi baru.
            </p>

            <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="forgot-input-email"
                  className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                >
                  Email
                </label>
                <input
                  id="forgot-input-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@contoh.com"
                  className="w-full bg-white border border-[#d6cfbe] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1c6b4f]/30 focus:border-[#1c6b4f]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#d8d0bf] text-xs sm:text-sm font-semibold hover:bg-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#155c43] hover:bg-[#0f4a36] text-white text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Kirim Instruksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
