"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, FileText, BarChart3, Search } from "lucide-react";
import LoginButton from "./LoginButton";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPrintMode = searchParams.get("print") === "true";
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  if (isPrintMode) return null;

  const handleSearch = (e: React.FormEvent, isMobile: boolean) => {
    e.preventDefault();
    const inputRef = isMobile ? mobileInputRef : desktopInputRef;
    const value = inputRef.current?.value;
    if (value?.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-[150] w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo / Left side */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Image
              src="/NodalCV_header.png"
              alt="NodalCV Logo"
              width={150}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search Bar - Persistent */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={(e) => handleSearch(e, false)} className="relative">
              <input
                ref={desktopInputRef}
                type="text"
                key={searchParams.get("q") || "header-search"}
                defaultValue={searchParams.get("q") || ""}
                placeholder="Rechercher un talent..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </form>
          </div>

          {/* Navigation / Right side */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 hover:text-indigo-600 transition-colors group"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
            <Link 
              href="/mon-cv" 
              className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 hover:text-indigo-600 transition-colors group"
            >
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Mon CV</span>
            </Link>
            <Link 
              href="/statistiques" 
              className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 hover:text-indigo-600 transition-colors group"
            >
              <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Statistiques</span>
            </Link>
            <LoginButton />
          </nav>
        </div>

        {/* Search Bar - Mobile Only (Visible under logo/nav) */}
        <div className="md:hidden pb-4 px-0">
          <form onSubmit={(e) => handleSearch(e, true)} className="relative w-full">
            <input
              ref={mobileInputRef}
              type="text"
              key={searchParams.get("q") || "header-search-mobile"}
              defaultValue={searchParams.get("q") || ""}
              placeholder="Rechercher un talent..."
              className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </form>
        </div>
      </div>
    </header>
  );
}
