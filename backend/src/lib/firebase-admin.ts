import "server-only";

import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

function getServiceAccount(): ServiceAccount {
  const encoded = process.env.FIREBASE_ADMIN_SDK_CONFIG_BASE64;
  if (encoded) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
    } catch {
      throw new Error("FIREBASE_ADMIN_SDK_CONFIG_BASE64 must contain valid base64-encoded JSON.");
    }
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Firebase Admin service account JSON is invalid.");
    }
    return parsed as ServiceAccount;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Configure FIREBASE_ADMIN_SDK_CONFIG_BASE64 or all individual FIREBASE_ADMIN_* fields.",
    );
  }
  return { projectId, clientEmail, privateKey };
}

function getAdminApp() {
  return (
    getApps()[0] ??
    initializeApp({
      credential: cert(getServiceAccount()),
    })
  );
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getFirestore() {
  return getAdminFirestore(getAdminApp());
}
