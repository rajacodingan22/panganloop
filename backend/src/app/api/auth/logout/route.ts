import { NextRequest, NextResponse } from "next/server";
import {
  checkOrigin,
  handleError,
  json,
  preflight,
  SESSION_COOKIE,
} from "@/lib/http";
import { getAdminAuth } from "@/lib/firebase-admin";

export function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    if (process.env.SESSION_REVOKE_ON_LOGOUT === "true") {
      const cookie = request.cookies.get(SESSION_COOKIE)?.value;
      if (cookie) {
        const decoded = await getAdminAuth().verifySessionCookie(cookie, true);
        await getAdminAuth().revokeRefreshTokens(decoded.uid);
      }
    }
    const response = json({ ok: true }, 200, request);
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return handleError(error, request);
  }
}
