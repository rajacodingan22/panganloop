"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardList,
  Copy,
  MapPin,
  PackageCheck,
  Store,
  XCircle,
} from "lucide-react";
import {
  formatDateTime,
  formatWindow,
  isPastDeadline,
  usePanganloop,
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

export function DonorReservationsView() {
  const { state, user, cancelReservation } = usePanganloop();
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"aktif" | "selesai" | "semua">("aktif");

  const ownBatchIds = new Set(
    state.batches.filter((batch) => batch.donorId === user?.id).map((batch) => batch.id),
  );
  const all = state.reservations.filter((reservation) => ownBatchIds.has(reservation.batchId));
  const reservations = all.filter((reservation) => {
    if (filter === "semua") return true;
    if (filter === "aktif") return reservation.status === "confirmed";
    return reservation.status === "picked_up" || reservation.status === "cancelled";
  });
  const active = all.filter((reservation) => reservation.status === "confirmed");
  const picked = all.filter((reservation) => reservation.status === "picked_up");

  return (
    <DashboardShell
      role="donor"
      active="reservasi"
      eyebrow="Koordinasi pickup"
      title="Reservasi masuk"
      description="Pantau organisasi yang mengklaim batch Anda. Verifikasi kode pickup dari halaman detail batch."
    >
      <div className="space-y-5">
        {error ? <Notice tone="error">{error}</Notice> : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Reservasi aktif" value={active.length} />
          <StatCard
            label="Unit diklaim"
            value={active.reduce((total, item) => total + item.units, 0)}
          />
          <StatCard
            label="Pickup selesai"
            value={picked.reduce((total, item) => total + item.units, 0)}
            hint={`${picked.length} reservasi`}
          />
          <StatCard
            label="Dibatalkan"
            value={all.filter((item) => item.status === "cancelled").length}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["aktif", "selesai", "semua"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize ${
                filter === item
                  ? "border-[#155c43] bg-[#155c43] text-white"
                  : "border-[#0d352726] bg-[#fffdf8] text-[#40564b]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {reservations.length === 0 ? (
          <EmptyState
            title="Belum ada reservasi"
            description="Reservasi dari organisasi penerima akan muncul di sini setelah listing diklaim."
            action={<LinkButton href="/batch" size="sm">Lihat batch saya</LinkButton>}
            icon={<ClipboardList className="size-5" />}
          />
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => {
              const batch = state.batches.find((item) => item.id === reservation.batchId);
              if (!batch) return null;
              return (
                <Panel key={reservation.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-semibold">
                          {reservation.recipientName}
                        </h2>
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
                            ? "Menunggu pickup"
                            : reservation.status === "picked_up"
                              ? "Sudah diambil"
                              : "Dibatalkan"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-[#40564b]">
                        {reservation.units} {batch.unit} • {batch.title}
                      </p>
                      <div className="mt-2 grid gap-1 text-xs text-[#5e6f64]">
                        <span className="flex items-center gap-1.5">
                          <CalendarClock className="size-3.5" /> {formatWindow(batch)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" /> {batch.area}
                        </span>
                      </div>
                      {reservation.note ? (
                        <p className="mt-2 rounded-lg bg-[#faf6ea] px-3 py-2 text-xs text-[#40564b]">
                          Catatan penerima: {reservation.note}
                        </p>
                      ) : null}
                      {reservation.cancelReason ? (
                        <p className="mt-2 text-xs text-[#7a3434]">
                          Alasan batal: {reservation.cancelReason}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <LinkButton href={`/batch/${batch.id}`} size="sm" variant="outline">
                        Detail batch <ArrowRight className="size-3.5" />
                      </LinkButton>
                      {reservation.status === "confirmed" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setSelected(reservation.id);
                            setReason("");
                          }}
                        >
                          Batalkan
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-[#5e6f64]">
                    Diajukan {formatDateTime(reservation.createdAt)}
                    {reservation.pickedUpAt
                      ? ` • Diambil ${formatDateTime(reservation.pickedUpAt)}`
                      : ""}
                  </p>
                </Panel>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={selected !== null}
        title="Batalkan reservasi?"
        description="Stok akan tersedia kembali untuk organisasi lain. Gunakan bila penerima tidak datang atau batch berubah."
        onClose={() => setSelected(null)}
      >
        <div className="space-y-4">
          <Field label="Alasan" hint="Opsional. Alasan default: penerima tidak datang pada jadwal pickup.">
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Kembali
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!selected) return;
                const result = cancelReservation(selected, reason);
                if (result.ok) {
                  setSelected(null);
                  setReason("");
                  setError(null);
                } else {
                  setError(result.error);
                }
              }}
            >
              Batalkan reservasi
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}

export function RecipientReservationsView() {
  const { state, user, cancelReservation } = usePanganloop();
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const reservations = state.reservations.filter(
    (reservation) => reservation.recipientId === user?.id,
  );
  const active = reservations.filter((reservation) => {
    if (reservation.status !== "confirmed") return false;
    const batch = state.batches.find((item) => item.id === reservation.batchId);
    return batch ? !isPastDeadline(batch) : false;
  });
  const history = reservations.filter((reservation) => !active.includes(reservation));

  return (
    <DashboardShell
      role="recipient"
      active="reservasi-saya"
      eyebrow="Kode pickup"
      title="Reservasi saya"
      description="Simpan kode pickup dan tunjukkan hanya kepada donor saat mengambil makanan."
      actions={<LinkButton href="/surplus">Cari surplus <ArrowRight className="size-4" /></LinkButton>}
    >
      <div className="space-y-5">
        {error ? <Notice tone="error">{error}</Notice> : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Reservasi aktif" value={active.length} />
          <StatCard
            label="Unit diklaim"
            value={active.reduce((total, item) => total + item.units, 0)}
          />
          <StatCard
            label="Sudah diambil"
            value={reservations
              .filter((item) => item.status === "picked_up")
              .reduce((total, item) => total + item.units, 0)}
          />
          <StatCard
            label="Dibatalkan"
            value={reservations.filter((item) => item.status === "cancelled").length}
          />
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Reservasi aktif</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {active.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyState
                  title="Tidak ada reservasi aktif"
                  description="Jelajahi surplus yang tersedia lalu ajukan pengambilan."
                  action={<LinkButton href="/surplus" size="sm">Jelajahi surplus</LinkButton>}
                  icon={<Store className="size-5" />}
                />
              </div>
            ) : (
              active.map((reservation) => {
                const batch = state.batches.find((item) => item.id === reservation.batchId);
                if (!batch) return null;
                const past = isPastDeadline(batch);
                return (
                  <Panel key={reservation.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold">{batch.title}</h3>
                        <p className="text-xs text-[#5e6f64]">{batch.donorName}</p>
                      </div>
                      <Badge
                        tone={
                          past
                            ? "border-[#f0c5bc] bg-[#fdf0ed] text-[#9b2c1a]"
                            : "border-[#efd9a6] bg-[#fdf6e5] text-[#7a5410]"
                        }
                      >
                        {past ? "Tenggat lewat" : "Siap pickup"}
                      </Badge>
                    </div>
                    <div className="rounded-2xl border border-[#efd9a6] bg-[#fdf6e5] p-4 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a5410]">
                        Kode pickup
                      </p>
                      <p className="mt-1 font-mono text-2xl font-bold tracking-[0.24em] text-[#7a5410]">
                        {reservation.code}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(reservation.code);
                            setCopied(reservation.code);
                            setTimeout(() => setCopied(null), 1500);
                          } catch {
                            setError("Kode tidak dapat disalin otomatis. Salin secara manual.");
                          }
                        }}
                      >
                        {copied === reservation.code ? (
                          <>
                            <Check className="size-3.5" /> Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" /> Salin kode
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="grid gap-1.5 text-xs text-[#40564b]">
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="size-3.5" /> {formatWindow(batch)}
                      </span>
                      <span className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" />
                        {batch.address}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PackageCheck className="size-3.5" /> {reservation.units} {batch.unit}
                      </span>
                    </div>
                    {batch.notes ? (
                      <p className="rounded-lg bg-[#faf6ea] px-3 py-2 text-xs text-[#40564b]">
                        {batch.notes}
                      </p>
                    ) : null}
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setSelected(reservation.id);
                          setReason("");
                        }}
                      >
                        <XCircle className="size-3.5" /> Batalkan
                      </Button>
                    </div>
                  </Panel>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Riwayat</h2>
          <div className="mt-3 space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-[#5e6f64]">Belum ada riwayat reservasi.</p>
            ) : (
              history
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((reservation) => {
                  const batch = state.batches.find((item) => item.id === reservation.batchId);
                  return (
                    <Panel key={reservation.id} className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{batch?.title ?? "Batch"}</p>
                        <p className="text-xs text-[#5e6f64]">
                          {reservation.units} {batch?.unit ?? "unit"} •{" "}
                          {formatDateTime(reservation.createdAt)}
                        </p>
                        {reservation.cancelReason ? (
                          <p className="mt-1 text-xs text-[#7a3434]">{reservation.cancelReason}</p>
                        ) : null}
                      </div>
                      <Badge
                        tone={
                          reservation.status === "picked_up"
                            ? "border-[#b9dfc4] bg-[#e9f6ed] text-[#14532d]"
                            : "border-[#e2c9c9] bg-[#f3eeee] text-[#7a3434]"
                        }
                      >
                        {reservation.status === "picked_up" ? "Diambil" : "Dibatalkan"}
                      </Badge>
                    </Panel>
                  );
                })
            )}
          </div>
        </div>
      </div>

      <Modal
        open={selected !== null}
        title="Batalkan reservasi?"
        description="Kode pickup akan tidak berlaku dan stok kembali tersedia untuk organisasi lain."
        onClose={() => setSelected(null)}
      >
        <div className="space-y-4">
          <Field label="Alasan pembatalan" hint="Wajib diisi.">
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Kembali
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!selected) return;
                const result = cancelReservation(selected, reason);
                if (result.ok) {
                  setSelected(null);
                  setReason("");
                  setError(null);
                } else {
                  setError(result.error);
                }
              }}
            >
              Batalkan reservasi
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
