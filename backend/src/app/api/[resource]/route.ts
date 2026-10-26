import { NextRequest } from "next/server";
import { getFirestore } from "@/lib/firebase-admin";
import {
  ApiError,
  checkOrigin,
  handleError,
  json,
  preflight,
  requireRole,
  requireUser,
} from "@/lib/http";
import { asObject, availableUnits, numberValue, pickupCode, requiredString, timestampValue, writeAudit } from "@/lib/domain";
import type { AuditEntry, Batch, Organization, Reservation } from "@/lib/models";

type Resource = "organizations" | "batches" | "reservations" | "audit";
type RouteContext = { params: Promise<{ resource: string }> };

const collections = new Set<Resource>(["organizations", "batches", "reservations", "audit"]);

function getResource(value: string): Resource {
  if (!collections.has(value as Resource)) throw new ApiError("Resource tidak ditemukan.", 404);
  return value as Resource;
}

async function userIfSignedIn(request: NextRequest) {
  if (!request.cookies.get("__session")?.value) return null;
  return requireUser(request);
}

function batchImageValue(value: unknown): string {
  if (typeof value !== "string") throw new ApiError("Gambar batch tidak valid.");
  const image = value.trim();
  if (image.length > 450 * 1024) {
    throw new ApiError("Ukuran gambar terlalu besar. Pilih gambar yang lebih kecil.");
  }
  if (
    image.startsWith("data:") &&
    !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image)
  ) {
    throw new ApiError("Format gambar batch tidak valid.");
  }
  return image;
}

