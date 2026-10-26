import type { CSSProperties } from "react";
import { ArrowRightIcon } from "./icons";
import { DemoLink } from "./demo-link";

const values = [
  {
    label: (
      <>
        Mengurangi
        <br />
        makanan terbuang
      </>
    ),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 4C11 4 4 9 4 16c0 2.5 1.8 4 4 4 7 0 12-7 12-16Z" />
        <path d="M4 21c2-6 6-10 11-13" />
      </svg>
    ),
  },
  {
    label: (
      <>
        Menguatkan
        <br />
        komunitas lokal
      </>
    ),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20v-1.2A5.5 5.5 0 0 1 9 13.3a5.5 5.5 0 0 1 5.5 5.5V20" />
        <path d="M16 5.4a3.2 3.2 0 0 1 0 5.9M17.6 13.7a5.5 5.5 0 0 1 3.4 5.1V20" />
      </svg>
    ),
  },
  {
    label: (
      <>
        Mendukung
        <br />
        keberlanjutan lingkungan
      </>
    ),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21v-8" />
        <path d="M12 14C12 9.5 8.2 7 4 7c0 5 3.8 7 8 7Z" />
        <path d="M12 14c0-4 3-6.5 8-6.5 0 4-3 6.5-8 6.5Z" />
        <path d="M8.5 21h7" />
      </svg>
    ),
  },
  {
    label: (
      <>
        Membangun Indonesia
        <br />
        yang lebih baik
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 20.2c-.3 0-.6-.1-.8-.3C7 16.4 3 13 3 8.9 3 6.1 5.1 4 7.8 4c1.7 0 3.2.8 4.2 2.1C13 4.8 14.5 4 16.2 4 18.9 4 21 6.1 21 8.9c0 4.1-4 7.5-8.2 11-.2.2-.5.3-.8.3Z" />
      </svg>
    ),
  },
];

export function ValuesStrip() {
  return (
    <section className="values" aria-label="Nilai yang kami bawa">
      <div className="container">
        <div
          className="values-inner reveal"
          style={{ "--delay": ".46s" } as CSSProperties}
        >
          {values.map((value, index) => (
            <div className="value" key={index}>
              <span className="value-icon" aria-hidden="true">
                {value.icon}
              </span>
              <p>{value.label}</p>
            </div>
          ))}
          <DemoLink label="Kesempatan kedua" className="value value-cta">
            <p>
              Karena setiap makanan
              <br />
              punya kesempatan kedua.
            </p>
            <ArrowRightIcon className="icon" />
          </DemoLink>
        </div>
      </div>
    </section>
  );
}
