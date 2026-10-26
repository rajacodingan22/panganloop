"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Clock,
  Leaf,
  PackageCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import {
  formatDateTime,
  formatRangeShort,
  getAvailableUnits,
  getDisplayStatus,
  getReservedUnits,
  getSurplus,
  imageForCategory,
  isPastDeadline,
  PICKUP_DISPOSITIONS,
  statusLabel,
  statusTone,
  usePanganloop,
  type Batch,
  type OrgStatus,
  type Role,
} from "./store";
import { DashboardShell } from "./dashboard-shell";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  LinkButton,
  Modal,
  Notice,
  Panel,
  StatCard,
  Textarea,
} from "./ui-kit";

function Thumb({ batch }: { batch: Batch }) {
  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#e6ecdd]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={batch.image || imageForCategory(batch.category)}
        alt=""
        className="size-full object-cover"
      />
    </div>
  );
}

export function DonorDashboard() {
  const { state, user } = usePanganloop();
  const batches = state.batches.filter((batch) => batch.donorId === user?.id);
  const batchIds = new Set(batches.map((batch) => batch.id));
  const reservations = state.reservations.filter((reservation) => batchIds.has(reservation.batchId));
  const activeBatches = batches.filter((batch) => batch.status === "published");
  const needsCloseout = activeBatches.filter((batch) => isPastDeadline(batch));
  const confirmed = reservations.filter((reservation) => reservation.status === "confirmed");
  const pickedUp = reservations.filter((reservation) => reservation.status === "picked_up");
  const rescued = batches.reduce((total, batch) => total + (batch.closeout?.rescued ?? 0), 0);
  const available = activeBatches.reduce(
    (total, batch) => total + getAvailableUnits(batch, state.reservations),
    0,
  );
  const recent = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <DashboardShell
      role="donor"
      active="ringkasan"
      eyebrow={`Selamat datang, ${user?.pic ?? "Donor"}`}
      title="Ringkasan surplus hari ini"
      description="Catat sisa produksi, pantau klaim komunitas, dan tutup batch tepat waktu."
      actions={
        <LinkButton href="/batch/baru">
          Catat batch baru <ArrowRight className="size-4" />
        </LinkButton>
      }
    >
      <div className="space-y-5">
        {needsCloseout.length > 0 ? (
          <Notice tone="warning">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <div>
                <strong>{needsCloseout.length} batch sudah melewati tenggat pickup.</strong>{" "}
                Selesaikan closeout agar outcome tercatat.{" "}
                <Link href="/batch" className="font-semibold underline underline-offset-2">
                  Buka daftar batch
                </Link>
              </div>
            </div>
          </Notice>
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Listing aktif"
            value={activeBatches.length}
            hint={`${available} unit masih tersedia`}
            icon={<Store className="size-4" />}
          />
          <StatCard
            label="Reservasi aktif"
            value={confirmed.length}
            hint={`${confirmed.reduce((total, item) => total + item.units, 0)} unit diklaim`}
            icon={<ClipboardList className="size-4" />}
          />
          <StatCard
            label="Sudah diambil"
            value={pickedUp.reduce((total, item) => total + item.units, 0)}
            hint={`${pickedUp.length} pickup terverifikasi`}
            icon={<PackageCheck className="size-4" />}
          />
          <StatCard
            label="Pangan terselamatkan"
            value={`${rescued} unit`}
            hint="Dari batch yang sudah ditutup"
            icon={<Leaf className="size-4" />}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">Batch aktif</h2>
                <p className="text-xs text-[#5e6f64]">Termasuk draft dan listing yang perlu ditutup.</p>
              </div>
              <Link href="/batch" className="text-xs font-semibold text-[#155c43] hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {batches.length === 0 ? (
                <EmptyState
                  title="Belum ada batch"
                  description="Catat sisa produksi pertama Anda untuk mulai menyelamatkan pangan."
                  action={<LinkButton href="/batch/baru" size="sm">Catat batch</LinkButton>}
                  icon={<Boxes className="size-5" />}
                />
              ) : (
                batches.slice(0, 5).map((batch) => {
                  const status = getDisplayStatus(batch, state.reservations);
                  const available = getAvailableUnits(batch, state.reservations);
                  const reserved = getReservedUnits(state.reservations, batch.id);
                  return (
                    <Link
                      key={batch.id}
                      href={`/batch/${batch.id}`}
                      className="flex items-center gap-3 rounded-xl border border-[#0d352714] p-3 transition hover:border-[#1c6b4f66] hover:bg-[#faf6ea]"
                    >
                      <Thumb batch={batch} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">{batch.title}</p>
                          <Badge tone={statusTone(status)}>{status}</Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-[#5e6f64]">
                          {formatRangeShort(batch)} • {batch.code}
                        </p>
                        <p className="mt-1 text-xs text-[#40564b]">
                          {getSurplus(batch)} surplus • {reserved} diklaim • {available} tersedia
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-[#5e6f64]" />
                    </Link>
                  );
                })
              )}
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <h2 className="font-display text-lg font-semibold">Reservasi terbaru</h2>
              <div className="mt-3 space-y-3">
                {recent.length === 0 ? (
                  <p className="text-sm text-[#5e6f64]">Belum ada reservasi masuk.</p>
                ) : (
                  recent.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-start justify-between gap-3 border-b border-[#0d352714] pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{reservation.recipientName}</p>
                        <p className="mt-0.5 text-xs text-[#5e6f64]">
                          {reservation.units} unit • {formatDateTime(reservation.createdAt)}
                        </p>
                      </div>
                      <Badge
                        tone={
                          reservation.status === "confirmed"
                            ? "border-[#efd9a6] bg-[#fdf6e5] text-[#7a5410]"
                            : reservation.status === "picked_up"
                              ? "border-[#b9dfc4] bg-[#e9f6ed] text-[#14532d]"
                              : "border-[#e2c9c9] bg-[#f3eeee] text-[#7a3434]"
                        }
                      >
                        {reservation.status === "confirmed"
                          ? "Aktif"
                          : reservation.status === "picked_up"
                            ? "Diambil"
                            : "Batal"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/reservasi"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#155c43] hover:underline"
              >
                Kelola reservasi <ArrowRight className="size-3.5" />
              </Link>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#b5791a]" />
                <h2 className="font-display text-lg font-semibold">Insight cepat</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#5e6f64]">
                {rescued > 0
                  ? `${rescued} unit sudah terselamatkan dari batch yang ditutup. Buka insight untuk melihat kategori dan outcome.`
                  : "Insight akan muncul setelah batch pertama Anda ditutup."}
              </p>
              <Link
                href="/insight"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#155c43] hover:underline"
              >
                Buka insight <ArrowRight className="size-3.5" />
              </Link>
            </Panel>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export function RecipientDashboard() {
  const { state, user } = usePanganloop();
  const reservations = state.reservations.filter(
    (reservation) => reservation.recipientId === user?.id,
  );
  const active = reservations.filter((reservation) => reservation.status === "confirmed");
  const pickedUp = reservations.filter((reservation) => reservation.status === "picked_up");
  const claimable = state.batches.filter(
    (batch) =>
      batch.status === "published" &&
      !batch.disabled &&
      !isPastDeadline(batch) &&
      getAvailableUnits(batch, state.reservations) > 0,
  );
  const history = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <DashboardShell
      role="recipient"
      active="ringkasan"
      eyebrow={`Selamat datang, ${user?.pic ?? "Penerima"}`}
      title="Surplus yang bisa diselamatkan"
      description="Ajukan pickup, simpan kode reservasi, lalu tunjukkan kode itu saat mengambil makanan."
      actions={
        <LinkButton href="/surplus">
          Jelajahi surplus <ArrowRight className="size-4" />
        </LinkButton>
      }
    >
      <div className="space-y-5">
        {user && !user.approved ? (
          <Notice tone="warning">
            Akun organisasi Anda belum disetujui admin. Anda bisa melihat listing, tetapi belum
            bisa mengajukan reservasi.
          </Notice>
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Listing tersedia"
            value={claimable.length}
            hint="Siap diajukan hari ini"
            icon={<Store className="size-4" />}
          />
          <StatCard
            label="Reservasi aktif"
            value={active.length}
            hint={`${active.reduce((total, item) => total + item.units, 0)} unit`}
            icon={<ClipboardList className="size-4" />}
          />
          <StatCard
            label="Sudah diambil"
            value={pickedUp.reduce((total, item) => total + item.units, 0)}
            hint={`${pickedUp.length} pickup`}
            icon={<PackageCheck className="size-4" />}
          />
          <StatCard
            label="Pangan diterima"
            value={`${reservations
              .filter((reservation) => reservation.status !== "cancelled")
              .reduce((total, item) => total + item.units, 0)} unit`}
            icon={<Leaf className="size-4" />}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">Rekomendasi surplus</h2>
                <p className="text-xs text-[#5e6f64]">Listing aktif dengan stok tersisa.</p>
              </div>
              <Link href="/surplus" className="text-xs font-semibold text-[#155c43] hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {claimable.length === 0 ? (
                <EmptyState
                  title="Belum ada surplus tersedia"
                  description="Cek kembali nanti atau lihat listing lain yang masih bisa diklaim."
                  action={<LinkButton href="/surplus" size="sm">Buka katalog</LinkButton>}
                  icon={<Store className="size-5" />}
                />
              ) : (
                claimable.slice(0, 4).map((batch) => (
                  <Link
                    key={batch.id}
                    href={`/surplus/${batch.id}`}
                    className="flex items-center gap-3 rounded-xl border border-[#0d352714] p-3 transition hover:border-[#1c6b4f66] hover:bg-[#faf6ea]"
                  >
                    <Thumb batch={batch} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{batch.title}</p>
                      <p className="mt-0.5 truncate text-xs text-[#5e6f64]">
                        {batch.donorName} • {batch.area}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#155c43]">
                        {getAvailableUnits(batch, state.reservations)} {batch.unit} tersedia
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-[#5e6f64]" />
                  </Link>
                ))
              )}
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <h2 className="font-display text-lg font-semibold">Reservasi aktif</h2>
              <div className="mt-3 space-y-3">
                {active.length === 0 ? (
                  <p className="text-sm text-[#5e6f64]">Belum ada reservasi aktif.</p>
                ) : (
                  active.map((reservation) => {
                    const batch = state.batches.find((item) => item.id === reservation.batchId);
                    return (
                      <div
                        key={reservation.id}
                        className="rounded-xl border border-[#efd9a6] bg-[#fdf6e5] p-3"
                      >
                        <p className="text-xs font-semibold text-[#7a5410]">
                          {batch?.title ?? "Batch"} • {reservation.units} {batch?.unit ?? "unit"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#7a5410]">Kode pickup</p>
                        <p className="font-mono text-lg font-bold tracking-[0.18em] text-[#7a5410]">
                          {reservation.code}
                        </p>
                        <p className="mt-1 text-[11px] text-[#7a5410]">
                          Tunjukkan kode ini saat pickup. Jangan bagikan ke publik.
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>

            <Panel>
              <h2 className="font-display text-lg font-semibold">Riwayat terakhir</h2>
              <div className="mt-3 space-y-2.5">
                {history.length === 0 ? (
                  <p className="text-sm text-[#5e6f64]">Belum ada riwayat reservasi.</p>
                ) : (
                  history.map((reservation) => {
                    const batch = state.batches.find((item) => item.id === reservation.batchId);
                    return (
                      <div key={reservation.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{batch?.title ?? "Batch"}</p>
                          <p className="text-[11px] text-[#5e6f64]">
                            {reservation.units} unit • {formatDateTime(reservation.createdAt)}
                          </p>
                        </div>
                        <Badge
                          tone={
                            reservation.status === "cancelled"
                              ? "border-[#e2c9c9] bg-[#f3eeee] text-[#7a3434]"
                              : "border-[#b9dfc4] bg-[#e9f6ed] text-[#14532d]"
                          }
                        >
                          {reservation.status === "confirmed"
                            ? "Aktif"
                            : reservation.status === "picked_up"
                              ? "Diambil"
                              : "Batal"}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
              <Link
                href="/reservasi/saya"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#155c43] hover:underline"
              >
                Buka reservasi saya <ArrowRight className="size-3.5" />
              </Link>
            </Panel>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

type AdminTab = "organisasi" | "listing" | "audit";

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "organisasi", label: "Organisasi" },
  { id: "listing", label: "Listing" },
  { id: "audit", label: "Jejak audit" },
];

export function AdminDashboard() {
  const { state, user, approveOrganization, rejectOrganization, disableBatch } = usePanganloop();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  const validQueryTab: AdminTab | null =
    queryTab === "listing" || queryTab === "audit" || queryTab === "organisasi"
      ? queryTab
      : null;
  const [tabOverride, setTab] = useState<AdminTab | null>(null);
  const tab: AdminTab = tabOverride ?? validQueryTab ?? "organisasi";
  const [selected, setSelected] = useState<Batch | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pending = state.organizations.filter((org) => org.status === "pending");
  const approved = state.organizations.filter((org) => org.status === "approved");
  const rejected = state.organizations.filter((org) => org.status === "rejected");
  const listings = state.batches.filter(
    (batch) => batch.status === "published" || batch.status === "closed",
  );
  const rescued = state.batches.reduce((total, batch) => total + (batch.closeout?.rescued ?? 0), 0);
  const confirmed = state.reservations.filter(
    (reservation) => reservation.status === "confirmed",
  );

  const run = (result: { ok: true } | { ok: false; error: string }) => {
    setError(result.ok ? null : result.error);
  };

  return (
    <DashboardShell
      role="admin"
      active={tab}
      eyebrow={`Masuk sebagai ${user?.pic ?? "Admin"}`}
      title="Operasional PANGANLOOP"
      description="Verifikasi organisasi, awasi listing, dan periksa jejak audit dari data Firestore."
    >
      <div className="space-y-5">
        {error ? <Notice tone="error">{error}</Notice> : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Menunggu verifikasi"
            value={pending.length}
            hint="Organisasi baru"
            icon={<ShieldAlert className="size-4" />}
          />
          <StatCard
            label="Organisasi aktif"
            value={approved.filter((org) => org.role !== "admin").length}
            hint={`${rejected.length} ditolak`}
            icon={<UsersRound className="size-4" />}
          />
          <StatCard
            label="Listing dipantau"
            value={listings.length}
            hint={`${confirmed.length} reservasi aktif`}
            icon={<Store className="size-4" />}
          />
          <StatCard
            label="Pangan terselamatkan"
            value={`${rescued} unit`}
            hint="Dari closeout batch"
            icon={<Leaf className="size-4" />}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {ADMIN_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                tab === item.id
                  ? "border-[#155c43] bg-[#155c43] text-white"
                  : "border-[#0d352726] bg-[#fffdf8] text-[#40564b] hover:border-[#155c43]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "organisasi" ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel>
              <h2 className="font-display text-lg font-semibold">Menunggu verifikasi</h2>
              <p className="text-xs text-[#5e6f64]">Setujui hanya organisasi yang valid.</p>
              <div className="mt-4 space-y-3">
                {pending.length === 0 ? (
                  <EmptyState
                    title="Tidak ada antrean"
                    description="Semua organisasi sudah ditinjau."
                    icon={<ShieldCheck className="size-5" />}
                  />
                ) : (
                  pending.map((org) => (
                    <div key={org.id} className="rounded-xl border border-[#efd9a6] bg-[#fdf6e5] p-4">
                      <p className="font-semibold">{org.name}</p>
                      <p className="text-xs text-[#7a5410]">
                        {org.role === "donor" ? "Donor" : "Penerima"} • {org.orgType}
                      </p>
                      <dl className="mt-2 space-y-1 text-xs text-[#40564b]">
                        <div className="flex gap-1">
                          <dt className="font-semibold">PIC:</dt>
                          <dd>{org.pic}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="font-semibold">Email:</dt>
                          <dd className="truncate">{org.email}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="font-semibold">Area:</dt>
                          <dd>{org.area}</dd>
                        </div>
                      </dl>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={async () => run(await approveOrganization(org.id))}>
                          <CheckCircle2 className="size-4" /> Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={async () => run(await rejectOrganization(org.id))}
                        >
                          Tolak
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel>
              <h2 className="font-display text-lg font-semibold">Organisasi terdaftar</h2>
              <div className="mt-4 space-y-2">
                {[...approved, ...rejected].map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#0d352714] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{org.name}</p>
                      <p className="text-[11px] text-[#5e6f64]">
                        {org.role === "donor" ? "Donor" : org.role === "recipient" ? "Penerima" : "Admin"} •{" "}
                        {org.area}
                      </p>
                    </div>
                    <Badge
                      tone={
                        org.status === "approved"
                          ? "border-[#b9dfc4] bg-[#e9f6ed] text-[#14532d]"
                          : "border-[#e2c9c9] bg-[#f3eeee] text-[#7a3434]"
                      }
                    >
                      {statusLabel(org.status as OrgStatus)}
                    </Badge>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ) : null}

        {tab === "listing" ? (
          <Panel>
            <h2 className="font-display text-lg font-semibold">Listing dan batch</h2>
            <p className="text-xs text-[#5e6f64]">
              Nonaktifkan listing yang melanggar aturan. Riwayat closeout tetap tersimpan.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[#0d35271a] text-[11px] uppercase tracking-wide text-[#5e6f64]">
                  <tr>
                    <th className="px-2 py-2">Batch</th>
                    <th className="px-2 py-2">Donor</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Stok</th>
                    <th className="px-2 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((batch) => {
                    const status = getDisplayStatus(batch, state.reservations);
                    return (
                      <tr key={batch.id} className="border-b border-[#0d35270f]">
                        <td className="px-2 py-3">
                          <p className="font-semibold">{batch.title}</p>
                          <p className="text-[11px] text-[#5e6f64]">{batch.code}</p>
                        </td>
                        <td className="px-2 py-3 text-xs text-[#40564b]">{batch.donorName}</td>
                        <td className="px-2 py-3">
                          <Badge tone={statusTone(status)}>{status}</Badge>
                        </td>
                        <td className="px-2 py-3 text-xs">
                          {getAvailableUnits(batch, state.reservations)} tersedia
                        </td>
                        <td className="px-2 py-3 text-right">
                          {batch.status === "published" ? (
                            <Button
                              size="sm"
                              variant={batch.disabled ? "outline" : "danger"}
                              onClick={() => {
                                setSelected(batch);
                                setReason(batch.disabledReason ?? "");
                              }}
                            >
                              {batch.disabled ? "Aktifkan" : "Nonaktifkan"}
                            </Button>
                          ) : (
                            <span className="text-xs text-[#5e6f64]">Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}

        {tab === "audit" ? (
          <Panel>
            <h2 className="font-display text-lg font-semibold">Jejak audit</h2>
            <p className="text-xs text-[#5e6f64]">Semua aksi penting tercatat di jejak audit.</p>
            <ol className="mt-4 space-y-3">
              {state.audit.length === 0 ? (
                <EmptyState
                  title="Belum ada aktivitas"
                  description="Aksi pengguna akan muncul di sini."
                  icon={<ClipboardList className="size-5" />}
                />
              ) : (
                [...state.audit]
                  .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                  .slice(0, 40)
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="flex gap-3 rounded-xl border border-[#0d352714] p-3"
                    >
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-[#1c6b4f]" />
                      <div>
                        <p className="text-sm">{entry.summary}</p>
                        <p className="mt-0.5 text-[11px] text-[#5e6f64]">
                          {entry.actorName} • {formatDateTime(entry.at)} • {entry.action}
                        </p>
                      </div>
                    </li>
                  ))
              )}
            </ol>
          </Panel>
        ) : null}
      </div>

      <Modal
        open={selected !== null}
        title={selected?.disabled ? "Aktifkan listing?" : "Nonaktifkan listing?"}
        description={
          selected
            ? `${selected.title} • ${selected.donorName}. Nonaktifkan bila listing melanggar aturan atau tidak layak.`
            : undefined
        }
        onClose={() => setSelected(null)}
      >
        <div className="space-y-4">
          <Field
            label="Alasan"
            hint={
              selected?.disabled
                ? "Opsional saat mengaktifkan kembali."
                : "Wajib diisi agar donor memahami alasan penonaktifan."
            }
          >
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Contoh: informasi pickup tidak jelas."
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Batal
            </Button>
            <Button
              variant={selected?.disabled ? "primary" : "danger"}
              onClick={async () => {
                if (!selected) return;
                const result = await disableBatch(selected.id, !selected.disabled, reason);
                run(result);
                if (result.ok) {
                  setSelected(null);
                  setReason("");
                }
              }}
            >
              {selected?.disabled ? "Aktifkan listing" : "Nonaktifkan listing"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}

export function InsightView() {
  const { state, user } = usePanganloop();
  const all = useMemo(
    () => state.batches.filter((batch) => batch.donorId === user?.id),
    [state.batches, user?.id],
  );
  const closed = all.filter((batch) => batch.status === "closed" && batch.closeout);
  const categories = Array.from(new Set(closed.map((batch) => batch.category)));
  const eligible = categories
    .map((category) => {
      const batches = closed.filter((batch) => batch.category === category);
      return {
        category,
        batches,
        rescued: batches.reduce((total, batch) => total + (batch.closeout?.rescued ?? 0), 0),
        unclaimed: batches.reduce((total, batch) => total + (batch.closeout?.unclaimed ?? 0), 0),
      };
    })
    .filter((group) => group.batches.length >= 4);

  const totalRescued = closed.reduce((total, batch) => total + (batch.closeout?.rescued ?? 0), 0);
  const totalUnclaimed = closed.reduce(
    (total, batch) => total + (batch.closeout?.unclaimed ?? 0),
    0,
  );
  const dispositionCounts = PICKUP_DISPOSITIONS.map((disposition) => ({
    ...disposition,
    count: closed.filter((batch) => batch.closeout?.disposition === disposition.value).length,
  }));

  return (
    <DashboardShell
      role="donor"
      active="insight"
      eyebrow="Pembelajaran"
      title="Insight batch dan outcome"
      description="Insight hanya ditampilkan untuk kategori dengan minimal 4 batch yang sudah ditutup."
    >
      <div className="space-y-5">
        {eligible.length === 0 ? (
          <Notice tone="warning">
            Belum ada kategori dengan minimal 4 batch ditutup. Saat ini ada{" "}
            <strong>{closed.length} batch ditutup</strong> pada{" "}
            <strong>{categories.length} kategori</strong>. Lanjutkan mencatat dan menutup batch
            untuk membuka insight.
          </Notice>
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Batch ditutup" value={closed.length} />
          <StatCard label="Pangan terselamatkan" value={`${totalRescued} unit`} />
          <StatCard label="Tidak terklaim" value={`${totalUnclaimed} unit`} />
          <StatCard
            label="Tingkat penyelamatan"
            value={`${totalRescued + totalUnclaimed > 0 ? Math.round((totalRescued / (totalRescued + totalUnclaimed)) * 100) : 0}%`}
            hint="Dari total surplus batch tertutup"
          />
        </div>

        {eligible.map((group) => (
          <Panel key={group.category}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">{group.category}</h2>
              <Badge tone="border-[#b9dfc4] bg-[#e9f6ed] text-[#14532d]">
                {group.batches.length} batch ditutup
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#faf6ea] p-3">
                <p className="text-xs text-[#5e6f64]">Terselamatkan</p>
                <p className="font-display text-xl font-semibold">{group.rescued} unit</p>
              </div>
              <div className="rounded-xl bg-[#faf6ea] p-3">
                <p className="text-xs text-[#5e6f64]">Tidak terklaim</p>
                <p className="font-display text-xl font-semibold">{group.unclaimed} unit</p>
              </div>
              <div className="rounded-xl bg-[#faf6ea] p-3">
                <p className="text-xs text-[#5e6f64]">Rata-rata per batch</p>
                <p className="font-display text-xl font-semibold">
                  {Math.round(group.rescued / group.batches.length)} unit
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {group.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0d35270f] pb-2 text-sm last:border-0 last:pb-0"
                >
                  <span className="font-medium">{batch.title}</span>
                  <span className="text-xs text-[#5e6f64]">
                    {batch.closeout?.rescued ?? 0} terselamatkan •{" "}
                    {PICKUP_DISPOSITIONS.find(
                      (item) => item.value === batch.closeout?.disposition,
                    )?.label ?? "Belum diketahui"}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        ))}

        <Panel>
          <h2 className="font-display text-lg font-semibold">Outcome closeout</h2>
          <p className="text-xs text-[#5e6f64]">Distribusi cara surplus diselesaikan.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {dispositionCounts.map((item) => (
              <div
                key={item.value}
                className="flex items-center justify-between rounded-xl border border-[#0d352714] px-3 py-2 text-sm"
              >
                <span>{item.label}</span>
                <span className="font-semibold">{item.count} batch</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}

export function ProfileView({ role }: { role: Role }) {
  const { user } = usePanganloop();
  if (!user) return null;
  const rows = [
    ["Nama organisasi", user.name],
    ["Penanggung jawab", user.pic],
    ["Peran", role === "donor" ? "Donor" : role === "recipient" ? "Penerima" : "Admin"],
    ["Jenis organisasi", user.orgType],
    ["Email", user.email],
    ["Telepon", user.phone],
    ["Alamat", user.address],
    ["Area", user.area],
    ["Status verifikasi", statusLabel(user.status)],
  ];

  return (
    <DashboardShell
      role={role}
      active="profil"
      eyebrow="Akun Firebase"
      title="Profil organisasi"
      description="Profil ini tersimpan di Firestore dan dipakai pada batch serta reservasi yang Anda buat."
    >
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#e6ecdd] text-[#155c43]">
              <BadgeCheck className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">{user.name}</h2>
              <p className="text-xs text-[#5e6f64]">{user.email}</p>
            </div>
          </div>
          <dl className="mt-5 divide-y divide-[#0d35270f]">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[180px_1fr]">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#5e6f64]">
                  {label}
                </dt>
                <dd className="text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Status akun</h2>
            <div className="mt-3">
              <Badge
                tone={
                  user.approved
                    ? "border-[#b9dfc4] bg-[#e9f6ed] text-[#14532d]"
                    : "border-[#efd9a6] bg-[#fdf6e5] text-[#7a5410]"
                }
              >
                {statusLabel(user.status)}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-[#5e6f64]">
              {user.approved
                ? "Akun sudah dapat menjalankan seluruh aksi sesuai peran."
                : "Tunggu admin menyetujui organisasi sebelum membuat batch atau reservasi."}
            </p>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[#1c6b4f]" />
              <h2 className="font-display text-lg font-semibold">Keamanan sesi</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#5e6f64]">
              Sesi login disimpan sebagai cookie httpOnly selama 5 hari. Keluar dari akun untuk
              mengakhiri sesi di perangkat ini.
            </p>
            <Link
              href="/"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#155c43] hover:underline"
            >
              Kembali ke beranda <ArrowRight className="size-3.5" />
            </Link>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
