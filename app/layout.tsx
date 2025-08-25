import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Restobar - Sistema de Gestión Profesional",
  description:
    "Sistema integral de gestión para restaurantes y bares. Administra mesas, cocina, pedidos y caja de manera eficiente y profesional.",
  keywords: "restobar, restaurante, bar, gestión, sistema, pedidos, cocina, mesas, caja, administración",
  authors: [{ name: "Restobar System" }],
  creator: "Restobar System",
  publisher: "Restobar System",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://restobar-system.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Restobar - Sistema de Gestión Profesional",
    description:
      "Sistema integral de gestión para restaurantes y bares. Administra mesas, cocina, pedidos y caja de manera eficiente.",
    url: "https://restobar-system.vercel.app",
    siteName: "Restobar System",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Restobar - Sistema de Gestión",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restobar - Sistema de Gestión Profesional",
    description: "Sistema integral de gestión para restaurantes y bares.",
    images: ["/og-image.png"],
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Restobar System",
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "business",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Restobar" />
        <meta name="application-name" content="Restobar System" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
