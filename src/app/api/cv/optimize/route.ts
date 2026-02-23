import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Middleware d'Authentification (Vérification du Token Firebase)
    const session = await auth(req);
    
    if (!session || !session.user.email) {
      return NextResponse.json(
        { error: "Non autorisé. Session invalide ou expirée." }, 
        { status: 401 }
      );
    }

    // 2. Extraction et Injection d'Identité
    const body = await req.json();
    
    // On écrase systématiquement l'email avec celui vérifié par Firebase
    const payload = {
      ...body,
      email: session.user.email
    };

    // 3. Proxy de Requête vers n8n
    const n8nUrl = process.env.NEXT_PUBLIC_OPTIMIZE_BY_OFFER_URL;
    const n8nSecret = process.env.N8N_SECRET_KEY;

    if (!n8nUrl || !n8nSecret) {
      console.error("Configuration n8n manquante");
      return NextResponse.json(
        { error: "Erreur de configuration serveur" }, 
        { status: 500 }
      );
    }

    const response = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": n8nSecret // Utilisation du header standard
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur n8n (${response.status}):`, errorText);
      return NextResponse.json(
        { error: "Le service d'optimisation a rencontré une erreur." }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erreur Proxy API:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue." }, 
      { status: 500 }
    );
  }
}
