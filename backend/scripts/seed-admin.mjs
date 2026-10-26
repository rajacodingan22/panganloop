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

const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD;
const name = process.env.ADMIN_SEED_NAME?.trim();
const pic = process.env.ADMIN_SEED_PIC?.trim();

if (!email || !password || password.length < 12 || !name || !pic) {
  throw new Error(
    "Set ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD (at least 12 characters), ADMIN_SEED_NAME, and ADMIN_SEED_PIC.",
  );
}

const app =
  getApps()[0] ??
  initializeApp({ credential: cert(serviceAccount()) });
const auth = getAuth(app);
const db = getFirestore(app);

let user;
try {
  user = await auth.getUserByEmail(email);
  user = await auth.updateUser(user.uid, { password, displayName: name, emailVerified: true });
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code !== "auth/user-not-found") {
    throw error;
  }
  user = await auth.createUser({ email, password, displayName: name, emailVerified: true });
}

await db.collection("organizations").doc(user.uid).set(
  {
    name,
    pic,
    email,
    role: "admin",
    orgType: "Operasional platform",
    phone: "-",
    address: "-",
    area: "DKI Jakarta",
    status: "approved",
    createdAt: new Date().toISOString(),
  },
  { merge: true },
);

console.log(`Seeded admin profile for ${email}.`);
await app.delete();
