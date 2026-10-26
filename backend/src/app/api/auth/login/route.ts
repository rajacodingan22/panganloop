import { NextRequest } from "next/server";
import { firebasePasswordRequest } from "@/lib/auth-api";
import {
  ApiError,
  checkOrigin,
  createSessionCookie,
  handleError,
  json,
  preflight,
  setSessionCookie,
} from "@/lib/http";
import { getFirestore } from "@/lib/firebase-admin";
import type { Organization } from "@/lib/models";

export function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !body.password) {
      throw new ApiError("Masukkan email dan kata sandi.");
    }
    const account = await firebasePasswordRequest("signInWithPassword", email, body.password);
    const { cookie } = await createSessionCookie(account.idToken);
    const snapshot = await getFirestore().collection("organizations").doc(account.localId).get();
    if (!snapshot.exists) throw new ApiError("Profil organisasi tidak ditemukan.", 403);
    const profile = snapshot.data() as Organization;
    if (profile.status === "rejected") {
      throw new ApiError("Akun organisasi ini ditolak. Hubungi admin PANGANLOOP.", 403);
    }

    const response = json({ user: { ...profile, id: account.localId } }, 200, request);
    setSessionCookie(response, cookie);
    return response;
  } catch (error) {
    return handleError(error, request);
  }
}
