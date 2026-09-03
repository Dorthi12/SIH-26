import React, { useState } from "react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Smile,
  X,
  Users,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  LocationPickerModal,
  type SelectedLocationData,
} from "./LocationPickerModal";

interface UserInfo {
  id?: string;
  name?: string;
  avatar?: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserInfo | null;
  onSubmit: (postData: {
    caption: string;
    location?: SelectedLocationData | null;
    selectedFile?: File | null;
    collaborators?: string[];
  }) => Promise<void>;
  submitting: boolean;
  submitError?: string | null;
}

const COMMON_EMOJIS = ["🌾", "🌱", "🚜", "🌽", "🌦️", "🟢", "☀️", "💧", "🇮🇳"];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  submitting,
  submitError,
}) => {
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationData | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleAddCollaborator = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && collaboratorInput.trim()) {
      e.preventDefault();
      const tag = collaboratorInput.trim().replace(/^@/, "");
      if (tag && !collaborators.includes(tag)) {
        setCollaborators([...collaborators, tag]);
      }
      setCollaboratorInput("");
    }
  };

  const removeCollaborator = (tagToRemove: string) => {
    setCollaborators(collaborators.filter((tag) => tag !== tagToRemove));
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    await onSubmit({
      caption,
      location: selectedLocation,
      selectedFile,
      collaborators,
    });
  };

  const appendEmoji = (emoji: string) => {
    setCaption((prev) => prev + emoji);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
        <div className="w-full max-w-4xl bg-[#121212] text-white rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
          {/* ── Top Header Navigation Bar ── */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-[#181818]">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <h2 className="text-sm sm:text-base font-semibold tracking-wide text-white">
              Create new post
            </h2>

            <button
              onClick={handleShare}
              disabled={submitting || !caption.trim()}
              className="text-sm font-bold text-sky-400 hover:text-sky-300 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Share</span>
            </button>
          </div>

          {/* ── Main Split 2-Column Content Layout ── */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] overflow-y-auto min-h-0 bg-[#000000]">
            {/* ── Left Column: Image Picker & Media Canvas ── */}
            <div className="relative flex flex-col items-center justify-center bg-[#050505] min-h-[300px] md:min-h-[460px] border-b md:border-b-0 md:border-r border-white/10 p-4 select-none">
              {previewUrl ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center group">
                  <img
                    src={previewUrl}
                    alt="Post preview"
                    className="max-h-[70vh] w-full object-contain rounded-lg"
                  />

                  {/* Overlay instructions prompt */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-white/80 border border-white/10 shadow-lg pointer-events-none">
                    Preview Mode
                  </div>

                  {/* Action buttons on hover */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <label className="cursor-pointer bg-black/70 hover:bg-black/90 text-white rounded-full p-2.5 backdrop-blur-md border border-white/20 transition-all shadow-md">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="bg-red-500/80 hover:bg-red-600 text-white rounded-full p-2.5 backdrop-blur-md transition-all shadow-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-4 cursor-pointer p-8 text-center hover:bg-white/5 rounded-2xl transition-all border-2 border-dashed border-white/15 w-full max-w-sm my-auto">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white shadow-inner">
                    <ImageIcon className="h-8 w-8 text-white/80" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Drag photos here or click to browse
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      Upload high quality field photos (PNG, JPG)
                    </p>
                  </div>
                  <span className="rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm">
                    Select from computer
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* ── Right Column: Caption & Location ── */}
            <div className="flex flex-col bg-[#121212] divide-y divide-white/10 overflow-y-auto">
              {/* User Profile Header */}
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 text-xs font-bold text-white shadow-sm ring-2 ring-white/10">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "F"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">
                    {currentUser?.name || "Farmer Member"}
                  </span>
                  <span className="text-[10px] text-white/40">
                    Sharing with Community
                  </span>
                </div>
              </div>

              {/* Caption Input & Character Count */}
              <div className="p-4 flex flex-col space-y-3 relative">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                  placeholder="Write a caption..."
                  rows={6}
                  className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none resize-none leading-relaxed"
                />

                {/* Bottom toolbar for text box */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-white/50 hover:text-white/90 transition-colors p-1"
                    >
                      <Smile className="h-5 w-5" />
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute left-0 bottom-8 bg-[#1f1f1f] border border-white/15 rounded-xl p-2 shadow-2xl flex items-center gap-1.5 z-30">
                        {COMMON_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => appendEmoji(emoji)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-base transition-transform active:scale-125"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-white/40">
                    {caption.length.toLocaleString()}/2,200
                  </span>
                </div>
              </div>

              {/* Location Picker Section */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="flex items-center justify-between w-full text-left py-1 text-sm text-white/90 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4.5 w-4.5 text-emerald-400" />
                      <span className="font-medium">
                        {selectedLocation ? selectedLocation.name : "Add location"}
                      </span>
                    </span>
                    <span className="text-xs text-sky-400 font-semibold hover:underline">
                      {selectedLocation ? "Change map" : "Pick on Map"}
                    </span>
                  </button>
                </div>

                {selectedLocation && (
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs">
                    <span className="text-white/80 font-medium truncate">
                      📍 {selectedLocation.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedLocation(null)}
                      className="text-white/40 hover:text-red-400 p-1 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Collaborators Section */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <Users className="h-4.5 w-4.5 text-amber-400" />
                  <span className="font-medium">Add collaborators</span>
                </div>
                <input
                  type="text"
                  value={collaboratorInput}
                  onChange={(e) => setCollaboratorInput(e.target.value)}
                  onKeyDown={handleAddCollaborator}
                  placeholder="Type username and press Enter"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-all"
                />

                {collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {collaborators.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-white/10 text-emerald-300 border border-white/10 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      >
                        @{tag}
                        <button
                          type="button"
                          onClick={() => removeCollaborator(tag)}
                          className="hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Error display */}
              {submitError && (
                <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-xs text-red-300 font-medium">
                  {submitError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Picker Modal */}
      <LocationPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLocation={selectedLocation}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
        }}
      />
    </>
  );
};