export function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { resource: rawResource } = await context.params;
    const resource = getResource(rawResource);
    const collection = getFirestore().collection(resource);
    const user = await userIfSignedIn(request);

    if (resource === "organizations") {
      if (!user) throw new ApiError("Silakan masuk untuk melihat organisasi.", 401);
      const rows =
        user.role === "admin"
          ? (await collection.orderBy("createdAt", "desc").get()).docs.map((doc) => ({
              ...(doc.data() as Organization),
              id: doc.id,
            }))
          : await collection.doc(user.id).get().then((doc) =>
              doc.exists ? [{ ...(doc.data() as Organization), id: doc.id }] : [],
            );
      return json({ data: rows }, 200, request);
    }

    if (resource === "audit") {
      await requireRole(request, ["admin"]);
      const snapshot = await collection.orderBy("at", "desc").limit(500).get();
      return json({ data: snapshot.docs.map((doc) => doc.data() as AuditEntry) }, 200, request);
    }

    if (resource === "batches") {
      const snapshot = await collection.orderBy("createdAt", "desc").get();
      const all = snapshot.docs.map((doc) => ({ ...(doc.data() as Batch), id: doc.id }));
      const visible = user?.role === "admin"
        ? all
        : user?.role === "donor"
          ? all.filter((batch) => batch.donorId === user.id || (batch.status === "published" && !batch.disabled))
          : all.filter((batch) => batch.status === "published" && !batch.disabled);
      return json({ data: visible }, 200, request);
    }

    const userRequired = await requireUser(request);
    const snapshot = await collection.orderBy("createdAt", "desc").get();
    const reservations = snapshot.docs.map((doc) => ({ ...(doc.data() as Reservation), id: doc.id }));
    if (userRequired.role === "admin") return json({ data: reservations }, 200, request);
    if (userRequired.role === "recipient") {
      return json({ data: reservations.filter((item) => item.recipientId === userRequired.id) }, 200, request);
    }
    const batchSnapshot = await getFirestore().collection("batches").where("donorId", "==", userRequired.id).get();
    const batchIds = new Set(batchSnapshot.docs.map((doc) => doc.id));
    return json({ data: reservations.filter((item) => batchIds.has(item.batchId)) }, 200, request);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    checkOrigin(request);
    const { resource: rawResource } = await context.params;
    const resource = getResource(rawResource);
    const body = asObject(await request.json());
    if (resource === "batches") {
      const user = await requireRole(request, ["donor"]);
      if (user.status !== "approved") throw new ApiError("Organisasi Anda belum disetujui admin.", 403);
      const title = requiredString(body.title, "Nama makanan");
      const unit = requiredString(body.unit, "Satuan");
      const prepared = numberValue(body.prepared, "Jumlah disiapkan", 1);
      const sold = numberValue(body.sold, "Jumlah terjual");
      if (!Number.isInteger(prepared) || !Number.isInteger(sold) || sold > prepared) {
        throw new ApiError("Jumlah terjual harus bilangan bulat dan tidak melebihi jumlah disiapkan.");
      }
      const pickupStart = timestampValue(body.pickupStart, "Waktu mulai pickup");
      const pickupEnd = timestampValue(body.pickupEnd, "Tenggat pickup");
      if (pickupEnd <= pickupStart) throw new ApiError("Tenggat pickup harus setelah waktu mulai.");
      const status = body.status === "published" ? "published" : "draft";
      if (status === "published" && (prepared <= sold || new Date(pickupEnd).getTime() <= Date.now())) {
        throw new ApiError("Batch tidak memiliki surplus atau tenggat pickup sudah lewat.");
      }

      const ref = getFirestore().collection("batches").doc();
      const batch: Batch = {
        id: ref.id,
        code: `BT-${new Date().getFullYear()}-${ref.id.slice(0, 6).toUpperCase()}`,
        donorId: user.id,
        donorName: user.name,
        title,
        category: requiredString(body.category, "Kategori"),
        description: typeof body.description === "string" ? body.description.trim() : "",
        image: body.image === undefined ? "" : batchImageValue(body.image),
        unit,
        prepared,
        sold,
        status,
        pickupStart,
        pickupEnd,
        createdAt: new Date().toISOString(),
        ...(status === "published" ? { publishedAt: new Date().toISOString() } : {}),
        address: requiredString(body.address, "Alamat pickup"),
        area: typeof body.area === "string" && body.area.trim() ? body.area.trim() : user.area,
        distanceKm: typeof body.distanceKm === "number" && body.distanceKm >= 0 ? body.distanceKm : 0,
        packaging: typeof body.packaging === "string" ? body.packaging.trim() : "",
        storage: typeof body.storage === "string" ? body.storage.trim() : "",
        allergen: typeof body.allergen === "string" ? body.allergen.trim() : "",
        handling: typeof body.handling === "string" ? body.handling.trim() : "",
        ...(typeof body.notes === "string" && body.notes.trim() ? { notes: body.notes.trim() } : {}),
      };
      const writeBatch = getFirestore().batch();
      writeBatch.create(ref, batch);
      await writeAudit({
        actorId: user.id,
        actorName: user.name,
        action: status === "published" ? "batch_published" : "batch_created",
        summary: status === "published"
          ? `Mempublikasikan ${title} (${prepared - sold} ${unit} tersedia).`
          : `Menyimpan draft ${title}.`,
        batchId: batch.id,
      }, writeBatch);
      await writeBatch.commit();
      return json({ data: batch }, 201, request);
    }

    if (resource === "reservations") {
      const user = await requireRole(request, ["recipient"]);
      if (user.status !== "approved") throw new ApiError("Organisasi Anda belum disetujui admin.", 403);
      const batchId = requiredString(body.batchId, "Batch");
      const units = numberValue(body.units, "Jumlah unit", 1);
      if (!Number.isInteger(units)) throw new ApiError("Jumlah unit harus bilangan bulat.");
      const db = getFirestore();
      const batchRef = db.collection("batches").doc(batchId);
      const reservationRef = db.collection("reservations").doc();
      const auditRef = db.collection("audit").doc();
      const result = await db.runTransaction(async (transaction) => {
        const batchSnapshot = await transaction.get(batchRef);
        if (!batchSnapshot.exists) throw new ApiError("Batch tidak ditemukan.", 404);
        const batch = batchSnapshot.data() as Batch;
        if (
          batch.status !== "published" ||
          batch.disabled ||
          new Date(batch.pickupEnd).getTime() <= Date.now()
        ) {
          throw new ApiError("Listing tidak menerima reservasi.");
        }
        const previousQuery = db
          .collection("reservations")
          .where("batchId", "==", batchId);
        const previousSnapshot = await transaction.get(previousQuery);
        const previous = previousSnapshot.docs.map((doc) => doc.data() as Reservation);
        if (previous.some((item) => item.recipientId === user.id && item.status !== "cancelled")) {
          throw new ApiError("Organisasi Anda sudah memiliki reservasi untuk batch ini.", 409);
        }
        const available = availableUnits(batch, previous);
        if (units > available) {
          throw new ApiError(`Stok tersisa ${available} ${batch.unit}.`, 409);
        }
        const code = pickupCode(previous.map((item) => item.code));
        const reservation: Reservation = {
          id: reservationRef.id,
          code,
          batchId,
          recipientId: user.id,
          recipientName: user.name,
          units,
          note: typeof body.note === "string" ? body.note.trim() : "",
          status: "confirmed",
          createdAt: new Date().toISOString(),
        };
        transaction.create(reservationRef, reservation);
        transaction.create(auditRef, {
          id: auditRef.id,
          at: new Date().toISOString(),
          actorId: user.id,
          actorName: user.name,
          action: "reservation_created",
          summary: `Mengajukan ${units} ${batch.unit} ${batch.title}.`,
          batchId,
          reservationId: reservation.id,
        } satisfies AuditEntry);
        return reservation;
      });
      return json({ data: result }, 201, request);
    }

    throw new ApiError(`POST tidak tersedia untuk ${resource}.`, 405);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    checkOrigin(request);
    const { resource: rawResource } = await context.params;
    const resource = getResource(rawResource);
    const body = asObject(await request.json());
    const user = await requireUser(request);
    const id = requiredString(body.id, "ID");
    delete body.id;

    if (resource === "organizations") {
      const admin = await requireRole(request, ["admin"]);
      if (body.status !== "approved" && body.status !== "rejected") {
        throw new ApiError("Status organisasi tidak valid.");
      }
      const ref = getFirestore().collection(resource).doc(id);
      const target = await ref.get();
      if (!target.exists) throw new ApiError("Organisasi tidak ditemukan.", 404);
      const targetData = target.data() as Organization;
      if (targetData.role === "admin") throw new ApiError("Akun admin tidak dapat diubah.");
      await ref.update({ status: body.status });
      await writeAudit({
        actorId: admin.id,
        actorName: admin.name,
        action: body.status === "approved" ? "organization_approved" : "organization_rejected",
        summary: `${body.status === "approved" ? "Menyetujui" : "Menolak"} organisasi ${targetData.name}.`,
      });
      return json({ ok: true }, 200, request);
    }

    if (resource === "batches") {
      const ref = getFirestore().collection(resource).doc(id);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new ApiError("Batch tidak ditemukan.", 404);
      const batch = snapshot.data() as Batch;
      const admin = user.role === "admin";
      if (!admin && (user.role !== "donor" || batch.donorId !== user.id)) {
        throw new ApiError("Anda tidak berhak mengelola batch ini.", 403);
      }
      if (admin) {
        if (typeof body.disabled !== "boolean") throw new ApiError("Status listing tidak valid.");
        const reason = typeof body.disabledReason === "string" ? body.disabledReason.trim() : "";
        if (body.disabled && !reason) throw new ApiError("Tuliskan alasan penonaktifan.");
        await ref.update({
          disabled: body.disabled,
          disabledReason: body.disabled ? reason : null,
        });
        await writeAudit({
          actorId: user.id,
          actorName: user.name,
          action: body.disabled ? "listing_disabled" : "listing_enabled",
          summary: body.disabled
            ? `Menonaktifkan ${batch.title}: ${reason}`
            : `Mengaktifkan kembali ${batch.title}.`,
          batchId: id,
        });
        return json({ ok: true }, 200, request);
      }

      if (body.status === "published") {
        if (batch.status !== "draft" || batch.prepared <= batch.sold || new Date(batch.pickupEnd).getTime() <= Date.now()) {
          throw new ApiError("Batch draft ini tidak dapat dipublikasikan.");
        }
        await ref.update({ status: "published", publishedAt: new Date().toISOString() });
        await writeAudit({
          actorId: user.id,
          actorName: user.name,
          action: "batch_published",
          summary: `Mempublikasikan ${batch.title} (${batch.prepared - batch.sold} ${batch.unit} tersedia).`,
          batchId: id,
        });
        return json({ ok: true }, 200, request);
      }
      if (body.closeout && typeof body.closeout === "object") {
        if (batch.status !== "published") throw new ApiError("Hanya batch yang dipublikasikan dapat ditutup.");
        const closeout = body.closeout as Record<string, unknown>;
        const disposition = closeout.disposition;
        if (!["compost", "internal", "discarded", "other", "unknown"].includes(String(disposition))) {
          throw new ApiError("Pilih jalur akhir yang valid.");
        }
        const notes = requiredString(closeout.notes, "Catatan closeout");
        if (new Date(batch.pickupEnd).getTime() > Date.now()) {
          throw new ApiError("Tutup batch setelah tenggat pickup berakhir.");
        }
        const reservationSnapshot = await getFirestore().collection("reservations")
          .where("batchId", "==", id).get();
        const reservations = reservationSnapshot.docs.map((doc) => doc.data() as Reservation);
        if (reservations.some((item) => item.status === "confirmed")) {
          throw new ApiError("Selesaikan reservasi aktif sebelum menutup batch.");
        }
        const rescued = reservations
          .filter((item) => item.status === "picked_up")
          .reduce((sum, item) => sum + item.units, 0);
        const unclaimed = Math.max(0, batch.prepared - batch.sold - rescued);
        const closedAt = new Date().toISOString();
        await ref.update({
          status: "closed",
          closedAt,
          closeout: { disposition, notes, rescued, unclaimed, closedAt },
        });
        await writeAudit({
          actorId: user.id,
          actorName: user.name,
          action: "batch_closed",
          summary: `Menutup ${batch.title}: ${rescued} ${batch.unit} tersalurkan, ${unclaimed} ${batch.unit} tidak tersalurkan.`,
          batchId: id,
        });
        return json({ ok: true, data: { rescued, unclaimed } }, 200, request);
      }
      if (typeof body.cancelReason === "string") {
        if (!body.cancelReason.trim() || ["closed", "cancelled"].includes(batch.status)) {
          throw new ApiError("Alasan atau status pembatalan tidak valid.");
        }
        const reservations = await getFirestore().collection("reservations")
          .where("batchId", "==", id).get();
        if (reservations.docs.some((doc) => (doc.data() as Reservation).status === "confirmed")) {
          throw new ApiError("Selesaikan reservasi aktif sebelum membatalkan batch.");
        }
        const reason = body.cancelReason.trim();
        await ref.update({
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          cancelReason: reason,
        });
        await writeAudit({
          actorId: user.id,
          actorName: user.name,
          action: "batch_cancelled",
          summary: `Membatalkan ${batch.title}: ${reason}`,
          batchId: id,
        });
        return json({ ok: true }, 200, request);
      }

      if (batch.status !== "draft") throw new ApiError("Hanya draft yang dapat diubah.");
      const prepared = body.prepared === undefined ? batch.prepared : numberValue(body.prepared, "Jumlah disiapkan", 1);
      const sold = body.sold === undefined ? batch.sold : numberValue(body.sold, "Jumlah terjual");
      if (!Number.isInteger(prepared) || !Number.isInteger(sold) || sold > prepared) {
        throw new ApiError("Jumlah terjual tidak boleh melebihi jumlah disiapkan.");
      }
      const pickupStart = body.pickupStart === undefined ? batch.pickupStart : timestampValue(body.pickupStart, "Waktu mulai pickup");
      const pickupEnd = body.pickupEnd === undefined ? batch.pickupEnd : timestampValue(body.pickupEnd, "Tenggat pickup");
      if (pickupEnd <= pickupStart) throw new ApiError("Tenggat pickup harus setelah waktu mulai.");
      const fields = [
        "title", "category", "description", "image", "unit", "address", "area",
        "packaging", "storage", "allergen", "handling", "notes",
      ] as const;
      const patch: Record<string, unknown> = { prepared, sold, pickupStart, pickupEnd };
      for (const field of fields) {
        if (field in body) {
          if (typeof body[field] !== "string") throw new ApiError(`Field ${field} tidak valid.`);
          patch[field] = field === "image"
            ? batchImageValue(body[field])
            : body[field].trim();
        }
      }
      if (body.distanceKm !== undefined) patch.distanceKm = numberValue(body.distanceKm, "Jarak");
      await ref.update(patch);
      await writeAudit({
        actorId: user.id,
        actorName: user.name,
        action: "batch_updated",
        summary: `Memperbarui draft ${String(patch.title ?? batch.title)}.`,
        batchId: id,
      });
      return json({ ok: true }, 200, request);
    }

    if (resource === "reservations") {
      const ref = getFirestore().collection(resource).doc(id);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new ApiError("Reservasi tidak ditemukan.", 404);
      const reservation = snapshot.data() as Reservation;
      const batchSnapshot = await getFirestore().collection("batches").doc(reservation.batchId).get();
      if (!batchSnapshot.exists) throw new ApiError("Batch tidak ditemukan.", 404);
      const batch = batchSnapshot.data() as Batch;
      const ownsReservation =
        (user.role === "recipient" && reservation.recipientId === user.id) ||
        (user.role === "donor" && batch.donorId === user.id) ||
        user.role === "admin";
      if (!ownsReservation) throw new ApiError("Anda tidak berhak mengelola reservasi ini.", 403);
      if (body.status === "cancelled") {
        if (reservation.status !== "confirmed") throw new ApiError("Reservasi ini tidak dapat dibatalkan.");
        const reason = typeof body.cancelReason === "string" ? body.cancelReason.trim() : "";
        if (user.role === "recipient" && !reason) throw new ApiError("Tuliskan alasan pembatalan.");
        const finalReason = reason || (user.role === "donor" ? "Penerima tidak datang pada jadwal pickup." : "Dibatalkan oleh admin.");
        await ref.update({
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          cancelledBy: user.id,
          cancelReason: finalReason,
        });
        await writeAudit({
          actorId: user.id,
          actorName: user.name,
          action: "reservation_cancelled",
          summary: `Membatalkan reservasi ${reservation.code}: ${finalReason}`,
          batchId: batch.id,
          reservationId: id,
        });
        return json({ ok: true }, 200, request);
      }
      if (body.status === "picked_up" && (user.role === "donor" || user.role === "admin")) {
        const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
        if (reservation.code !== code || reservation.status !== "confirmed") {
          throw new ApiError("Kode pickup tidak cocok atau sudah digunakan.");
        }
        await ref.update({ status: "picked_up", pickedUpAt: new Date().toISOString() });
        await writeAudit({
          actorId: user.id,
          actorName: user.name,
          action: "pickup_confirmed",
          summary: `Mengonfirmasi pickup ${reservation.units} ${batch.unit} ${batch.title} untuk ${reservation.recipientName}.`,
          batchId: batch.id,
          reservationId: id,
        });
        return json({ ok: true, data: { units: reservation.units } }, 200, request);
      }
      throw new ApiError("Perubahan status reservasi tidak valid.");
    }

    throw new ApiError(`${resource} bersifat append-only.`, 405);
  } catch (error) {
    return handleError(error, request);
  }
}
