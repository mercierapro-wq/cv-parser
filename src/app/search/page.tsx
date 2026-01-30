'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import SearchSkeleton from '@/components/SearchSkeleton';
import { CVData } from '@/types/cv';
import { useAuth } from '@/context/AuthContext';

interface SearchResult {
  slug: string;
  data: CVData;
}

function SearchResults() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const lastQueryRef = useRef<string | null>(null);
  const lastViewerIdRef = useRef<string | null>(null);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const currentViewerId = user?.email || 'anonymous';

    if (query && (query !== lastQueryRef.current || currentViewerId !== lastViewerIdRef.current)) {
      handleSearch(query, currentViewerId);
    } else if (!query) {
      setResults([]);
      setHasSearched(false);
      lastQueryRef.current = null;
      lastViewerIdRef.current = null;
    }
  }, [query, user, authLoading]);

  const handleSearch = async (searchQuery: string, viewerId: string) => {
    if (!searchQuery.trim()) return;
    
    lastQueryRef.current = searchQuery;
    lastViewerIdRef.current = viewerId;
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const searchUrl = process.env.NEXT_PUBLIC_SEARCH_URL;
      if (!searchUrl) throw new Error("Search URL not configured");

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          viewerId: viewerId
        }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      const normalizedResults = (Array.isArray(data) ? data : []).map((result: SearchResult & { availability?: string }) => {
        const cvData = result.data as CVData;
        // On s'assure que availability est présent s'il est à la racine du résultat
        if (result.availability && !cvData.availability) {
          cvData.availability = result.availability;
        }
        return {
          ...result,
          data: cvData
        };
      });
      setResults(normalizedResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar (Future Filters) */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 h-fit sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Filtres</h3>
            <div className="space-y-4">
              <div className="h-4 bg-slate-50 rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-50 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-50 rounded w-5/6 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mt-6 italic">
              Bientôt : Localisation, Expérience, Disponibilité
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <SearchSkeleton key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {results.map((result) => (
                <ProfileCard key={result.slug} slug={result.slug} data={result.data} />
              ))}
            </div>
          ) : hasSearched ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Oups, aucun talent ne correspond à cette recherche.</h2>
              <p className="text-slate-500">
                Essayez avec un autre mot-clé ou une compétence différente !
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 font-medium">
                Entrez un mot-clé pour commencer votre recherche.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[1, 2].map(i => <SearchSkeleton key={i} />)}
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
