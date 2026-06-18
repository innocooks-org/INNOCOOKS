import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

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
  width: "device-width",
  initialScale: 1,
  // extend the onyx void edge-to-edge under notches/rounded corners; the nav
  // and container add env(safe-area-inset-*) padding so nothing is occluded
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#121112",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://innocooks.com"),
  title: {
    default: "InnoCooks · Websites, Internal Systems & AI Automation",
    template: "%s · InnoCooks",
  },
  description:
    "InnoCooks is a systems studio building the websites, internal tools and AI automation growing businesses run on. Crafted like products, not projects.",
  openGraph: {
    title: "InnoCooks · Systems Studio",
    description:
      "Websites, internal management systems and AI automation for small and medium businesses.",
    type: "website",
    locale: "en_IN",
    siteName: "InnoCooks",
  },
  twitter: {
    card: "summary_large_image",
    title: "InnoCooks · Systems Studio",
    description:
      "Websites, internal management systems and AI automation for small and medium businesses.",
  },
  keywords: [
    "InnoCooks",
    "systems studio",
    "web development India",
    "internal management systems",
    "AI automation",
    "custom software",
  ],
  alternates: { canonical: "/" },
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
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          // escape "<" so this static JSON can never break out of the <script>
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Preloader />
        <SmoothScroll />
        <Cursor />
        <Frame />
        <ScrollSpy />
        <Nav />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
