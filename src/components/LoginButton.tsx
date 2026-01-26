'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, Loader2, User as UserIcon, ChevronDown } from 'lucide-react';

export default function LoginButton() {
  const { user, loading, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <button 
        disabled 
        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl cursor-not-allowed border border-slate-100"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Chargement...</span>
      </button>
    );
  }

  if (user) {
    return (
      <div className="relative">
        {/* Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 pr-2 hover:bg-slate-50 rounded-full transition-all border border-transparent hover:border-slate-200 group"
        >
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Invisible backdrop to close dropdown */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user.displayName || 'Utilisateur'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email}
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 rounded-xl text-sm font-bold"
    >
      <LogIn className="w-4 h-4" />
      Se connecter
    </button>
  );
}
