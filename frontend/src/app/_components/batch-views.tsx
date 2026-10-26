"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Contact,
  Info,
  Leaf,
  MapPin,
  Package,
  Pencil,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  CATEGORIES,
  formatDateTime,
  formatWindow,
  getActiveReservations,
  getAvailableUnits,
  getDisplayStatus,
  getPickedUpUnits,
  getReservedUnits,
  getSurplus,
  imageForCategory,
  isPastDeadline,
  PICKUP_DISPOSITIONS,
  statusTone,
  toDateTimeLocal,
  usePanganloop,
  type Batch,
  type BatchInput,
  type Disposition,
} from "./store";
import { DashboardShell } from "./dashboard-shell";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  LinkButton,
  Modal,
  Notice,
  Panel,
  Select,
  StatCard,
  Textarea,
} from "./ui-kit";

function localInput(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function defaultWindow() {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60_000);
  return { start: localInput(start), end: localInput(end) };
}

type FormState = {
  title: string;
  category: string;
  description: string;
  image: string;
  unit: string;
  prepared: string;
  sold: string;
  pickupStart: string;
  pickupEnd: string;
  address: string;
  area: string;
  distanceKm: string;
  packaging: string;
  storage: string;
  allergen: string;
  handling: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  category: CATEGORIES[0],
  description: "",
  image: "",
  unit: "bungkus",
  prepared: "",
  sold: "",
  pickupStart: "",
  pickupEnd: "",
  address: "",
  area: "",
  distanceKm: "0",
  packaging: "",
  storage: "",
  allergen: "",
  handling: "",
  notes: "",
};

function formFromBatch(batch: Batch): FormState {
  return {
    title: batch.title,
    category: batch.category,
    description: batch.description,
    image: batch.image,
    unit: batch.unit,
    prepared: String(batch.prepared),
    sold: String(batch.sold),
    pickupStart: toDateTimeLocal(batch.pickupStart),
    pickupEnd: toDateTimeLocal(batch.pickupEnd),
    address: batch.address,
    area: batch.area,
    distanceKm: String(batch.distanceKm),
    packaging: batch.packaging,
    storage: batch.storage,
    allergen: batch.allergen,
    handling: batch.handling,
    notes: batch.notes ?? "",
  };
}

async function optimizeBatchImage(file: File): Promise<string> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Pilih gambar berformat JPG, PNG, atau WebP.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Ukuran gambar maksimal 10 MB.");
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const source = new window.Image();
    source.src = sourceUrl;
    await source.decode();

    const maxDataUrlLength = 450 * 1024;
    let scale = Math.min(1, 1200 / Math.max(source.naturalWidth, source.naturalHeight));
    for (let resizeAttempt = 0; resizeAttempt < 5; resizeAttempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Gambar tidak dapat diproses di browser ini.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.82, 0.7, 0.58, 0.46, 0.34]) {
        const image = canvas.toDataURL("image/jpeg", quality);
        if (image.length <= maxDataUrlLength) return image;
      }
      scale *= 0.75;
    }
  } catch {
    throw new Error("Gambar tidak dapat dibaca. Coba pilih file gambar lain.");
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }

  throw new Error("Gambar terlalu besar setelah dikompresi. Coba pilih gambar lain.");
}

