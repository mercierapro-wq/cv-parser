'use client';

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const GA_MEASUREMENT_ID = 'G-GSPSG6EQSV';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [shouldLoadGA, setShouldLoadGA] = useState(false);

  // Fonction pour charger GA dynamiquement
  const loadGA = useCallback(() => {
    setShouldLoadGA(true);
  }, []);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie_consent');
    
    // Utilisation de setTimeout pour éviter l'erreur de lint sur le setState synchrone dans un effect
    const timer = setTimeout(() => {
      if (!storedConsent) {
        setShowBanner(true);
      } else if (storedConsent === 'accepted') {
        loadGA();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loadGA]);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    loadGA();
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowBanner(false);
  };

  return (
    <>
      {/* Chargement conditionnel de Google Analytics */}
      {shouldLoadGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Bannière de consentement */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-slide-up">
          <div className="max-w-5xl mx-auto bg-gray-900/95 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm md:text-base text-center md:text-left space-y-2">
              <h3 className="font-semibold text-lg">Respect de votre vie privée</h3>
              <p className="text-gray-300 leading-relaxed">
                Nous utilisons des cookies pour optimiser votre expérience, analyser le trafic et personnaliser le contenu. 
                En cliquant sur &quot;Accepter&quot;, vous consentez à l&apos;utilisation de ces technologies.
                Vous pouvez consulter notre{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
                  Politique de confidentialité
                </Link>.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
              >
                Refuser
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-8 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
