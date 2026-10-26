import { NextRequest } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";
import { handleError, json, preflight, requireUser } from "@/lib/http";
import type { Organization } from "@/lib/models";

export function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const snapshot = await getFirestore().collection("organizations").doc(user.id).get();
    const profile = snapshot.data() as Organization;
    return json({ user: { ...profile, id: user.id } }, 200, request);
  } catch (error) {
    return handleError(error, request);
  }
}
