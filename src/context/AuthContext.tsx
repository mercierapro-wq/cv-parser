'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Auto-import CV from localStorage if it exists
      const pendingData = localStorage.getItem("pending-cv-data");
      if (pendingData && user.email) {
        try {
          const cvData = JSON.parse(pendingData);
          // Ensure the email in the CV matches the logged-in user
          cvData.personne.contact.email = user.email;

          const insertUrl = process.env.NEXT_PUBLIC_INSERT_CV_URL;
          if (insertUrl) {
            const { visible, availability, slug: currentSlug, ...cvContent } = cvData;
            const payload = {
              email: user.email,
              nom: cvData.personne.nom,
              prenom: cvData.personne.prenom,
              slug: currentSlug,
              visible: visible ?? true,
              availability: availability || 'immediate',
              data: cvContent
            };

            await fetch(insertUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            localStorage.removeItem("pending-cv-data");
            console.log("CV importé automatiquement après connexion");
          }
        } catch (e) {
          console.error("Erreur lors de l'import automatique du CV:", e);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
