import { cert, getApps, initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

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

const dateFields = {
  organizations: ["createdAt"],
  batches: ["createdAt", "pickupStart", "pickupEnd", "publishedAt", "closedAt", "cancelledAt"],
  reservations: ["createdAt", "pickedUpAt", "cancelledAt"],
  audit: ["at"],
};

function toIso(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (
    value &&
    typeof value === "object" &&
    typeof value.toDate === "function" &&
    typeof value.seconds === "number"
  ) {
    return value.toDate().toISOString();
  }
  return value;
}

const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount()) });
const db = getFirestore(app);
let updated = 0;

for (const [collection, fields] of Object.entries(dateFields)) {
  const snapshot = await db.collection(collection).get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const patch = {};
    for (const field of fields) {
      const next = toIso(data[field]);
      if (next !== data[field]) patch[field] = next;
    }
    if (data.closeout && typeof data.closeout === "object") {
      const closedAt = toIso(data.closeout.closedAt);
      if (closedAt !== data.closeout.closedAt) {
        patch.closeout = { ...data.closeout, closedAt };
      }
    }
    if (Object.keys(patch).length === 0) continue;
    await doc.ref.update(patch);
    updated += 1;
    console.log(`${collection}/${doc.id}: ${Object.keys(patch).join(", ")}`);
  }
}

console.log(`Selesai. ${updated} dokumen diperbarui.`);
