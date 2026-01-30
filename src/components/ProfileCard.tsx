'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { CVData } from '@/types/cv';
import AvailabilityBadge from './AvailabilityBadge';

interface ProfileCardProps {
  slug: string;
  data: CVData;
}

export default function ProfileCard({ slug, data }: ProfileCardProps) {
  const { personne, competences } = data;
  
  // Get top 5 skills (combining hard and soft skills if needed, or just hard skills)
  const topSkills = [...(competences.hard_skills || []), ...(competences.soft_skills || [])].slice(0, 5);

  return (
    <Link href={`/cv/${slug}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-100 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-5 mb-4 md:mb-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-200 transition-colors">
            <User className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 truncate mb-0.5 md:mb-1">
              {personne.prenom} {personne.nom}
            </h3>
            <div className="mb-1 md:mb-2">
              <AvailabilityBadge status={data.availability} size="sm" />
            </div>
            <p className="text-indigo-600 font-semibold text-sm md:text-base truncate">
              {personne.titre_professionnel}
            </p>
          </div>
        </div>

        {/* Body - Job Title is already in header, but let's make it prominent as requested */}
        <div className="mb-4 md:mb-8 flex-grow">
          <p className="text-slate-600 text-sm md:text-base line-clamp-3 md:line-clamp-4 leading-relaxed">
            {data.resume}
          </p>
        </div>

        {/* Footer - Tags */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mt-auto">
          {topSkills.map((skill, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 md:px-2.5 md:py-1 bg-indigo-50 text-indigo-600 text-[10px] md:text-xs font-medium rounded-lg border border-indigo-100/50"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
