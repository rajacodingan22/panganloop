"use client";

import Link from "next/link";
import { usePanganloopUi } from "./ui-context";
import { CloseIcon } from "./icons";

const steps = [
  {
    number: "1",
    title: "Catat",
    body: "Input surplus makanan Anda dengan cepat dan mudah.",
  },
  {
    number: "2",
    title: "Selamatkan",
    body: "Hubungkan dengan pihak yang bisa memanfaatkan.",
    gold: true,
  },
  {
    number: "3",
    title: "Serahkan",
    body: "Makanan diterima oleh komunitas yang membutuhkan.",
  },
  {
    number: "4",
    title: "Pelajari",
    body: "Lihat dampak dan tingkatkan bersama.",
    gold: true,
  },
];

export function InfoDialog() {
  const { dialogRef, closeInfo } = usePanganloopUi();

  const unlockScroll = () => document.body.classList.remove("modal-open");

  return (
    <dialog
      ref={dialogRef}
      className="info-modal"
      id="info-modal"
      aria-labelledby="info-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeInfo();
      }}
      onClose={unlockScroll}
      onCancel={unlockScroll}
    >
      <button
        className="modal-close"
        type="button"
        aria-label="Tutup cara kerja"
        onClick={closeInfo}
      >
        <CloseIcon />
      </button>
      <p className="eyebrow">Cara kerja</p>
      <h2 id="info-title">Empat langkah, satu lingkaran manfaat.</h2>
      <p className="modal-lede">
        Di PANGANLOOP, makanan baik tidak berhenti di tempat sampah. Setiap
        langkah memutar kembali manfaat untuk lebih banyak orang.
      </p>
      <ol className="modal-steps">
        {steps.map((step) => (
          <li key={step.number}>
            <span className={`step-num${step.gold ? " is-gold" : ""}`}>
              {step.number}
            </span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="modal-actions">
        <Link className="btn btn-primary" href="/#surplus" onClick={closeInfo}>
          Lihat surplus aktif
        </Link>
        <button className="btn btn-outline" type="button" onClick={closeInfo}>
          Nanti saja
        </button>
      </div>
    </dialog>
  );
}
