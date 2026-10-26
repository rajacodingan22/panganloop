import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createSeedState } from "../../frontend/src/app/_components/store-legacy";

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

if (process.env.NODE_ENV !== "development") {
  throw new Error("Demo data can only be seeded when NODE_ENV=development.");
}

const app =
  getApps()[0] ??
  initializeApp({ credential: cert(serviceAccount()) });
const auth = getAuth(app);
const db = getFirestore(app);
const seed = createSeedState();
const firestoreBatch = db.batch();

for (const org of seed.organizations) {
  if (!org.password) throw new Error(`Missing demo password for ${org.email}.`);
  let account;
  try {
    account = await auth.getUser(org.id);
    account = await auth.updateUser(account.uid, {
      email: org.email,
      password: org.password,
      displayName: org.name,
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
    account = await auth.createUser({
      uid: org.id,
      email: org.email,
      password: org.password,
      displayName: org.name,
    });
  }
  const { password: _password, ...profile } = org;
  firestoreBatch.set(db.collection("organizations").doc(account.uid), profile, { merge: true });
}

for (const collection of ["batches", "reservations", "audit"] as const) {
  for (const entry of seed[collection]) {
    firestoreBatch.set(db.collection(collection).doc(entry.id), entry, { merge: true });
  }
}

await firestoreBatch.commit();
console.log("Seeded PANGANLOOP demo organizations, batches, reservations, and audit events.");
