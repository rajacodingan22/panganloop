import { NextRequest, NextResponse } from "next/server";
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
import { getAdminAuth, getFirestore } from "@/lib/firebase-admin";
import type { Organization, Role } from "@/lib/models";

const validRoles: Role[] = ["donor", "recipient"];

export function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const body = (await request.json()) as Partial<Organization> & {
      password?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    if (
      !body.name?.trim() ||
      !body.pic?.trim() ||
      !email ||
      !password ||
      !body.role ||
      !validRoles.includes(body.role)
    ) {
      throw new ApiError("Lengkapi data pendaftaran yang wajib diisi.");
    }
    if (password.length < 8) {
      throw new ApiError("Kata sandi minimal 8 karakter.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError("Format email belum benar.");
    }

    const account = await firebasePasswordRequest("signUp", email, password);
    const { cookie } = await createSessionCookie(account.idToken);
    const profile: Organization = {
      name: body.name.trim(),
      pic: body.pic.trim(),
      email,
      role: body.role,
      orgType: body.role === "donor" ? "Usaha pangan" : "Organisasi penerima",
      phone: body.phone?.trim() || "-",
      address: body.address?.trim() || "-",
      area: body.area?.trim() || "DKI Jakarta",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const db = getFirestore();
      const batch = db.batch();
      batch.create(db.collection("organizations").doc(account.localId), profile);
      const auditRef = db.collection("audit").doc();
      batch.create(auditRef, {
        id: auditRef.id,
        at: new Date().toISOString(),
        actorId: account.localId,
        actorName: profile.name,
        action: "organization_registered",
        summary: `Mendaftar sebagai ${body.role === "donor" ? "Donor" : "Penerima"} dan menunggu verifikasi.`,
      });
      await batch.commit();
    } catch (error) {
      await getAdminAuth().deleteUser(account.localId);
      throw error;
    }

    const response = json({ user: { ...profile, id: account.localId } }, 201, request);
    setSessionCookie(response, cookie);
    return response;
  } catch (error) {
    return handleError(error, request);
  }
}
