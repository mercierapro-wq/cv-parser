"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { LoadingOverlay } from "@/components/LoadingOverlay";
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

      const webhookUrl = process.env.NEXT_PUBLIC_PARSE_CV_URL;
      
      if (!webhookUrl) {
        throw new Error("L'URL d'analyse de CV n'est pas configurée.");
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Loading Overlay */}
      {isUploading && (
        <LoadingOverlay 
          title="Analyse de votre CV en cours"
          subtitle="Notre IA extrait vos informations pour créer votre profil. Cela peut prendre jusqu'à deux minutes..."
        />
      )}

      {/* Notifications */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
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
          <p className="font-bold text-xs md:text-sm">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 md:ml-4 text-slate-400 hover:text-slate-600 transition-colors min-h-[44px] flex items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs md:text-sm font-medium mb-1 md:mb-2">
            <Sparkles className="w-3.5 h-3.5 md:w-4 h-4" />
            <span>Analyseur de CV basé sur l'IA</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Plus qu'un CV <br />
            <span className="text-indigo-600">un profil intelligent et mesurable</span>
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            Convertissez votre CV en une page web standardisée et optimisée par l'IA. Améliorez la pertinence de vos expériences en un clic et suivez l'impact de vos candidatures grâce à vos statistiques de consultation en temps réel.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <FileUpload onFileSelect={handleFileSelect} isUploading={isUploading} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16 text-left max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 md:mb-4 text-blue-600">
              <ArrowRight className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 md:mb-2 text-base md:text-lg">Rapide & Automatique</h3>
            <p className="text-xs md:text-sm text-slate-500">Analyse instantanée de votre document PDF.</p>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 md:mb-4 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 md:mb-2 text-base md:text-lg">Format Structuré</h3>
            <p className="text-xs md:text-sm text-slate-500">Extraction intelligente des compétences, expériences et informations clés.</p>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 md:mb-4 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 md:mb-2 text-base md:text-lg">Assistant Candidat</h3>
            <p className="text-xs md:text-sm text-slate-500">Faites vous aider par l'IA pour optimiser votre CV.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
