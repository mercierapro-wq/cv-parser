import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function CVNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full space-y-6">
        <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
          <FileQuestion className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-slate-900">CV Introuvable</h1>
          <p className="text-slate-500 font-sans">
            Désolé, nous n'avons pas pu trouver le profil que vous recherchez. Il est possible que le lien soit incorrect ou que le CV ait été supprimé.
          </p>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
