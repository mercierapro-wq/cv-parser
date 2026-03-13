import type { Metadata } from "next";
import FaqAccordion from "@/components/FaqAccordion";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nodalcv.com";

export const faqItems = [
  {
    question: "Qu'est-ce que NodalCV ?",
    answer:
      "NodalCV est une plateforme qui transforme votre CV PDF en un profil web professionnel structuré et référencé sur Google. Grâce à l'intelligence artificielle, vos expériences, compétences et formations sont automatiquement extraites et mises en forme sur une page publique personnalisée.",
  },
  {
    question: "Comment créer mon profil NodalCV ?",
    answer:
      "C'est simple : depuis la page d'accueil, déposez votre CV en format PDF. Notre IA analyse votre document en quelques secondes et génère automatiquement votre profil. Vous pouvez ensuite le modifier, l'enrichir et le publier en un clic.",
  },
  {
    question: "Mon profil est-il visible publiquement ?",
    answer:
      "Vous contrôlez entièrement la visibilité de votre profil. Depuis votre espace « Mon CV », vous pouvez le rendre public (accessible par un lien unique et indexé par Google) ou le garder privé. Un profil privé n'est accessible qu'à vous.",
  },
  {
    question: "Qu'est-ce que la fonction IA « Reconstruire » ?",
    answer:
      "La fonction « Reconstruire » analyse l'ensemble de votre profil et vous propose une version améliorée de chaque section : résumé, expériences, compétences. L'IA reformule vos contenus pour les rendre plus percutants et plus lisibles, sans changer le fond de ce que vous avez vécu.",
  },
  {
    question: "Qu'est-ce que la fonction IA « Optimiser pour une offre » ?",
    answer:
      "Cette fonction vous permet de coller une offre d'emploi dans NodalCV. L'IA analyse les mots-clés et les attentes du recruteur, puis adapte votre profil pour mieux correspondre à cette offre. Le résultat est une version ciblée de votre CV, générée en quelques secondes.",
  },
  {
    question: "Qu'est-ce que la fonction IA « Candidature » ?",
    answer:
      "La fonction « Candidature » génère automatiquement une lettre de motivation personnalisée à partir de votre profil et de l'offre d'emploi que vous lui soumettez. Elle rédige un message clair et professionnel, que vous pouvez ensuite relire et ajuster avant de l'envoyer.",
  },
  {
    question: "Grâce à l'IA, puis-je optimiser une expérience à la fois ?",
    answer:
      "Oui. Dans l'éditeur de profil, chaque expérience professionnelle dispose d'un bouton d'optimisation individuel. Vous pouvez donc affiner une expérience précise sans toucher au reste de votre profil.",
  },
  {
    question: "Puis-je avoir plusieurs versions de mon CV ?",
    answer:
      "Oui. NodalCV vous permet de créer plusieurs versions de votre CV, par exemple une par offre d'emploi ciblée. Cependant, seul votre CV de référence (le CV principal) peut être rendu public et visible sur votre page en ligne. Les autres versions restent privées et sont destinées à un usage personnel ou à être envoyées directement à un recruteur.",
  },
  {
    question: "Comment suivre les statistiques de consultation de mon CV ?",
    answer:
      "La page « Statistiques » vous donne accès en temps réel au nombre de vues de votre profil, aux sources de trafic (recherche Google, partage de lien, etc.) et aux mots-clés qui ont mené des visiteurs vers votre page.",
  },
  {
    question: "Mon profil NodalCV est-il référencé sur Google ?",
    answer:
      "Oui, automatiquement. Dès que vous rendez votre profil public, NodalCV s'occupe de tout pour que Google puisse le trouver et l'afficher dans ses résultats. Vous n'avez rien à configurer : votre nom, votre métier et vos compétences peuvent apparaître directement dans Google quand quelqu'un vous cherche.",
  },
  {
    question: "Puis-je télécharger mon CV en PDF ?",
    answer:
      "Oui. Depuis la page de votre profil public, un bouton « Télécharger en PDF » permet d'exporter votre profil NodalCV dans un format imprimable, prêt à être envoyé à un recruteur.",
  },
  {
    question: "Comment modifier mon profil après sa création ?",
    answer:
      "Connectez-vous, accédez à « Mon CV », puis cliquez sur « Modifier » à côté du profil souhaité. L'éditeur vous permet de modifier chaque section (expériences, compétences, formations, résumé) et de mettre à jour votre photo de profil.",
  },
  {
    question: "NodalCV est-il gratuit ?",
    answer:
      "Oui, NodalCV est actuellement entièrement gratuit. La création de profil, l'optimisation IA, la publication en ligne et les statistiques sont accessibles sans abonnement.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Vos données sont transmises exclusivement via HTTPS/TLS et ne sont jamais vendues à des tiers. Vous disposez d'un droit d'accès, de rectification et de suppression de toutes vos données à tout moment, conformément au RGPD. Consultez notre politique de confidentialité pour plus de détails.",
  },
];

export const metadata: Metadata = {
  title: "FAQ - Questions fréquentes sur NodalCV",
  description:
    "Toutes les réponses à vos questions sur NodalCV : création de profil, visibilité, optimisation IA, statistiques, référencement Google et gestion de vos données.",
  alternates: {
    canonical: `${baseUrl}/faq`,
  },
  openGraph: {
    title: "FAQ NodalCV - Questions fréquentes",
    description:
      "Toutes les réponses à vos questions sur NodalCV : création de profil, visibilité, optimisation IA, statistiques et référencement Google.",
    url: `${baseUrl}/faq`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
              Centre d&apos;aide
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Questions fréquentes
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Tout ce que vous devez savoir pour tirer le meilleur parti de NodalCV.
            </p>
          </div>

          {/* Accordion */}
          <FaqAccordion items={faqItems} />

          {/* CTA bottom */}
          <div className="mt-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <p className="text-slate-600 mb-4">
              Vous n&apos;avez pas trouvé la réponse à votre question ?
            </p>
            <a
              href="mailto:nodalforge@gmail.com"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
