'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AnalyticsTrackerProps {
  cvOwnerEmail: string;
}

/**
 * Composant invisible pour le tracking des vues de CV.
 * Envoie une requête POST à l'URL de tracking définie dans les variables d'environnement.
 */
export default function AnalyticsTracker({ cvOwnerEmail }: AnalyticsTrackerProps) {
  const { user, loading } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    // On attend que l'état d'authentification soit initialisé
    if (loading || hasTracked.current) return;

    const trackView = async () => {
      // Marquer comme tracké immédiatement pour éviter les doubles appels en cas de re-render
      hasTracked.current = true;

      // 1. Identification du viewer
      let viewerId = 'anonymous';
      
      if (user?.email) {
        viewerId = user.email;
      } else {
        // Tentative de récupération via cookie (nommé 'viewerId' par convention)
        const cookies = document.cookie.split(';');
        const viewerCookie = cookies.find(c => c.trim().startsWith('viewerId='));
        if (viewerCookie) {
          viewerId = viewerCookie.split('=')[1].trim();
        }
      }

      // 2. Exception : si le propriétaire regarde son propre CV, on ne tracke pas
      if (cvOwnerEmail === viewerId) {
        return;
      }

      // 3. Appel API via le proxy sécurisé
      try {
        const token = await user?.getIdToken();

        const response = await fetch("/api/n8n-proxy", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            action: 'tracking',
            cvOwnerEmail,
            viewerId,
            type: 'view',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Tracking error (n8n potentially unreachable):', error);
      }
    };

    trackView();
  }, [loading, user, cvOwnerEmail]); // Dépendances mises à jour

  return null;
}
