"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type ActionResult,
  type AuditEntry,
  type Batch,
  type BatchInput,
  type CurrentUser,
  type Disposition,
  type RegisterInput,
  type Reservation,
  type Role,
  type StoreState,
  emptyState,
} from "./store-legacy";

export {
  CATEGORIES,
  DATA_KEY,
  imageForCategory,
  PICKUP_DISPOSITIONS,
  SESSION_KEY,
  formatDate,
  formatDateTime,
  formatRangeShort,
  formatTime,
  formatWindow,
  getActiveReservations,
  getAvailableUnits,
  getDisplayStatus,
  getPickedUpUnits,
  getReservedUnits,
  getSurplus,
  imageForCategory as categoryImage,
  isBatchClaimable,
  isPastDeadline,
  roleLabel,
  statusLabel,
  statusTone,
  toDateTimeLocal,
} from "./store-legacy";
export type {
  ActionResult,
  AuditEntry,
  Batch,
  BatchInput,
  BatchStatus,
  CurrentUser,
  Disposition,
  OrgStatus,
  Organization,
  RegisterInput,
  Reservation,
  ReservationStatus,
  Role,
  StoreState,
} from "./store-legacy";

type ApiPayload<T> = { data?: T; user?: CurrentUser; state?: StoreState; error?: string };

