# PanganLoop — Aplikasi Pengelolaan Surplus Makanan

**PanganLoop** adalah platform penuh stack untuk menghubungkan surplus makanan dengan komunitas yang membutuhkan. Aplikasi ini memungkinkan pemilik usaha dan organisasi untuk mencatat surplus, sementara penerima dapat mengajukan reservasi dan mengakuisisi makanan tersebut.

---

## 📋 Ringkasan Proyek

| Aspek | Detail |
|-------|--------|
| **Nama Aplikasi** | PanganLoop |
| **Versi** | 1.0.0 |
| **Tujuan** | Mengurangi pembazirhan makanan dengan memfasilitasi transfer surplus dari donor ke penerima |
| **Stack Teknologi** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Firebase Auth & Firestore |
| **Arsitektur** | Full-stack: frontend Next.js + backend API routes dengan Firebase Admin SDK |
| **Role yang Tersedia** | Donor, Penerima, Admin |

---

## 🚀 Fitur Utama

### 1. Autentikasi & Otorisasi
- **Firebase Authentication** untuk login/register dengan email & kata sandi
- **Session cookies** httpOnly (durasi 5 hari) via backend
- **Role-based access control** per pengguna (donor, penerima, admin)
- **Verifikasi status organisasi** (pending → approved → rejected)

### 2. Manajemen Batch (Donor)
- **Catat surplus** dengan detail: kategori, jumlah, deskripsi, gambar
- **Publish batch** untuk diakses penerima
- **Tutup batch** (closeout) dengan outcome: terselamatkan, terklaim, dibuang
- **Nonaktifkan/aktifkan listing**

### 3. Sistem Reservasi (Penerima)
- **Ajukan reservasi** pada batch yang tersedia
- **Kode pickup** unik untuk setiap reservasi
- **Lacak status reservasi**: konfirmasi → diambil → dibatalkan
- **Riwayat reservasi pribadi**

### 4. Dashboard per Role

#### Donor Dashboard
- Ringkasan batch aktif, reservasi, dan pangan terselamatkan
- Notifikasi batch yang melewati tenggat pickup
- Statistik: unit tersedia, unit diklaim, unit terselamatkan
- Insight batch tertutup per kategori

#### Recipient Dashboard
- Listing surplus tersedia untuk diajukan
- Reservasi aktif dan kode pickup
- Riwayat reservasi sendiri
- Status verifikasi akun

#### Admin Dashboard
- **Menunggu verifikasi**: setujui/tolak organisasi baru
- **Listing**: nonaktifkan batch yang melanggar aturan
- **Jejak audit**: semua aksi penting tercatat
- Statistik organizasi, listing, dan outcome closeout

### 5. Pelacakan Dampak (Impact)
- **Metrik transparansi**: surplus dipublikasikan, diklaim, terselamatkan
- **Bar chart per kategori**: dipublikasikan vs berhasil diambil
- **Distribusi outcome**: compost, internal, dibuang, other
- **Insight kategori**: minimal 4 batch ditutup untuk tampil

### 6. Profil Organisasi
- Data lengkap: nama, PIC, email, telepon, alamat, area, status
- Status verifikasi ditampilkan dengan indikator warna
- Catatan sesi disimpan per tab browser

---

## 🏗️ Arsitektur Teknis

### Backend (`panganloop/backend/`)
- **Framework**: Next.js 14 App Router dengan API Routes
- **Bahasa**: TypeScript
- **Database**: Firestore (NoSQL)
- **Auth**: Firebase Admin SDK (password sign-in/sign-up, session cookies)
- **Struktur API**:
  - `POST /api/auth/login` - Masuk & buat session cookie
  - `POST /api/auth/register` - Daftar baru (Firebase Auth + Firestore profile)
  - `GET /api/auth/me` - Ambil profil pengguna
  - `GET /api/state` - Ambil state lengkap (organisasi, batch, reservasi, audit)
  - `GET /api/health` - Cek kesehatan layanan
  - `GET /api/[resource]/[id]` - CRUD operasi batch/reservasi

- **Library utama**:
  - `lib/firebase-admin.ts` - Inisialisasi Firebase Admin
  - `lib/auth-api.ts` - Panggil Firebase Auth REST API
  - `lib/http.ts` - Respons JSON, validasi origin, handling error
  - `lib/domain.ts` - Fungsi utilitas: kode pickup, validasi, timestamp
  - `lib/models.ts` - Type interface: Organization, Batch, Reservation, Role

### Frontend (`panganloop/frontend/`)
- **Framework**: Next.js 14 (App Router) dengan pengurananserver components
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS kustom
- **Component Library**: UI kustom (Badge, Button, Input, Modal, StatCard, dll)
- **State Management**: Context API (`store.ts`, `ui-context.ts`)

