"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DownloadPDFButtonProps {
  slug: string;
  fileName: string;
  cvOwnerEmail?: string;
}

export default function DownloadPDFButton({ slug, fileName, cvOwnerEmail }: DownloadPDFButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      // Tracking
      if (cvOwnerEmail) {
        let viewerId = 'anonymous';
        if (user?.email) {
          viewerId = user.email;
        } else {
          const cookies = document.cookie.split(';');
          const viewerCookie = cookies.find(c => c.trim().startsWith('viewerId='));
          if (viewerCookie) {
            viewerId = viewerCookie.split('=')[1].trim();
          }
        }

        const trackingUrl = process.env.NEXT_PUBLIC_TRACKING_URL;
        if (trackingUrl) {
          fetch(trackingUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cvOwnerEmail,
              type: 'download_pdf',
              viewerId,
              timestamp: new Date().toISOString(),
              keyword: null
            }),
          }).catch(err => console.error("Tracking error:", err));
        }
      }

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_PDF_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error("Webhook URL for PDF generation is not configured");
      }

      // Construct the URL to be printed
      const baseUrl = window.location.origin;
      const printUrl = `${baseUrl}/cv/${slug}?print=true`;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: printUrl,
          fileName: `${fileName}.pdf`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Handle binary stream
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="no-print flex items-center justify-center w-10 h-10 bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-100 text-indigo-600 disabled:text-slate-400 rounded-xl transition-all border border-indigo-100 disabled:border-slate-200 active:scale-95 shrink-0"
      title="Télécharger le PDF"
    >
      {isDownloading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Download className="w-5 h-5" />
      )}
    </button>
  );
}
