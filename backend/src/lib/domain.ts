import { randomInt, randomUUID } from "node:crypto";
import { getFirestore } from "./firebase-admin";
import { ApiError } from "./http";
import type { AuditEntry, Batch, Reservation } from "./models";

export function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError("Request body harus berupa object JSON.");
  }
  return value as Record<string, unknown>;
}

export function requiredString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`${label} wajib diisi.`);
  }
  return value.trim();
}

export function numberValue(value: unknown, label: string, minimum = 0) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) {
    throw new ApiError(`${label} tidak valid.`);
  }
  return value;
}

export function timestampValue(value: unknown, label: string) {
  if (typeof value !== "string" || !Number.isFinite(new Date(value).getTime())) {
    throw new ApiError(`${label} tidak valid.`);
  }
  return new Date(value).toISOString();
}

export function availableUnits(batch: Batch, reservations: Reservation[]) {
  const reserved = reservations
    .filter((item) => item.status !== "cancelled")
    .reduce((total, item) => total + item.units, 0);
  return Math.max(0, batch.prepared - batch.sold - reserved);
}

export async function writeAudit(
  entry: Omit<AuditEntry, "id" | "at">,
  batch?: FirebaseFirestore.WriteBatch,
) {
  const ref = getFirestore().collection("audit").doc();
  const data: AuditEntry = { id: ref.id, at: new Date().toISOString(), ...entry };
  if (batch) batch.create(ref, data);
  else await ref.create(data);
}

export function pickupCode(excluded: string[]) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let value = "";
    for (let index = 0; index < 6; index += 1) {
      value += alphabet[randomInt(alphabet.length)];
    }
    if (!excluded.includes(value)) return value;
  }
  return randomUUID().slice(0, 6).toUpperCase();
}
