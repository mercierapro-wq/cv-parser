import type { Metadata } from "next";
import HomepageClient from "@/components/HomepageClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nodalcv.com";

export const metadata: Metadata = {
  title: "NodalCV - Créez votre profil CV intelligent en ligne",
  description:
    "Transformez votre CV PDF en profil web professionnel optimisé par l'IA. Analyse automatique des compétences, mise en page standardisée et statistiques de consultation en temps réel.",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "NodalCV - Créez votre profil CV intelligent en ligne",
    description:
      "Transformez votre CV PDF en profil web professionnel optimisé par l'IA. Analyse automatique des compétences, mise en page standardisée et statistiques de consultation en temps réel.",
    url: baseUrl,
    siteName: "NodalCV",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "NodalCV - Créez votre profil CV intelligent en ligne",
    description:
      "Transformez votre CV PDF en profil web professionnel optimisé par l'IA. Analyse automatique des compétences, mise en page standardisée et statistiques de consultation en temps réel.",
  },
};

export default function Home() {
  return <HomepageClient />;
}