- **Halaman utama**:
  - `/` - Beranda
  - `/login` - Halaman masuk
  - `/register` - Daftar akun baru
  - `/admin` - Dashboard admin
  - `/dashboard` - Dashboard per role
  - `/profil` - Profil organisasi
  - `/batch/baru` - Catat batch baru
  - `/surplus` - Listing surplus
  - `/insight` - Insight batch dan outcome

---

## 📦 Instalasi & Setup

### Prasyarat
- Node.js 18+ atau 20+
- Firebase project (`panganloop`)
- Firebase Admin SDK credentials

### Backend Setup
```bash
cd panganloop/backend
npm install
# Konfigurasi environment variables:
# - FIREBASE_ADMIN_SDK_CONFIG_BASE64 atau field terpisah:
#   FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
# - FIREBASE_WEB_API_KEY
# - FRONTEND_ORIGIN (mis. http://localhost:3000)
npm run dev
```

### Frontend Setup
```bash
cd panganloop/frontend
npm install
npm run dev
```

### Akun Default (sudah dibuat)
| Role | Email | Password | Status |
|------|-------|----------|--------|
| Donor | donor@panganloop.id | DonorPangan2026! | approved |
| Penerima | penerima@panganloop.id | PenerimaPangan2026! | approved |
| Admin | admin@panganloop.id | AdminPangan2026! | approved |

### Perintah Berguna
```bash
# Seed akun donor, penerima, admin sekaligus
cd backend && npm run seed:accounts

# Migrasi timestamp lama di Firestore
cd backend && npm run migrate:timestamps

# Build frontend & backend
cd frontend && npm run build
cd backend && npm run build
```

---

## 🛠️ Pengembangan

### Menambahkan Fitur Baru
1. **Backend**: Buat file route di `panganloop/backend/src/app/api/` dengan mengikuti pola:
   - Fungsi `OPTIONS` untuk preflight CORS
   - Validasi origin via `checkOrigin(request)`
   - Response JSON via `json(data, status, request)`
   - Error handling via `handleError(error, request)`

2. **Frontend**: 
   - Buat komponen di `panganloop/frontend/src/app/_components/`
   - Gunakan UI kit dari `panganloop/frontend/src/app/_components/ui-kit.tsx`
   - Tambahkan halaman di `panganloop/frontend/src/app/`

3. **Tipe Data**: Perbarui interface di `panganloop/backend/src/lib/models.ts`

### Menambahkan Role Baru
1. Perbarui tipe `Role` di `backend/src/lib/models.ts`
2. Tambahkan logika di `state route` untuk filtering per role
3. Tambahkan dashboard di `role-dashboards.tsx`

---

## 📊 Arus Data

```
User Login/Register
    ↓
Firebase Auth → verifySessionCookie → createSessionCookie (httpOnly)
    ↓
Backend: GET /api/auth/me → ambil profile Firestore organizations/{uid}
    ↓
Frontend: usePanganloop() → state per role + user profile
    ↓
Dashboard/ halaman merender berdasarkan role dan data Firestore
    ↓
Aksi (create batch, reserve, approve, closeout) → Firestore writes → state update
    ↓
Audit entries otomatis tercatat di collection "audit"
```

---

## 🔒 Keamanan

- **Session cookies** httpOnly, secure di production, sameSite: lax
- **Validasi origin** untuk mencegah CSRF
- **Verifikasi profil** di setiap request terautentikasi
- **Status rejected** memblokir akses penuh
- **Password minimal 8 karakter** di registrasi
- **Validasi format email** di registrasi

---

## 📱 Browser & Device

- **Supported**: Chrome, Firefox, Safari, Edge terbaru
- **Responsive**: Mobile-first design dengan Tailwind CSS
- **Sesi**: Disimpan per tab browser, bisa login peran berbeda di tab terpisah
- **Data**: Tahan di perangkat sampai di-reset (mode demo) atau di-sinkronkan ke Firestore

---

## 🎯 Workflow Umum

### Donor Melakukan Batch:
1. Login sebagai donor
2. Klik "Catat batch baru"
3. Isi detail: kategori, jumlah, deskripsi, gambar
4. Publish batch
5. Pantau reservasi masuk
6. Tutup batch saat tenggat tercapai
7. Catat outcome: terselamatkan, terklaim, dibuang

### Penerima Mengambil Surplus:
1. Login sebagai penerima
2. Lihat listing surplus tersedia
3. Ajukan reservasi pada batch
4. Dapatkan kode pickup unik
5. Tunjukkan kode saat mengambil makanan
6. Status reservasi update menjadi "picked_up"

### Admin Mengelola Sistem:
1. Login sebagai admin
2. Verifikasi organisasi baru (setujui/tolak)
3. Pantau listing dan batch
4. Nonaktifkan batch yang melanggar
5. Lihat jejak audit semua aktivitas

---

## 📞 Kontak & Support

- **Project**: PanganLoop
- **Repository**: Available locally
- **Firebase Project**: `panganloop`
- **Developer**: Codebuff agent

---

*Documentation generated for PanganLoop project. Terakhir diperbarui: Oktober 2026.*