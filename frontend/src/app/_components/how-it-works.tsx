"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRightIcon, BoxIcon, ChartIcon, ShieldCheckIcon } from "./icons";

const delay = (value: string) => ({ "--delay": value }) as CSSProperties;

const steps = [
  {
    number: "1",
    title: "Catat",
    body: "Masukkan diskon, jumlah, dan surplus.",
    image: "/assets/how-1-catat.png",
    alt: "Pemilik toko roti mencatat sisa roti di etalase",
  },
  {
    number: "2",
    title: "Selamatkan",
    body: "Buka Rescue Window dengan info penanganan.",
    image: "/assets/how-2-selamatkan.png",
    alt: "Krat berisi roti dengan label Rescue Window dan penanda waktu",
  },
  {
    number: "3",
    title: "Serahkan",
    body: "Penerima klaim, donor verifikasi pickup.",
    image: "/assets/how-3-serahkan.png",
    alt: "Donor menyerahkan krat roti kepada penerima",
  },
  {
    number: "4",
    title: "Pelajari",
    body: "Tutup batch dan lihat pola historis.",
    image: "/assets/how-4-pelajari.png",
    alt: "Laporan dampak dengan grafik dan donat di atas meja",
  },
];

const limits = [
  {
    icon: <ShieldCheckIcon className="icon" />,
    title: "Bukan sertifikasi pangan",
    body: "PANGANLOOP bukan lembaga sertifikasi pangan. Keamanan pangan tetap menjadi tanggung jawab masing-masing pihak.",
  },
  {
    icon: <BoxIcon className="icon" />,
    title: "Rescue hanya setelah pickup dikonfirmasi",
    body: "Status “Rescued” dicatat hanya setelah penerima mengonfirmasi pickup berhasil.",
  },
  {
    icon: <ChartIcon className="icon" />,
    title: "Data dampak berdasarkan catatan pengguna",
    body: "Seluruh data dampak, mis. kilogram terselamatkan, porsi, emisi, bersifat data dari catatan yang dimasukkan oleh pengguna.",
  },
];

export function HowItWorks() {
  return (
    <section className="how" id="cara-kerja" aria-labelledby="how-title">
      <div className="container">
        <div className="how-intro">
          <div className="how-intro-copy reveal">
            <p className="how-eyebrow">Cara kerja</p>
            <h2 id="how-title">
              Satu siklus surplus <span>yang tercatat</span>
            </h2>
            <p className="how-sub">
              Dari catatan akhir hari sampai outcome batch.
            </p>
          </div>

          <div className="how-intro-side">
            <p className="how-side-copy">
              <strong>PANGANLOOP</strong> membantu makanan berlebih menemukan
              tujuan yang lebih baik dengan proses yang sederhana, aman, dan
              tercatat.
            </p>
            <Image
              className="how-crate"
              src="/assets/how-crate.png"
              alt="Krat berisi roti, sayur, dan buah segar"
              width={1254}
              height={1254}
              sizes="(max-width: 760px) 180px, 210px"
            />
            <p className="how-hand">
              Lebih sedikit terbuang,
              <br />
              lebih banyak manfaat.
            </p>
            <span className="how-hand-arrow" aria-hidden="true">
              <svg viewBox="0 0 64 34" fill="none">
                <path
                  d="M3 29C14 9 36 4 60 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="m54 3 6 5-6 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        <ol className="how-steps reveal" style={delay(".18s")}>
          {steps.map((step) => (
            <li className="how-step" key={step.number}>
              <div className="how-step-head">
                <span className="how-step-num">{step.number}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.body}</p>
              <div className="how-art">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 760px) 90vw, (max-width: 1160px) 45vw, 260px"
                />
              </div>
            </li>
          ))}
        </ol>

        <div className="how-limits reveal" style={delay(".24s")}>
          <div className="how-limits-head">
            <h3>Batasan yang penting</h3>
            <p>Transparan sejak awal, untuk dampak yang berkelanjutan.</p>
          </div>

          <div className="how-limits-grid">
            {limits.map((limit) => (
              <div className="how-limit" key={limit.title}>
                <span className="how-limit-icon" aria-hidden="true">
                  {limit.icon}
                </span>
                <div>
                  <h4>{limit.title}</h4>
                  <p>{limit.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="how-cta reveal" style={delay(".3s")}>
          <Link className="btn btn-primary btn-lg" href="/login">
            Masuk ke akun Anda
            <ArrowRightIcon className="icon" />
          </Link>
          <p>Gunakan akun Firebase organisasi Anda untuk memulai.</p>
        </div>

        <div className="how-deco" aria-hidden="true">
          <svg viewBox="0 0 120 90" fill="none">
            <path
              d="M18 82C34 56 60 40 96 34"
              stroke="#2c7a57"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity=".55"
            />
            <path d="M38 74c-12-2-19-10-20-21 11 0 19 6 23 16Z" fill="#4a9069" opacity=".7" />
            <path d="M56 58c-2-12 4-21 14-25 2 11-4 20-14 25Z" fill="#2c7a57" opacity=".6" />
            <path d="M78 44c8-8 18-10 27-6-6 9-16 11-27 6Z" fill="#61a077" opacity=".65" />
          </svg>
          <p>
            Pangan
            <br />
            Menghubungkan
            <br />
            Kita
          </p>
        </div>
      </div>
    </section>
  );
}
