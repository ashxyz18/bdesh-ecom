import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BdeshShop - Build Your Online Store in Bangladesh",
  description:
    "The easiest way to create your own e-commerce website and mobile app in Bangladesh. Accept bKash, Nagad, and Rocket payments.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BdeshShop - Build Your Online Store in Bangladesh",
    description:
      "The easiest way to create your own e-commerce website and mobile app in Bangladesh.",
    type: "website",
    locale: "en_BD",
    siteName: "BdeshShop",
  },
  twitter: {
    card: "summary_large_image",
    title: "BdeshShop",
    description: "Build your online store in Bangladesh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#008060",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansBengali.variable}`}>
      <body className={inter.className}>
        {/* Skip to content - accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#008060] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#008060] focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
