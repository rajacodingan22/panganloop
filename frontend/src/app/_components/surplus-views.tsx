"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Info,
  Leaf,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Store,
  TriangleAlert,
} from "lucide-react";
import {
  CATEGORIES,
  formatWindow,
  getAvailableUnits,
  getDisplayStatus,
  getSurplus,
  imageForCategory,
  isBatchClaimable,
  isPastDeadline,
  statusTone,
  usePanganloop,
  type Batch,
} from "./store";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  LinkButton,
  Notice,
  Panel,
  Select,
  Spinner,
  Textarea,
} from "./ui-kit";

function SurplusCard({ batch }: { batch: Batch }) {
  const { state, user } = usePanganloop();
  const status = getDisplayStatus(batch, state.reservations);
  const available = getAvailableUnits(batch, state.reservations);
  const claimable = isBatchClaimable(batch, state.reservations);
  const ownReservation = state.reservations.find(
    (reservation) =>
      reservation.batchId === batch.id &&
      reservation.recipientId === user?.id &&
      reservation.status !== "cancelled",
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#0d35271a] bg-[#fffdf8] shadow-[0_18px_40px_-32px_rgba(13,53,39,0.45)]">
      <div className="relative h-44 w-full bg-[#e6ecdd]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={batch.image || imageForCategory(batch.category)}
          alt={batch.title}
          className="size-full object-cover"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone={statusTone(status)}>{status}</Badge>
          <Badge tone="border-[#0d352733] bg-[#fffdf8]/90 text-[#40564b]">
            {batch.category}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-display text-lg font-semibold leading-snug">{batch.title}</h2>
        <p className="mt-0.5 text-xs text-[#5e6f64]">{batch.donorName}</p>
        <div className="mt-3 grid gap-1.5 text-xs text-[#40564b]">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5 text-[#1c6b4f]" /> {formatWindow(batch)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-[#1c6b4f]" /> {batch.area} • {batch.distanceKm} km
          </span>
          <span className="flex items-center gap-1.5">
            <Package className="size-3.5 text-[#1c6b4f]" /> {available} dari {getSurplus(batch)}{" "}
            {batch.unit} tersedia
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-[11px] text-[#5e6f64]">{batch.code}</span>
          {ownReservation ? (
            <LinkButton href="/reservasi/saya" size="sm" variant="outline">
              Reservasi saya <ArrowRight className="size-3.5" />
            </LinkButton>
          ) : (
            <Link
              href={`/surplus/${batch.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold ${
                claimable
                  ? "border-[#155c43] bg-[#155c43] text-white"
                  : "border-[#0d352726] text-[#40564b]"
              }`}
            >
              {claimable ? "Lihat dan klaim" : "Lihat detail"} <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function SurplusBrowseView() {
  const { state, ready } = usePanganloop();
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");

  const batches = useMemo(
    () =>
      state.batches
        .filter((batch) => batch.status === "published" && !batch.disabled)
        .filter((batch) => category === "Semua" || batch.category === category)
        .filter((batch) => {
          const term = query.trim().toLowerCase();
          if (!term) return true;
          return (
            batch.title.toLowerCase().includes(term) ||
            batch.donorName.toLowerCase().includes(term) ||
            batch.area.toLowerCase().includes(term)
          );
        })
        .sort((a, b) => {
          const aClaim = isBatchClaimable(a, state.reservations) ? 0 : 1;
          const bClaim = isBatchClaimable(b, state.reservations) ? 0 : 1;
          if (aClaim !== bClaim) return aClaim - bClaim;
          return new Date(a.pickupEnd).getTime() - new Date(b.pickupEnd).getTime();
        }),
    [category, query, state.batches, state.reservations],
  );

  if (!ready) return <Spinner />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c6b4f]">
          Surplus aktif · data platform
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Makanan layak yang bisa diselamatkan hari ini
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5e6f64]">
          Listing di bawah berasal dari donor terverifikasi. Kode pickup tidak pernah ditampilkan di halaman
          publik dan hanya diberikan kepada organisasi penerima yang reservasinya dikonfirmasi.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-[#0d35271a] bg-[#fffdf8] p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Cari surplus">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5e6f64]" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nama makanan, donor, atau area"
              />
            </div>
          </Field>
        </div>
        <div className="sm:w-56">
          <Field label="Kategori">
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="Semua">Semua kategori</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5e6f64]">
        <span>{batches.length} listing ditemukan</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="size-3.5" /> Data dari donor terverifikasi
        </span>
      </div>

      {batches.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Belum ada listing yang cocok"
            description="Coba kategori lain atau kosongkan pencarian. Listing baru akan muncul saat donor mempublikasikan batch."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCategory("Semua");
                  setQuery("");
                }}
              >
                Reset filter
              </Button>
            }
            icon={<Store className="size-5" />}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <SurplusCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-[#b9dfc4] bg-[#e9f6ed] p-5 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Leaf className="mt-0.5 size-5 shrink-0 text-[#155c43]" />
          <div>
            <h2 className="font-display text-lg font-semibold">Organisasi penerima?</h2>
            <p className="mt-1 text-sm text-[#40564b]">
              Masuk sebagai penerima terverifikasi untuk mengajukan pickup dan mendapatkan kode
              reservasi.
            </p>
          </div>
        </div>
        <LinkButton href="/login" size="sm" className="mt-4 sm:mt-0">
          Masuk sebagai penerima
        </LinkButton>
      </div>
    </div>
  );
}

export function SurplusDetailView({ batchId }: { batchId: string }) {
  const { state, ready, user, createReservation } = usePanganloop();
  const [units, setUnits] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  const batch = state.batches.find((item) => item.id === batchId);

  if (!ready) return <Spinner />;

  if (!batch) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Listing tidak ditemukan"
          description="Listing mungkin sudah dihapus atau tautannya tidak valid."
          action={<LinkButton href="/surplus" size="sm">Kembali ke katalog</LinkButton>}
          icon={<Info className="size-5" />}
        />
      </div>
    );
  }

  const status = getDisplayStatus(batch, state.reservations);
  const available = getAvailableUnits(batch, state.reservations);
  const claimable = isBatchClaimable(batch, state.reservations);
  const existing = state.reservations.find(
    (reservation) =>
      reservation.batchId === batch.id &&
      reservation.recipientId === user?.id &&
      reservation.status !== "cancelled",
  );
  const showAddress = user?.role === "recipient" || user?.role === "admin";
  const canClaim = user?.role === "recipient" && user.approved && !existing && claimable;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/surplus"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155c43] hover:underline"
      >
        <ArrowLeft className="size-3.5" /> Kembali ke katalog surplus
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-[#0d35271a] bg-[#fffdf8]">
            <div className="relative h-56 w-full bg-[#e6ecdd] sm:h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={batch.image || imageForCategory(batch.category)}
                alt={batch.title}
                className="size-full object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge tone={statusTone(status)}>{status}</Badge>
                <Badge tone="border-[#0d352733] bg-[#fffdf8]/90 text-[#40564b]">
                  {batch.category}
                </Badge>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1c6b4f]">
                {batch.donorName} • {batch.code}
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                {batch.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#40564b]">{batch.description}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#faf6ea] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    <CalendarClock className="size-3.5" /> Jadwal pickup
                  </p>
                  <p className="mt-1 text-sm font-medium">{formatWindow(batch)}</p>
                </div>
                <div className="rounded-xl bg-[#faf6ea] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    <Package className="size-3.5" /> Ketersediaan
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {available} dari {getSurplus(batch)} {batch.unit}
                  </p>
                </div>
                <div className="rounded-xl bg-[#faf6ea] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    <MapPin className="size-3.5" /> Area
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {batch.area} • {batch.distanceKm} km
                  </p>
                </div>
                <div className="rounded-xl bg-[#faf6ea] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    <ShieldCheck className="size-3.5" /> Alamat pickup
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {showAddress ? batch.address : "Tersedia setelah masuk sebagai penerima"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    Kemasan
                  </p>
                  <p className="mt-0.5">{batch.packaging}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    Penyimpanan
                  </p>
                  <p className="mt-0.5">{batch.storage}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    Alergen
                  </p>
                  <p className="mt-0.5">{batch.allergen}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                    Penanganan
                  </p>
                  <p className="mt-0.5">{batch.handling}</p>
                </div>
              </div>
            </div>
          </div>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Cara pickup</h2>
            <ol className="mt-3 space-y-2 text-sm text-[#40564b]">
              <li>1. Masuk sebagai organisasi penerima yang sudah disetujui admin.</li>
              <li>2. Ajukan jumlah unit yang dibutuhkan selama stok tersedia.</li>
              <li>3. Simpan kode pickup 6 karakter. Kode hanya tampil untuk akun Anda.</li>
              <li>4. Datang pada jadwal pickup dan tunjukkan kode ke donor.</li>
              <li>5. Donor memverifikasi kode; kode hanya berlaku sekali.</li>
            </ol>
          </Panel>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {batch.disabled ? (
            <Notice tone="error">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                Listing dinonaktifkan admin. {batch.disabledReason ?? ""}
              </div>
            </Notice>
          ) : null}

          {existing || claimedCode ? (
            <Panel>
              <div className="flex items-center gap-2 text-[#155c43]">
                <CheckCircle2 className="size-5" />
                <h2 className="font-display text-lg font-semibold">Reservasi aktif</h2>
              </div>
              <p className="mt-2 text-sm text-[#5e6f64]">
                Tunjukkan kode ini kepada donor saat pickup. Jangan bagikan ke publik.
              </p>
              <div className="mt-3 rounded-2xl border border-[#efd9a6] bg-[#fdf6e5] p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a5410]">
                  Kode pickup
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-[0.24em] text-[#7a5410]">
                  {existing?.code ?? claimedCode}
                </p>
              </div>
              <LinkButton href="/reservasi/saya" size="sm" variant="outline" className="mt-3 w-full">
                Buka reservasi saya
              </LinkButton>
            </Panel>
          ) : canClaim ? (
            <Panel>
              <h2 className="font-display text-lg font-semibold">Ajukan pickup</h2>
              <p className="mt-1 text-xs text-[#5e6f64]">
                {available} {batch.unit} tersedia. Ajukan jumlah sesuai kebutuhan distribusi.
              </p>
              <div className="mt-4 space-y-4">
                <Field label="Jumlah unit">
                  <Input
                    type="number"
                    min={1}
                    max={available}
                    step={1}
                    value={units}
                    onChange={(event) => setUnits(event.target.value)}
                  />
                </Field>
                <Field label="Catatan untuk donor" hint="Opsional.">
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Contoh: untuk distribusi malam ini."
                  />
                </Field>
                {error ? <Notice tone="error">{error}</Notice> : null}
                <Button
                  className="w-full"
                  onClick={async () => {
                    const result = await createReservation(batch.id, Number(units), note);
                    if (result.ok) {
                      setError(null);
                      setClaimedCode(result.data.code);
                    } else {
                      setError(result.error);
                    }
                  }}
                >
                  Ajukan reservasi
                </Button>
              </div>
            </Panel>
          ) : (
            <Panel>
              <h2 className="font-display text-lg font-semibold">Ajukan pickup</h2>
              <div className="mt-3">
                {!user ? (
                  <>
                    <p className="text-sm text-[#5e6f64]">
                      Masuk sebagai penerima terverifikasi untuk mengajukan pickup.
                    </p>
                    <LinkButton href="/login" size="sm" className="mt-3 w-full">
                      Masuk ke akun
                    </LinkButton>
                  </>
                ) : user.role !== "recipient" ? (
                  <p className="text-sm text-[#5e6f64]">
                    Anda masuk sebagai {user.role === "donor" ? "donor" : "admin"}. Reservasi hanya
                    dapat dibuat oleh organisasi penerima.
                  </p>
                ) : !user.approved ? (
                  <p className="text-sm text-[#5e6f64]">
                    Organisasi Anda masih menunggu verifikasi admin. Anda dapat melihat listing,
                    tetapi belum bisa mengajukan pickup.
                  </p>
                ) : !claimable ? (
                  <p className="text-sm text-[#5e6f64]">
                    {batch.status !== "published"
                      ? "Listing tidak sedang menerima reservasi."
                      : isPastDeadline(batch)
                        ? "Tenggat pickup sudah lewat."
                        : "Stok listing ini sedang habis."}
                  </p>
                ) : (
                  <p className="text-sm text-[#5e6f64]">Reservasi belum dapat diajukan.</p>
                )}
              </div>
            </Panel>
          )}

          <Notice tone="info">
            Reservasi disimpan di Firestore dan mengunci stok secara transaksional. Tetap periksa
            kondisi pangan sebelum didistribusikan.
          </Notice>
        </div>
      </div>
    </div>
  );
}

