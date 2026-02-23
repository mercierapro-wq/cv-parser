import { adminAuth } from "@/lib/firebase-admin";

export interface Session {
  user: {
    email: string;
    uid: string;
  };
}

/**
 * Vérifie le token Firebase passé dans le header Authorization.
 * Cette fonction est utilisée par les API Routes pour sécuriser les appels.
 */
export async function auth(req: Request): Promise<Session | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken || !decodedToken.email) {
      return null;
    }

    return {
      user: {
        email: decodedToken.email,
        uid: decodedToken.uid,
      },
    };
  } catch (error) {
    console.error("Erreur de vérification du token Firebase:", error);
    return null;
  }
}
