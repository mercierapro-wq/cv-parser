import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Mapping des types d'actions vers les variables d'environnement
const ENDPOINT_MAP: Record<string, string | undefined> = {
  "update-cv": process.env.NEXT_PUBLIC_UPDATE_CV_URL,
  "optimize-desc": process.env.NEXT_PUBLIC_OPTIMIZE_DESC_URL,
  "optimize-cv": process.env.NEXT_PUBLIC_OPTIMIZE_CV_URL,
  "get-offer": process.env.NEXT_PUBLIC_GET_OFFER_URL,
  "delete-cv": process.env.NEXT_PUBLIC_DELETE_CV_URL,
  "create-cover-letter": process.env.NEXT_PUBLIC_CREATE_COVER_LETTER_URL,
  "save-cover-letter": process.env.NEXT_PUBLIC_SAVE_COVER_LETTER_URL,
  "save-offer": process.env.NEXT_PUBLIC_SAVE_OFFER_URL,
  "optimize-by-offer": process.env.NEXT_PUBLIC_OPTIMIZE_BY_OFFER_URL,
  "insert-cv": process.env.NEXT_PUBLIC_INSERT_CV_URL,
  "tracking": process.env.NEXT_PUBLIC_TRACKING_URL,
  "get-analytics": process.env.NEXT_PUBLIC_GET_ANALYTICS_URL,
  "get-cv": process.env.NEXT_PUBLIC_GET_CV_URL,
  "generate-pdf": process.env.NEXT_PUBLIC_N8N_PDF_WEBHOOK_URL,
  "parse-cv": process.env.NEXT_PUBLIC_PARSE_CV_URL,
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let action: string;
    let payload: any;
    let isFormData = false;

    // 1. Extraction des données selon le type de contenu
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      action = formData.get("action") as string;
      payload = formData;
      isFormData = true;
    } else {
      const body = await req.json();
      action = body.action;
      payload = body;
    }

    // 2. Authentification Firebase (Optionnelle pour certaines actions)
    const session = await auth(req);
    
    // Actions qui nécessitent obligatoirement une authentification
    const protectedActions = [
      "update-cv", 
      "optimize-desc", 
      "optimize-cv", 
      "get-offer",
      "delete-cv", 
      "create-cover-letter", 
      "save-cover-letter", 
      "save-offer", 
      "optimize-by-offer",
      "get-analytics",
      "get-cv"
    ];

    if (protectedActions.includes(action) && (!session || !session.user.email)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 3. Vérification de l'endpoint
    const n8nUrl = ENDPOINT_MAP[action];
    const n8nSecret = process.env.N8N_SECRET_KEY;

    if (!n8nUrl || !n8nSecret) {
      console.error(`Configuration manquante pour l'action: ${action}`);
      return NextResponse.json({ error: "Action non supportée ou config manquante" }, { status: 400 });
    }

    // 4. Préparation de la requête vers n8n
    let fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Authorization": n8nSecret
      }
    };

    if (isFormData) {
      // Pour FormData, on laisse fetch définir le boundary
      // On ajoute l'email si l'utilisateur est connecté
      if (session?.user?.email) {
        (payload as FormData).append("email", session.user.email);
      }
      fetchOptions.body = payload;
    } else {
      // Pour JSON
      const { action: _, ...data } = payload;
      const jsonBody = {
        ...data,
        ...(session?.user?.email ? { email: session.user.email } : {})
      };
      (fetchOptions.headers as any)["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(jsonBody);
    }

    const response = await fetch(n8nUrl, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur n8n [${action}] (${response.status}):`, errorText);
      return NextResponse.json({ error: `Erreur service n8n: ${action}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error("Erreur Proxy Générique:", error);
    return NextResponse.json({ error: "Erreur interne du proxy" }, { status: 500 });
  }
}
