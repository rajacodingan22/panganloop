"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { usePanganloop } from "../_components/store";
import { Button, Field, Input, Notice, Spinner, Textarea } from "../_components/ui-kit";

type RoleInput = "donor" | "recipient";

export function RegisterView() {
  const router = useRouter();
  const { ready, register } = usePanganloop();
  const [role, setRole] = useState<RoleInput>("donor");
  const [form, setForm] = useState({
    name: "",
    pic: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    area: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!agreed) {
      setError("Centang pernyataan bahwa informasi yang diisi benar dan makanan aman.");
      return;
    }
    setSubmitting(true);
    const result = register({ role, ...form });
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.replace("/dashboard");
  };

  if (!ready) return <Spinner />;

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_640px_at_96%_-6%,rgba(246,214,150,0.35),transparent_62%),radial-gradient(820px_560px_at_-8%_102%,rgba(197,214,190,0.3),transparent_64%),#faf6ea] text-[#0d3527]">
      <header className="sticky top-0 z-30 border-b border-[#0d35270f] bg-[#faf6ea]/85 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
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
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#526359] sm:inline">Sudah punya akun?</span>
            <Link
              href="/login"
              className="rounded-xl border border-[#0d35273d] bg-[#fffdf8]/70 px-4 py-2 text-sm font-semibold transition hover:bg-[#fffdf8]"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c6b4f]">
            Pendaftaran organisasi
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Bergabung dalam jejaring penyelamatan pangan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#526359]">
            Akun baru berstatus menunggu verifikasi admin. Anda dapat masuk dan melihat data,
            tetapi belum bisa membuat batch atau mengajukan pickup sampai disetujui.
          </p>

          {error ? (
            <div className="mt-5">
              <Notice tone="error">{error}</Notice>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="rounded-2xl border border-[#0d35271a] bg-[#fffdf8] p-5">
              <h2 className="font-display text-lg font-semibold">Peran organisasi</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole("donor")}
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "donor"
                      ? "border-[#155c43] bg-[#eef6f1] ring-2 ring-[#155c43]/15"
                      : "border-[#dfdbcf] bg-white hover:border-[#155c43]/50"
                  }`}
                >
                  <Store className="size-5 text-[#155c43]" />
                  <span className="mt-2 block text-sm font-semibold">Donor / penyedia pangan</span>
                  <span className="mt-0.5 block text-xs text-[#5e6f64]">
                    Restoran, bakery, katering, toko makanan.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recipient")}
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "recipient"
                      ? "border-[#155c43] bg-[#eef6f1] ring-2 ring-[#155c43]/15"
                      : "border-[#dfdbcf] bg-white hover:border-[#155c43]/50"
                  }`}
                >
                  <Users className="size-5 text-[#155c43]" />
                  <span className="mt-2 block text-sm font-semibold">Penerima / komunitas</span>
                  <span className="mt-0.5 block text-xs text-[#5e6f64]">
                    Panti, dapur umum, organisasi food rescue.
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#0d35271a] bg-[#fffdf8] p-5">
              <h2 className="font-display text-lg font-semibold">Data organisasi</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label={role === "donor" ? "Nama usaha" : "Nama organisasi"}>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                      <Input
                        required
                        value={form.name}
                        onChange={update("name")}
                        placeholder={
                          role === "donor" ? "Contoh: Bakery Suka Rasa" : "Contoh: Dapur Peduli"
                        }
                        className="pl-10"
                      />
                    </div>
                  </Field>
                </div>
                <Field label="Penanggung jawab">
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                    <Input
                      required
                      value={form.pic}
                      onChange={update("pic")}
                      placeholder="Nama lengkap"
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Field label="Email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      placeholder="kontak@organisasi.id"
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Field label="Kata sandi" hint="Minimal 8 karakter.">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={form.password}
                      onChange={update("password")}
                      placeholder="Kata sandi baru"
                      className="pl-10 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8a958e] hover:text-[#0d3527]"
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Telepon">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                    <Input
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="0812-xxxx-xxxx"
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Field label="Area operasional">
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a958e]" />
                    <Input
                      value={form.area}
                      onChange={update("area")}
                      placeholder="Contoh: Tebet, Jakarta Selatan"
                      className="pl-10"
                    />
                  </div>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Alamat lengkap" hint="Dipakai sebagai lokasi pickup atau distribusi.">
                    <Textarea
                      value={form.address}
                      onChange={update("address")}
                      placeholder="Jalan, nomor, kelurahan, kota"
                    />
                  </Field>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-3 text-xs leading-relaxed text-[#40564b]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-0.5 size-4 accent-[#155c43]"
                />
                <span>
                  Saya menyatakan data yang diisi benar dan memahami bahwa PANGANLOOP tidak
                  mensertifikasi keamanan pangan. Verifikasi admin diperlukan sebelum transaksi.
                </span>
              </label>

              <Button type="submit" disabled={submitting} className="mt-5 w-full">
                {submitting ? "Mendaftarkan..." : "Daftar dan tunggu verifikasi"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-[#5e6f64]">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-[#155c43] underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-[#0d35271a] bg-[#fffdf8] p-5">
            <h2 className="font-display text-lg font-semibold">Apa yang terjadi setelah daftar?</h2>
            <ol className="mt-3 space-y-3 text-sm text-[#40564b]">
              <li className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e6ecdd] text-[11px] font-bold text-[#155c43]">
                  1
                </span>
                Akun tersimpan dengan status menunggu verifikasi.
              </li>
              <li className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e6ecdd] text-[11px] font-bold text-[#155c43]">
                  2
                </span>
                Admin meninjau organisasi di panel admin.
              </li>
              <li className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e6ecdd] text-[11px] font-bold text-[#155c43]">
                  3
                </span>
                Setelah disetujui, donor dapat mencatat batch dan penerima dapat mengklaim surplus.
              </li>
            </ol>
          </div>
          <div className="rounded-2xl border border-[#efd9a6] bg-[#fdf6e5] p-5 text-sm text-[#7a5410]">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4" /> Mode demo
            </p>
            <p className="mt-1 text-xs leading-relaxed">
              Pendaftaran tidak mengirim email. Data hanya tersimpan di browser ini dan dapat
              direset dari dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#526359]">
            <Leaf className="size-4 text-[#1c6b4f]" /> Lebih sedikit terbuang. Lebih banyak manfaat.
          </div>
        </aside>
      </main>
    </div>
  );
}
