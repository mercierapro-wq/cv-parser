"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error("L'URL du webhook n8n n'est pas configurée.");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse du CV");
      }

      const responseData = await response.json();
      
      // Extraction robuste des données (gère output, tableau, ou racine)
      let cvData = null;
      
      if (responseData.output) {
        cvData = responseData.output;
      } else if (Array.isArray(responseData) && responseData[0]?.output) {
        cvData = responseData[0].output;
      } else if (Array.isArray(responseData) && responseData[0]) {
        cvData = responseData[0];
      } else {
        cvData = responseData;
      }
      
      if (cvData) {
        localStorage.setItem("pending-cv-data", JSON.stringify(cvData));
        router.push("/cv/edit");
      } else {
        throw new Error("Format de réponse inconnu");
      }

    } catch (error) {
      console.error("Erreur:", error);
      setNotification({ 
        message: "Une erreur est survenue lors de l'analyse du CV. Veuillez réessayer.", 
        type: 'error' 
      });
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Notifications */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-red-50 border-red-100 text-red-800'
          }`}
        >
          <div className={`p-1.5 rounded-full ${
            notification.type === 'success' ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </div>
          <p className="font-bold text-sm">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto text-center space-y-8">
        
        {/* Header Section */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            <span>IA Powered Resume Parser</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Transformez votre CV <br />
            <span className="text-indigo-600">en profil web moderne</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Déposez votre CV au format PDF et laissez notre IA extraire vos compétences et expériences pour créer une page de profil professionnelle instantanément.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <FileUpload onFileSelect={handleFileSelect} isUploading={isUploading} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <ArrowRight className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Rapide & Automatique</h3>
            <p className="text-sm text-slate-500">Analyse instantanée de votre document PDF grâce à la puissance de n8n.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Format Structuré</h3>
            <p className="text-sm text-slate-500">Extraction intelligente des compétences, expériences et informations clés.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Design Moderne</h3>
            <p className="text-sm text-slate-500">Génération automatique d&apos;une page de profil élégante et responsive.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
