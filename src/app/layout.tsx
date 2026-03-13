import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { AuthProvider } from "@/context/AuthContext";
import { NavigationProvider } from "@/context/NavigationContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nodalcv.com";

export const metadata: Metadata = {
  title: {
    default: "NodalCV - Profil CV intelligent en ligne",
    template: "%s | NodalCV",
  },
  description:
    "Transformez votre CV PDF en profil web professionnel optimisé par l'IA. Compétences structurées, statistiques de vues en temps réel, référencement Google automatique.",
  metadataBase: new URL(baseUrl),
  keywords: [
    "CV en ligne",
    "profil professionnel",
    "créer CV",
    "CV IA",
    "CV PDF",
    "portfolio professionnel",
    "NodalCV",
  ],
  authors: [{ name: "NodalForge", url: baseUrl }],
  creator: "NodalForge",
  publisher: "NodalForge",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    siteName: "NodalCV",
    locale: "fr_FR",
    type: "website",
  },
  icons: {
    icon: "/NodalCV_icon.png",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "NodalCV",
  "url": baseUrl,
  "description":
    "Transformez votre CV PDF en profil web professionnel optimisé par l'IA. Compétences structurées, statistiques de vues en temps réel, référencement Google automatique.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "inLanguage": "fr",
  "featureList": [
    "Import et analyse automatique de CV PDF par intelligence artificielle",
    "Création d'un profil web public référencé sur Google",
    "Optimisation IA du profil complet (fonction Reconstruire)",
    "Adaptation du CV à une offre d'emploi spécifique (fonction Optimiser pour une offre)",
    "Génération automatique de lettre de motivation (fonction Candidature)",
    "Optimisation individuelle de chaque expérience professionnelle par IA",
    "Versions multiples de CV pour différentes candidatures",
    "Statistiques de consultation en temps réel",
    "Export du profil en PDF",
    "Contrôle de la visibilité publique ou privée du profil",
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
  },
  "publisher": {
    "@type": "Organization",
    "name": "NodalForge",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/NodalCV_icon.png`,
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "nodalforge@gmail.com",
      "contactType": "customer support",
      "availableLanguage": "French",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white`}
      >
        <AuthProvider>
          <NavigationProvider>
            <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
              <Header />
            </Suspense>
            <main className="min-h-screen">
              {children}
            </main>
            <Suspense fallback={<div className="h-16 bg-white border-t border-slate-200" />}>
              <Footer />
            </Suspense>
            <CookieBanner />
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
