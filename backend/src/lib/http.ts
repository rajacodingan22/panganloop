import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth, getFirestore } from "./firebase-admin";
import type { Organization, Role } from "./models";

export const SESSION_COOKIE = "__session";
const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface AuthenticatedUser extends Organization {
  id: string;
  role: Role;
}

export function allowedOrigins() {
  return new Set(
    [process.env.FRONTEND_ORIGIN, ...(process.env.ALLOWED_ORIGINS ?? "").split(",")]
      .map((origin) => origin?.trim())
      .filter((origin): origin is string => Boolean(origin)),
  );
}

export function checkOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().has(origin)) {
    throw new ApiError("Origin tidak diizinkan.", 403);
  }
}

export function json(data: unknown, status = 200, request?: NextRequest) {
  const response = NextResponse.json(data, { status });
  if (request) {
    const origin = request.headers.get("origin");
    if (origin && allowedOrigins().has(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Vary", "Origin");
    }
  }
  return response;
}

export function preflight(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().has(origin)) {
    return json({ error: "Origin tidak diizinkan." }, 403);
  }
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Max-Age", "600");
  response.headers.set("Vary", "Origin");
  return response;
}

export function handleError(error: unknown, request?: NextRequest) {
  if (error instanceof ApiError) {
    return json({ error: error.message }, error.status, request);
  }
  console.error("Unhandled API error:", error);
  return json({ error: "Terjadi kesalahan pada server." }, 500, request);
}

export async function requireUser(request: NextRequest): Promise<AuthenticatedUser> {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) throw new ApiError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);

  let decoded;
  try {
    decoded = await getAdminAuth().verifySessionCookie(cookie, true);
  } catch {
    throw new ApiError("Sesi tidak valid atau telah kedaluwarsa.", 401);
  }
  const snapshot = await getFirestore().collection("organizations").doc(decoded.uid).get();
  if (!snapshot.exists) throw new ApiError("Profil organisasi tidak ditemukan.", 403);
  const organization = snapshot.data() as Omit<Organization, "password">;
  return { ...organization, id: snapshot.id, role: organization.role };
}

export async function requireRole(
  request: NextRequest,
  roles: Role[],
): Promise<AuthenticatedUser> {
  const user = await requireUser(request);
  if (!roles.includes(user.role)) throw new ApiError("Akses ditolak.", 403);
  return user;
}

export async function createSessionCookie(idToken: string) {
  const decoded = await getAdminAuth().verifyIdToken(idToken, true);
  const cookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });
  return { cookie, uid: decoded.uid };
}

export function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}
