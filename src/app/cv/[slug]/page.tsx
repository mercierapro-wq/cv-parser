import { notFound } from "next/navigation";
import { CVData } from "@/types/cv";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import CVDisplay from "@/components/CVDisplay";

interface PageProps {
  params: Promise<{ slug: string }>;
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
        return cvData;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching CV data:", error);
    return null;
  }
}

export default async function CVProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const cvData = await getCVData(slug);

  if (!cvData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <AnalyticsTracker cvOwnerEmail={cvData.personne.contact.email} />
      <div className="max-w-5xl mx-auto">
        <CVDisplay data={cvData} />
      </div>
    </div>
  );
}
