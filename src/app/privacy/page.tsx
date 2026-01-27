import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - NodalForge',
  description: 'Politique de confidentialité et protection des données personnelles de l\'écosystème NodalForge.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Politique de Confidentialité
        </h1>
        <p className="text-blue-600 font-medium mb-8">
          Écosystème NodalForge
        </p>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <section>
            <p className="text-sm text-gray-400 italic">
              Dernière mise à jour : 27 Janvier 2026
            </p>
            <p className="mt-4 leading-relaxed">
              La présente politique de confidentialité détaille la manière dont <strong>NodalForge</strong> (incluant les services Cardify, NodalCV et home.nodalforge.cloud) collecte, utilise et protège vos informations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">1</span>
              Responsable du Traitement
            </h2>
            <p>
              L&apos;ensemble des services est édité par <strong>NodalForge</strong>. Pour toute question relative à vos données personnelles, vous pouvez nous contacter à : <a href="mailto:nodalforge@gmail.com" className="text-blue-600 hover:underline">nodalforge@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">2</span>
              Données Collectées
            </h2>
            <p className="mb-4">Nous collectons uniquement les données nécessaires au bon fonctionnement de nos services :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informations de compte :</strong> Email, nom et photo de profil (via Google SSO).</li>
              <li><strong>Données de contenu (NodalCV/Cardify) :</strong> Toutes les informations saisies pour la création de vos CV (expériences, formations, compétences, coordonnées).</li>
              <li><strong>Données de navigation (Analytics) :</strong> Adresse IP (anonymisée), type d&apos;appareil, pages visitées et sources de trafic (via Google Analytics 4).</li>
              <li><strong>Données d&apos;interaction :</strong> Nombre de vues sur votre CV, mots-clés de recherche ayant mené à votre profil.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">3</span>
              Finalité de la Collecte
            </h2>
            <p className="mb-4">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Fournir le service :</strong> Créer, stocker et diffuser vos CV en ligne.</li>
              <li><strong>Statistiques :</strong> Vous fournir des analyses précises sur la visibilité de votre profil (vues, recherches).</li>
              <li><strong>Amélioration :</strong> Analyser l&apos;audience globale de nos outils pour optimiser l&apos;expérience utilisateur.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">4</span>
              Partage des Données
            </h2>
            <p className="mb-4">Nous ne vendons jamais vos données. Elles sont uniquement partagées avec nos sous-traitants techniques pour le fonctionnement du service :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Cloud / SSO :</strong> Authentification sécurisée.</li>
              <li><strong>Google Analytics 4 :</strong> Mesure d&apos;audience (uniquement si vous avez accepté les cookies).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">5</span>
              Cookies et Tracking
            </h2>
            <p className="mb-4">Nous utilisons des cookies pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintenir votre session connectée.</li>
              <li>Enregistrer vos préférences de consentement.</li>
              <li>Mesurer l&apos;audience via Google Analytics 4 (soumis à votre accord préalable via notre bannière de cookies).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">6</span>
              Vos Droits (RGPD)
            </h2>
            <p className="mb-4">Conformément à la réglementation européenne, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Droit d&apos;accès et de rectification :</strong> Vous pouvez modifier vos données à tout moment depuis votre espace personnel.</li>
              <li><strong>Droit à l&apos;effacement :</strong> Vous pouvez demander la suppression de votre compte et de toutes les données associées.</li>
              <li><strong>Droit d&apos;opposition :</strong> Vous pouvez refuser le tracking analytique via notre bannière de cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">7</span>
              Sécurité
            </h2>
            <p>
              Toutes vos données sont transmises via un protocole sécurisé (<strong>HTTPS/TLS</strong>). Nous appliquons des politiques de chiffrement strictes pour protéger vos informations contre tout accès non autorisé.
            </p>
          </section>

          <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-sm">
            <p>
              <strong>Note importante :</strong> En utilisant nos services, vous acceptez que vos CV publics soient accessibles via un lien unique et puissent être indexés par les moteurs de recherche si vous choisissez de les rendre publics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
