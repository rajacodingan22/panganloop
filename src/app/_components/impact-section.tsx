"use client";

import { AlertIcon, BoxIcon, ChevronRightIcon, InfoIcon, ShieldCheckIcon } from "./icons";
import { usePanganloopUi } from "./ui-context";

/* ─── Static demo data ──────────────────────────────────────────── */
const stats = [
  {
    icon: <BoxIcon className="imp-stat-icon" />,
    label: "Surplus dipublikasikan",
    value: "86",
    unit: "unit",
    desc: "Makanan dan bahan pangan yang ditawarkan melalui platform.",
    accent: false,
  },
  {
    icon: <ShieldCheckIcon className="imp-stat-icon" />,
    label: "Rescued",
    value: "54",
    unit: "unit",
    desc: "Berhasil diterima dan dimanfaatkan oleh penerima.",
    accent: false,
  },
  {
    icon: <CheckCircleIcon />,
    label: "Pickup selesai",
    value: "82",
    unit: "%",
    desc: "Dari surplus yang diklaim.",
    accent: false,
  },
  {
    icon: <AlertIcon className="imp-stat-icon" />,
    label: "Belum tersalurkan",
    value: "18",
    unit: "unit",
    desc: "Masih menunggu pickup atau batal.",
    accent: true,
  },
];

const weeks = [
  { label: "Minggu 1", sub: "1–5 Okt", listed: 23, rescued: 15 },
  { label: "Minggu 2", sub: "6–12 Okt", listed: 28, rescued: 19 },
  { label: "Minggu 3", sub: "13–19 Okt", listed: 18, rescued: 13 },
];

const metricGuide = [
  {
    icon: <BoxIcon className="imp-legend-icon" />,
    term: "Dipublikasikan (listed)",
    desc: "Jumlah surplus makanan dan bahan pangan yang diunggah di PANGANLOOP.",
  },
  {
    icon: <ShieldCheckIcon className="imp-legend-icon" />,
    term: "Diklaim (claimed)",
    desc: "Jumlah surplus yang diklaim oleh penerima (mis. komunitas, NGO, atau individu).",
  },
  {
    icon: <CheckCircleIcon />,
    term: "Diselamatkan (rescued)",
    desc: "Jumlah surplus yang benar-benar diterima oleh penerima dan tidak terbuang.",
  },
];

