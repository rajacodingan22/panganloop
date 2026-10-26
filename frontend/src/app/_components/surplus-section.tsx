"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { BoxIcon, ClockIcon, SearchIcon, ShieldCheckIcon } from "./icons";
import {
  CATEGORIES,
  formatRangeShort,
  getAvailableUnits,
  getSurplus,
  imageForCategory,
  isBatchClaimable,
  usePanganloop,
} from "./store";
import { usePanganloopUi } from "./ui-context";

export function SurplusSection() {
  const { showToast } = usePanganloopUi();
  const { state, ready } = usePanganloop();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [pickupWindow, setPickupWindow] = useState("");
  const [maxDistance, setMaxDistance] = useState("");

  const term = query.trim().toLowerCase();
  const visibleItems = state.batches
    .filter((batch) => batch.status === "published" && !batch.disabled)
    .filter((batch) => {
      const matchesTerm =
        !term ||
        `${batch.title} ${batch.donorName} ${batch.area} ${batch.description}`
          .toLowerCase()
          .includes(term);
      const matchesCategory = !category || batch.category === category;
      const endHour = Number(
        new Intl.DateTimeFormat("id-ID", {
          hour: "2-digit",
          hour12: false,
          timeZone: "Asia/Jakarta",
        }).format(new Date(batch.pickupEnd)),
      );
      const matchesWindow =
        !pickupWindow ||
        (pickupWindow === "sore" && endHour < 18) ||
        (pickupWindow === "malam" && endHour >= 18);
      const matchesDistance = !maxDistance || batch.distanceKm <= Number(maxDistance);
      return matchesTerm && matchesCategory && matchesWindow && matchesDistance;
    })
    .sort((a, b) => {
      const aClaim = isBatchClaimable(a, state.reservations) ? 0 : 1;
      const bClaim = isBatchClaimable(b, state.reservations) ? 0 : 1;
      if (aClaim !== bClaim) return aClaim - bClaim;
      return new Date(a.pickupEnd).getTime() - new Date(b.pickupEnd).getTime();
    })
    .slice(0, 3);

  return (
    <section className="surplus" id="surplus" aria-labelledby="surplus-title">
      <div className="container">
        <div
          className="surplus-head reveal"
          style={{ "--delay": ".5s" } as CSSProperties}
        >
          <div className="surplus-head-copy">
            <h2 id="surplus-title">Surplus aktif</h2>
            <p className="surplus-sub">
              Lihat makanan yang sedang menunggu untuk diambil.
            </p>
          </div>
          <div className="surplus-privacy">
            <span className="privacy-icon" aria-hidden="true">
              <ShieldCheckIcon />
            </span>
            <p>
              <strong>Semua informasi di sini bersifat publik.</strong>
              Kami tidak menampilkan nomor telepon atau alamat lengkap untuk
              melindungi privasi.
            </p>
          </div>
        </div>

        <form
          className="surplus-filters reveal"
          style={{ "--delay": ".56s" } as CSSProperties}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            showToast(
              visibleItems.length > 0
                ? `${visibleItems.length} surplus cocok dengan filter Anda.`
                : "Tidak ada surplus yang cocok. Coba ubah filter.",
            );
          }}
        >
          <label className="filter-field filter-search">
            <SearchIcon className="icon" />
            <input
              type="search"
              name="q"
              placeholder="Cari makanan atau organisasi"
              aria-label="Cari makanan atau organisasi"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <select
            className="filter-select"
            name="kategori"
            aria-label="Kategori"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Kategori</option>
            {CATEGORIES.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            name="waktu"
            aria-label="Waktu pickup"
            value={pickupWindow}
            onChange={(event) => setPickupWindow(event.target.value)}
          >
            <option value="">Waktu pickup</option>
            <option value="sore">Sore (sebelum 18.00)</option>
            <option value="malam">Malam (18.00 ke atas)</option>
          </select>

          <select
            className="filter-select"
            name="jarak"
            aria-label="Jarak"
            value={maxDistance}
            onChange={(event) => setMaxDistance(event.target.value)}
          >
            <option value="">Jarak</option>
            <option value="3">Di bawah 3 km</option>
            <option value="5">Di bawah 5 km</option>
            <option value="10">Di bawah 10 km</option>
          </select>

          <button className="btn btn-primary" type="submit">
            Terapkan filter
          </button>
        </form>

        {!ready ? (
          <p className="surplus-empty">Memuat surplus...</p>
        ) : (
          <div
            className="surplus-grid reveal"
            style={{ "--delay": ".62s" } as CSSProperties}
          >
            {visibleItems.map((item) => (
              <article
                className="surplus-card"
                data-category={item.category}
                key={item.id}
              >
                <div className="surplus-photo">
                  <Image
                    src={item.image || imageForCategory(item.category)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                    loading="eager"
                  />
                </div>
                <div className="surplus-body">
                  <span className="badge-available">
                    <ClockIcon className="icon" />
                    {isBatchClaimable(item, state.reservations) ? "Masih tersedia" : "Lihat status"}
                  </span>
                  <h3>{item.title}</h3>
                  <ul className="surplus-meta">
                    <li>
                      <BoxIcon className="icon" />
                      Tersedia {getAvailableUnits(item, state.reservations)} dari{" "}
                      {getSurplus(item)} unit
                    </li>
                    <li className="is-urgent">
                      <ClockIcon className="icon" />
                      {formatRangeShort(item)} WIB
                    </li>
                  </ul>
                  <p className="surplus-org">{item.donorName}</p>
                  <p className="surplus-loc">
                    {item.area} <span aria-hidden="true">•</span> {item.distanceKm} km
                  </p>
                  <Link className="btn btn-primary" href={`/surplus/${item.id}`}>
                    Lihat detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {ready && visibleItems.length === 0 ? (
          <p className="surplus-empty">
            Tidak ada surplus yang cocok dengan filter. Coba ubah kategori,
            waktu, atau jarak.
          </p>
        ) : null}

        <div className="reveal" style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
          <Link className="btn btn-outline" href="/surplus">
            Lihat semua surplus
          </Link>
        </div>
      </div>
    </section>
  );
}
