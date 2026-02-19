import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Experience } from "@/types/cv";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortExperiences(experiences: Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    const dateAEnd = parseDate(a.periode_fin);
    const dateBEnd = parseDate(b.periode_fin);
    
    // If end dates are different, sort by end date (descending)
    if (dateBEnd.getTime() !== dateAEnd.getTime()) {
      return dateBEnd.getTime() - dateAEnd.getTime();
    }
    
    // If end dates are the same (e.g., both "Présent" or both same year), 
    // sort by start date (descending)
    const dateAStart = parseDate(a.periode_debut);
    const dateBStart = parseDate(b.periode_debut);
    return dateBStart.getTime() - dateAStart.getTime();
  });
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  
  const normalized = dateStr.toLowerCase().trim();
  
  // Handle "Présent", "Aujourd'hui", "En poste", etc.
  const currentKeywords = [
    "présent", "aujourd'hui", "now", "current", "en poste", 
    "actuel", "aujourd’hui", "aujourdhui", "maintenant"
  ];
  
  if (currentKeywords.some(kw => normalized.includes(kw))) {
    // Return a date far in the future to ensure "Present" is always first
    return new Date(2099, 11, 31);
  }

  // Try to extract year and month
  // Formats: "MM/YYYY", "MM-YYYY", "YYYY", "Month YYYY"
  const yearMatch = normalized.match(/\d{4}/);
  if (!yearMatch) return new Date(0);
  
  const year = parseInt(yearMatch[0]);
  let month = 0; // Default to January

  const monthMatch = normalized.match(/(\d{1,2})[\/\-]/);
  if (monthMatch) {
    month = parseInt(monthMatch[1]) - 1;
  } else {
    // Try to find month names (French/English)
    const months = [
      ["jan", "janv"], ["feb", "fév"], ["mar", "mars"], ["apr", "avr"],
      ["may", "mai"], ["jun", "juin"], ["jul", "juil"], ["aug", "août"],
      ["sep", "sept"], ["oct"], ["nov"], ["dec", "déc"]
    ];
    
    for (let i = 0; i < months.length; i++) {
      if (months[i].some(m => normalized.includes(m))) {
        month = i;
        break;
      }
    }
  }

  return new Date(year, month);
}
