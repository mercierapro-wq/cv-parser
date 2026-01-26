'use client';

import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <button 
        disabled 
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        Chargement...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full border border-gray-200"
            />
          )}
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {user.displayName}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded-lg text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md rounded-lg text-sm font-semibold"
    >
      <LogIn className="w-5 h-5" />
      Se connecter
    </button>
  );
}
