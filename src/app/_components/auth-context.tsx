"use client";

import React, { createContext, useContext, useState } from "react";

export type UserRole = "donor" | "recipient" | "admin";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  orgType: string;
  pic: string;
  phone: string;
  address: string;
  approved: boolean;
};

export const DEMO_ACCOUNTS: UserProfile[] = [
  {
    id: "usr-admin-1",
    name: "Admin Platform",
    email: "admin@panganloop.id",
    role: "admin",
    roleLabel: "Admin",
    orgType: "PANGANLOOP Operations",
    pic: "Administrator",
    phone: "0811-2233-4455",
    address: "Jakarta, Indonesia",
    approved: true,
  },
  {
    id: "usr-donor-1",
    name: "Dapur Pagi",
    email: "dapurpagi@panganloop.id",
    role: "donor",
    roleLabel: "Donor",
    orgType: "Toko Roti & Katering",
    pic: "Budi Santoso",
    phone: "0812-3456-7890",
    address: "Jl. Tebet Barat Dalam Raya No. 42, Jakarta Selatan",
    approved: true,
  },
  {
    id: "usr-recipient-1",
    name: "Komunitas Berbagi Pangan",
    email: "komunitas@panganloop.id",
    role: "recipient",
    roleLabel: "Penerima",
    orgType: "Organisasi Food Rescue Komunitas",
    pic: "Ahmad Fauzi",
    phone: "0812-9988-7711",
    address: "Jl. Kramat Raya No. 12, Jakarta Pusat",
    approved: true,
  },
  {
    id: "usr-donor-user",
    name: "Dapur Mandiri (Akun Anda)",
    email: "opower5431@gmail.com",
    role: "donor",
    roleLabel: "Donor",
    orgType: "Restoran & Kafe Pangan",
    pic: "Mitra Panganloop",
    phone: "0812-8899-7711",
    address: "Jl. Senopati No. 28, Jakarta Selatan",
    approved: true,
  },
  {
    id: "usr-recipient-2",
    name: "Yayasan Kasih Peduli",
    email: "kasihpeduli@panganloop.id",
    role: "recipient",
    roleLabel: "Penerima",
    orgType: "Panti Asuhan & Dapur Komunitas",
    pic: "Siti Rahma",
    phone: "0812-9988-7766",
    address: "Jl. Otista Raya No. 18, Jakarta Timur",
    approved: true,
  },
];

type AuthContextType = {
  user: UserProfile | null;
  login: (email: string, role?: UserRole, name?: string) => void;
  quickLogin: (account: UserProfile) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: DEMO_ACCOUNTS[0],
  login: () => {},
  quickLogin: () => {},
  logout: () => {},
});

const STORAGE_KEY = "panganloop_active_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return DEMO_ACCOUNTS[0];
  });

  const login = (email: string, role: UserRole = "donor", name?: string) => {
    // Check if matches a demo account
    const found = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );
    const resolvedUser: UserProfile = found || {
      id: `usr-${Date.now()}`,
      name: name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)),
      email,
      role,
      roleLabel: role === "donor" ? "Donor" : role === "admin" ? "Admin" : "Penerima",
      orgType: role === "donor" ? "Penyedia Pangan" : role === "admin" ? "Platform Operations" : "Komunitas Penerima",
      pic: name || "Pengelola Akun",
      phone: "0812-0000-0000",
      address: "DKI Jakarta",
      approved: true,
    };

    setUser(resolvedUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedUser));
    } catch {}
  };

  const quickLogin = (account: UserProfile) => {
    setUser(account);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
