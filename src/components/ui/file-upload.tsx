"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

export function FileUpload({ onFileSelect, isUploading = false }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Veuillez uploader un fichier PDF uniquement.");
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors duration-300 ease-in-out",
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".pdf"
          onChange={handleChange}
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center p-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="p-3 bg-indigo-100 rounded-full mb-3">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            
            {!isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="flex items-center gap-1 px-4 py-2 min-h-[44px] text-xs font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
              >
                <X className="w-3 h-3" />
                Retirer
              </button>
            )}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center p-4 text-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <div className="p-3 bg-slate-100 rounded-full mb-3 group-hover:bg-indigo-100 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <p className="text-lg font-semibold text-slate-700 mb-1">
              Glissez votre CV ici
            </p>
            <p className="text-sm text-slate-500">
              ou cliquez pour parcourir (PDF uniquement)
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-10">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-2" />
            <p className="text-sm font-medium text-indigo-600">Analyse en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}
