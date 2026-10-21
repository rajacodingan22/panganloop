"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { BoxIcon, ClockIcon, SearchIcon, ShieldCheckIcon } from "./icons";
import { surplusItems } from "./surplus-data";
import { usePanganloopUi } from "./ui-context";

export function SurplusSection() {
  const { showToast } = usePanganloopUi();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [pickupWindow, setPickupWindow] = useState("");
  const [maxDistance, setMaxDistance] = useState("");

  const term = query.trim().toLowerCase();
  const visibleItems = surplusItems.filter((item) => {
    const matchesTerm =
      !term ||
      `${item.title} ${item.org} ${item.place} ${item.alt}`
        .toLowerCase()
        .includes(term);
    const matchesCategory = !category || item.category === category;
    const matchesWindow = !pickupWindow || item.window === pickupWindow;
    const matchesDistance =
      !maxDistance || item.distance <= Number(maxDistance);
    return matchesTerm && matchesCategory && matchesWindow && matchesDistance;
  });

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
              "Filter diterapkan. Menampilkan surplus yang paling cocok.",
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
            <option value="roti">Roti &amp; bakeri</option>
            <option value="nasi">Makanan berat</option>
            <option value="kue">Kue &amp; camilan</option>
          </select>

          <select
            className="filter-select"
            name="waktu"
            aria-label="Waktu pickup"
            value={pickupWindow}
            onChange={(event) => setPickupWindow(event.target.value)}
          >
            <option value="">Waktu pickup</option>
            <option value="sore">Sore ini (sebelum 18.30)</option>
            <option value="malam">Malam ini (setelah 18.30)</option>
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

        <div
          className="surplus-grid reveal"
          style={{ "--delay": ".62s" } as CSSProperties}
        >
          {visibleItems.map((item) => (
            <article
              className="surplus-card"
              data-category={item.category}
              data-window={item.window}
              data-distance={item.distance}
              key={item.id}
            >
              <div className="surplus-photo">
                <Image
                  src={item.photo}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                  loading="eager"
                />
              </div>
              <div className="surplus-body">
                <span className="badge-available">
                  <ClockIcon className="icon" />
                  Masih tersedia
                </span>
                <h3>{item.title}</h3>
                <ul className="surplus-meta">
                  <li>
                    <BoxIcon className="icon" />
                    Tersedia {item.units} unit
                  </li>
                  <li className="is-urgent">
                    <ClockIcon className="icon" />
                    {item.cutoff}
                  </li>
                </ul>
                <p className="surplus-org">{item.org}</p>
                <p className="surplus-loc">
                  {item.place} <span aria-hidden="true">•</span>{" "}
                  {item.distanceLabel}
                </p>
                <Link
                  className="btn btn-primary"
                  href={`/surplus/${item.id}`}
                >
                  Lihat detail
                </Link>
              </div>
            </article>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <p className="surplus-empty">
            Tidak ada surplus yang cocok dengan filter. Coba ubah kategori,
            waktu, atau jarak.
          </p>
        ) : null}
      </div>
    </section>
  );
}
