import { NextRequest } from "next/server";
import { getAdminAuth, getFirestore } from "@/lib/firebase-admin";
import { ApiError, checkOrigin, handleError, json, preflight, requireRole, requireUser } from "@/lib/http";
import { writeAudit } from "@/lib/domain";
import type { Batch, Organization } from "@/lib/models";

type RouteContext = { params: Promise<{ resource: string; id: string }> };
const resources = new Set(["organizations", "batches", "reservations", "audit"]);

export function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
    if (!resources.has(resource)) throw new ApiError("Resource tidak ditemukan.", 404);
    const snapshot = await getFirestore().collection(resource).doc(id).get();
    if (!snapshot.exists) throw new ApiError("Data tidak ditemukan.", 404);
    const user = await requireUser(request);

    if (resource === "organizations") {
      if (user.role !== "admin" && user.id !== id) throw new ApiError("Akses ditolak.", 403);
    } else if (resource === "batches") {
      const batch = snapshot.data() as Batch;
      if (
        user.role !== "admin" &&
        batch.donorId !== user.id &&
        (batch.status !== "published" || batch.disabled)
      ) {
        throw new ApiError("Akses ditolak.", 403);
      }
    } else if (resource === "audit") {
      await requireRole(request, ["admin"]);
    } else if (resource === "reservations") {
      const reservation = snapshot.data();
      const batch = await getFirestore().collection("batches").doc(String(reservation?.batchId)).get();
      const donorId = batch.exists ? (batch.data() as Batch).donorId : "";
      if (
        user.role !== "admin" &&
        reservation?.recipientId !== user.id &&
        !(user.role === "donor" && donorId === user.id)
      ) {
        throw new ApiError("Akses ditolak.", 403);
      }
    }
    return json({ data: { ...snapshot.data(), id: snapshot.id } }, 200, request);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    checkOrigin(request);
    const { resource, id } = await context.params;
    if (!resources.has(resource)) throw new ApiError("Resource tidak ditemukan.", 404);
    const ref = getFirestore().collection(resource).doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new ApiError("Data tidak ditemukan.", 404);
    const user = await requireUser(request);

    if (resource === "batches") {
      const batch = snapshot.data() as Batch;
      if (user.role !== "donor" || batch.donorId !== user.id || batch.status !== "draft") {
        throw new ApiError("Hanya donor pemilik yang dapat menghapus draft.", 403);
      }
      const reservations = await getFirestore().collection("reservations").where("batchId", "==", id).get();
      if (!reservations.empty) throw new ApiError("Batch dengan reservasi tidak dapat dihapus.");
      await ref.delete();
      await writeAudit({
        actorId: user.id,
        actorName: user.name,
        action: "batch_deleted",
        summary: `Menghapus draft ${batch.title}.`,
        batchId: id,
      });
      return json({ ok: true }, 200, request);
    }

    if (resource === "organizations") {
      const admin = await requireRole(request, ["admin"]);
      const organization = snapshot.data() as Organization;
      if (organization.role === "admin") throw new ApiError("Akun admin tidak dapat dihapus.");
      const batches = await getFirestore().collection("batches").where("donorId", "==", id).get();
      if (!batches.empty) throw new ApiError("Organisasi yang memiliki batch tidak dapat dihapus.");
      const reservations = await getFirestore().collection("reservations").where("recipientId", "==", id).get();
      if (!reservations.empty) throw new ApiError("Organisasi yang memiliki reservasi tidak dapat dihapus.");
      await getAdminAuth().deleteUser(id);
      await getFirestore().collection("organizations").doc(id).delete();
      await writeAudit({
        actorId: admin.id,
        actorName: admin.name,
        action: "organization_deleted",
        summary: `Menghapus organisasi ${organization.name}.`,
      });
      return json({ ok: true }, 200, request);
    }

    throw new ApiError(`${resource} tidak dapat dihapus secara permanen.`, 405);
  } catch (error) {
    return handleError(error, request);
  }
}
