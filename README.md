# PANGANLOOP

PANGANLOOP is split into two independent Next.js applications:

- [`frontend/`](./frontend/README.md) — existing UI, development port `3000`.
- [`backend/`](./backend/) — API, Firebase Authentication and Firestore, development port `4000`.

## Backend setup

1. Rotate any Firebase service-account key or admin password that has been shared outside a
   secret manager. Do not copy credentials from chat history into project files.
2. Copy `backend/.env.example` to `backend/.env.local`. Set the newly rotated Firebase Admin
   credentials, `FIREBASE_WEB_API_KEY`, and `FRONTEND_ORIGIN=http://localhost:3000`. Jika memakai
   `npm run seed:admin`, isi juga `ADMIN_SEED_PASSWORD` minimal 12 karakter.
3. In a terminal:

   ```powershell
   cd backend
   npm install
   npm run seed:accounts
   npm run dev
   ```

   `npm run seed:accounts` membuat satu akun untuk tiap peran (donor, penerima, admin) langsung di
   Firebase Authentication beserta profilnya di Firestore, lalu mencetak email dan kata sandinya di
   terminal. Jalankan ulang kapan saja untuk mengatur ulang kata sandi akun tersebut. Langkah
   `npm run seed:admin` bersifat opsional bila Anda ingin bootstrap admin terpisah.

   The server starts at `http://localhost:4000`. Check `GET /api/health`.
4. In a second terminal, copy `frontend/.env.example` to `frontend/.env.local`, then run:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   The frontend API URL should be `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`.

## Autentikasi

Login dan register memakai **Firebase Authentication** (email + password). Server memanggil Firebase
Identity Toolkit dengan `FIREBASE_WEB_API_KEY`, memverifikasi ID token lewat Firebase Admin, lalu
menerbitkan session cookie httpOnly `__session` berumur 5 hari. Profil, peran, dan status verifikasi
disimpan di koleksi Firestore `organizations/{uid}`; kata sandi tidak pernah disimpan di Firestore.
Registrasi langsung membuat user Firebase dan dokumen organisasi berstatus `pending`.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/organizations`, `PATCH /api/organizations`, `GET|DELETE /api/organizations/:id`
- `GET|POST /api/batches`, `PATCH /api/batches`, `GET|DELETE /api/batches/:id`
- `GET|POST /api/reservations`, `PATCH /api/reservations`, `GET /api/reservations/:id`
- `GET /api/audit` (admin only)

Protected mutations enforce the account role and record audit events. Reservation stock is
checked transactionally in Firestore. Audit entries are append-only. Configure Firestore rules
to deny direct client reads and writes; only the backend service account should access data.
