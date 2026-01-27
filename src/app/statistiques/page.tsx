'use client';

import { useAuth } from "@/context/AuthContext";
import { Loader2, Lock, LogIn, BarChart3 } from "lucide-react";
import Statistics from "@/components/Statistics";

export default function StatistiquesPage() {
  const { user, loading: authLoading, login } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Chargement de vos statistiques...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Accès réservé</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Vous devez être connecté pour accéder à vos statistiques de visibilité.
          </p>
          <button 
            onClick={() => login()}
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
          >
            <LogIn className="w-5 h-5" />
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Mes Statistiques</h1>
          </div>
          <p className="text-slate-500 mt-2">Analysez la performance et la visibilité de votre CV en temps réel.</p>
        </div>

        <Statistics userEmail={user.email || ""} />
      </div>
    </div>
  );
}
