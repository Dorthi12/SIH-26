import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, X, File, ShieldCheck } from "lucide-react";
import type { CostEvidence } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface DocumentUploadDropzoneProps {
  category: string;
  label: string;
  uploadedFiles: CostEvidence[];
  onFileUploaded: (newEvidence: CostEvidence) => void;
  onFileRemoved: (id: string) => void;
}

export function DocumentUploadDropzone({
  category,
  label,
  uploadedFiles,
  onFileUploaded,
  onFileRemoved,
}: DocumentUploadDropzoneProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const newEvidence: CostEvidence = {
      id: `EV-MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${category} Document (${file.name})`,
      category,
      fileName: file.name,
      uploadDate: new Date().toISOString().split("T")[0],
      verified: true,
      fileUrl: URL.createObjectURL(file),
    };

    onFileUploaded(newEvidence);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const categoryFiles = uploadedFiles.filter((f) => f.category === category);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-charcoal dark:text-ivory-200">
          {label}
        </label>
        <span className="text-3xs text-charcoal-muted dark:text-ivory-400">
          PDF, JPG, PNG (Max 10MB)
        </span>
      </div>

      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
          isDragging
            ? "border-forest bg-forest/10 dark:bg-forest/20"
            : "border-ivory-300 dark:border-charcoal-light bg-ivory-50/50 dark:bg-charcoal/50 hover:border-forest/50 hover:bg-ivory-100 dark:hover:bg-charcoal"
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-xs text-charcoal dark:text-ivory-100">
            {t("Click or drag file to upload document", "दस्तावेज़ अपलोड करने के लिए क्लिक करें या फ़ाइल खींचें")}
          </p>
          <p className="text-3xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            {t("Upload receipt, voucher, lab test, or certificate", "रसीद, वाउचर, लैब टेस्ट या प्रमाणपत्र अपलोड करें")}
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {categoryFiles.length > 0 && (
        <div className="space-y-2">
          {categoryFiles.map((file) => (
            <div
              key={file.id}
              className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-emerald-300 dark:border-emerald-800/60 shadow-xs flex items-center justify-between animate-in fade-in duration-150"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-charcoal dark:text-ivory-100 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-3xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Uploaded on {file.uploadDate}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemoved(file.id);
                }}
                className="p-1 rounded-lg text-charcoal-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
