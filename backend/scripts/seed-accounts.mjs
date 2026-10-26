import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function serviceAccount() {
  const base64 = process.env.FIREBASE_ADMIN_SDK_CONFIG_BASE64;
  if (base64) return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Configure Firebase Admin credentials in backend/.env.local.");
  }
  return { projectId, clientEmail, privateKey };
}

const accounts = [
  {
    role: "donor",
    email: process.env.SEED_DONOR_EMAIL?.trim().toLowerCase() || "donor@panganloop.id",
    password: process.env.SEED_DONOR_PASSWORD || "DonorPangan2026!",
    name: "Donor PANGANLOOP",
    pic: "Penanggung Jawab Donor",
    orgType: "Usaha pangan",
    phone: "0812-1111-2222",
    address: "Jl. Contoh Donor No. 1, Jakarta Selatan",
    area: "Jakarta Selatan",
  },
  {
    role: "recipient",
    email: process.env.SEED_RECIPIENT_EMAIL?.trim().toLowerCase() || "penerima@panganloop.id",
    password: process.env.SEED_RECIPIENT_PASSWORD || "PenerimaPangan2026!",
    name: "Penerima PANGANLOOP",
    pic: "Penanggung Jawab Penerima",
    orgType: "Organisasi penerima",
    phone: "0812-3333-4444",
    address: "Jl. Contoh Penerima No. 2, Jakarta Pusat",
    area: "Jakarta Pusat",
  },
  {
    role: "admin",
    email: process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || "admin@panganloop.id",
    password: process.env.SEED_ADMIN_PASSWORD || "AdminPangan2026!",
    name: "Admin PANGANLOOP",
    pic: "Platform Admin",
    orgType: "Operasional platform",
    phone: "-",
    address: "-",
    area: "DKI Jakarta",
  },
];

const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount()) });
const auth = getAuth(app);
const db = getFirestore(app);
const results = [];

for (const account of accounts) {
  let user;
  try {
    user = await auth.getUserByEmail(account.email);
    user = await auth.updateUser(user.uid, {
      password: account.password,
      displayName: account.name,
      emailVerified: true,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code !== "auth/user-not-found"
    ) {
      throw error;
    }
    user = await auth.createUser({
      email: account.email,
      password: account.password,
      displayName: account.name,
      emailVerified: true,
    });
  }

  await auth.setCustomUserClaims(user.uid, {
    role: account.role,
    orgStatus: "approved",
  });

  const ref = db.collection("organizations").doc(user.uid);
  const existing = await ref.get();
  const profile = {
    name: account.name,
    pic: account.pic,
    email: account.email,
    role: account.role,
    orgType: account.orgType,
    phone: account.phone,
    address: account.address,
    area: account.area,
    status: "approved",
    createdAt: existing.exists
      ? (existing.data()?.createdAt ?? new Date().toISOString())
      : new Date().toISOString(),
  };
  await ref.set(profile, { merge: true });

  results.push({
    role: account.role,
    email: account.email,
    password: account.password,
    uid: user.uid,
  });
}

console.log("Akun peran berhasil dibuat/diperbarui di Firebase Authentication + Firestore:");
console.table(results.map(({ role, email, password }) => ({ role, email, password })));
