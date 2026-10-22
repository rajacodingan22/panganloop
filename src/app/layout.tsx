import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, DM_Sans } from "next/font/google";
import { AuthProvider } from "./_components/auth-context";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = DM_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const hand = Caveat({
  variable: "--font-hand",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PANGANLOOP — Surplus hari ini, manfaat hari ini.",
  description:
    "PANGANLOOP menghubungkan surplus makanan dengan komunitas yang membutuhkan. Catat, selamatkan, serahkan, dan pelajari dampaknya untuk sistem pangan yang lebih adil dan berkelanjutan.",
  openGraph: {
    title: "PANGANLOOP — Surplus hari ini, manfaat hari ini.",
    description:
      "PANGANLOOP menghubungkan surplus makanan dengan komunitas yang membutuhkan. Catat, selamatkan, serahkan, dan pelajari dampaknya untuk sistem pangan yang lebih adil dan berkelanjutan.",
  },
  icons: {
    icon: [{ url: "/assets/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full">
      <body
        className={`${display.variable} ${body.variable} ${hand.variable}`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
