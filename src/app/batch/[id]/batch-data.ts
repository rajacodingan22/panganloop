export interface BatchDetailData {
  id: string;
  code: string;
  name: string;
  statusLabel: string;
  statusType: "sebagian" | "selesai" | "draft" | "tersedia";
  image: string;
  storeName: string;
  location: string;
  createdDate: string;
  author: string;
  disiapkan: number;
  terjual: number;
  surplus: number;
  tersedia: number;
  timeline: {
    title: string;
    time: string;
    description: string;
    state: "completed" | "current" | "pending";
  }[];
  reservations: {
    id: string;
    recipientName: string;
    units: number;
    status: "Menunggu pickup" | "Sudah diambil" | "Batal";
    pickupTime: string;
  }[];
  penyimpanan: {
    label: string;
    desc: string;
  };
  alergen: {
    label: string;
    desc: string;
  };
}

export const batchDatabase: Record<string, BatchDetailData> = {
  "batch-1": {
    id: "batch-1",
    code: "#BT-2024-00123",
    name: "Roti tawar",
    statusLabel: "Sebagian dipesan",
    statusType: "sebagian",
    image: "/assets/surplus/surplus-roti.jpg",
    storeName: "Toko Roti Sumber Rasa",
    location: "Jakarta Selatan",
    createdDate: "12 Nov 2024, 08:15",
    author: "Sari Purnama",
    disiapkan: 20,
    terjual: 8,
    surplus: 12,
    tersedia: 8,
    timeline: [
      {
        title: "Batch dibuat",
        time: "12 Nov 2024, 08:15",
        description: "Batch berhasil dibuat oleh penyedia.",
        state: "completed",
      },
      {
        title: "Dipublikasikan",
        time: "12 Nov 2024, 08:30",
        description: "Batch kini dapat dilihat dan dipesan oleh penerima.",
        state: "completed",
      },
      {
        title: "Reservasi masuk",
        time: "12 Nov 2024, 10:24",
        description: "1 reservasi (4 unit) dari Komunitas Berbagi Pangan.",
        state: "completed",
      },
      {
        title: "Pickup menunggu",
        time: "12 Nov 2024, 10:30",
        description: "Menunggu konfirmasi pickup dari penerima.",
        state: "current",
      },
      {
        title: "Batch ditutup",
        time: "",
        description: "Batch akan ditutup setelah semua unit tersalurkan atau oleh penyedia.",
        state: "pending",
      },
    ],
    reservations: [
      {
        id: "res-1",
        recipientName: "Komunitas Berbagi Pangan",
        units: 4,
        status: "Menunggu pickup",
        pickupTime: "12 Nov 2024, 16:00 - 18:30 WIB",
      },
    ],
    penyimpanan: {
      label: "Suhu ruang (15–25°C)",
      desc: "Simpan di tempat kering dan terhindar dari sinar matahari langsung.",
    },
    alergen: {
      label: "Mengandung gluten (gandum), dapat mengandung jejak susu dan telur.",
      desc: "Informasi ini membantu penerima dalam penanganan yang aman.",
    },
  },
  "batch-2": {
    id: "batch-2",
    code: "#BT-2024-00122",
    name: "Nasi kotak ayam",
    statusLabel: "Selesai disalurkan",
    statusType: "selesai",
    image: "/assets/surplus/surplus-nasi.jpg",
    storeName: "Dapur Pagi Catering",
    location: "Jakarta Selatan",
    createdDate: "12 Okt 2026, 09:00",
    author: "Budi Santoso",
    disiapkan: 30,
    terjual: 18,
    surplus: 12,
    tersedia: 0,
    timeline: [
      {
        title: "Batch dibuat",
        time: "12 Okt 2026, 09:00",
        description: "Batch disiapkan dengan menu nasi ayam bakar.",
        state: "completed",
      },
      {
        title: "Dipublikasikan",
        time: "12 Okt 2026, 09:30",
        description: "Surplus tayang di aplikasi PANGANLOOP.",
        state: "completed",
      },
      {
        title: "Reservasi masuk",
        time: "12 Okt 2026, 12:15",
        description: "Yayasan Kasih Peduli mengklaim 12 unit.",
        state: "completed",
      },
      {
        title: "Pickup berhasil",
        time: "12 Okt 2026, 17:30",
        description: "Pangan diserahterimakan dan dikonfirmasi.",
        state: "completed",
      },
      {
        title: "Batch ditutup",
        time: "12 Okt 2026, 18:00",
        description: "Seluruh pangan terselamatkan.",
        state: "completed",
      },
    ],
    reservations: [
      {
        id: "res-2",
        recipientName: "Yayasan Kasih Peduli",
        units: 12,
        status: "Sudah diambil",
        pickupTime: "12 Okt 2026, 17:30 WIB",
      },
    ],
    penyimpanan: {
      label: "Suhu hangat (konsumsi segera)",
      desc: "Disarankan untuk langsung dikonsumsi sebelum malam tiba.",
    },
    alergen: {
      label: "Bebas kacang & gluten, mengandung protein unggas.",
      desc: "Disiapkan higienis di dapur bersertifikasi.",
    },
  },
  "batch-3": {
    id: "batch-3",
    code: "#BT-2024-00124",
    name: "Kue bolu",
    statusLabel: "Draft tersimpan",
    statusType: "draft",
    image: "/assets/surplus/surplus-kue.jpg",
    storeName: "Toko Roti Sumber Rasa",
    location: "Jakarta Selatan",
    createdDate: "18 Okt 2026, 14:00",
    author: "Sari Purnama",
    disiapkan: 16,
    terjual: 12,
    surplus: 4,
    tersedia: 4,
    timeline: [
      {
        title: "Batch dibuat",
        time: "18 Okt 2026, 14:00",
        description: "Batch dicatat sebagai draft closing sore.",
        state: "completed",
      },
      {
        title: "Dipublikasikan",
        time: "-",
        description: "Menunggu penayangan ke komunitas.",
        state: "pending",
      },
      {
        title: "Reservasi masuk",
        time: "-",
        description: "Belum ada reservasi masuk.",
        state: "pending",
      },
      {
        title: "Pickup menunggu",
        time: "-",
        description: "Menunggu proses reservasi.",
        state: "pending",
      },
      {
        title: "Batch ditutup",
        time: "-",
        description: "Akan ditutup setelah seluruh unit selesai.",
        state: "pending",
      },
    ],
    reservations: [],
    penyimpanan: {
      label: "Suhu ruang (15–25°C)",
      desc: "Simpan dalam wadah kedap udara.",
    },
    alergen: {
      label: "Mengandung telur, mentega (susu), dan tepung gandum.",
      desc: "Harap perhatikan penerima dengan alergi laktosa.",
    },
  },
};

export function getBatchDetail(id: string): BatchDetailData {
  return (
    batchDatabase[id] ||
    batchDatabase["batch-1"] || {
      id: "batch-1",
      code: "#BT-2024-00123",
      name: "Roti tawar",
      statusLabel: "Sebagian dipesan",
      statusType: "sebagian",
      image: "/assets/surplus/surplus-roti.jpg",
      storeName: "Toko Roti Sumber Rasa",
      location: "Jakarta Selatan",
      createdDate: "12 Nov 2024, 08:15",
      author: "Sari Purnama",
      disiapkan: 20,
      terjual: 8,
      surplus: 12,
      tersedia: 8,
      timeline: [],
      reservations: [],
      penyimpanan: { label: "Suhu ruang", desc: "" },
      alergen: { label: "Mengandung gluten", desc: "" },
    }
  );
}
