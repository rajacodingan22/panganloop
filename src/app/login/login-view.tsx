"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { DEMO_LOGIN_ACCOUNTS, roleLabel, usePanganloop } from "../_components/store";
import { Button, Field, Input, Notice, Spinner } from "../_components/ui-kit";

function destinationForRole(role: "donor" | "recipient" | "admin") {
  return role === "admin" ? "/admin" : "/dashboard";
}

export function LoginView() {
  const router = useRouter();
  const { ready, user, login, quickLogin } = usePanganloop();
  const [email, setEmail] = useState("rotipagi@panganloop.id");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPending(true);
    const account = DEMO_LOGIN_ACCOUNTS.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
    );
    router.replace(account ? destinationForRole(account.role) : "/dashboard");
  };

  if (!ready) return <Spinner />;

  return (
    <div className="flex min-h-screen flex-col bg-[#faf6ea] text-[#0d3527] lg:flex-row">
      <div className="flex min-h-screen w-full flex-col justify-between bg-[radial-gradient(900px_640px_at_96%_-6%,rgba(246,214,150,0.35),transparent_62%),radial-gradient(820px_560px_at_-8%_102%,rgba(197,214,190,0.3),transparent_64%),#faf6ea] px-5 py-8 sm:px-10 lg:w-[48%] lg:px-14">
        <header>
          <Link href="/" aria-label="PANGANLOOP — beranda">
            <Image
              src="/assets/panganloop-logo.png"
              alt="PANGANLOOP"
              width={2172}
              height={724}
              priority
              className="h-auto w-44 mix-blend-multiply sm:w-52"
            />
          </Link>
        </header>

        <div className="mx-auto my-auto w-full max-w-[430px] py-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c6b4f]">
            Akses akun
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Masuk ke PANGANLOOP
          </h1>
          <p className="mt-2 text-sm text-[#526359]">
            Kelola surplus, pickup, dan outcome batch sesuai peran Anda.
          </p>

          {user ? (
            <div className="mt-5">
              <Notice tone="success">
                Anda sudah masuk sebagai <strong>{user.name}</strong> ({roleLabel(user.role)}).{" "}
                <Link href={destinationForRole(user.role)} className="font-semibold underline">
                  Buka dashboard
                </Link>
                .
              </Notice>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5">
              <Notice tone="error">{error}</Notice>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@organisasi.id"
                  className="pl-10"
                />
              </div>
            </Field>
            <Field label="Kata sandi">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#8a958e] hover:text-[#0d3527]"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Mengarahkan..." : "Masuk"}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-[#e4ddcc] bg-[#f4efe3] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#526359]">
                Akun demo
              </p>
              <span className="text-[10px] font-semibold text-[#1c6b4f]">1 klik masuk</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {DEMO_LOGIN_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setError(null);
                    const result = quickLogin(account.email);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    router.replace(destinationForRole(account.role));
                  }}
                  className="rounded-xl border border-[#d8d0bf] bg-white p-2.5 text-left text-xs transition hover:border-[#155c43] hover:shadow-sm"
                >
                  <span className="block font-bold leading-tight">{account.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-tight text-[#5e6f64]">
                    {account.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-[#5e6f64]">
              Semua akun demo memakai kata sandi <code>password123</code>. Data hanya tersimpan di
              browser ini.
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#dfdbcf]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#faf6ea] px-3 text-[#75837a]">atau</span>
            </div>
          </div>

          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#134f3a] px-5 py-3 text-sm font-semibold text-[#134f3a] transition hover:bg-[#134f3a]/5"
          >
            <Users className="size-4" /> Daftar sebagai donor atau penerima
          </Link>
        </div>

        <footer className="mx-auto flex w-full max-w-[430px] items-center gap-2 text-xs text-[#526359]">
          <Leaf className="size-4 shrink-0 text-[#1c6b4f]" />
          Lebih sedikit terbuang. Lebih banyak manfaat.
        </footer>
      </div>

      <div className="relative min-h-[300px] w-full overflow-hidden bg-[#133c2a] lg:min-h-screen lg:w-[52%]">
        <Image
          src="/assets/login-banner-right-hd.png"
          alt="PANGANLOOP menghubungkan kelebihan pangan dengan komunitas yang membutuhkan."
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 52vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b2b20]/90 to-transparent p-6 pt-20 sm:p-8">
          <div className="flex items-start gap-3 text-white">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#f0aa3e]" />
            <div>
              <p className="font-display text-lg font-semibold">Satu alur untuk tiga peran</p>
              <p className="mt-1 max-w-md text-sm text-white/80">
                Donor mencatat surplus, penerima mengklaim dengan kode pickup, admin menjaga
                verifikasi organisasi dan listing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <ShieldCheck /> Mode demo PANGANLOOP
      </div>
    </div>
  );
}
