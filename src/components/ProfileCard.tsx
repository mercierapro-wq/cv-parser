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
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-100 h-full flex flex-col min-h-[400px]">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 md:mb-8">
          {data.profilePicture ? (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-50 relative shrink-0 mb-4">
              <img 
                src={data.profilePicture} 
                alt={`Photo de profil de ${personne.prenom} ${personne.nom}`}
                className="absolute max-w-full max-h-full w-auto h-auto"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: data.profilePictureTransform 
                    ? `translate(calc(-50% + ${data.profilePictureTransform.x}px), calc(-50% + ${data.profilePictureTransform.y}px)) scale(${data.profilePictureTransform.scale || 1})`
                    : 'translate(-50%, -50%)'
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100 shrink-0 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-200 transition-colors">
              <User className="w-12 h-12 md:w-16 md:h-16" />
            </div>
          )}
          <div className="min-w-0 w-full">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 truncate mb-1">
              {personne.prenom} {personne.nom}
            </h3>
            <div className="mb-2 flex justify-center">
              <AvailabilityBadge status={data.availability} size="sm" />
            </div>
            <p className="text-indigo-600 font-bold text-base md:text-lg truncate">
              {personne.titre_professionnel}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mb-6 md:mb-8 flex-grow">
          <p className="text-slate-600 text-sm md:text-base line-clamp-4 md:line-clamp-6 leading-relaxed">
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