class ApiRequestError extends Error {
  constructor(message: string, readonly status = 0) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:4000";
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api${path}`, {
      ...init,
      cache: "no-store",
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiRequestError("Backend tidak dapat dihubungi. Pastikan server berjalan di port 4000.");
  }

  const payload = (await response.json().catch(() => ({}))) as ApiPayload<T>;
  if (!response.ok) {
    throw new ApiRequestError(payload.error || "Permintaan ke backend gagal.", response.status);
  }
  return payload as T;
}

type StoreContextValue = {
  state: StoreState;
  ready: boolean;
  user: CurrentUser | null;
  connectionError: string | null;
  login: (email: string, password: string) => Promise<ActionResult<{ role: Role }>>;
  logout: () => Promise<ActionResult>;
  register: (input: RegisterInput) => Promise<ActionResult<{ pending: boolean }>>;
  approveOrganization: (id: string) => Promise<ActionResult>;
  rejectOrganization: (id: string) => Promise<ActionResult>;
  createBatch: (input: BatchInput, publish: boolean) => Promise<ActionResult<{ id: string }>>;
  updateBatch: (id: string, input: BatchInput) => Promise<ActionResult>;
  publishBatch: (id: string) => Promise<ActionResult>;
  cancelBatch: (id: string, reason: string) => Promise<ActionResult>;
  disableBatch: (id: string, disabled: boolean, reason: string) => Promise<ActionResult>;
  createReservation: (
    batchId: string,
    units: number,
    note: string,
  ) => Promise<ActionResult<{ id: string; code: string }>>;
  cancelReservation: (id: string, reason: string) => Promise<ActionResult>;
  verifyPickup: (batchId: string, code: string) => Promise<ActionResult<{ units: number }>>;
  closeBatch: (
    id: string,
    disposition: Disposition,
    notes: string,
  ) => Promise<ActionResult<{ rescued: number; unclaimed: number }>>;
  audit: AuditEntry[];
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function PanganloopStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(emptyState);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const payload = await apiRequest<{ state: StoreState; user: CurrentUser | null }>("/state");
    setState(payload.state);
    setUser(payload.user);
    setConnectionError(null);
  }, []);

  useEffect(() => {
    let active = true;
    void apiRequest<{ state: StoreState; user: CurrentUser | null }>("/state")
      .then((payload) => {
        if (!active) return;
        setState(payload.state);
        setUser(payload.user);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setConnectionError(
          error instanceof Error ? error.message : "Backend tidak dapat dihubungi.",
        );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const mutate = useCallback(
    async <T,>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<ActionResult<T>> => {
      try {
        const payload = await apiRequest<{ data?: T }>(path, {
          method,
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        try {
          await refresh();
        } catch {
          setConnectionError("Perubahan tersimpan, tetapi data terbaru gagal dimuat.");
        }
        return payload.data === undefined
          ? { ok: true } as ActionResult<T>
          : { ok: true, data: payload.data } as ActionResult<T>;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Permintaan gagal.";
        if (error instanceof ApiRequestError && error.status === 0) {
          setConnectionError(message);
        }
        return { ok: false, error: message };
      }
    },
    [refresh],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<ActionResult<{ role: Role }>> => {
      try {
        const payload = await apiRequest<{ user?: CurrentUser }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        const role = payload.user?.role;
        if (!role) throw new Error("Peran akun tidak ditemukan.");
        try {
          await refresh();
        } catch {
          setConnectionError("Berhasil masuk, tetapi data terbaru gagal dimuat.");
        }
        return { ok: true, data: { role } };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal masuk.";
        return { ok: false, error: message };
      }
    },
    [refresh],
  );

  const logout = useCallback(async (): Promise<ActionResult> => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      try {
        await refresh();
      } catch {
        setConnectionError("Berhasil keluar, tetapi data terbaru gagal dimuat.");
      }
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal keluar.";
      setConnectionError(message);
      return { ok: false, error: message };
    }
  }, [refresh]);

  const register = useCallback(
    async (input: RegisterInput): Promise<ActionResult<{ pending: boolean }>> => {
      try {
        await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify(input),
        });
        try {
          await refresh();
        } catch {
          setConnectionError("Pendaftaran berhasil, tetapi data terbaru gagal dimuat.");
        }
        return { ok: true, data: { pending: true } };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Pendaftaran gagal.";
        return { ok: false, error: message };
      }
    },
    [refresh],
  );

  const approveOrganization = useCallback(
    (id: string) => mutate("/organizations", "PATCH", { id, status: "approved" }),
    [mutate],
  );
  const rejectOrganization = useCallback(
    (id: string) => mutate("/organizations", "PATCH", { id, status: "rejected" }),
    [mutate],
  );
  const createBatch = useCallback(
    async (input: BatchInput, publish: boolean) => {
      const result = await mutate<Batch>("/batches", "POST", {
        ...input,
        status: publish ? "published" : "draft",
      });
      return result.ok
        ? { ok: true, data: { id: result.data.id } } as const
        : result;
    },
    [mutate],
  );
  const updateBatch = useCallback(
    (id: string, input: BatchInput) => mutate("/batches", "PATCH", { id, ...input }),
    [mutate],
  );
  const publishBatch = useCallback(
    (id: string) => mutate("/batches", "PATCH", { id, status: "published" }),
    [mutate],
  );
  const cancelBatch = useCallback(
    (id: string, reason: string) => mutate("/batches", "PATCH", { id, cancelReason: reason }),
    [mutate],
  );
  const disableBatch = useCallback(
    (id: string, disabled: boolean, reason: string) =>
      mutate("/batches", "PATCH", { id, disabled, disabledReason: reason }),
    [mutate],
  );
  const createReservation = useCallback(
    async (batchId: string, units: number, note: string) => {
      const result = await mutate<Reservation>("/reservations", "POST", {
        batchId,
        units,
        note,
      });
      return result.ok
        ? { ok: true, data: { id: result.data.id, code: result.data.code } } as const
        : result;
    },
    [mutate],
  );
  const cancelReservation = useCallback(
    (id: string, reason: string) =>
      mutate("/reservations", "PATCH", { id, status: "cancelled", cancelReason: reason }),
    [mutate],
  );
  const verifyPickup = useCallback(
    async (batchId: string, code: string): Promise<ActionResult<{ units: number }>> => {
      const reservation = state.reservations.find(
        (item) =>
          item.batchId === batchId &&
          item.code === code.trim().toUpperCase() &&
          item.status === "confirmed",
      );
      if (!reservation) return { ok: false, error: "Kode tidak cocok atau reservasi tidak aktif." };
      return mutate<{ units: number }>("/reservations", "PATCH", {
        id: reservation.id,
        status: "picked_up",
        code,
      });
    },
    [mutate, state.reservations],
  );
  const closeBatch = useCallback(
    (id: string, disposition: Disposition, notes: string) =>
      mutate<{ rescued: number; unclaimed: number }>("/batches", "PATCH", {
        id,
        closeout: { disposition, notes },
      }),
    [mutate],
  );
  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      ready,
      user,
      connectionError,
      login,
      logout,
      register,
      approveOrganization,
      rejectOrganization,
      createBatch,
      updateBatch,
      publishBatch,
      cancelBatch,
      disableBatch,
      createReservation,
      cancelReservation,
      verifyPickup,
      closeBatch,
      audit: state.audit,
    }),
    [
      approveOrganization,
      cancelBatch,
      cancelReservation,
      closeBatch,
      connectionError,
      createBatch,
      createReservation,
      disableBatch,
      login,
      logout,
      publishBatch,
      ready,
      register,
      rejectOrganization,
      state,
      updateBatch,
      user,
      verifyPickup,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {connectionError ? (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-[100] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-[#e2c9c9] bg-[#fffaf8] px-4 py-3 text-sm text-[#7a3434] shadow-lg"
        >
          {connectionError}
        </div>
      ) : null}
    </StoreContext.Provider>
  );
}

export function usePanganloop() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("usePanganloop must be used within PanganloopStoreProvider");
  return context;
}

export function useAuth() {
  const { user, login, logout } = usePanganloop();
  return { user, login, logout };
}
