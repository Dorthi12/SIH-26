import React from 'react';
import {
  FileText,
  Lock,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Upload,
  Plus,
} from 'lucide-react';
import type { VerificationDocument } from '../../types/mandi';

interface DocumentCenterViewProps {
  documents: VerificationDocument[];
}

export function DocumentCenterView({ documents }: DocumentCenterViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-forest" />
            📁 My Verification & Land Document Center
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Manage identity, land ownership extracts, organic certificates, and quality lab reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Mock document upload initiated')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-sm self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload New Document
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] shadow-card space-y-3 hover:border-forest/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono font-bold text-forest uppercase bg-forest/10 px-2 py-0.5 rounded">
                {doc.category}
              </span>

              {doc.isPrivate ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300">
                  <Lock className="w-3 h-3 text-amber-600" />
                  🔒 Private (System Only)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300">
                  <Eye className="w-3 h-3 text-emerald-600" />
                  👁 Public Verification
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-charcoal dark:text-ivory-100">{doc.name}</h4>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-ivory-200 dark:border-[#26362f]">
              <span className="text-2xs text-charcoal-muted font-mono">Uploaded: {doc.uploadDate}</span>
              <span
                className={`font-bold flex items-center gap-1 text-2xs ${
                  doc.status === 'Verified'
                    ? 'text-emerald-600'
                    : doc.status === 'Under Review'
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {doc.status === 'Verified' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {doc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
