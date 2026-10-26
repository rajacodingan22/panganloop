export type Role = "donor" | "recipient" | "admin";
export type OrgStatus = "pending" | "approved" | "rejected";
export type BatchStatus = "draft" | "published" | "closed" | "cancelled";
export type ReservationStatus = "confirmed" | "picked_up" | "cancelled";
export type Disposition = "compost" | "internal" | "discarded" | "other" | "unknown";

export interface Organization {
  name: string;
  pic: string;
  email: string;
  role: Role;
  orgType: string;
  phone: string;
  address: string;
  area: string;
  status: OrgStatus;
  createdAt: string;
}

export interface Batch {
  id: string;
  code: string;
  donorId: string;
  donorName: string;
  title: string;
  category: string;
  description: string;
  image: string;
  unit: string;
  prepared: number;
  sold: number;
  status: BatchStatus;
  pickupStart: string;
  pickupEnd: string;
  createdAt: string;
  publishedAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  address: string;
  area: string;
  distanceKm: number;
  packaging: string;
  storage: string;
  allergen: string;
  handling: string;
  notes?: string;
  disabled?: boolean;
  disabledReason?: string;
  closeout?: {
    disposition: Disposition;
    notes: string;
    rescued: number;
    unclaimed: number;
    closedAt: string;
  };
}

export interface Reservation {
  id: string;
  code: string;
  batchId: string;
  recipientId: string;
  recipientName: string;
  units: number;
  note: string;
  status: ReservationStatus;
  createdAt: string;
  pickedUpAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  summary: string;
  batchId?: string;
  reservationId?: string;
}
