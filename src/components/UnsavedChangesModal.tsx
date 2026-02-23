"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onDiscard,
  onSave,
  isSaving
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="p-8 sm:p-10 text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Modifications non enregistrées</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Vous avez effectué des modifications sur votre CV. Voulez-vous les enregistrer avant de quitter ?
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={async () => {
                await onSave();
                onDiscard(); // This will trigger the navigation
              }}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Enregistrer et quitter
            </button>
            <button 
              onClick={onDiscard}
              disabled={isSaving}
              className="w-full py-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all"
            >
              Abandonner les modifications
            </button>
            <button 
              onClick={onClose}
              disabled={isSaving}
              className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
            >
              Continuer l&apos;édition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
