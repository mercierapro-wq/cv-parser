'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, User, Move } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProfilePictureTransform } from '@/types/cv';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProfilePictureManagerProps {
  prenom: string;
  nom: string;
  profilePicture?: string;
  transform?: ProfilePictureTransform;
  onUpdate: (base64: string | undefined, transform: ProfilePictureTransform | undefined) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export const ProfilePictureManager: React.FC<ProfilePictureManagerProps> = ({
  prenom,
  nom,
  profilePicture,
  transform = { x: 0, y: 0, scale: 1 },
  onUpdate,
  disabled = false,
}) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local transform state to avoid heavy re-renders of the whole CV during drag
  const [localTransform, setLocalTransform] = useState<ProfilePictureTransform>(transform);

  // Sync local transform with props when not dragging
  useEffect(() => {
    if (!isDraggingImage) {
      // Deep comparison to avoid infinite loops if transform object is recreated with same values
      if (
        transform.x !== localTransform.x ||
        transform.y !== localTransform.y ||
        transform.scale !== localTransform.scale
      ) {
        setLocalTransform(transform);
      }
    }
  }, [transform, isDraggingImage, localTransform]);

  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleFile = (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image valide.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('L\'image est trop lourde (max 1Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const defaultTransform = { x: 0, y: 0, scale: 1 };
      setLocalTransform(defaultTransform);
      onUpdate(base64String, defaultTransform);
    };
    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier.');
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onDragOverFile = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDraggingFile(true);
  };

  const onDragLeaveFile = () => {
    setIsDraggingFile(false);
  };

  const onDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Image dragging logic
  const onMouseDown = (e: React.MouseEvent) => {
    if (disabled || !profilePicture) return;
    if (e.button !== 0) return;
    
    setIsDraggingImage(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingImage) return;
      
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      dragStartPos.current = {
        x: e.clientX,
        y: e.clientY
      };

      setLocalTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    };

    const onMouseUp = () => {
      if (isDraggingImage) {
        setIsDraggingImage(false);
        // Sync with parent only when drag ends to avoid re-render loops
        onUpdate(profilePicture, localTransform);
      }
    };

    if (isDraggingImage) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingImage, localTransform, onUpdate, profilePicture]);

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, (localTransform.scale || 1) + delta));
    const newTransform = { ...localTransform, scale: newScale };
    setLocalTransform(newTransform);
    onUpdate(profilePicture, newTransform);
  };

  const removePicture = () => {
    onUpdate(undefined, undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const altText = `Photo de profil de ${prenom} ${nom}`.trim() || 'Photo de profil';

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div
          className={cn(
            "relative group w-32 h-32 rounded-full border-2 border-dashed transition-all duration-200 flex items-center justify-center overflow-hidden bg-slate-100",
            isDraggingFile ? "border-indigo-500 bg-indigo-50" : "border-slate-200",
            error ? "border-red-500" : "hover:border-indigo-400",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          onDragOver={onDragOverFile}
          onDragLeave={onDragLeaveFile}
          onDrop={onDropFile}
        >
          {profilePicture ? (
            <div 
              className={cn(
                "w-full h-full relative",
                !disabled && "cursor-move"
              )}
              onMouseDown={onMouseDown}
            >
              <img
                src={profilePicture}
                alt={altText}
                className="absolute max-w-full max-h-full w-auto h-auto pointer-events-none select-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${localTransform.x}px), calc(-50% + ${localTransform.y}px)) scale(${localTransform.scale})`,
                }}
              />
              
              {!disabled && !isDraggingImage && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                  <button
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      fileInputRef.current?.click(); 
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-2 bg-white rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      removePicture(); 
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isDraggingImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="bg-black/40 text-white p-2 rounded-full">
                    <Move className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <User className="w-12 h-12 mb-1" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
                >
                  Ajouter
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={disabled}
          />
          
          {!profilePicture && !disabled && (
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            />
          )}
        </div>

        {profilePicture && !disabled && (
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm font-bold"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm font-bold"
            >
              -
            </button>
          </div>
        )}
      </div>

      {profilePicture && !disabled && (
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-1">
          <Move className="w-3 h-3" /> Glissez pour ajuster la position
        </p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
