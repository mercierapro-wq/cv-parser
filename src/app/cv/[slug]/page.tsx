import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CVData } from "@/types/cv";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import CVDisplay from "@/components/CVDisplay";
import StructuredData from "@/components/StructuredData";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getCVData(slug: string): Promise<CVData | null> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  if (!baseUrl) {
    console.error("N8N_WEBHOOK_BASE_URL is not defined");
    return null;
  }

  const url = `${baseUrl}${slug}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Authorization': process.env.N8N_SECRET_KEY || ""
      }
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    
    // Selon la structure n8n : data du premier élément du tableau
    if (Array.isArray(result) && result.length > 0) {
      const rawData = result[0];
      if (rawData.data) {
        const cvData = rawData.data as CVData;
        // On s'assure que availability et visible sont présents s'ils sont à la racine
        if (rawData.availability && !cvData.availability) {
          cvData.availability = rawData.availability;
        }
        if (rawData.visible !== undefined && cvData.visible === undefined) {
          cvData.visible = rawData.visible;
        }
        if (rawData.profilePicture && !cvData.profilePicture) {
          cvData.profilePicture = rawData.profilePicture;
        }
        if (rawData.profilePictureTransform && !cvData.profilePictureTransform) {
          cvData.profilePictureTransform = rawData.profilePictureTransform;
        }
        return cvData;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching CV data:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cvData = await getCVData(slug);

  if (!cvData) {
    return {
      title: "Profil non trouvé | NodalCV",
    };
  }

  const { personne, competences } = cvData;
  const fullName = `${personne.nom} ${personne.prenom}`;
  const title = `${fullName} - ${personne.titre_professionnel} | NodalCV`;
  
  const skills = [...(competences.hard_skills || []), ...(competences.soft_skills || [])].slice(0, 5).join(", ");
  const description = `Découvrez le profil professionnel de ${personne.nom} sur NodalCV. Expert en ${skills}. Consultez son parcours et ses réalisations en ligne.`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nodalcv.com";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/cv/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "profile",
      firstName: personne.prenom,
      lastName: personne.nom,
      username: slug,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CVProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { print } = await searchParams;
  const isPrintMode = print === "true";
  const cvData = await getCVData(slug);

  if (!cvData) {
    notFound();
  }

  return (
    <div className={`min-h-screen font-sans ${isPrintMode ? 'bg-white py-0 px-0' : 'bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8'}`}>
      <AnalyticsTracker cvOwnerEmail={cvData.personne.contact.email} />
      <StructuredData data={cvData} />
      <div className={isPrintMode ? 'w-full' : 'max-w-5xl mx-auto'}>
        <CVDisplay data={cvData} slug={slug} isPrintMode={isPrintMode} />
      </div>
    </div>
  );
}
