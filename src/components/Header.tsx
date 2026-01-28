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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value;
    if (value?.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
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
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={inputRef}
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
              href="/search" 
              className="md:hidden p-2 text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 hover:text-indigo-600 transition-colors group"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Home</span>
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
              <span className="hidden sm:inline">Stats</span>
            </Link>
            <LoginButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