/* ─── Inline SVG not in icons.tsx ──────────────────────────────── */
function CheckCircleIcon() {
  return (
    <svg
      className="imp-stat-icon imp-stat-icon--check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.4" />
      <path d="m8.4 12 2.4 2.4 4.8-4.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2.4" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

/* ─── Bar chart (pure SVG, no library) ─────────────────────────── */
const CHART_W = 480;
const CHART_H = 180;
const PADDING = { top: 16, right: 16, bottom: 48, left: 32 };
const MAX_VAL = 30;

function ImpactChart() {
  const barW = 28;
  const gap = 10;
  const groupW = barW * 2 + gap;
  const totalGroups = weeks.length;
  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = CHART_H - PADDING.top - PADDING.bottom;
  const sectionW = plotW / totalGroups;

  const yLines = [0, 10, 20, 30];

  function barH(val: number) {
    return (val / MAX_VAL) * plotH;
  }

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      role="img"
      aria-label="Bar chart: dipublikasikan vs berhasil diambil per minggu"
      className="imp-chart-svg"
    >
      {/* Y-axis grid lines */}
      {yLines.map((y) => {
        const cy = PADDING.top + plotH - (y / MAX_VAL) * plotH;
        return (
          <g key={y}>
            <line
              x1={PADDING.left}
              x2={CHART_W - PADDING.right}
              y1={cy}
              y2={cy}
              stroke="rgba(13,53,39,0.09)"
              strokeWidth="1"
            />
            <text
              x={PADDING.left - 6}
              y={cy + 4}
              textAnchor="end"
              fontSize="10"
              fill="rgba(13,53,39,0.4)"
            >
              {y}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {weeks.map((week, i) => {
        const cx = PADDING.left + i * sectionW + sectionW / 2;
        const listedH = barH(week.listed);
        const rescuedH = barH(week.rescued);
        const listedX = cx - groupW / 2;
        const rescuedX = listedX + barW + gap;
        const baseY = PADDING.top + plotH;

        return (
          <g key={week.label}>
            {/* Listed bar */}
            <rect
              x={listedX}
              y={baseY - listedH}
              width={barW}
              height={listedH}
              rx="5"
              fill="#a8c5a0"
            />
            {/* Rescued bar */}
            <rect
              x={rescuedX}
              y={baseY - rescuedH}
              width={barW}
              height={rescuedH}
              rx="5"
              fill="#2c7a57"
            />
            {/* X labels */}
            <text
              x={cx}
              y={baseY + 16}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="rgba(13,53,39,0.65)"
            >
              {week.label}
            </text>
            <text
              x={cx}
              y={baseY + 29}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(13,53,39,0.38)"
            >
              {week.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
export function ImpactSection() {
  const { runDemo } = usePanganloopUi();

  return (
    <section className="imp" id="dampak" aria-labelledby="imp-title">
      <div className="container">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="imp-header reveal">
          <div className="imp-header-copy">
            <p className="imp-eyebrow">Transparansi dampak</p>
            <h2 id="imp-title">Dampak yang dapat ditelusuri</h2>
            <p className="imp-sub">
              Angka di bawah berasal dari batch dan pickup yang benar-benar dicatat.
            </p>
          </div>

          <div className="imp-header-actions">
            <div className="imp-date-pill">
              <CalendarIcon />
              <span>1–19 Oktober 2026</span>
              <ChevronRightIcon className="imp-date-caret icon" />
            </div>
            <button
              type="button"
              className="imp-demo-btn"
              onClick={() => runDemo("Filter tanggal")}
            >
              Demo data
              <InfoIcon className="icon" />
            </button>
          </div>
        </div>

        {/* ── Stat cards ─────────────────────────────────────── */}
        <div className="imp-stats reveal" style={{ "--delay": ".1s" } as React.CSSProperties}>
          {stats.map((s) => (
            <div className={`imp-stat${s.accent ? " imp-stat--warn" : ""}`} key={s.label}>
              <span className={`imp-stat-icon-wrap${s.accent ? " imp-stat-icon-wrap--warn" : ""}`} aria-hidden="true">
                {s.icon}
              </span>
              <div className="imp-stat-body">
                <p className="imp-stat-label">{s.label}</p>
                <p className="imp-stat-value">
                  {s.value}
                  <span className="imp-stat-unit">&nbsp;{s.unit}</span>
                </p>
                <p className="imp-stat-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Legend row ─────────────────────────────── */}
        <div className="imp-body reveal" style={{ "--delay": ".18s" } as React.CSSProperties}>

          {/* Chart panel */}
          <div className="imp-chart-panel">
            <div className="imp-chart-top">
              <p className="imp-chart-title">Dipublikasikan vs berhasil diambil</p>
              <div className="imp-chart-legend">
                <span className="imp-chart-dot imp-chart-dot--listed" />
                <span>Dipublikasikan</span>
                <span className="imp-chart-dot imp-chart-dot--rescued" />
                <span>Berhasil diambil (rescued)</span>
              </div>
            </div>
            <ImpactChart />
          </div>

          {/* Metric guide panel */}
          <div className="imp-guide-panel">
            <p className="imp-guide-title">Cara membaca metrik</p>
            <ul className="imp-guide-list">
              {metricGuide.map((m) => (
                <li className="imp-guide-item" key={m.term}>
                  <span className="imp-guide-icon-wrap" aria-hidden="true">
                    {m.icon}
                  </span>
                  <div>
                    <p className="imp-guide-term">{m.term}</p>
                    <p className="imp-guide-desc">{m.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Footer note ────────────────────────────────────── */}
        <p className="imp-footnote reveal" style={{ "--delay": ".22s" } as React.CSSProperties}>
          <InfoIcon className="icon" />
          Berdasarkan data yang dicatat pengguna; bukan pengukuran independen.
          <span className="imp-footnote-right">🌿 Lebih sedikit terbuang. Lebih banyak kesempatan.</span>
        </p>

      </div>
    </section>
  );
}
