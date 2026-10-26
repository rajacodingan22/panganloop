"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Role = "donor" | "recipient" | "admin";
export type OrgStatus = "pending" | "approved" | "rejected";
export type BatchStatus = "draft" | "published" | "closed" | "cancelled";
export type ReservationStatus = "confirmed" | "picked_up" | "cancelled";
export type Disposition =
  | "compost"
  | "internal"
  | "discarded"
  | "other"
  | "unknown";

export interface Organization {
  id: string;
  name: string;
  pic: string;
  email: string;
  password?: string;
  role: Role;
  orgType: string;
  phone: string;
  address: string;
  area: string;
  status: OrgStatus;
  createdAt: string;
}

export interface Batch {
  id: string;
  code: string;
  donorId: string;
  donorName: string;
  title: string;
  category: string;
  description: string;
  image: string;
  unit: string;
  prepared: number;
  sold: number;
  status: BatchStatus;
  pickupStart: string;
  pickupEnd: string;
  createdAt: string;
  publishedAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  address: string;
  area: string;
  distanceKm: number;
  packaging: string;
  storage: string;
  allergen: string;
  handling: string;
  notes?: string;
  disabled?: boolean;
  disabledReason?: string;
  closeout?: {
    disposition: Disposition;
    notes: string;
    rescued: number;
    unclaimed: number;
    closedAt: string;
  };
}

export interface Reservation {
  id: string;
  code: string;
  batchId: string;
  recipientId: string;
  recipientName: string;
  units: number;
  note: string;
  status: ReservationStatus;
  createdAt: string;
  pickedUpAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  summary: string;
  batchId?: string;
  reservationId?: string;
}

export interface StoreState {
  version: 1;
  organizations: Organization[];
  batches: Batch[];
  reservations: Reservation[];
  audit: AuditEntry[];
}

export interface CurrentUser {
  id: string;
  name: string;
  pic: string;
  email: string;
  role: Role;
  roleLabel: string;
  orgType: string;
  phone: string;
  address: string;
  area: string;
  status: OrgStatus;
  approved: boolean;
}

