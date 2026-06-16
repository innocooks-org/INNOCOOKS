import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Frame from "@/components/Frame";
import ScrollSpy from "@/components/ScrollSpy";
import Cursor from "@/components/Cursor";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

// contrasting serif italic — used only to emphasise keywords inside headings
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
});

export const viewport: Viewport = {
  themeColor: "#121112",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://innocooks.com"),
  title: {
    default: "InnoCooks — Websites, Internal Systems & AI Automation",
    template: "%s — InnoCooks",
  },
  description:
    "InnoCooks is a systems studio building the websites, internal tools and AI automation growing businesses run on. Crafted like products, not projects.",
  openGraph: {
    title: "InnoCooks — Systems Studio",
    description:
      "Websites, internal management systems and AI automation for small and medium businesses.",
    type: "website",
    locale: "en_IN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "InnoCooks",
  slogan: "Cooking Innovation",
  description:
    "Systems studio building websites, internal management systems, AI workflows and automation for small and medium businesses.",
  email: "vishnuuu24@gmail.com",
  url: "https://innocooks.com",
  areaServed: "IN",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${bricolage.variable} ${hanken.variable} ${jetbrains.variable} ${instrument.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Preloader />
        <SmoothScroll />
        <Cursor />
        <Frame />
        <ScrollSpy />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