export function BatchListView() {
  const { state, user } = usePanganloop();
  const [filter, setFilter] = useState<"aktif" | "selesai" | "semua">("aktif");
  const [query, setQuery] = useState("");
  const batches = state.batches.filter((batch) => batch.donorId === user?.id);
  const filtered = batches.filter((batch) => {
    const matchesFilter =
      filter === "semua" ||
      (filter === "aktif" && (batch.status === "published" || batch.status === "draft")) ||
      (filter === "selesai" && (batch.status === "closed" || batch.status === "cancelled"));
    const matchesQuery = batch.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <DashboardShell
      role="donor"
      active="batch"
      eyebrow="Manajemen surplus"
      title="Batch saya"
      description="Semua batch yang dicatat organisasi Anda, dari draft sampai closeout."
      actions={
        <LinkButton href="/batch/baru">
          <Plus className="size-4" /> Catat batch
        </LinkButton>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="w-full sm:max-w-xs">
            <Input
              type="search"
              placeholder="Cari nama batch..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Cari batch"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Tidak ada batch pada filter ini"
            description="Ubah filter atau catat batch baru untuk mulai mencatat surplus."
            action={<LinkButton href="/batch/baru" size="sm">Catat batch</LinkButton>}
            icon={<Package className="size-5" />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((batch) => {
              const status = getDisplayStatus(batch, state.reservations);
              const active = getActiveReservations(state.reservations, batch.id);
              const needsCloseout = batch.status === "published" && isPastDeadline(batch);
              return (
                <Panel key={batch.id} className="flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#e6ecdd]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={batch.image || imageForCategory(batch.category)}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-semibold">{batch.title}</h2>
                        <Badge tone={statusTone(status)}>{status}</Badge>
                      </div>
                      <p className="text-xs text-[#5e6f64]">
                        {batch.code} • {batch.category}
                      </p>
                      <p className="mt-1 text-xs text-[#40564b]">
                        {getSurplus(batch)} surplus • {getReservedUnits(state.reservations, batch.id)}{" "}
                        diklaim • {getAvailableUnits(batch, state.reservations)} tersedia
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#40564b]">
                    <div className="flex items-start gap-1.5">
                      <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-[#1c6b4f]" />
                      <span>{formatWindow(batch)}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#1c6b4f]" />
                      <span className="line-clamp-2">{batch.area}</span>
                    </div>
                  </div>

                  {needsCloseout ? (
                    <p className="mt-3 rounded-lg bg-[#fdf6e5] px-3 py-2 text-xs text-[#7a5410]">
                      Tenggat pickup lewat.{" "}
                      {active.length > 0
                        ? `${active.length} reservasi aktif perlu diselesaikan.`
                        : "Batch siap ditutup dengan closeout."}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <LinkButton href={`/batch/${batch.id}`} size="sm" variant="outline">
                      Lihat detail <ArrowRight className="size-3.5" />
                    </LinkButton>
                    {batch.status === "draft" ? (
                      <LinkButton href={`/batch/${batch.id}/edit`} size="sm" variant="ghost">
                        <Pencil className="size-3.5" /> Edit draft
                      </LinkButton>
                    ) : null}
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export function BatchFormView({ batchId }: { batchId?: string }) {
  const router = useRouter();
  const { state, user, createBatch, updateBatch } = usePanganloop();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const initialized = useRef(false);
  const batch = batchId ? state.batches.find((item) => item.id === batchId) : undefined;
  const isEdit = Boolean(batchId);

  useEffect(() => {
    if (isEdit) {
      if (!initialized.current && batch) {
        setForm(formFromBatch(batch));
        initialized.current = true;
      }
      return;
    }
    if (!initialized.current) {
      const defaults = defaultWindow();
      setForm((current) => ({
        ...current,
        pickupStart: defaults.start,
        pickupEnd: defaults.end,
        address: user?.address ?? "",
        area: user?.area ?? "",
      }));
      initialized.current = true;
    }
  }, [batch, isEdit, user?.address, user?.area]);

  const prepared = Number(form.prepared);
  const sold = Number(form.sold);
  const surplus = Number.isFinite(prepared) && Number.isFinite(sold) ? prepared - sold : 0;

  const update = (key: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setImageProcessing(true);
    try {
      const image = await optimizeBatchImage(file);
      setForm((current) => ({ ...current, image }));
    } catch (imageError) {
      setError(
        imageError instanceof Error ? imageError.message : "Gambar gagal diproses.",
      );
    } finally {
      setImageProcessing(false);
    }
  };

  const buildInput = (): BatchInput => ({
    title: form.title,
    category: form.category,
    description: form.description,
    image: form.image || imageForCategory(form.category),
    unit: form.unit,
    prepared: Number(form.prepared),
    sold: Number(form.sold),
    pickupStart: form.pickupStart ? new Date(form.pickupStart).toISOString() : "",
    pickupEnd: form.pickupEnd ? new Date(form.pickupEnd).toISOString() : "",
    address: form.address,
    area: form.area,
    distanceKm: Number(form.distanceKm),
    packaging: form.packaging,
    storage: form.storage,
    allergen: form.allergen,
    handling: form.handling,
    notes: form.notes,
  });

  const submit = async (publish: boolean) => {
    setError(null);
    setSubmitting(true);
    const input = buildInput();
    if (isEdit && batchId) {
      const result = await updateBatch(batchId, input);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/batch/${batchId}`);
      return;
    }
    const result = await createBatch(input, publish);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/batch/${result.data.id}`);
  };

  if (isEdit && !batch) {
    return (
      <DashboardShell role="donor" active="batch" eyebrow="Batch" title="Batch tidak ditemukan">
        <EmptyState
          title="Batch tidak tersedia"
          description="Batch ini tidak ditemukan atau bukan milik organisasi Anda."
          action={<LinkButton href="/batch" size="sm">Kembali ke daftar</LinkButton>}
          icon={<Info className="size-5" />}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="donor"
      active={isEdit ? "batch" : "catat"}
      eyebrow={isEdit ? "Perbarui batch" : "Catat surplus"}
      title={isEdit ? `Edit ${batch?.title ?? "batch"}` : "Catat batch baru"}
      description="Surplus dihitung otomatis dari jumlah disiapkan dikurangi jumlah terjual. Publikasikan hanya jika masih ada sisa."
    >
      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          {error ? <Notice tone="error">{error}</Notice> : null}

          <Panel>
            <h2 className="font-display text-lg font-semibold">Informasi makanan</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nama makanan" hint="Contoh: Roti sourdough.">
                  <Input value={form.title} onChange={update("title")} placeholder="Nama batch" />
                </Field>
              </div>
              <Field label="Kategori">
                <Select value={form.category} onChange={update("category")}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Satuan" hint="bungkus, kotak, potong, paket, dan sebagainya.">
                <Input value={form.unit} onChange={update("unit")} placeholder="bungkus" />
              </Field>
              <Field label="Jumlah disiapkan">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={form.prepared}
                  onChange={update("prepared")}
                  placeholder="24"
                />
              </Field>
              <Field label="Jumlah terjual">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={form.sold}
                  onChange={update("sold")}
                  placeholder="12"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Deskripsi singkat">
                  <Textarea
                    value={form.description}
                    onChange={update("description")}
                    placeholder="Jelaskan kondisi dan asal makanan."
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Foto makanan"
                  hint="Opsional. JPG, PNG, atau WebP; maksimal 10 MB. Gambar akan dikompresi otomatis."
                >
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={chooseImage}
                    disabled={imageProcessing || submitting}
                    aria-label="Unggah foto makanan"
                    className="file:mr-3 file:rounded-full file:border-0 file:bg-[#e6ecdd] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#155c43]"
                  />
                </Field>
                <div className="mt-3 flex items-center gap-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[#e6ecdd]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image || imageForCategory(form.category)}
                      alt={form.image ? "Pratinjau foto makanan" : "Gambar bawaan kategori"}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-[#5e6f64]">
                    {imageProcessing ? (
                      <span>Memproses gambar...</span>
                    ) : form.image ? (
                      <>
                        <p>Foto siap digunakan.</p>
                        <button
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, image: "" }))}
                          className="mt-1 font-semibold text-[#9b2c1a] hover:underline"
                        >
                          Hapus foto
                        </button>
                      </>
                    ) : (
                      <span>Gambar contoh kategori akan digunakan jika foto tidak diunggah.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Jadwal dan lokasi pickup</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Mulai pickup">
                <Input type="datetime-local" value={form.pickupStart} onChange={update("pickupStart")} />
              </Field>
              <Field label="Tenggat pickup">
                <Input type="datetime-local" value={form.pickupEnd} onChange={update("pickupEnd")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Alamat pickup">
                  <Input value={form.address} onChange={update("address")} />
                </Field>
              </div>
              <Field label="Area">
                <Input value={form.area} onChange={update("area")} />
              </Field>
              <Field label="Perkiraan jarak (km)" hint="Untuk estimasi jarak pickup.">
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.distanceKm}
                  onChange={update("distanceKm")}
                />
              </Field>
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-semibold">Penanganan dan alergen</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Kemasan">
                <Input value={form.packaging} onChange={update("packaging")} />
              </Field>
              <Field label="Cara penyimpanan">
                <Input value={form.storage} onChange={update("storage")} />
              </Field>
              <Field label="Alergen">
                <Input value={form.allergen} onChange={update("allergen")} />
              </Field>
              <Field label="Penanganan">
                <Input value={form.handling} onChange={update("handling")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Catatan pickup" hint="Opsional, tampil untuk penerima yang diklaim.">
                  <Textarea value={form.notes} onChange={update("notes")} />
                </Field>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Ringkasan surplus</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[#faf6ea] p-3">
                <p className="text-[11px] text-[#5e6f64]">Disiapkan</p>
                <p className="font-display text-xl font-semibold">
                  {Number.isFinite(prepared) ? prepared : 0}
                </p>
              </div>
              <div className="rounded-xl bg-[#faf6ea] p-3">
                <p className="text-[11px] text-[#5e6f64]">Terjual</p>
                <p className="font-display text-xl font-semibold">
                  {Number.isFinite(sold) ? sold : 0}
                </p>
              </div>
              <div className="rounded-xl bg-[#e6ecdd] p-3">
                <p className="text-[11px] text-[#155c43]">Surplus</p>
                <p className="font-display text-xl font-semibold text-[#155c43]">
                  {Number.isFinite(surplus) ? surplus : 0}
                </p>
              </div>
            </div>
            {surplus <= 0 ? (
              <p className="mt-3 text-xs text-[#7a5410]">
                Belum ada surplus. Simpan sebagai draft atau periksa jumlah terjual.
              </p>
            ) : (
              <p className="mt-3 text-xs text-[#5e6f64]">
                {surplus} {form.unit || "unit"} dapat ditawarkan ke organisasi penerima.
              </p>
            )}
            <div className="mt-5 space-y-2">
              {isEdit ? (
                <Button className="w-full" disabled={submitting || imageProcessing} onClick={() => submit(false)}>
                  <CheckCircle2 className="size-4" /> Simpan perubahan
                </Button>
              ) : (
                <>
                  <Button className="w-full" disabled={submitting || imageProcessing} onClick={() => submit(true)}>
                    <Send className="size-4" /> Publikasikan sekarang
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={submitting || imageProcessing}
                    onClick={() => submit(false)}
                  >
                    Simpan sebagai draft
                  </Button>
                </>
              )}
              <Link
                href="/batch"
                className="block pt-1 text-center text-xs font-semibold text-[#5e6f64] hover:text-[#155c43]"
              >
                Kembali ke daftar batch
              </Link>
            </div>
          </Panel>

          <Notice tone="info">
            Pastikan makanan masih layak, kemasan aman, dan jadwal pickup realistis. Batch yang
            sudah lewat tenggat tidak bisa diklaim.
          </Notice>
        </div>
      </div>
    </DashboardShell>
  );
}

export function BatchDetailView({ batchId }: { batchId: string }) {
  const { state, user, publishBatch, cancelBatch, closeBatch, verifyPickup } = usePanganloop();
  const [closeOpen, setCloseOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [disposition, setDisposition] = useState<Disposition>("compost");
  const [closeNotes, setCloseNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const batch = state.batches.find((item) => item.id === batchId);
  const reservations = state.reservations.filter((reservation) => reservation.batchId === batchId);
  const active = getActiveReservations(state.reservations, batchId);
  const picked = getPickedUpUnits(state.reservations, batchId);

  if (!batch || !user || batch.donorId !== user.id) {
    return (
      <DashboardShell role="donor" active="batch" eyebrow="Detail batch" title="Batch tidak ditemukan">
        <EmptyState
          title="Batch tidak tersedia"
          description="Batch ini tidak ditemukan atau bukan milik organisasi Anda."
          action={<LinkButton href="/batch" size="sm">Kembali ke daftar</LinkButton>}
          icon={<Info className="size-5" />}
        />
      </DashboardShell>
    );
  }

  const status = getDisplayStatus(batch, state.reservations);
  const available = getAvailableUnits(batch, state.reservations);
  const canCloseout =
    batch.status === "published" && isPastDeadline(batch) && active.length === 0;

  return (
    <DashboardShell
      role="donor"
      active="batch"
      eyebrow="Detail batch"
      title={batch.title}
      description={`${batch.code} • ${batch.category}`}
      actions={
        <>
          <LinkButton href="/batch" variant="outline" size="sm">
            <ArrowLeft className="size-4" /> Kembali
          </LinkButton>
          {batch.status === "draft" ? (
            <>
              <LinkButton href={`/batch/${batch.id}/edit`} variant="outline" size="sm">
                <Pencil className="size-4" /> Edit
              </LinkButton>
              <Button
                size="sm"
                onClick={async () => {
                  const result = await publishBatch(batch.id);
                  if (result.ok) {
                    setError(null);
                    setSuccess("Batch berhasil dipublikasikan.");
                  } else {
                    setError(result.error);
                  }
                }}
              >
                <Send className="size-4" /> Publikasikan
              </Button>
            </>
          ) : null}
          {batch.status === "published" ? (
            <Button
              size="sm"
              disabled={!canCloseout}
              onClick={() => setCloseOpen(true)}
              title={
                !isPastDeadline(batch)
                  ? "Closeout tersedia setelah tenggat pickup."
                  : active.length > 0
                    ? "Selesaikan reservasi aktif terlebih dahulu."
                    : undefined
              }
            >
              <ClipboardCheck className="size-4" /> Tutup batch
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-5">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {success ? <Notice tone="success">{success}</Notice> : null}
        {batch.disabled ? (
          <Notice tone="error">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                Listing dinonaktifkan admin. {batch.disabledReason ?? "Tidak ada alasan tercatat."}
              </span>
            </div>
          </Notice>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Surplus" value={`${getSurplus(batch)} ${batch.unit}`} />
          <StatCard label="Tersedia" value={`${available} ${batch.unit}`} />
          <StatCard label="Diklaim" value={`${getReservedUnits(state.reservations, batch.id)} ${batch.unit}`} />
          <StatCard label="Sudah diambil" value={`${picked} ${batch.unit}`} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-5">
            <Panel>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-[#e6ecdd] sm:h-36 sm:w-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={batch.image || imageForCategory(batch.category)}
                    alt={batch.title}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(status)}>{status}</Badge>
                    <span className="text-xs text-[#5e6f64]">{formatDateTime(batch.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#40564b]">{batch.description}</p>
                  <div className="mt-3 grid gap-2 text-xs text-[#40564b]">
                    <p className="flex items-start gap-2">
                      <CalendarClock className="mt-0.5 size-4 shrink-0 text-[#1c6b4f]" />
                      {formatWindow(batch)}
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-[#1c6b4f]" />
                      {batch.address} • {batch.area}
                    </p>
                    <p className="flex items-start gap-2">
                      <Contact className="mt-0.5 size-4 shrink-0 text-[#1c6b4f]" />
                      {batch.donorName}
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <h2 className="font-display text-lg font-semibold">Informasi penanganan</h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Kemasan", batch.packaging],
                  ["Penyimpanan", batch.storage],
                  ["Alergen", batch.allergen],
                  ["Penanganan", batch.handling],
                  ["Catatan", batch.notes || "-"],
                  ["Terakhir diperbarui", formatDateTime(batch.publishedAt ?? batch.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#5e6f64]">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-[#0d3527]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            {batch.closeout ? (
              <Panel>
                <div className="flex items-center gap-2">
                  <Leaf className="size-4 text-[#1c6b4f]" />
                  <h2 className="font-display text-lg font-semibold">Closeout</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#faf6ea] p-3">
                    <p className="text-xs text-[#5e6f64]">Terselamatkan</p>
                    <p className="font-display text-xl font-semibold">
                      {batch.closeout.rescued} {batch.unit}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#faf6ea] p-3">
                    <p className="text-xs text-[#5e6f64]">Tidak tersalurkan</p>
                    <p className="font-display text-xl font-semibold">
                      {batch.closeout.unclaimed} {batch.unit}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#faf6ea] p-3">
                    <p className="text-xs text-[#5e6f64]">Jalur akhir</p>
                    <p className="text-sm font-semibold">
                      {PICKUP_DISPOSITIONS.find((item) => item.value === batch.closeout?.disposition)
                        ?.label ?? "Belum diketahui"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#5e6f64]">{batch.closeout.notes}</p>
                <p className="mt-1 text-xs text-[#5e6f64]">
                  Ditutup {formatDateTime(batch.closeout.closedAt)}
                </p>
              </Panel>
            ) : null}
          </div>

          <div className="space-y-5">
            <Panel>
              <h2 className="font-display text-lg font-semibold">Verifikasi pickup</h2>
              <p className="mt-1 text-xs text-[#5e6f64]">
                Masukkan kode 6 karakter dari penerima. Kode hanya dapat dipakai sekali.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="R7K2QP"
                  maxLength={6}
                  aria-label="Kode pickup"
                  disabled={batch.status !== "published"}
                />
                <Button
                  size="sm"
                  disabled={batch.status !== "published"}
                  onClick={async () => {
                    const result = await verifyPickup(batch.id, code);
                    if (result.ok) {
                      setCode("");
                      setError(null);
                      setSuccess(`Pickup terverifikasi untuk ${result.data.units} ${batch.unit}.`);
                    } else {
                      setError(result.error);
                    }
                  }}
                >
                  Verifikasi
                </Button>
              </div>
              {batch.status !== "published" ? (
                <p className="mt-2 text-xs text-[#5e6f64]">
                  Verifikasi hanya tersedia untuk batch yang dipublikasikan.
                </p>
              ) : null}
              {batch.status === "published" && isPastDeadline(batch) ? (
                <p className="mt-2 text-xs text-[#9b2c1a]">
                  Tenggat sudah lewat. Pickup tidak dapat diverifikasi lagi.
                </p>
              ) : null}
            </Panel>

            <Panel>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">Reservasi</h2>
                <span className="text-xs text-[#5e6f64]">{active.length} aktif</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {reservations.length === 0 ? (
                  <p className="text-sm text-[#5e6f64]">Belum ada reservasi untuk batch ini.</p>
                ) : (
                  reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-start justify-between gap-2 border-b border-[#0d35270f] pb-2.5 text-sm last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{reservation.recipientName}</p>
                        <p className="text-[11px] text-[#5e6f64]">
                          {reservation.units} {batch.unit} • {formatDateTime(reservation.createdAt)}
                        </p>
                        <p className="text-[11px] text-[#5e6f64]">Kode disembunyikan</p>
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
            </Panel>

            {batch.status !== "closed" && batch.status !== "cancelled" ? (
              <Panel>
                <h2 className="font-display text-lg font-semibold">Batalkan batch</h2>
                <p className="mt-1 text-xs text-[#5e6f64]">
                  Pembatalan mengembalikan stok dan hanya bisa dilakukan setelah semua reservasi
                  aktif diselesaikan.
                </p>
                <Button
                  className="mt-3"
                  variant="danger"
                  size="sm"
                  disabled={active.length > 0}
                  onClick={() => setCancelOpen(true)}
                >
                  <Trash2 className="size-4" /> Batalkan batch
                </Button>
                {active.length > 0 ? (
                  <p className="mt-2 text-xs text-[#7a5410]">
                    {active.length} reservasi masih aktif.
                  </p>
                ) : null}
              </Panel>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={closeOpen}
        title="Tutup batch dengan closeout"
        description={`${batch.title} • ${picked} ${batch.unit} sudah diambil. Pilih jalur akhir untuk ${
          Math.max(0, getSurplus(batch) - picked)
        } ${batch.unit} yang tidak tersalurkan.`}
        onClose={() => setCloseOpen(false)}
      >
        <div className="space-y-4">
          <Field label="Jalur akhir surplus">
            <Select
              value={disposition}
              onChange={(event) => setDisposition(event.target.value as Disposition)}
            >
              {PICKUP_DISPOSITIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Catatan closeout" hint="Wajib diisi, misalnya alasan tidak terklaim.">
            <Textarea
              value={closeNotes}
              onChange={(event) => setCloseNotes(event.target.value)}
              placeholder="Contoh: sisa tidak layak konsumsi dan dikompos."
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCloseOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={async () => {
                const result = await closeBatch(batch.id, disposition, closeNotes);
                if (result.ok) {
                  setCloseOpen(false);
                  setCloseNotes("");
                  setSuccess(
                    `Batch ditutup: ${result.data.rescued} ${batch.unit} terselamatkan, ${result.data.unclaimed} ${batch.unit} tidak tersalurkan.`,
                  );
                } else {
                  setError(result.error);
                }
              }}
            >
              <CheckCircle2 className="size-4" /> Tutup batch
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={cancelOpen}
        title="Batalkan batch?"
        description="Stok reservasi cancelled tidak dihitung lagi. Tindakan ini tidak dapat dibatalkan."
        onClose={() => setCancelOpen(false)}
      >
        <div className="space-y-4">
          <Field label="Alasan pembatalan">
            <Textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Contoh: batch tidak jadi diproduksi."
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Kembali
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const result = await cancelBatch(batch.id, cancelReason);
                if (result.ok) {
                  setCancelOpen(false);
                  setSuccess("Batch dibatalkan.");
                } else {
                  setError(result.error);
                }
              }}
            >
              <XCircle className="size-4" /> Batalkan batch
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
