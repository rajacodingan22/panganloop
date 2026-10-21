export type SurplusItem = {
  id: string;
  category: "roti" | "nasi" | "kue";
  window: "sore" | "malam";
  distance: number;
  photo: string;
  alt: string;
  title: string;
  units: number;
  cutoff: string;
  org: string;
  place: string;
  distanceLabel: string;
  area: string;
  cutoffFull: string;
  pickupNote: string;
  batchPrepared: number;
  batchSold: number;
  packaged: string;
  storage: string;
  allergen: string;
};

export const surplusItems: SurplusItem[] = [
  {
    id: "roti-tawar",
    category: "roti",
    window: "sore",
    distance: 2.1,
    photo: "/assets/surplus/surplus-roti.jpg",
    alt: "Roti tawar iris",
    title: "Roti tawar",
    units: 12,
    cutoff: "Ambil sebelum 18.30",
    org: "Toko Roti Suka Rasa",
    place: "Jakarta Selatan",
    distanceLabel: "2,1 km",
    area: "Kawasan Tebet, Jakarta Selatan",
    cutoffFull: "Ambil sebelum 18.30, 20 Oktober 2026",
    pickupNote: "Roti tawar, kemasan utuh, siap diambil",
    batchPrepared: 20,
    batchSold: 8,
    packaged: "Dikemas hari ini",
    storage: "Penyimpanan suhu ruang",
    allergen: "Alergen mengandung gandum",
  },
  {
    id: "nasi-kotak-ayam",
    category: "nasi",
    window: "sore",
    distance: 3.4,
    photo: "/assets/surplus/surplus-nasi.jpg",
    alt: "Nasi kotak ayam",
    title: "Nasi kotak ayam",
    units: 12,
    cutoff: "Ambil sebelum 18.30",
    org: "Dapur Sehat Bersama",
    place: "Jakarta Pusat",
    distanceLabel: "3,4 km",
    area: "Kawasan Menteng, Jakarta Pusat",
    cutoffFull: "Ambil sebelum 18.30, 20 Oktober 2026",
    pickupNote: "Nasi kotak ayam, kemasan tertutup, siap diambil",
    batchPrepared: 18,
    batchSold: 6,
    packaged: "Dikemas hari ini",
    storage: "Simpan di lemari pendingin",
    allergen: "Mengandung telur dan kedelai",
  },
  {
    id: "kue-bolu",
    category: "kue",
    window: "sore",
    distance: 4.8,
    photo: "/assets/surplus/surplus-kue.jpg",
    alt: "Kue bolu",
    title: "Kue bolu",
    units: 12,
    cutoff: "Ambil sebelum 18.30",
    org: "Mama Cita Bakery",
    place: "Tangerang",
    distanceLabel: "4,8 km",
    area: "Kawasan Ciledug, Tangerang",
    cutoffFull: "Ambil sebelum 18.30, 20 Oktober 2026",
    pickupNote: "Kue bolu, kemasan utuh, siap diambil",
    batchPrepared: 16,
    batchSold: 4,
    packaged: "Dikemas hari ini",
    storage: "Penyimpanan suhu ruang",
    allergen: "Mengandung telur, gandum, dan susu",
  },
];

export function getSurplusItem(id: string) {
  return surplusItems.find((item) => item.id === id);
}
