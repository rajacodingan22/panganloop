import { NextRequest } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";
import { handleError, json, preflight, requireUser } from "@/lib/http";
import type { AuditEntry, Batch, Organization, Reservation } from "@/lib/models";

export function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function GET(request: NextRequest) {
  try {
    const db = getFirestore();
    const signedIn = request.cookies.get("__session")?.value;
    const user = signedIn ? await requireUser(request) : null;
    const [organizationSnapshot, batchSnapshot] = await Promise.all([
      user?.role === "admin"
        ? db.collection("organizations").orderBy("createdAt", "desc").get()
        : user
          ? db.collection("organizations").doc(user.id).get()
          : Promise.resolve(null),
      db.collection("batches").orderBy("createdAt", "desc").get(),
    ]);

    const organizations =
      user?.role === "admin"
        ? (organizationSnapshot as FirebaseFirestore.QuerySnapshot).docs.map((doc) => ({
            ...(doc.data() as Organization),
            id: doc.id,
          }))
        : organizationSnapshot && "exists" in organizationSnapshot && organizationSnapshot.exists
          ? [{ ...(organizationSnapshot.data() as Organization), id: organizationSnapshot.id }]
          : [];
    const allBatches = batchSnapshot.docs.map((doc) => ({
      ...(doc.data() as Batch),
      id: doc.id,
    }));
    const batches =
      user?.role === "admin"
        ? allBatches
        : user?.role === "donor"
          ? allBatches.filter(
              (batch) => batch.donorId === user.id || (batch.status === "published" && !batch.disabled),
            )
          : allBatches.filter((batch) => batch.status === "published" && !batch.disabled);

    let reservations: Reservation[] = [];
    if (user) {
      const reservationSnapshot = await db.collection("reservations").orderBy("createdAt", "desc").get();
      const allReservations = reservationSnapshot.docs.map((doc) => ({
        ...(doc.data() as Reservation),
        id: doc.id,
      }));
      if (user.role === "admin") {
        reservations = allReservations;
      } else if (user.role === "recipient") {
        reservations = allReservations.filter((item) => item.recipientId === user.id);
      } else {
        const ownedBatchIds = new Set(
          allBatches.filter((batch) => batch.donorId === user.id).map((batch) => batch.id),
        );
        reservations = allReservations.filter((item) => ownedBatchIds.has(item.batchId));
      }
    }

    const audit =
      user?.role === "admin"
        ? (await db.collection("audit").orderBy("at", "desc").limit(500).get()).docs.map(
            (doc) => doc.data() as AuditEntry,
          )
        : [];

    const currentUser = user
      ? {
          id: user.id,
          name: user.name,
          pic: user.pic,
          email: user.email,
          role: user.role,
          roleLabel: user.role === "admin" ? "Admin" : user.role === "donor" ? "Donor" : "Penerima",
          orgType: user.orgType,
          phone: user.phone,
          address: user.address,
          area: user.area,
          status: user.status,
          approved: user.status === "approved",
        }
      : null;

    return json({
      state: { version: 1, organizations, batches, reservations, audit },
      user: currentUser,
    }, 200, request);
  } catch (error) {
    return handleError(error, request);
  }
}
