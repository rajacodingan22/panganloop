"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePanganloop } from "./store";
import { usePanganloopUi } from "./ui-context";

const PUBLIC_LINKS = [
  { label: "Jelajahi surplus", href: "/surplus" },
  { label: "Dampak", href: "/#dampak" },
];

export function SiteHeader() {
  const { openInfo } = usePanganloopUi();
  const { user, ready } = usePanganloop();
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

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} id="top">
      <div className="container nav">
        <Link
          className="brand"
          href="/"
          aria-label="PANGANLOOP — beranda"
          onClick={closeMenu}
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
          {PUBLIC_LINKS.map((link) => (
            <Link className="nav-link" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {ready && user ? (
            <Link className="login" href="/dashboard">
              Dashboard
            </Link>
          ) : (
            <Link className="login" href="/login">
              Masuk
            </Link>
          )}
          <Link
            className="btn btn-primary btn-sm"
            href={user ? "/dashboard" : "/register"}
          >
            {user ? "Buka dashboard" : "Daftar gratis"}
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
            <button className="mobile-link" type="button" onClick={openInfo}>
              Cara kerja
            </button>
            {PUBLIC_LINKS.map((link) => (
              <Link
                className="mobile-link"
                href={link.href}
                key={link.href}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-actions">
            <Link
              className="btn btn-outline"
              href={user ? "/dashboard" : "/login"}
              onClick={closeMenu}
            >
              {user ? "Dashboard" : "Masuk"}
            </Link>
            <Link
              className="btn btn-primary"
              href={user ? "/dashboard" : "/register"}
              onClick={closeMenu}
            >
              {user ? "Buka dashboard" : "Daftar gratis"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
