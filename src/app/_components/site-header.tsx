"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePanganloopUi } from "./ui-context";

export function SiteHeader() {
  const { openInfo } = usePanganloopUi();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const openInfoFromMenu = () => {
    setMenuOpen(false);
    openInfo();
  };

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} id="top">
      <div className="container nav">
        <Link
          className="brand"
          href="/"
          aria-label="PANGANLOOP — beranda"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/assets/panganloop-logo.png"
            alt="PANGANLOOP — Lebih Banyak Manfaat. Lebih Sedikit Terbuang."
            width={2172}
            height={724}
            priority
          />
        </Link>

        <nav className="nav-links" aria-label="Navigasi utama">
          <button className="nav-link" type="button" onClick={openInfo}>
            Cara kerja
          </button>
          <Link className="nav-link" href="/#surplus">
            Surplus aktif
          </Link>
          <Link className="nav-link" href="/#dampak">
            Dampak
          </Link>
        </nav>

        <div className="nav-actions">
          <Link className="login" href="/login">
            Masuk
          </Link>
          <Link className="btn btn-primary btn-sm" href="/register">
            Daftar gratis
          </Link>
          <button
            ref={toggleRef}
            className="nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-menu" id="mobile-menu">
          <nav aria-label="Navigasi seluler">
            <button className="mobile-link" type="button" onClick={openInfoFromMenu}>
              Cara kerja
            </button>
            <Link
              className="mobile-link"
              href="/#surplus"
              onClick={() => setMenuOpen(false)}
            >
              Surplus aktif
            </Link>
            <Link
              className="mobile-link"
              href="/#dampak"
              onClick={() => setMenuOpen(false)}
            >
              Dampak
            </Link>
          </nav>
          <div className="mobile-actions">
            <Link
              className="btn btn-outline"
              href="/login"
              onClick={() => setMenuOpen(false)}
            >
              Masuk
            </Link>
            <Link
              className="btn btn-primary"
              href="/register"
              onClick={() => setMenuOpen(false)}
            >
              Daftar gratis
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
