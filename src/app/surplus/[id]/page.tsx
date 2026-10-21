import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimButton } from "../../_components/claim-button";
import { DemoLink } from "../../_components/demo-link";
import {
  AlertIcon,
  BoxIcon,
  ChartIcon,
  ChevronRightIcon,
  ClockIcon,
  HomeIcon,
  InfoIcon,
  MapPinIcon,
  StoreIcon,
  ThermometerIcon,
} from "../../_components/icons";
import { getSurplusItem, surplusItems } from "../../_components/surplus-data";

export function generateStaticParams() {
  return surplusItems.map((item) => ({ id: item.id }));
}

export async function generateMetadata(
  props: PageProps<"/surplus/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const item = getSurplusItem(id);

  if (!item) return {};

  return {
    title: `${item.title} — Surplus di ${item.place} | PANGANLOOP`,
    description: `${item.units} unit ${item.title.toLowerCase()} dari ${item.org}. ${item.cutoff}.`,
    openGraph: {
      images: [{ url: item.photo, alt: item.alt }],
    },
  };
}

export default async function SurplusDetailPage(
  props: PageProps<"/surplus/[id]">,
) {
  const { id } = await props.params;
  const item = getSurplusItem(id);

  if (!item) notFound();

  return (
    <div className="container detail-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/" aria-label="Beranda" className="breadcrumb-home">
          <HomeIcon className="icon" />
        </Link>
        <ChevronRightIcon className="breadcrumb-sep" />
        <Link href="/#surplus">Surplus aktif</Link>
        <ChevronRightIcon className="breadcrumb-sep" />
        <span aria-current="page">{item.title}</span>
      </nav>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-photo">
            <Image
              src={item.photo}
              alt={item.alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 60vw"
            />
          </div>

          <section className="handling-card" aria-labelledby="handling-title">
            <div className="handling-head">
              <span className="handling-icon" aria-hidden="true">
                <InfoIcon className="icon" />
              </span>
              <div>
                <h2 id="handling-title">Informasi penanganan</h2>
                <p>Disiapkan oleh penyedia</p>
              </div>
            </div>

            <div className="handling-grid">
              <div className="handling-item">
                <BoxIcon className="icon" />
                <strong>{item.packaged}</strong>
              </div>
              <div className="handling-item">
                <ThermometerIcon className="icon" />
                <strong>{item.storage}</strong>
              </div>
              <div className="handling-item">
                <AlertIcon className="icon" />
                <strong>{item.allergen}</strong>
              </div>
            </div>

            <p className="handling-note">
              <InfoIcon className="icon" />
              PANGANLOOP tidak memastikan keamanan pangan. Periksa kondisi
              makanan sebelum dikonsumsi.
            </p>
          </section>
        </div>

        <aside className="detail-side">
          <div className="detail-summary">
            <div className="detail-title-row">
              <h1>{item.title}</h1>
              <span className="badge-available">
                <ClockIcon className="icon" />
                Masih tersedia
              </span>
            </div>

            <div className="detail-org">
              <StoreIcon className="icon" />
              <DemoLink label="Profil penyedia" className="detail-org-link">
                {item.org}
              </DemoLink>
              <ChevronRightIcon className="icon detail-org-chevron" />
            </div>

            <div className="detail-units">
              <span className="detail-units-icon" aria-hidden="true">
                <BoxIcon className="icon" />
              </span>
              <div>
                <p className="detail-units-count">
                  {item.units} unit tersedia
                </p>
                <p className="detail-units-note">{item.pickupNote}</p>
              </div>
            </div>

            <p className="detail-cutoff">
              <ClockIcon className="icon" />
              {item.cutoffFull}
            </p>

            <div className="detail-location">
              <MapPinIcon className="icon" />
              <div>
                <p className="detail-area">{item.area}</p>
                <p className="detail-location-note">
                  Lokasi detail akan ditampilkan setelah Anda masuk dan berhasil
                  mengklaim.
                </p>
              </div>
            </div>

            <ClaimButton />
          </div>

          <section className="batch-card" aria-labelledby="batch-title">
            <h2 id="batch-title">
              <ChartIcon className="icon" />
              Jejak batch ini
            </h2>

            <dl className="batch-grid">
              <div>
                <dt>Disiapkan</dt>
                <dd>
                  {item.batchPrepared}
                  <span> unit</span>
                </dd>
              </div>
              <div>
                <dt>Terjual</dt>
                <dd>
                  {item.batchSold}
                  <span> unit</span>
                </dd>
              </div>
              <div>
                <dt>Surplus</dt>
                <dd>
                  {item.units}
                  <span> unit</span>
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
