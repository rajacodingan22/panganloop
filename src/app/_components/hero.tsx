import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowRightIcon, ChartIcon, PlayIcon } from "./icons";
import { InfoButton } from "./info-button";

const delay = (value: string) => ({ "--delay": value }) as CSSProperties;

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow reveal" style={delay(".05s")}>
            Pangan lebih berarti
          </p>
          <h1 className="reveal" id="hero-title" style={delay(".12s")}>
            Surplus hari ini,
            <br />
            <span>manfaat hari ini.</span>
          </h1>
          <p className="lede reveal" style={delay(".2s")}>
            Catat, selamatkan, serahkan, dan pelajari dari surplus makanan.
            Bersama, kita wujudkan sistem pangan yang lebih adil dan
            berkelanjutan.
          </p>

          <div className="hero-actions reveal" style={delay(".28s")}>
            <a className="btn btn-primary btn-lg" href="#surplus">
              <ArrowRightIcon className="icon" />
              Lihat surplus aktif
            </a>
            <InfoButton className="btn btn-outline btn-lg">
              <span className="play" aria-hidden="true">
                <PlayIcon />
              </span>
              Pelajari cara kerja
            </InfoButton>
          </div>

          <dl className="stats reveal" id="dampak" style={delay(".36s")}>
            <div className="stat">
              <dt>Porsi makanan terselamatkan</dt>
              <dd>12.480+</dd>
            </div>
            <div className="stat">
              <dt>Mitra terlibat</dt>
              <dd>320+</dd>
            </div>
            <div className="stat">
              <dt>Di seluruh Indonesia</dt>
              <dd>28 kota</dd>
            </div>
          </dl>

          <p className="source reveal" style={delay(".42s")}>
            <ChartIcon />
            Data berdasarkan catatan pengguna
          </p>
        </div>

        <div className="hero-visual">
          <div className="loop-stage">
            <Image
              src="/assets/hero-loop.png"
              alt="Siklus PANGANLOOP: catat surplus makanan, selamatkan dengan menghubungkan pihak yang membutuhkan, serahkan ke komunitas, lalu pelajari dampaknya."
              fill
              priority
              sizes="(max-width: 1040px) 92vw, 52vw"
              className="hero-loop-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
