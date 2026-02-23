"use client";

import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';

export default function Footer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleNavigation } = useNavigation();
  const isPrintMode = searchParams.get("print") === "true";

  if (isPrintMode) return null;
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center mb-4 inline-flex hover:opacity-80 transition-opacity"
            >
              <div className="relative h-12 w-48 flex items-center">
                <Image 
                  src="/nodalforge_navbar.png" 
                  alt="NodalForge" 
                  width={192} 
                  height={48} 
                  className="object-contain object-left"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </button>
            <p className="text-slate-600 mb-4 max-w-md">
              Créateur de produits digitaux innovants pour simplifier votre quotidien.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/mercierapro-wq" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-500 hover:text-indigo-600 transition-colors p-2 bg-slate-50 rounded-lg border border-slate-100"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              
              <a 
                href="https://www.linkedin.com/in/alexis-mercier-54284792/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-500 hover:text-indigo-600 transition-colors p-2 bg-slate-50 rounded-lg border border-slate-100"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-slate-900 font-bold mb-4">Produits</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://cardify.nodalforge.cloud/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                >
                  Cardify
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-slate-900 font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:nodalforge@gmail.com" className="text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-slate-900 font-bold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleNavigation('/privacy', (url) => router.push(url))}
                  className="text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                >
                  Confidentialité
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} NodalForge. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