export interface BatchInput {
  title: string;
  category: string;
  description: string;
  image: string;
  unit: string;
  prepared: number;
  sold: number;
  pickupStart: string;
  pickupEnd: string;
  address: string;
  area: string;
  distanceKm: number;
  packaging: string;
  storage: string;
  allergen: string;
  handling: string;
  notes?: string;
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

export type RegisterInput = {
  role: "donor" | "recipient";
  name: string;
  pic: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  area: string;
};

export const DATA_KEY = "panganloop.data.v1";
export const SESSION_KEY = "panganloop.session.v1";

export const PICKUP_DISPOSITIONS: { value: Disposition; label: string }[] = [
  { value: "compost", label: "Dikompos" },
  { value: "internal", label: "Digunakan internal" },
  { value: "discarded", label: "Dibuang" },
  { value: "other", label: "Disalurkan dengan cara lain" },
  { value: "unknown", label: "Belum diketahui" },
];

export const CATEGORIES = [
  "Bakery & roti",
  "Makanan siap santap",
  "Buah & sayur",
  "Makanan kemasan",
  "Lainnya",
] as const;

export const DEMO_LOGIN_ACCOUNTS = [
  {
    email: "rotipagi@panganloop.id",
    password: "password123",
    role: "donor" as const,
    label: "Donor",
    name: "Roti Pagi Studio (Demo)",
    description: "Catat surplus, publikasikan, verifikasi pickup, dan tutup batch.",
  },
  {
    email: "komunitas@panganloop.id",
    password: "password123",
    role: "recipient" as const,
    label: "Penerima",
    name: "Komunitas Berbagi Pangan (Demo)",
    description: "Jelajahi surplus, ajukan pengambilan, dan tunjukkan kode pickup.",
  },
  {
    email: "admin@panganloop.id",
    password: "password123",
    role: "admin" as const,
    label: "Admin",
    name: "Admin PANGANLOOP (Demo)",
    description: "Setujui organisasi, awasi listing, dan periksa jejak audit.",
  },
];

const CATEGORY_IMAGE: Record<string, string> = {
  "Bakery & roti": "/assets/surplus/surplus-roti.jpg",
  "Makanan siap santap": "/assets/surplus/surplus-nasi.jpg",
  "Buah & sayur": "/assets/crate-vegetables-hd.png",
  "Makanan kemasan": "/assets/pickup-box.jpg",
  Lainnya: "/assets/surplus/surplus-kue.jpg",
};

export function imageForCategory(category: string) {
  return CATEGORY_IMAGE[category] ?? CATEGORY_IMAGE["Lainnya"];
}

function addDays(dayOffset: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function createSeedState(): StoreState {
  const now = new Date().toISOString();
  const organizations: Organization[] = [
    {
      id: "org-admin",
      name: "Admin PANGANLOOP (Demo)",
      pic: "Admin Demo",
      email: "admin@panganloop.id",
      password: "password123",
      role: "admin",
      orgType: "Operasional platform",
      phone: "0811-2233-4455",
      address: "Jakarta, Indonesia",
      area: "Jakarta",
      status: "approved",
      createdAt: now,
    },
    {
      id: "org-rotipagi",
      name: "Roti Pagi Studio (Demo)",
      pic: "Sari Purnama",
      email: "rotipagi@panganloop.id",
      password: "password123",
      role: "donor",
      orgType: "Toko roti & katering",
      phone: "0812-3456-7890",
      address: "Jl. Tebet Barat Dalam Raya No. 42, Jakarta Selatan",
      area: "Tebet, Jakarta Selatan",
      status: "approved",
      createdAt: now,
    },
    {
      id: "org-sumberrasa",
      name: "Toko Roti Sumber Rasa (Demo)",
      pic: "Budi Santoso",
      email: "sumberrasa@panganloop.id",
      password: "password123",
      role: "donor",
      orgType: "Toko roti & katering",
      phone: "0812-7777-1122",
      address: "Jl. Kebon Sirih No. 15, Menteng, Jakarta Pusat",
      area: "Menteng, Jakarta Pusat",
      status: "approved",
      createdAt: now,
    },
    {
      id: "org-komunitas",
      name: "Komunitas Berbagi Pangan (Demo)",
      pic: "Ahmad Fauzi",
      email: "komunitas@panganloop.id",
      password: "password123",
      role: "recipient",
      orgType: "Organisasi food rescue komunitas",
      phone: "0812-9988-7711",
      address: "Jl. Kramat Raya No. 12, Senen, Jakarta Pusat",
      area: "Senen, Jakarta Pusat",
      status: "approved",
      createdAt: now,
    },
    {
      id: "org-kasih",
      name: "Yayasan Kasih Peduli (Demo)",
      pic: "Siti Rahma",
      email: "kasihpeduli@panganloop.id",
      password: "password123",
      role: "recipient",
      orgType: "Panti asuhan & dapur komunitas",
      phone: "0812-9988-7766",
      address: "Jl. Otista Raya No. 18, Jakarta Timur",
      area: "Jatinegara, Jakarta Timur",
      status: "approved",
      createdAt: now,
    },
    {
      id: "org-panti",
      name: "Panti Harapan Baru (Demo)",
      pic: "Rina Wulandari",
      email: "panti@panganloop.id",
      password: "password123",
      role: "recipient",
      orgType: "Panti asuhan",
      phone: "0813-2211-8899",
      address: "Jl. Duren Tiga No. 8, Jakarta Selatan",
      area: "Pancoran, Jakarta Selatan",
      status: "pending",
      createdAt: now,
    },
  ];

  const base = {
    donorId: "org-rotipagi",
    donorName: "Roti Pagi Studio (Demo)",
    address: "Jl. Tebet Barat Dalam Raya No. 42, Jakarta Selatan",
    area: "Tebet, Jakarta Selatan",
    distanceKm: 2.1,
    packaging: "Kemasan food grade, kondisi utuh",
    handling: "Disiapkan pada pagi hari dan disimpan di rak tertutup.",
    allergen: "Mengandung gluten (gandum), susu, dan telur.",
  };

  const batches: Batch[] = [
    {
      ...base,
      id: "batch-sourdough",
      code: "BT-2026-001",
      title: "Roti sourdough",
      category: "Bakery & roti",
      description: "Roti sourdough panggang pagi ini, masih layak dikonsumsi.",
      image: "/assets/surplus/surplus-roti.jpg",
      unit: "bungkus",
      prepared: 24,
      sold: 12,
      status: "published",
      pickupStart: addDays(0, 17, 0),
      pickupEnd: addDays(0, 18, 30),
      createdAt: addDays(0, 8, 15),
      publishedAt: addDays(0, 8, 30),
      storage: "Suhu ruang 15-25°C, jauh dari sinar matahari langsung.",
      notes: "Ambil di pintu samping toko, tunjukkan kode pickup.",
    },
    {
      ...base,
      id: "batch-croissant",
      code: "BT-2026-002",
      title: "Croissant butter",
      category: "Bakery & roti",
      description: "Croissant mentega dari sisa produksi hari ini.",
      image: "/assets/surplus/surplus-kue.jpg",
      unit: "potong",
      prepared: 18,
      sold: 10,
      status: "published",
      pickupStart: addDays(0, 17, 30),
      pickupEnd: addDays(0, 19, 0),
      createdAt: addDays(0, 9, 0),
      publishedAt: addDays(0, 9, 10),
      storage: "Wadah tertutup pada suhu ruang.",
      notes: "Ambil di meja pickup dekat kasir.",
    },
    {
      ...base,
      id: "batch-tawar",
      code: "BT-2026-003",
      title: "Roti tawar gandum",
      category: "Bakery & roti",
      description: "Roti tawar gandum utuh, diproduksi hari ini.",
      image: "/assets/surplus/surplus-roti.jpg",
      unit: "bungkus",
      prepared: 20,
      sold: 6,
      status: "published",
      pickupStart: addDays(1, 16, 0),
      pickupEnd: addDays(1, 18, 0),
      createdAt: addDays(0, 10, 0),
      publishedAt: addDays(0, 10, 5),
      storage: "Suhu ruang, kemasan tertutup.",
      notes: "Pickup di pintu samping toko.",
    },
    {
      ...base,
      id: "batch-bolu",
      code: "BT-2026-004",
      title: "Kue bolu marmer",
      category: "Bakery & roti",
      description: "Bolu marmer sisa display, belum dipublikasikan.",
      image: "/assets/surplus/surplus-kue.jpg",
      unit: "potong",
      prepared: 16,
      sold: 12,
      status: "draft",
      pickupStart: addDays(1, 15, 0),
      pickupEnd: addDays(1, 17, 0),
      createdAt: addDays(0, 11, 0),
      storage: "Suhu ruang, wadah kedap udara.",
      notes: "Perlu dikemas ulang sebelum pickup.",
    },
    {
      ...base,
      id: "batch-sobek",
      code: "BT-2026-005",
      title: "Roti sobek cokelat",
      category: "Bakery & roti",
      description: "Roti sobek isi cokelat dari produksi dua hari lalu.",
      image: "/assets/surplus/surplus-roti.jpg",
      unit: "bungkus",
      prepared: 20,
      sold: 8,
      status: "closed",
      pickupStart: addDays(-2, 16, 0),
      pickupEnd: addDays(-2, 18, 0),
      createdAt: addDays(-2, 8, 0),
      publishedAt: addDays(-2, 8, 15),
      closedAt: addDays(-2, 18, 20),
      storage: "Suhu ruang.",
      closeout: {
        disposition: "compost",
        notes: "Sisa 2 bungkus tidak layak jual, dikompos.",
        rescued: 10,
        unclaimed: 2,
        closedAt: addDays(-2, 18, 20),
      },
    },
    {
      ...base,
      id: "batch-baguette",
      code: "BT-2026-006",
      title: "Baguette gandum",
      category: "Bakery & roti",
      description: "Baguette dari produksi tiga hari lalu.",
      image: "/assets/surplus/surplus-roti.jpg",
      unit: "potong",
      prepared: 16,
      sold: 6,
      status: "closed",
      pickupStart: addDays(-3, 16, 0),
      pickupEnd: addDays(-3, 18, 0),
      createdAt: addDays(-3, 8, 0),
      publishedAt: addDays(-3, 8, 20),
      closedAt: addDays(-3, 18, 30),
      storage: "Suhu ruang.",
      closeout: {
        disposition: "internal",
        notes: "Sisa 2 potong digunakan untuk staf.",
        rescued: 8,
        unclaimed: 2,
        closedAt: addDays(-3, 18, 30),
      },
    },
    {
      ...base,
      id: "batch-danish",
      code: "BT-2026-007",
      title: "Danish pastry",
      category: "Bakery & roti",
      description: "Danish pastry dari produksi lima hari lalu.",
      image: "/assets/surplus/surplus-kue.jpg",
      unit: "potong",
      prepared: 24,
      sold: 10,
      status: "closed",
      pickupStart: addDays(-5, 16, 0),
      pickupEnd: addDays(-5, 18, 0),
      createdAt: addDays(-5, 8, 0),
      publishedAt: addDays(-5, 8, 10),
      closedAt: addDays(-5, 18, 15),
      storage: "Suhu ruang.",
      closeout: {
        disposition: "other",
        notes: "Seluruh surplus tersalurkan ke yayasan mitra.",
        rescued: 14,
        unclaimed: 0,
        closedAt: addDays(-5, 18, 15),
      },
    },
    {
      ...base,
      id: "batch-cinnamon",
      code: "BT-2026-008",
      title: "Cinnamon roll",
      category: "Bakery & roti",
      description: "Cinnamon roll dari produksi tujuh hari lalu.",
      image: "/assets/surplus/surplus-kue.jpg",
      unit: "potong",
      prepared: 18,
      sold: 8,
      status: "closed",
      pickupStart: addDays(-7, 16, 0),
      pickupEnd: addDays(-7, 18, 0),
      createdAt: addDays(-7, 8, 0),
      publishedAt: addDays(-7, 8, 25),
      closedAt: addDays(-7, 18, 10),
      storage: "Suhu ruang.",
      closeout: {
        disposition: "discarded",
        notes: "Sisa 4 potong tidak memenuhi standar kualitas.",
        rescued: 6,
        unclaimed: 4,
        closedAt: addDays(-7, 18, 10),
      },
    },
    {
      ...base,
      id: "batch-pastry",
      code: "BT-2026-009",
      title: "Pastry almond",
      category: "Bakery & roti",
      description: "Pastry almond dari produksi pagi ini, waktu pickup sudah lewat.",
      image: "/assets/surplus/surplus-kue.jpg",
      unit: "potong",
      prepared: 12,
      sold: 7,
      status: "published",
      pickupStart: addDays(0, 8, 0),
      pickupEnd: addDays(0, 10, 0),
      createdAt: addDays(0, 6, 30),
      publishedAt: addDays(0, 6, 45),
      storage: "Suhu ruang.",
      notes: "Batch contoh untuk closeout setelah tenggat.",
    },
    {
      donorId: "org-sumberrasa",
      donorName: "Toko Roti Sumber Rasa (Demo)",
      address: "Jl. Kebon Sirih No. 15, Menteng, Jakarta Pusat",
      area: "Menteng, Jakarta Pusat",
      distanceKm: 3.4,
      packaging: "Kotak makan food grade tersegel",
      handling: "Dimasak dan dikemas pada hari yang sama.",
      allergen: "Mengandung kedelai, telur, dan rempah.",
      id: "batch-nasi",
      code: "BT-2026-010",
      title: "Nasi kotak ayam",
      category: "Makanan siap santap",
      description: "Nasi kotak ayam bakar dengan tahu tempe dan lalapan.",
      image: "/assets/surplus/surplus-nasi.jpg",
      unit: "kotak",
      prepared: 30,
      sold: 18,
      status: "published",
      pickupStart: addDays(0, 16, 30),
      pickupEnd: addDays(0, 18, 30),
      createdAt: addDays(0, 9, 0),
      publishedAt: addDays(0, 9, 15),
      storage: "Konsumsi sebelum pukul 21.00 atau simpan di chiller.",
      notes: "Ambil di area parkir belakang.",
    },
    {
      donorId: "org-sumberrasa",
      donorName: "Toko Roti Sumber Rasa (Demo)",
      address: "Jl. Kebon Sirih No. 15, Menteng, Jakarta Pusat",
      area: "Menteng, Jakarta Pusat",
      distanceKm: 3.4,
      packaging: "Paket sayur dalam kantong kertas food grade",
      handling: "Dicuci dan dipotong pada pagi hari.",
      allergen: "Tanpa alergen utama yang diketahui.",
      id: "batch-sayur",
      code: "BT-2026-011",
      title: "Paket sayur segar",
      category: "Buah & sayur",
      description: "Paket sayur harian dari sisa produksi katering.",
      image: "/assets/crate-vegetables-hd.png",
      unit: "paket",
      prepared: 20,
      sold: 12,
      status: "published",
      pickupStart: addDays(0, 17, 0),
      pickupEnd: addDays(0, 19, 0),
      createdAt: addDays(0, 10, 0),
      publishedAt: addDays(0, 10, 20),
      storage: "Simpan di kulkas atau cooler box.",
      notes: "Bawa cooler box bila memungkinkan.",
    },
    {
      donorId: "org-sumberrasa",
      donorName: "Toko Roti Sumber Rasa (Demo)",
      address: "Jl. Kebon Sirih No. 15, Menteng, Jakarta Pusat",
      area: "Menteng, Jakarta Pusat",
      distanceKm: 3.4,
      packaging: "Kotak kue",
      handling: "Disiapkan kemarin.",
      allergen: "Mengandung telur dan susu.",
      id: "batch-expired",
      code: "BT-2026-012",
      title: "Kue lapis legit",
      category: "Bakery & roti",
      description: "Batch contoh yang sudah melewati tenggat pickup.",
      image: "/assets/surplus/surplus-kue.jpg",
      unit: "potong",
      prepared: 14,
      sold: 9,
      status: "published",
      pickupStart: addDays(-1, 14, 0),
      pickupEnd: addDays(-1, 16, 0),
      createdAt: addDays(-1, 8, 0),
      publishedAt: addDays(-1, 8, 30),
      storage: "Suhu ruang.",
      notes: "Tidak dapat diklaim karena tenggat sudah lewat.",
    },
  ];

  const reservations: Reservation[] = [
    {
      id: "res-001",
      code: "R7K2QP",
      batchId: "batch-sourdough",
      recipientId: "org-komunitas",
      recipientName: "Komunitas Berbagi Pangan (Demo)",
      units: 3,
      note: "Untuk distribusi malam ini.",
      status: "confirmed",
      createdAt: addDays(0, 9, 10),
    },
    {
      id: "res-002",
      code: "M4X9TB",
      batchId: "batch-sourdough",
      recipientId: "org-kasih",
      recipientName: "Yayasan Kasih Peduli (Demo)",
      units: 2,
      note: "",
      status: "confirmed",
      createdAt: addDays(0, 9, 35),
    },
    {
      id: "res-003",
      code: "K8N3WD",
      batchId: "batch-sobek",
      recipientId: "org-komunitas",
      recipientName: "Komunitas Berbagi Pangan (Demo)",
      units: 10,
      note: "",
      status: "picked_up",
      createdAt: addDays(-2, 10, 0),
      pickedUpAt: addDays(-2, 17, 20),
    },
    {
      id: "res-004",
      code: "T2P6HS",
      batchId: "batch-danish",
      recipientId: "org-kasih",
      recipientName: "Yayasan Kasih Peduli (Demo)",
      units: 14,
      note: "",
      status: "picked_up",
      createdAt: addDays(-5, 9, 0),
      pickedUpAt: addDays(-5, 17, 30),
    },
    {
      id: "res-005",
      code: "J9F4LR",
      batchId: "batch-cinnamon",
      recipientId: "org-komunitas",
      recipientName: "Komunitas Berbagi Pangan (Demo)",
      units: 6,
      note: "",
      status: "picked_up",
      createdAt: addDays(-7, 9, 30),
      pickedUpAt: addDays(-7, 17, 0),
    },
    {
      id: "res-006",
      code: "B5C8NV",
      batchId: "batch-baguette",
      recipientId: "org-kasih",
      recipientName: "Yayasan Kasih Peduli (Demo)",
      units: 8,
      note: "",
      status: "picked_up",
      createdAt: addDays(-3, 10, 15),
      pickedUpAt: addDays(-3, 17, 45),
    },
    {
      id: "res-007",
      code: "H3Q7ZX",
      batchId: "batch-croissant",
      recipientId: "org-komunitas",
      recipientName: "Komunitas Berbagi Pangan (Demo)",
      units: 3,
      note: "Dibatalkan karena jadwal armada berubah.",
      status: "cancelled",
      createdAt: addDays(0, 10, 30),
      cancelledAt: addDays(0, 11, 0),
      cancelledBy: "org-komunitas",
      cancelReason: "Jadwal armada berubah.",
    },
  ];

  const audit: AuditEntry[] = [
    {
      id: "aud-001",
      at: addDays(0, 8, 30),
      actorId: "org-rotipagi",
      actorName: "Roti Pagi Studio (Demo)",
      action: "batch_published",
      summary: "Mempublikasikan Roti sourdough (12 bungkus tersedia).",
      batchId: "batch-sourdough",
    },
    {
      id: "aud-002",
      at: addDays(0, 9, 10),
      actorId: "org-komunitas",
      actorName: "Komunitas Berbagi Pangan (Demo)",
      action: "reservation_created",
      summary: "Mengajukan 3 bungkus Roti sourdough.",
      batchId: "batch-sourdough",
      reservationId: "res-001",
    },
    {
      id: "aud-003",
      at: addDays(-2, 18, 20),
      actorId: "org-rotipagi",
      actorName: "Roti Pagi Studio (Demo)",
      action: "batch_closed",
      summary: "Menutup Roti sobek cokelat dengan 10 bungkus tersalurkan.",
      batchId: "batch-sobek",
    },
  ];

  return { version: 1, organizations, batches, reservations, audit };
}

export function emptyState(): StoreState {
  return { version: 1, organizations: [], batches: [], reservations: [], audit: [] };
}

function parseStored(raw: string | null): StoreState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoreState;
    if (
      parsed &&
      parsed.version === 1 &&
      Array.isArray(parsed.organizations) &&
      Array.isArray(parsed.batches) &&
      Array.isArray(parsed.reservations) &&
      Array.isArray(parsed.audit)
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function newId(prefix: string) {
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function pickupCode(existing: string[]) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 40; attempt += 1) {
    let code = "";
    const values = new Uint32Array(6);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(values);
      code = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
    } else {
      code = Array.from(
        { length: 6 },
        () => alphabet[Math.floor(Math.random() * alphabet.length)],
      ).join("");
    }
    if (!existing.includes(code)) return code;
  }
  return `X${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

export function getSurplus(batch: Batch) {
  return Math.max(0, batch.prepared - batch.sold);
}

export function getReservedUnits(reservations: Reservation[], batchId: string) {
  return reservations
    .filter(
      (reservation) =>
        reservation.batchId === batchId &&
        (reservation.status === "confirmed" || reservation.status === "picked_up"),
    )
    .reduce((total, reservation) => total + reservation.units, 0);
}

export function getActiveReservations(reservations: Reservation[], batchId: string) {
  return reservations.filter(
    (reservation) => reservation.batchId === batchId && reservation.status === "confirmed",
  );
}

export function getAvailableUnits(batch: Batch, reservations: Reservation[]) {
  return Math.max(0, getSurplus(batch) - getReservedUnits(reservations, batch.id));
}

export function getPickedUpUnits(reservations: Reservation[], batchId: string) {
  return reservations
    .filter(
      (reservation) => reservation.batchId === batchId && reservation.status === "picked_up",
    )
    .reduce((total, reservation) => total + reservation.units, 0);
}

export function isPastDeadline(batch: Batch, now = Date.now()) {
  return new Date(batch.pickupEnd).getTime() < now;
}

export function isBatchClaimable(
  batch: Batch,
  reservations: Reservation[],
  now = Date.now(),
) {
  return (
    batch.status === "published" &&
    !batch.disabled &&
    !isPastDeadline(batch, now) &&
    getAvailableUnits(batch, reservations) > 0
  );
}

export type DisplayStatus =
  | "Draft"
  | "Tersedia"
  | "Sebagian diklaim"
  | "Penuh"
  | "Kedaluwarsa"
  | "Ditutup"
  | "Dibatalkan"
  | "Dinonaktifkan";

export function getDisplayStatus(
  batch: Batch,
  reservations: Reservation[],
  now = Date.now(),
): DisplayStatus {
  if (batch.status === "cancelled") return "Dibatalkan";
  if (batch.status === "closed") return "Ditutup";
  if (batch.disabled) return "Dinonaktifkan";
  if (batch.status === "draft") return "Draft";
  if (isPastDeadline(batch, now)) return "Kedaluwarsa";
  const available = getAvailableUnits(batch, reservations);
  if (available <= 0) return "Penuh";
  const reserved = getReservedUnits(reservations, batch.id);
  if (reserved > 0) return "Sebagian diklaim";
  return "Tersedia";
}

export function statusTone(status: DisplayStatus) {
  switch (status) {
    case "Tersedia":
      return "bg-[#e3f4e8] text-[#14532d] border-[#b9dfc4]";
    case "Sebagian diklaim":
      return "bg-[#fdf3dc] text-[#7a5410] border-[#efd9a6]";
    case "Penuh":
      return "bg-[#e8eefc] text-[#1f3f88] border-[#c4d3f5]";
    case "Kedaluwarsa":
      return "bg-[#fdf0ed] text-[#9b2c1a] border-[#f0c5bc]";
    case "Ditutup":
      return "bg-[#eef0ed] text-[#44544a] border-[#d5dad2]";
    case "Dibatalkan":
      return "bg-[#f3eeee] text-[#7a3434] border-[#e2c9c9]";
    case "Dinonaktifkan":
      return "bg-[#f3eeee] text-[#7a3434] border-[#e2c9c9]";
    default:
      return "bg-[#f3efe4] text-[#6b5a32] border-[#ded3ba]";
  }
}

export function formatDateTime(value: string | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatDate(value: string | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function pickupWindowDates(batch: Batch) {
  const start = new Date(batch.pickupStart);
  const end = new Date(batch.pickupEnd);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return null;
  return { start, end };
}

export function formatWindow(batch: Batch) {
  const dates = pickupWindowDates(batch);
  if (!dates) return "Jadwal pickup tidak valid";
  const { start, end } = dates;
  const sameDay =
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(start) ===
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(end);
  if (sameDay) {
    return `${formatDate(batch.pickupStart)}, ${formatTime(batch.pickupStart)}-${formatTime(batch.pickupEnd)} WIB`;
  }
  return `${formatDateTime(batch.pickupStart)} - ${formatDateTime(batch.pickupEnd)} WIB`;
}

export function formatRangeShort(batch: Batch) {
  if (!pickupWindowDates(batch)) return "Jadwal pickup tidak valid";
  return `${formatDate(batch.pickupStart)} • ${formatTime(batch.pickupStart)}-${formatTime(batch.pickupEnd)}`;
}

export function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function roleLabel(role: Role) {
  if (role === "donor") return "Donor";
  if (role === "recipient") return "Penerima";
  return "Admin";
}

export function statusLabel(status: OrgStatus) {
  if (status === "approved") return "Disetujui";
  if (status === "pending") return "Menunggu verifikasi";
  return "Ditolak";
}

function toCurrentUser(org: Organization | null): CurrentUser | null {
  if (!org) return null;
  return {
    id: org.id,
    name: org.name,
    pic: org.pic,
    email: org.email,
    role: org.role,
    roleLabel: roleLabel(org.role),
    orgType: org.orgType,
    phone: org.phone,
    address: org.address,
    area: org.area,
    status: org.status,
    approved: org.status === "approved",
  };
}

type StoreContextValue = {
  state: StoreState;
  ready: boolean;
  user: CurrentUser | null;
  login: (email: string, password: string) => ActionResult;
  quickLogin: (email: string) => ActionResult;
  logout: () => void;
  register: (input: RegisterInput) => ActionResult<{ pending: boolean }>;
  approveOrganization: (id: string) => ActionResult;
  rejectOrganization: (id: string) => ActionResult;
  createBatch: (input: BatchInput, publish: boolean) => ActionResult<{ id: string }>;
  updateBatch: (id: string, input: BatchInput) => ActionResult;
  publishBatch: (id: string) => ActionResult;
  cancelBatch: (id: string, reason: string) => ActionResult;
  disableBatch: (id: string, disabled: boolean, reason: string) => ActionResult;
  createReservation: (
    batchId: string,
    units: number,
    note: string,
  ) => ActionResult<{ id: string; code: string }>;
  cancelReservation: (id: string, reason: string) => ActionResult;
  verifyPickup: (batchId: string, code: string) => ActionResult<{ units: number }>;
  closeBatch: (
    id: string,
    disposition: Disposition,
    notes: string,
  ) => ActionResult<{ rescued: number; unclaimed: number }>;
  resetDemo: () => void;
  audit: AuditEntry[];
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function PanganloopStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(emptyState);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let next = parseStored(window.localStorage.getItem(DATA_KEY));
    if (!next) {
      next = createSeedState();
      try {
        window.localStorage.setItem(DATA_KEY, JSON.stringify(next));
      } catch {
        // Storage may be unavailable in private mode.
      }
    }
    // Load persisted demo data after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next);
    stateRef.current = next;
    try {
      const session = window.sessionStorage.getItem(SESSION_KEY);
      if (session && next.organizations.some((org) => org.id === session)) {
        setUserId(session);
      }
    } catch {
      // Ignore inaccessible session storage.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== DATA_KEY) return;
      const next = parseStored(event.newValue);
      if (next) {
        setState(next);
        stateRef.current = next;
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: StoreState) => {
    setState(next);
    stateRef.current = next;
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(next));
    } catch {
      // Storage may be unavailable in private mode.
    }
  }, []);

  const update = useCallback(
    (updater: (prev: StoreState) => StoreState) => {
      const next = updater(stateRef.current);
      persist(next);
      return next;
    },
    [persist],
  );

  const setSession = useCallback((id: string | null) => {
    setUserId(id);
    try {
      if (id) window.sessionStorage.setItem(SESSION_KEY, id);
      else window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore inaccessible session storage.
    }
  }, []);

  const user = useMemo(() => {
    if (!userId) return null;
    return toCurrentUser(state.organizations.find((org) => org.id === userId) ?? null);
  }, [state.organizations, userId]);

  const login = useCallback(
    (email: string, password: string): ActionResult => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        return { ok: false, error: "Masukkan email dan kata sandi." };
      }
      const org = stateRef.current.organizations.find(
        (item) => item.email.toLowerCase() === normalized,
      );
      if (!org || org.password !== password) {
        return { ok: false, error: "Email atau kata sandi tidak cocok." };
      }
      if (org.status === "rejected") {
        return {
          ok: false,
          error: "Akun organisasi ini ditolak. Hubungi admin PANGANLOOP.",
        };
      }
      setSession(org.id);
      return { ok: true };
    },
    [setSession],
  );

  const quickLogin = useCallback(
    (email: string): ActionResult => {
      return login(email, "password123");
    },
    [login],
  );

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const register = useCallback(
    (input: RegisterInput): ActionResult<{ pending: boolean }> => {
      const email = input.email.trim().toLowerCase();
      if (!input.name.trim() || !input.pic.trim() || !email || !input.password) {
        return { ok: false, error: "Lengkapi nama organisasi, penanggung jawab, email, dan kata sandi." };
      }
      if (input.password.length < 8) {
        return { ok: false, error: "Kata sandi minimal 8 karakter." };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: "Format email belum benar." };
      }
      if (
        stateRef.current.organizations.some(
          (org) => org.email.toLowerCase() === email,
        )
      ) {
        return { ok: false, error: "Email sudah terdaftar. Silakan masuk." };
      }
      const org: Organization = {
        id: newId("org"),
        name: input.name.trim(),
        pic: input.pic.trim(),
        email,
        password: input.password,
        role: input.role,
        orgType:
          input.role === "donor"
            ? "Usaha pangan"
            : "Organisasi penerima",
        phone: input.phone.trim() || "-",
        address: input.address.trim() || "-",
        area: input.area.trim() || "DKI Jakarta",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      update((prev) => ({
        ...prev,
        organizations: [...prev.organizations, org],
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: org.id,
            actorName: org.name,
            action: "organization_registered",
            summary: `Mendaftar sebagai ${roleLabel(org.role)} dan menunggu verifikasi.`,
          },
          ...prev.audit,
        ],
      }));
      setSession(org.id);
      return { ok: true, data: { pending: true } };
    },
    [setSession, update],
  );

  const approveOrganization = useCallback(
    (id: string): ActionResult => {
      if (!user || user.role !== "admin") {
        return { ok: false, error: "Hanya admin yang dapat menyetujui organisasi." };
      }
      const target = stateRef.current.organizations.find((org) => org.id === id);
      if (!target) return { ok: false, error: "Organisasi tidak ditemukan." };
      if (target.role === "admin") return { ok: false, error: "Akun admin tidak perlu disetujui." };
      update((prev) => ({
        ...prev,
        organizations: prev.organizations.map((org) =>
          org.id === id ? { ...org, status: "approved" } : org,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "organization_approved",
            summary: `Menyetujui organisasi ${target.name}.`,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true };
    },
    [update, user],
  );

  const rejectOrganization = useCallback(
    (id: string): ActionResult => {
      if (!user || user.role !== "admin") {
        return { ok: false, error: "Hanya admin yang dapat menolak organisasi." };
      }
      const target = stateRef.current.organizations.find((org) => org.id === id);
      if (!target) return { ok: false, error: "Organisasi tidak ditemukan." };
      if (target.role === "admin") return { ok: false, error: "Akun admin tidak dapat ditolak." };
      update((prev) => ({
        ...prev,
        organizations: prev.organizations.map((org) =>
          org.id === id ? { ...org, status: "rejected" } : org,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "organization_rejected",
            summary: `Menolak organisasi ${target.name}.`,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true };
    },
    [update, user],
  );

  const createBatch = useCallback(
    (input: BatchInput, publish: boolean): ActionResult<{ id: string }> => {
      if (!user || user.role !== "donor") {
        return { ok: false, error: "Masuk sebagai donor untuk mencatat batch." };
      }
      if (!user.approved) {
        return { ok: false, error: "Organisasi Anda belum disetujui admin." };
      }
      if (!input.title.trim()) return { ok: false, error: "Nama makanan wajib diisi." };
      if (!input.category) return { ok: false, error: "Pilih kategori makanan." };
      if (!Number.isInteger(input.prepared) || input.prepared <= 0) {
        return { ok: false, error: "Jumlah disiapkan harus bilangan bulat lebih dari 0." };
      }
      if (!Number.isInteger(input.sold) || input.sold < 0) {
        return { ok: false, error: "Jumlah terjual harus bilangan bulat dan tidak negatif." };
      }
      if (input.sold > input.prepared) {
        return { ok: false, error: "Jumlah terjual tidak boleh melebihi jumlah disiapkan." };
      }
      if (publish && input.prepared - input.sold <= 0) {
        return { ok: false, error: "Tidak ada surplus untuk dipublikasikan." };
      }
      const start = new Date(input.pickupStart).getTime();
      const end = new Date(input.pickupEnd).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return { ok: false, error: "Lengkapi waktu pickup mulai dan tenggat." };
      }
      if (end <= start) {
        return { ok: false, error: "Tenggat pickup harus setelah waktu mulai." };
      }
      if (publish && end <= Date.now()) {
        return { ok: false, error: "Tenggat pickup sudah lewat. Perbarui waktu pickup." };
      }
      if (!input.address.trim()) return { ok: false, error: "Alamat pickup wajib diisi." };
      if (!input.unit.trim()) return { ok: false, error: "Satuan wajib diisi." };

      const id = newId("batch");
      const year = new Date().getFullYear();
      const sequence = stateRef.current.batches.length + 1;
      const batch: Batch = {
        id,
        code: `BT-${year}-${String(sequence).padStart(3, "0")}`,
        donorId: user.id,
        donorName: user.name,
        title: input.title.trim(),
        category: input.category,
        description: input.description.trim(),
        image: input.image || imageForCategory(input.category),
        unit: input.unit.trim(),
        prepared: input.prepared,
        sold: input.sold,
        status: publish ? "published" : "draft",
        pickupStart: new Date(start).toISOString(),
        pickupEnd: new Date(end).toISOString(),
        createdAt: new Date().toISOString(),
        publishedAt: publish ? new Date().toISOString() : undefined,
        address: input.address.trim(),
        area: input.area.trim() || user.area,
        distanceKm: Number.isFinite(input.distanceKm) ? input.distanceKm : 0,
        packaging: input.packaging.trim(),
        storage: input.storage.trim(),
        allergen: input.allergen.trim(),
        handling: input.handling.trim(),
        notes: input.notes?.trim(),
      };
      update((prev) => ({
        ...prev,
        batches: [batch, ...prev.batches],
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: publish ? "batch_published" : "batch_created",
            summary: publish
              ? `Mempublikasikan ${batch.title} (${batch.prepared - batch.sold} ${batch.unit} tersedia).`
              : `Menyimpan draft ${batch.title}.`,
            batchId: id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true, data: { id } };
    },
    [update, user],
  );

  const updateBatch = useCallback(
    (id: string, input: BatchInput): ActionResult => {
      if (!user || user.role !== "donor") {
        return { ok: false, error: "Masuk sebagai donor untuk mengubah batch." };
      }
      const batch = stateRef.current.batches.find((item) => item.id === id);
      if (!batch) return { ok: false, error: "Batch tidak ditemukan." };
      if (batch.donorId !== user.id) {
        return { ok: false, error: "Anda hanya dapat mengubah batch milik organisasi sendiri." };
      }
      if (batch.status !== "draft") {
        return { ok: false, error: "Batch yang sudah dipublikasikan tidak dapat diubah. Batalkan atau tutup batch." };
      }
      if (input.sold > input.prepared) {
        return { ok: false, error: "Jumlah terjual tidak boleh melebihi jumlah disiapkan." };
      }
      const start = new Date(input.pickupStart).getTime();
      const end = new Date(input.pickupEnd).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        return { ok: false, error: "Waktu pickup belum valid." };
      }
      update((prev) => ({
        ...prev,
        batches: prev.batches.map((item) =>
          item.id === id
            ? {
                ...item,
                title: input.title.trim(),
                category: input.category,
                description: input.description.trim(),
                image: input.image || imageForCategory(input.category),
                unit: input.unit.trim(),
                prepared: input.prepared,
                sold: input.sold,
                pickupStart: new Date(start).toISOString(),
                pickupEnd: new Date(end).toISOString(),
                address: input.address.trim(),
                area: input.area.trim(),
                distanceKm: input.distanceKm,
                packaging: input.packaging.trim(),
                storage: input.storage.trim(),
                allergen: input.allergen.trim(),
                handling: input.handling.trim(),
                notes: input.notes?.trim(),
              }
            : item,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "batch_updated",
            summary: `Memperbarui draft ${input.title}.`,
            batchId: id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true };
    },
    [update, user],
  );

  const publishBatch = useCallback(
    (id: string): ActionResult => {
      if (!user || user.role !== "donor") {
        return { ok: false, error: "Masuk sebagai donor untuk mempublikasikan batch." };
      }
      const batch = stateRef.current.batches.find((item) => item.id === id);
      if (!batch) return { ok: false, error: "Batch tidak ditemukan." };
      if (batch.donorId !== user.id) {
        return { ok: false, error: "Anda hanya dapat mengelola batch milik organisasi sendiri." };
      }
      if (batch.status !== "draft") return { ok: false, error: "Hanya draft yang dapat dipublikasikan." };
      if (getSurplus(batch) <= 0) {
        return { ok: false, error: "Tidak ada surplus untuk dipublikasikan." };
      }
      if (new Date(batch.pickupEnd).getTime() <= Date.now()) {
        return { ok: false, error: "Tenggat pickup sudah lewat." };
      }
      update((prev) => ({
        ...prev,
        batches: prev.batches.map((item) =>
          item.id === id
            ? { ...item, status: "published", publishedAt: new Date().toISOString() }
            : item,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "batch_published",
            summary: `Mempublikasikan ${batch.title} (${getSurplus(batch)} ${batch.unit} tersedia).`,
            batchId: id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true };
    },
    [update, user],
  );

  const cancelBatch = useCallback(
    (id: string, reason: string): ActionResult => {
      if (!user || user.role !== "donor") {
        return { ok: false, error: "Masuk sebagai donor untuk membatalkan batch." };
      }
      const batch = stateRef.current.batches.find((item) => item.id === id);
      if (!batch) return { ok: false, error: "Batch tidak ditemukan." };
      if (batch.donorId !== user.id) {
        return { ok: false, error: "Anda hanya dapat mengelola batch milik organisasi sendiri." };
      }
      if (batch.status === "closed") return { ok: false, error: "Batch sudah ditutup." };
      if (batch.status === "cancelled") return { ok: false, error: "Batch sudah dibatalkan." };
      const active = getActiveReservations(stateRef.current.reservations, id);
      if (active.length > 0) {
        return {
          ok: false,
          error: `Selesaikan ${active.length} reservasi aktif terlebih dahulu sebelum membatalkan batch.`,
        };
      }
      if (!reason.trim()) return { ok: false, error: "Tuliskan alasan pembatalan." };
      update((prev) => ({
        ...prev,
        batches: prev.batches.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "cancelled",
                cancelledAt: new Date().toISOString(),
                cancelReason: reason.trim(),
              }
            : item,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "batch_cancelled",
            summary: `Membatalkan ${batch.title}: ${reason.trim()}`,
            batchId: id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true };
    },
    [update, user],
  );

  const disableBatch = useCallback(
    (id: string, disabled: boolean, reason: string): ActionResult => {
      if (!user || user.role !== "admin") {
        return { ok: false, error: "Hanya admin yang dapat mengubah status listing." };
      }
      const batch = stateRef.current.batches.find((item) => item.id === id);
      if (!batch) return { ok: false, error: "Listing tidak ditemukan." };
      if (disabled && !reason.trim()) {
        return { ok: false, error: "Tuliskan alasan penonaktifan." };
      }
      update((prev) => ({
        ...prev,
        batches: prev.batches.map((item) =>
          item.id === id
            ? {
                ...item,
                disabled,
                disabledReason: disabled ? reason.trim() : undefined,
              }
            : item,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: disabled ? "listing_disabled" : "listing_enabled",
            summary: disabled
              ? `Menonaktifkan ${batch.title}: ${reason.trim()}`
              : `Mengaktifkan kembali ${batch.title}.`,
            batchId: id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true };
    },
    [update, user],
  );

  const createReservation = useCallback(
    (batchId: string, units: number, note: string): ActionResult<{ id: string; code: string }> => {
      if (!user || user.role !== "recipient") {
        return { ok: false, error: "Masuk sebagai organisasi penerima untuk mengajukan pengambilan." };
      }
      if (!user.approved) {
        return {
          ok: false,
          error: "Organisasi Anda sedang menunggu verifikasi. Anda dapat menjelajahi surplus, tetapi belum dapat mengajukan pengambilan.",
        };
      }
      if (!Number.isInteger(units) || units <= 0) {
        return { ok: false, error: "Jumlah unit harus bilangan bulat lebih dari 0." };
      }
      const snapshot = stateRef.current;
      const batch = snapshot.batches.find((item) => item.id === batchId);
      if (!batch) return { ok: false, error: "Batch tidak ditemukan." };
      if (batch.disabled) {
        return { ok: false, error: "Listing sedang dinonaktifkan oleh admin." };
      }
      if (batch.status !== "published") {
        return { ok: false, error: "Listing tidak sedang menerima reservasi." };
      }
      if (isPastDeadline(batch)) {
        return { ok: false, error: "Tenggat pickup sudah lewat. Listing tidak dapat diklaim." };
      }
      const duplicate = snapshot.reservations.find(
        (reservation) =>
          reservation.batchId === batchId &&
          reservation.recipientId === user.id &&
          reservation.status !== "cancelled",
      );
      if (duplicate) {
        return { ok: false, error: "Organisasi Anda sudah memiliki reservasi untuk batch ini." };
      }
      const available = getAvailableUnits(batch, snapshot.reservations);
      if (units > available) {
        return {
          ok: false,
          error: `Stok berubah. Sisa yang tersedia sekarang ${available} ${batch.unit}.`,
        };
      }
      const code = pickupCode(snapshot.reservations.map((item) => item.code));
      const reservation: Reservation = {
        id: newId("res"),
        code,
        batchId,
        recipientId: user.id,
        recipientName: user.name,
        units,
        note: note.trim(),
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      update((prev) => ({
        ...prev,
        reservations: [reservation, ...prev.reservations],
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "reservation_created",
            summary: `Mengajukan ${units} ${batch.unit} ${batch.title}.`,
            batchId,
            reservationId: reservation.id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true, data: { id: reservation.id, code } };
    },
    [update, user],
  );

  const cancelReservation = useCallback(
    (id: string, reason: string): ActionResult => {
      if (!user) return { ok: false, error: "Masuk untuk membatalkan reservasi." };
      const snapshot = stateRef.current;
      const reservation = snapshot.reservations.find((item) => item.id === id);
      if (!reservation) return { ok: false, error: "Reservasi tidak ditemukan." };
      const batch = snapshot.batches.find((item) => item.id === reservation.batchId);
      if (!batch) return { ok: false, error: "Batch tidak ditemukan." };
      const isRecipientOwner =
        user.role === "recipient" && reservation.recipientId === user.id;
      const isDonorOwner = user.role === "donor" && batch.donorId === user.id;
      const isAdmin = user.role === "admin";
      if (!isRecipientOwner && !isDonorOwner && !isAdmin) {
        return { ok: false, error: "Anda tidak berhak membatalkan reservasi ini." };
      }
      if (reservation.status === "picked_up") {
        return { ok: false, error: "Reservasi sudah dikonfirmasi pickup dan tidak dapat dibatalkan." };
      }
      if (reservation.status === "cancelled") {
        return { ok: false, error: "Reservasi sudah dibatalkan." };
      }
      if (isRecipientOwner && !reason.trim()) {
        return { ok: false, error: "Tuliskan alasan pembatalan." };
      }
      const finalReason =
        reason.trim() ||
        (isDonorOwner ? "Penerima tidak datang pada jadwal pickup." : "Dibatalkan oleh admin.");
      update((prev) => ({
        ...prev,
        reservations: prev.reservations.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "cancelled",
                cancelledAt: new Date().toISOString(),
                cancelledBy: user.id,
                cancelReason: finalReason,
              }
            : item,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "reservation_cancelled",
            summary: `Membatalkan reservasi ${reservation.code} (${reservation.units} ${batch.unit} ${batch.title}): ${finalReason}`,
            batchId: batch.id,
            reservationId: reservation.id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true };
    },
    [update, user],
  );

  const verifyPickup = useCallback(
    (batchId: string, code: string): ActionResult<{ units: number }> => {
      if (!user || (user.role !== "donor" && user.role !== "admin")) {
        return { ok: false, error: "Hanya donor atau admin yang dapat memverifikasi pickup." };
      }
      const snapshot = stateRef.current;
      const batch = snapshot.batches.find((item) => item.id === batchId);
      if (!batch) return { ok: false, error: "Batch tidak ditemukan." };
      if (user.role === "donor" && batch.donorId !== user.id) {
        return { ok: false, error: "Anda hanya dapat memverifikasi batch milik organisasi sendiri." };
      }
      if (batch.status === "closed") return { ok: false, error: "Batch sudah ditutup." };
      if (batch.status === "cancelled") return { ok: false, error: "Batch sudah dibatalkan." };
      if (isPastDeadline(batch)) {
        return { ok: false, error: "Tenggat pickup sudah lewat. Hubungi admin bila perlu koreksi." };
      }
      const normalized = code.trim().toUpperCase();
      if (!normalized) return { ok: false, error: "Masukkan kode pickup." };
      const reservation = snapshot.reservations.find(
        (item) =>
          item.batchId === batchId &&
          item.code === normalized &&
          item.status !== "cancelled",
      );
      if (!reservation) {
        return { ok: false, error: "Kode tidak cocok. Periksa kembali kode pada reservasi." };
      }
      if (reservation.status === "picked_up") {
        return { ok: false, error: "Kode ini sudah digunakan. Pickup hanya dapat dikonfirmasi sekali." };
      }
      update((prev) => ({
        ...prev,
        reservations: prev.reservations.map((item) =>
          item.id === reservation.id
            ? { ...item, status: "picked_up", pickedUpAt: new Date().toISOString() }
            : item,
        ),
        audit: [
          {
            id: newId("aud"),
            at: new Date().toISOString(),
            actorId: user.id,
            actorName: user.name,
            action: "pickup_confirmed",
            summary: `Mengonfirmasi pickup ${reservation.units} ${batch.unit} ${batch.title} untuk ${reservation.recipientName}.`,
            batchId,
            reservationId: reservation.id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true, data: { units: reservation.units } };
    },
    [update, user],
  );

  const closeBatch = useCallback(
    (id: string, disposition: Disposition, notes: string): ActionResult<{ rescued: number; unclaimed: number }> => {
      if (!user || user.role !== "donor") {
        return { ok: false, error: "Masuk sebagai donor untuk menutup batch." };
      }
      const snapshot = stateRef.current;
      const batch = snapshot.batches.find((item) => item.id === id);
      if (!batch) return { ok: false, error: "Batch tidak ditemukan." };
      if (batch.donorId !== user.id) {
        return { ok: false, error: "Anda hanya dapat menutup batch milik organisasi sendiri." };
      }
      if (batch.status === "closed") return { ok: false, error: "Batch sudah ditutup." };
      if (batch.status !== "published") {
        return { ok: false, error: "Hanya batch yang dipublikasikan yang dapat ditutup." };
      }
      const active = getActiveReservations(snapshot.reservations, id);
      if (active.length > 0) {
        return {
          ok: false,
          error: `Masih ada ${active.length} reservasi aktif. Selesaikan pickup atau batalkan reservasi tersebut sebelum menutup batch.`,
        };
      }
      if (!isPastDeadline(batch)) {
        return { ok: false, error: "Tutup batch setelah tenggat pickup berakhir." };
      }
      const rescued = getPickedUpUnits(snapshot.reservations, id);
      const unclaimed = Math.max(0, getSurplus(batch) - rescued);
      if (!disposition) return { ok: false, error: "Pilih jalur akhir untuk sisa batch." };
      if (!notes.trim()) return { ok: false, error: "Tuliskan catatan closeout." };
      const closedAt = new Date().toISOString();
      update((prev) => ({
        ...prev,
        batches: prev.batches.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "closed",
                closedAt,
                closeout: {
                  disposition,
                  notes: notes.trim(),
                  rescued,
                  unclaimed,
                  closedAt,
                },
              }
            : item,
        ),
        audit: [
          {
            id: newId("aud"),
            at: closedAt,
            actorId: user.id,
            actorName: user.name,
            action: "batch_closed",
            summary: `Menutup ${batch.title}: ${rescued} ${batch.unit} tersalurkan, ${unclaimed} ${batch.unit} tidak tersalurkan.`,
            batchId: id,
          },
          ...prev.audit,
        ],
      }));
      return { ok: true, data: { rescued, unclaimed } };
    },
    [update, user],
  );

  const resetDemo = useCallback(() => {
    const next = createSeedState();
    persist(next);
    setSession(null);
  }, [persist, setSession]);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      ready,
      user,
      login,
      quickLogin,
      logout,
      register,
      approveOrganization,
      rejectOrganization,
      createBatch,
      updateBatch,
      publishBatch,
      cancelBatch,
      disableBatch,
      createReservation,
      cancelReservation,
      verifyPickup,
      closeBatch,
      resetDemo,
      audit: state.audit,
    }),
    [
      approveOrganization,
      cancelBatch,
      cancelReservation,
      closeBatch,
      createBatch,
      createReservation,
      disableBatch,
      login,
      logout,
      publishBatch,
      quickLogin,
      ready,
      register,
      rejectOrganization,
      resetDemo,
      state,
      updateBatch,
      user,
      verifyPickup,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePanganloop() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("usePanganloop must be used within PanganloopStoreProvider");
  }
  return context;
}

export function useAuth() {
  const { user, login, quickLogin, logout } = usePanganloop();
  return { user, login, quickLogin, logout };
}
