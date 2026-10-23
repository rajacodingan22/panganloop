"use client";

import { useMemo } from "react";
import { AlertIcon, BoxIcon, ChevronRightIcon, InfoIcon, ShieldCheckIcon } from "./icons";
import { getSurplus, usePanganloop } from "./store";
import { usePanganloopUi } from "./ui-context";

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

type ChartGroup = { label: string; sub: string; listed: number; rescued: number };

function ImpactChart({ groups }: { groups: ChartGroup[] }) {
  const CHART_W = 480;
  const CHART_H = 180;
  const PADDING = { top: 16, right: 16, bottom: 48, left: 32 };
  const maxRaw = Math.max(1, ...groups.flatMap((group) => [group.listed, group.rescued]));
  const MAX_VAL = Math.max(10, Math.ceil(maxRaw / 10) * 10);
  const barW = 28;
  const gap = 10;
  const groupW = barW * 2 + gap;
  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = CHART_H - PADDING.top - PADDING.bottom;
  const sectionW = plotW / Math.max(groups.length, 1);
  const yLines = [0, MAX_VAL / 2, MAX_VAL];

  function barH(value: number) {
    return (value / MAX_VAL) * plotH;
  }

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      role="img"
      aria-label="Bar chart: surplus dipublikasikan vs berhasil diambil per kategori"
      className="imp-chart-svg"
    >
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
              {Math.round(y)}
            </text>
          </g>
        );
      })}

      {groups.map((group, i) => {
        const cx = PADDING.left + i * sectionW + sectionW / 2;
        const listedH = barH(group.listed);
        const rescuedH = barH(group.rescued);
        const listedX = cx - groupW / 2;
        const rescuedX = listedX + barW + gap;
        const baseY = PADDING.top + plotH;

        return (
          <g key={group.label}>
            <rect
              x={listedX}
              y={baseY - listedH}
              width={barW}
              height={listedH}
              rx="5"
              fill="#a8c5a0"
            />
            <rect
              x={rescuedX}
              y={baseY - rescuedH}
              width={barW}
              height={rescuedH}
              rx="5"
              fill="#2c7a57"
            />
            <text
              x={cx}
              y={baseY + 16}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="rgba(13,53,39,0.65)"
            >
              {group.label}
            </text>
            <text
              x={cx}
              y={baseY + 29}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(13,53,39,0.38)"
            >
              {group.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ImpactSection() {
  const { state } = usePanganloop();
  const { runDemo } = usePanganloopUi();

  const metrics = useMemo(() => {
    const listedBatches = state.batches.filter(
      (batch) => batch.status === "published" || batch.status === "closed",
    );
    const listed = listedBatches.reduce((total, batch) => total + getSurplus(batch), 0);

    const rescued = state.batches.reduce((total, batch) => {
      if (batch.status === "closed" && batch.closeout) return total + batch.closeout.rescued;
      return (
        total +
        state.reservations
          .filter((reservation) => reservation.batchId === batch.id && reservation.status === "picked_up")
          .reduce((sum, reservation) => sum + reservation.units, 0)
      );
    }, 0);

    const unclaimed = state.batches.reduce(
      (total, batch) =>
        total + (batch.status === "closed" ? batch.closeout?.unclaimed ?? 0 : 0),
      0,
    );
    const completion = rescued + unclaimed > 0 ? Math.round((rescued / (rescued + unclaimed)) * 100) : 0;

    const groups: ChartGroup[] = Array.from(new Set(listedBatches.map((batch) => batch.category)))
      .map((category) => {
        const batches = listedBatches.filter((batch) => batch.category === category);
        return {
          label: category.split(" ")[0],
          sub: `${batches.length} batch`,
          listed: batches.reduce((total, batch) => total + getSurplus(batch), 0),
          rescued: batches.reduce((total, batch) => {
            if (batch.status === "closed" && batch.closeout) return total + batch.closeout.rescued;
            return (
              total +
              state.reservations
                .filter(
                  (reservation) =>
                    reservation.batchId === batch.id && reservation.status === "picked_up",
                )
                .reduce((sum, reservation) => sum + reservation.units, 0)
            );
          }, 0),
        };
      })
      .filter((group) => group.listed > 0)
      .sort((a, b) => b.listed - a.listed)
      .slice(0, 3);

    return { listed, rescued, unclaimed, completion, groups };
  }, [state.batches, state.reservations]);

  const stats = [
    {
      icon: <BoxIcon className="imp-stat-icon" />,
      label: "Surplus dipublikasikan",
      value: String(metrics.listed),
      unit: "unit",
      desc: "Total unit surplus pada batch yang pernah tayang.",
      accent: false,
    },
    {
      icon: <ShieldCheckIcon className="imp-stat-icon" />,
      label: "Rescued",
      value: String(metrics.rescued),
      unit: "unit",
      desc: "Unit yang sudah diambil penerima atau ditutup sebagai tersalurkan.",
      accent: false,
    },
    {
      icon: <CheckCircleIcon />,
      label: "Pickup selesai",
      value: String(metrics.completion),
      unit: "%",
      desc: "Rasio unit tersalurkan terhadap unit yang sudah memiliki outcome.",
      accent: false,
    },
    {
      icon: <AlertIcon className="imp-stat-icon" />,
      label: "Belum tersalurkan",
      value: String(metrics.unclaimed),
      unit: "unit",
      desc: "Unit pada batch closed yang tidak berhasil diselamatkan.",
      accent: true,
    },
  ];

  return (
    <section className="imp" id="dampak" aria-labelledby="imp-title">
      <div className="container">
        <div className="imp-header reveal">
          <div className="imp-header-copy">
            <p className="imp-eyebrow">Transparansi dampak · mode demo</p>
            <h2 id="imp-title">Dampak yang dapat ditelusuri</h2>
            <p className="imp-sub">
              Angka dihitung dari batch dan reservasi pada data demo di browser ini.
            </p>
          </div>

          <div className="imp-header-actions">
            <div className="imp-date-pill">
              <CalendarIcon />
              <span>Data demo saat ini</span>
              <ChevronRightIcon className="imp-date-caret icon" />
            </div>
            <button
              type="button"
              className="imp-demo-btn"
              onClick={() => runDemo("Sumber angka dampak")}
            >
              Sumber data
              <InfoIcon className="icon" />
            </button>
          </div>
        </div>

        <div className="imp-stats reveal" style={{ "--delay": ".1s" } as React.CSSProperties}>
          {stats.map((s) => (
            <div className={`imp-stat${s.accent ? " imp-stat--warn" : ""}`} key={s.label}>
              <span
                className={`imp-stat-icon-wrap${s.accent ? " imp-stat-icon-wrap--warn" : ""}`}
                aria-hidden="true"
              >
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

        <div className="imp-body reveal" style={{ "--delay": ".18s" } as React.CSSProperties}>
          <div className="imp-chart-panel">
            <div className="imp-chart-top">
              <p className="imp-chart-title">Dipublikasikan vs berhasil diambil per kategori</p>
              <div className="imp-chart-legend">
                <span className="imp-chart-dot imp-chart-dot--listed" />
                <span>Dipublikasikan</span>
                <span className="imp-chart-dot imp-chart-dot--rescued" />
                <span>Berhasil diambil (rescued)</span>
              </div>
            </div>
            {metrics.groups.length > 0 ? (
              <ImpactChart groups={metrics.groups} />
            ) : (
              <p className="imp-chart-empty">Belum ada batch yang dipublikasikan.</p>
            )}
          </div>

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

        <p className="imp-footnote reveal" style={{ "--delay": ".22s" } as React.CSSProperties}>
          <InfoIcon className="icon" />
          Berdasarkan data demo yang dicatat di browser; bukan pengukuran independen.
          <span className="imp-footnote-right">Lebih sedikit terbuang. Lebih banyak kesempatan.</span>
        </p>
      </div>
    </section>
  );
}
