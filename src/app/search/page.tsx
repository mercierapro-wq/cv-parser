import type { Metadata } from 'next';
import SearchResultsClient from '@/components/SearchResultsClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nodalcv.com';

export const metadata: Metadata = {
  title: 'Rechercher des profils professionnels',
  description:
    'Trouvez des profils de professionnels qualifiés sur NodalCV. Recherchez par compétence, métier ou secteur et découvrez des talents disponibles.',
  alternates: {
    canonical: `${baseUrl}/search`,
  },
  openGraph: {
    title: 'Rechercher des profils professionnels | NodalCV',
    description:
      'Trouvez des profils de professionnels qualifiés sur NodalCV. Recherchez par compétence, métier ou secteur.',
    url: `${baseUrl}/search`,
    type: 'website',
  },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SearchResultsClient />
    </div>
  );
}
