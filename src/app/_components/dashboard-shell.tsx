"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Boxes,
  ChartNoAxesColumn,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  RotateCcw,
  ShieldCheck,
  Sprout,
  Store,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  DEMO_LOGIN_ACCOUNTS,
  roleLabel,
  usePanganloop,
  type Role,
} from "./store";
import { Button, Modal, Spinner } from "./ui-kit";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV: Record<Role, NavItem[]> = {
  donor: [
    { id: "ringkasan", label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { id: "batch", label: "Batch saya", href: "/batch", icon: Boxes },
    { id: "catat", label: "Catat batch", href: "/batch/baru", icon: PackagePlus },
    { id: "reservasi", label: "Reservasi masuk", href: "/reservasi", icon: ClipboardList },
    { id: "insight", label: "Insight", href: "/insight", icon: ChartNoAxesColumn },
    { id: "profil", label: "Profil", href: "/profil", icon: UserRound },
  ],
  recipient: [
    { id: "ringkasan", label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { id: "surplus", label: "Jelajahi surplus", href: "/surplus", icon: Store },
    { id: "reservasi-saya", label: "Reservasi saya", href: "/reservasi/saya", icon: ClipboardList },
    { id: "profil", label: "Profil", href: "/profil", icon: UserRound },
  ],
  admin: [
    { id: "ringkasan", label: "Ringkasan", href: "/admin", icon: LayoutDashboard },
    { id: "organisasi", label: "Organisasi", href: "/admin?tab=organisasi", icon: UsersRound },
    { id: "listing", label: "Listing", href: "/admin?tab=listing", icon: Boxes },
    { id: "audit", label: "Jejak audit", href: "/admin?tab=audit", icon: ShieldCheck },
    { id: "profil", label: "Profil", href: "/profil", icon: UserRound },
  ],
};

export function DashboardShell({
  role,
  active,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  role: Role;
  active: string;
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const { ready, user, logout, resetDemo, quickLogin } = usePanganloop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const nav = useMemo(() => NAV[role], [role]);

  if (!ready) return <Spinner />;

  if (!user) {
    return (
      <AuthPrompt
        onQuickLogin={(email) => {
          const result = quickLogin(email);
          if (!result.ok) setResetNotice(result.error);
        }}
        notice={resetNotice}
      />
    );
  }

  if (user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#0d35271a] bg-[#fffdf8] p-7 text-center shadow-xl">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fdf6e5] text-[#7a5410]">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-semibold">Area khusus {roleLabel(role)}</h1>
          <p className="mt-2 text-sm text-[#5e6f64]">
            Anda masuk sebagai <strong>{roleLabel(user.role)}</strong>. Buka dashboard yang sesuai
            dengan peran akun Anda.
          </p>
          <Link
            href={user.role === "admin" ? "/admin" : "/dashboard"}
            className="mt-5 inline-flex rounded-full bg-[#155c43] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Buka dashboard saya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6ea] text-[#0d3527]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[#0d35271a] bg-[#fffdf8] lg:flex lg:flex-col">
          <div className="border-b border-[#0d352714] px-5 py-5">
            <Link href="/" aria-label="PANGANLOOP — beranda">
              <Image
                src="/assets/panganloop-logo.png"
                alt="PANGANLOOP"
                width={2172}
                height={724}
                className="h-auto w-40"
              />
            </Link>
          </div>

          <div className="px-5 py-4">
            <div className="rounded-2xl bg-[#e6ecdd] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#155c43]">
                Masuk sebagai
              </p>
              <div className="mt-1 flex items-center gap-2">
                <BadgeCheck className="size-4 shrink-0 text-[#155c43]" />
                <p className="truncate text-sm font-semibold">{user.name}</p>
              </div>
              <p className="mt-1 text-xs text-[#40564b]">{roleLabel(user.role)}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3" aria-label="Navigasi dashboard">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#155c43] text-white"
                      : "text-[#40564b] hover:bg-[#0d35270a] hover:text-[#0d3527]"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-[#0d352714] p-4">
            <div className="rounded-xl border border-[#efd9a6] bg-[#fdf6e5] p-3 text-[11px] leading-relaxed text-[#7a5410]">
              <strong className="block uppercase tracking-wide">Mode demo</strong>
              Data tersimpan di browser ini. Reset untuk kembali ke data contoh.
            </div>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#5e6f64] hover:bg-[#0d35270a]"
            >
              <RotateCcw className="size-4" /> Reset data demo
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#5e6f64] hover:bg-[#0d35270a]"
            >
              <LogOut className="size-4" /> Keluar
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#0d352714] bg-[#faf6ea]/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/" className="flex items-center gap-2" aria-label="PANGANLOOP — beranda">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#155c43] text-white">
                <Sprout className="size-4" />
              </span>
              <span className="font-display text-sm font-bold tracking-wide">PANGANLOOP</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-full border border-[#0d352726] p-2"
              aria-label="Buka navigasi"
            >
              <Menu className="size-5" />
            </button>
          </header>

          {user.status === "pending" ? (
            <div className="border-b border-[#efd9a6] bg-[#fdf6e5] px-4 py-3 text-sm text-[#7a5410] sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-6xl items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  Akun <strong>{user.name}</strong> masih menunggu verifikasi admin. Anda dapat
                  melihat data, tetapi belum bisa membuat batch atau mengajukan reservasi.
                </p>
              </div>
            </div>
          ) : null}

          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c6b4f]">
                {eyebrow}
              </p>
              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
                  {description ? (
                    <p className="mt-1 max-w-2xl text-sm text-[#5e6f64]">{description}</p>
                  ) : null}
                </div>
                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0d352759]"
            aria-label="Tutup navigasi"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col bg-[#fffdf8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#0d352714] px-4 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#155c43]">
                  {roleLabel(user.role)}
                </p>
                <p className="max-w-[190px] truncate text-sm font-semibold">{user.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 hover:bg-[#0d35270a]"
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navigasi seluler">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === active;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      isActive ? "bg-[#155c43] text-white" : "text-[#40564b]"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="space-y-2 border-t border-[#0d352714] p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  setResetOpen(true);
                }}
              >
                <RotateCcw className="size-4" /> Reset data demo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                <LogOut className="size-4" /> Keluar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={resetOpen}
        title="Reset data demo?"
        description="Seluruh batch, reservasi, dan perubahan lain di browser ini akan diganti dengan data contoh awal."
        onClose={() => setResetOpen(false)}
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setResetOpen(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetDemo();
              setResetOpen(false);
            }}
          >
            <RotateCcw className="size-4" /> Reset sekarang
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function AuthPrompt({
  onQuickLogin,
  notice,
}: {
  onQuickLogin: (email: string) => void;
  notice: string | null;
}) {
  return (
    <div className="min-h-screen bg-[#faf6ea] px-4 py-10 text-[#0d3527] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-block">
          <Image
            src="/assets/panganloop-logo.png"
            alt="PANGANLOOP"
            width={2172}
            height={724}
            className="h-auto w-44"
          />
        </Link>

        <div className="mt-10 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c6b4f]">
            Akses demo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Masuk untuk membuka dashboard peran Anda
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#5e6f64]">
            Pilih salah satu akun demo di bawah. Setiap tab browser dapat memakai peran berbeda,
            sehingga donor dan penerima bisa dicoba bersamaan.
          </p>
        </div>

        {notice ? (
          <p className="mt-5 rounded-xl border border-[#f0c5bc] bg-[#fdf0ed] px-4 py-3 text-sm text-[#9b2c1a]">
            {notice}
          </p>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {DEMO_LOGIN_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => onQuickLogin(account.email)}
              className="group rounded-2xl border border-[#0d35271a] bg-[#fffdf8] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#1c6b4f] hover:shadow-lg"
            >
              <span className="inline-flex rounded-full bg-[#e6ecdd] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#155c43]">
                {account.label}
              </span>
              <span className="mt-3 block font-display text-base font-semibold">
                {account.name}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#5e6f64]">
                {account.description}
              </span>
              <span className="mt-3 block truncate text-[11px] text-[#1c6b4f]">
                {account.email}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-full bg-[#155c43] px-5 py-2.5 font-semibold text-white"
          >
            Buka halaman masuk
          </Link>
          <Link href="/register" className="font-semibold text-[#155c43] underline underline-offset-4">
            Daftar organisasi baru
          </Link>
          <Link href="/surplus" className="text-[#5e6f64] underline underline-offset-4">
            Lihat surplus publik
          </Link>
        </div>

        <p className="mt-8 text-xs text-[#5e6f64]">
          Mode demo: data disimpan hanya di browser ini dan tidak dikirim ke server.
        </p>
      </div>
    </div>
  );
}
