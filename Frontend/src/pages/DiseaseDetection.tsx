import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  History,
  RefreshCw,
  Plus,
} from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Badge } from "../components/ui/Badge";
import { apiRequest } from "../utils/api";

interface TopPrediction {
  rank: number;
  crop: string;
  disease: string;
  is_healthy: boolean;
  confidence: number;
}

interface DiagnosisResult {
  crop: string | null;
  disease: string | null;
  is_healthy: boolean | null;
  confidence: number | null;
  status: string;
  message?: string;
  top_predictions?: TopPrediction[];
}

interface HistoryItem {
  id: string;
  imageUrl: string;
  status: string;
  crop: string | null;
  disease: string | null;
  isHealthy: boolean | null;
  confidence: number | null;
  responsePayload: any;
  createdAt: string;
}

export function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  // History list
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Sample leaf images for testing
  const SAMPLE_IMAGES = [
    {
      name: "Healthy Tomato Leaf",
      url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400",
      crop: "Tomato",
      disease: "Healthy",
    },
    {
      name: "Diseased Potato Leaf",
      url: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=400",
      crop: "Potato",
      disease: "Early blight",
    },
  ];

  // Fetch scan history
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiRequest("/disease-detection/history?limit=10");
      if (res.success && res.data) {
        setHistoryItems(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setError(null);
      } else {
        setError("Unsupported file format. Please upload JPEG, PNG, or WebP.");
      }
    }
  };

  // Perform disease prediction
  const handleUploadAndPredict = async (fileToUpload: File | string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let finalImageUrl = "";

      // Case A: File upload from device
      if (fileToUpload instanceof File) {
        setLoadingStage("Generating S3 upload link...");
        const presignedRes = await apiRequest(
          `/disease-detection/presigned-url?fileName=${encodeURIComponent(
            fileToUpload.name
          )}&fileType=${encodeURIComponent(fileToUpload.type)}`
        );

        if (!presignedRes.success || !presignedRes.uploadUrl || !presignedRes.imageUrl) {
          throw new Error("Failed to get S3 upload signature.");
        }

        setLoadingStage("Uploading leaf image to S3 bucket...");
        const uploadRes = await fetch(presignedRes.uploadUrl, {
          method: "PUT",
          body: fileToUpload,
          headers: {
            "Content-Type": fileToUpload.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image directly to S3.");
        }

        finalImageUrl = presignedRes.imageUrl;
      }
      // Case B: Testing with sample image url
      else {
        finalImageUrl = fileToUpload;
      }

      setLoadingStage("Analyzing leaf pattern with EfficientNet-B0...");
      const predictRes = await apiRequest("/disease-detection/predict", {
        method: "POST",
        body: JSON.stringify({ imageUrl: finalImageUrl }),
      });

      if (predictRes.success && predictRes.data) {
        setResult(predictRes.data);
        loadHistory(); // reload scan history list
      } else {
        throw new Error(predictRes.message || "Failed to scan leaf image.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Image classification failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  const startNewDiagnosis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-ivory pb-12">
      <PageContainer maxWidth="xl" className="py-8 space-y-10 animate-fade-in">
        {/* Page Header */}
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
            AI Crop Health Diagnosis
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            Leaf Disease Detection
          </h1>
          <p className="text-sm text-charcoal-muted max-w-xl">
            Upload a clear photo of a plant leaf to identify crop diseases, receive confidence scores, and view alternative options.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-6">
            {/* Predictor Zone */}
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6">
              {!previewUrl ? (
                /* Drop Zone */
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-ivory-300 hover:border-forest/40 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-ivory/5 group"
                  onClick={() => document.getElementById("leaf-file-input")?.click()}
                >
                  <input
                    id="leaf-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="h-16 w-16 rounded-full bg-forest/[0.05] group-hover:bg-forest/[0.1] text-forest flex items-center justify-center mb-4 transition-all">
                    <Upload className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal mb-1">
                    Drag and drop leaf image here
                  </h3>
                  <p className="text-xs text-charcoal-muted mb-4">
                    Supports JPG, JPEG, PNG, or WebP up to 10 MB
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-600 shadow-sm transition-all"
                  >
                    Select Leaf File
                  </button>
                </div>
              ) : (
                /* Preview and Result Container */
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6 items-center">
                    {/* Image Preview */}
                    <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-ivory-300 bg-ivory/10 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Leaf preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      {!loading && !result && (
                        <button
                          type="button"
                          onClick={startNewDiagnosis}
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow"
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </button>
                      )}
                    </div>

                    {/* Stage loading / prediction details */}
                    <div>
                      {loading && (
                        <div className="space-y-4 py-6 text-center sm:text-left">
                          <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <RefreshCw className="h-5 w-5 text-forest animate-spin" />
                            <h3 className="text-sm font-semibold text-charcoal">
                              Diagnosing leaf health...
                            </h3>
                          </div>
                          <p className="text-xs text-charcoal-muted italic">{loadingStage}</p>
                        </div>
                      )}

                      {error && (
                        <div className="space-y-4 py-4">
                          <div className="flex items-start gap-2.5 text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3.5 rounded-xl">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider">
                                Classification Failed
                              </h4>
                              <p className="text-xs mt-1 leading-relaxed">{error}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUploadAndPredict(selectedFile!)}
                              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-600 shadow transition-all"
                            >
                              Retry Scan
                            </button>
                            <button
                              type="button"
                              onClick={startNewDiagnosis}
                              className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all"
                            >
                              Change File
                            </button>
                          </div>
                        </div>
                      )}

                      {!loading && !result && !error && (
                        <div className="space-y-4 text-center sm:text-left py-4">
                          <h3 className="text-sm font-semibold text-charcoal">
                            Image loaded successfully
                          </h3>
                          <p className="text-xs text-charcoal-muted">
                            Click below to upload this leaf image and verify its status.
                          </p>
                          <div className="flex justify-center sm:justify-start gap-2">
                            <button
                              type="button"
                              onClick={() => handleUploadAndPredict(selectedFile!)}
                              className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow-md transition-all"
                            >
                              Start Diagnosis
                            </button>
                            <button
                              type="button"
                              onClick={startNewDiagnosis}
                              className="px-5 py-2.5 rounded-xl border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Prediction Result Display */}
                      {result && (
                        <div className="space-y-4 animate-slide-up">
                          <div className="space-y-2">
                            <span className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/50">
                              Diagnosis Report
                            </span>
                            <div className="flex items-center gap-2">
                              {result.is_healthy ? (
                                <Badge variant="success" size="sm" dot>
                                  Healthy Leaf
                                </Badge>
                              ) : (
                                <Badge variant="danger" size="sm" dot>
                                  Diseased
                                </Badge>
                              )}
                              {result.confidence && (
                                <span className="text-xs font-bold text-forest">
                                  {Math.round(result.confidence * 100)}% Match
                                </span>
                              )}
                            </div>

                            <h2 className="text-xl font-bold text-charcoal">
                              {result.crop || "Unknown Crop"}
                            </h2>
                            <p className="text-sm text-charcoal-muted">
                              {result.is_healthy ? "No pathogen patterns detected." : result.disease}
                            </p>
                          </div>

                          {result.message && (
                            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl">
                              {result.message}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={startNewDiagnosis}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all"
                          >
                            Scan Another Leaf
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top-K Alternatives */}
                  {result?.top_predictions && result.top_predictions.length > 0 && (
                    <div className="border-t border-ivory-200 pt-5 space-y-3 animate-slide-up">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
                        Alternative Predictions
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {result.top_predictions.map((p) => (
                          <div
                            key={p.rank}
                            className="bg-ivory/5 rounded-xl border border-ivory-300 p-3 flex flex-col justify-between gap-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-2xs font-bold text-forest/60">Rank {p.rank}</span>
                              <Badge variant={p.is_healthy ? "success" : "neutral"} size="sm">
                                {p.is_healthy ? "Healthy" : "Diseased"}
                              </Badge>
                            </div>
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-bold text-charcoal">{p.crop}</h5>
                              <p className="text-2xs text-charcoal-muted truncate">{p.disease}</p>
                            </div>
                            <span className="text-2xs font-semibold text-charcoal-light">
                              {Math.round(p.confidence * 100)}% confidence
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Test Sample Leaf Images */}
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6">
              <h3 className="text-sm font-semibold text-charcoal mb-3">
                Quick Test Sample Images
              </h3>
              <p className="text-xs text-charcoal-muted mb-4">
                No plant leaf handy? Click a sample below to run immediate ML diagnostic prediction.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {SAMPLE_IMAGES.map((img) => (
                  <div
                    key={img.name}
                    className="border border-ivory-300 rounded-xl overflow-hidden cursor-pointer hover:border-forest/40 hover:shadow transition-all group flex flex-col bg-ivory/5"
                    onClick={() => {
                      setPreviewUrl(img.url);
                      handleUploadAndPredict(img.url);
                    }}
                  >
                    <div className="h-32 overflow-hidden bg-ivory/10 relative">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="text-xs font-bold text-charcoal">{img.name}</h4>
                      <p className="text-2xs text-charcoal-muted">
                        Target: {img.crop} — {img.disease}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <aside className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-ivory-200">
              <History className="h-4 w-4 text-forest/70" />
              <h3 className="text-sm font-semibold text-charcoal">Recent Diagnoses</h3>
            </div>

            {historyLoading && (
              <div className="py-6 flex items-center justify-center text-charcoal-muted gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading history...</span>
              </div>
            )}

            {!historyLoading && historyItems.length === 0 && (
              <div className="py-8 text-center text-xs text-charcoal-muted">
                No past scans recorded.
              </div>
            )}

            {!historyLoading && historyItems.length > 0 && (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="group border border-ivory-300 rounded-xl p-3 bg-ivory/5 hover:border-forest/20 hover:bg-forest/[0.01] transition-all cursor-pointer flex gap-3"
                    onClick={() => {
                      setPreviewUrl(item.imageUrl);
                      setResult(item.responsePayload);
                    }}
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-ivory-200 bg-ivory/15 flex items-center justify-center">
                      <img
                        src={item.imageUrl}
                        alt="Diagnosis thumb"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-charcoal truncate">
                          {item.crop || "Crop"}
                        </h4>
                        {item.isHealthy ? (
                          <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-2xs text-charcoal-muted truncate">
                        {item.isHealthy ? "Healthy" : item.disease}
                      </p>
                      <span className="block text-[10px] text-charcoal-muted/50">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}
