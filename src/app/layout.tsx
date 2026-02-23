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

export const metadata: Metadata = {
  title: "NodalCV - Votre CV Professionnel",
  description: "Générez et gérez votre CV professionnel en quelques clics.",
  icons: {
    icon: "/NodalCV_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
