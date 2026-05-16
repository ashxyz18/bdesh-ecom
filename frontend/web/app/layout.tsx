import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { Providers } from "./providers";
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
  title: {
    default: "BixelBD - Build Your Online Store in Bangladesh",
    template: "%s | BixelBD",
  },
  description:
    "The easiest way to create your own e-commerce website and mobile app in Bangladesh. Accept bKash, Nagad, and Rocket payments. Launch in minutes with beautiful templates.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "ecommerce Bangladesh",
    "online store builder",
    "bKash payments",
    "Nagad payments",
    "e-commerce platform Bangladesh",
    "create online shop",
    "Bangladesh ecommerce",
    "store builder",
    "sell online Bangladesh",
  ],
  authors: [{ name: "BixelBD" }],
  creator: "BixelBD",
  publisher: "BixelBD",
  openGraph: {
    title: "BixelBD - Build Your Online Store in Bangladesh",
    description:
      "The easiest way to create your own e-commerce website and mobile app in Bangladesh. Accept bKash, Nagad, and Rocket payments.",
    type: "website",
    locale: "en_BD",
    siteName: "BixelBD",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BixelBD - Build Your Online Store in Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BixelBD - Build Your Online Store in Bangladesh",
    description: "The easiest way to create your own e-commerce website in Bangladesh.",
    images: ["/og-image.jpg"],
    creator: "@bixelbd",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#1d4ed8" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BixelBD",
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  other: {
    "msapplication-TileColor": "#1d4ed8",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#008060",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#008060",
  colorScheme: "light",
};

// JSON-LD Structured Data
function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bdesh.shop/#organization",
        name: "BixelBD",
        url: "https://bdesh.shop",
        logo: {
          "@type": "ImageObject",
          url: "https://bdesh.shop/logo.png",
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://facebook.com/bixelbd",
          "https://twitter.com/bixelbd",
          "https://instagram.com/bixelbd",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+880-1XXX-XXXXXX",
          contactType: "customer support",
          areaServed: "BD",
          availableLanguage: ["English", "Bengali"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://bdesh.shop/#website",
        url: "https://bdesh.shop",
        name: "BixelBD",
        description: "The easiest way to create your online store in Bangladesh.",
        publisher: { "@id": "https://bdesh.shop/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://bdesh.shop/templates?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "BixelBD",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BDT",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1250",
        },
        featureList: [
          "bKash and Nagad payment integration",
          "Mobile-optimized store templates",
          "Inventory management",
          "Order tracking",
          "Courier integration",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansBengali.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <StructuredData />
      </head>
      <body className={inter.className}>
        {/* Skip to content - accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#008060] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#008060] focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
