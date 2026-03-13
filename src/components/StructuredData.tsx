import { CVData } from "@/types/cv";

interface StructuredDataProps {
  data: CVData;
}

export default function StructuredData({ data }: StructuredDataProps) {
  const { personne, competences, resume, experiences, formation, certifications, slug } = data;
  const fullName = `${personne.prenom} ${personne.nom}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nodalcv.com";
  const profileUrl = `${baseUrl}/cv/${slug}`;

  const workExperiences = (experiences || []).map((exp) => ({
    "@type": "OrganizationRole",
    "roleName": exp.poste,
    "startDate": exp.periode_debut,
    "endDate": exp.periode_fin || undefined,
    "description": exp.description,
    "worksFor": {
      "@type": "Organization",
      "name": exp.entreprise,
    },
  }));

  const educations = (formation || []).map((f) => ({
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "degree",
    "name": f.diplome,
    "recognizedBy": {
      "@type": "EducationalOrganization",
      "name": f.etablissement,
    },
    "dateCreated": f.annee,
  }));

  const certifs = (certifications || []).map((c) => ({
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "certificate",
    "name": c.nom,
    "dateCreated": c.date_obtention || undefined,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": fullName,
    "givenName": personne.prenom,
    "familyName": personne.nom,
    "jobTitle": personne.titre_professionnel,
    "description": resume,
    "url": profileUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": personne.contact.ville,
      "addressCountry": "FR",
    },
    "knowsAbout": [
      ...(competences.hard_skills || []),
      ...(competences.soft_skills || []),
    ],
    "knowsLanguage": (competences.langues || []).map((lang) => ({
      "@type": "Language",
      "name": lang,
    })),
    "hasOccupation": {
      "@type": "Occupation",
      "name": personne.titre_professionnel,
      "occupationLocation": {
        "@type": "City",
        "name": personne.contact.ville,
      },
    },
    "hasCredential": [...educations, ...certifs],
    "worksFor": workExperiences.length > 0
      ? workExperiences[0].worksFor
      : undefined,
    "sameAs": [personne.contact.linkedin].filter(Boolean),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Profils",
        "item": `${baseUrl}/search`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": fullName,
        "item": profileUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
