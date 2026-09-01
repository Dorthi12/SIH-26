import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Mic,
  Square,
  Sparkles,
  Send,
  Paperclip,
  FileText,
  ShieldCheck,
  Building2,
  Globe,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Edit3,
} from "lucide-react";
import type { BuyerOffer, UserRole, ChatMessageAttachment, CropListing } from "../../types/mandi";
import { chatService } from "../../services/chatService";
import { speechService } from "../../services/speechService";
import { aiAssistantService } from "../../services/aiAssistantService";
import { mandiService } from "../../services/mandiService";
import { useLanguage } from "../../context/LanguageContext";
import { OfferCardInline } from "./OfferCardInline";
import { StructuredOfferModal } from "./StructuredOfferModal";
import { CounterOfferModal } from "./CounterOfferModal";
import { NegotiationTimelineView } from "./NegotiationTimelineView";

interface TradeChatWorkspaceProps {
  userRole: UserRole;
  offer: BuyerOffer;
  onOfferUpdated: () => void;
  onOpenBuyerProfile: () => void;
  onOpenCropReport: (listing: CropListing) => void;
  onGenerateSmartDeal: (offer: BuyerOffer) => void;
}

export function TradeChatWorkspace({
  userRole,
  offer,
  onOfferUpdated,
  onOpenBuyerProfile,
  onOpenCropReport,
  onGenerateSmartDeal,
}: TradeChatWorkspaceProps) {
  const { t, language, setLanguage } = useLanguage();
  const [inputText, setInputText] = useState<string>("");
  
  // Voice Recording States: 'IDLE' | 'RECORDING' | 'PROCESSING' | 'RESULT' | 'ERROR'
  const [voiceState, setVoiceState] = useState<"IDLE" | "RECORDING" | "PROCESSING" | "RESULT" | "ERROR">("IDLE");
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const timerRef = useRef<any>(null);

  // AI Assistant Modal State
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [aiDraftMessage, setAiDraftMessage] = useState<string>("");
  const [aiExplanation, setAiExplanation] = useState<any>(null);

  // Attachment Modal State
  const [showAttachmentPicker, setShowAttachmentPicker] = useState<boolean>(false);

  // Offer Modals
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [showCounterModal, setShowCounterModal] = useState<boolean>(false);

  const listing = offer.cropListing;
  const messages = offer.messages || [];

  // Scroll to bottom on new message
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Voice recording timer
  const startVoiceRecording = () => {
    setVoiceState("RECORDING");
    setRecordingSeconds(0);
    setVoiceTranscript("");
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopVoiceRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVoiceState("PROCESSING");
    try {
      const res = await speechService.transcribeAudio(null, language === "hi" ? "hi" : "en");
      setVoiceTranscript(res.transcript);
      setVoiceState("RESULT");
    } catch {
      setVoiceState("ERROR");
    }
  };

  const cancelVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVoiceState("IDLE");
    setRecordingSeconds(0);
    setVoiceTranscript("");
  };

  const sendVoiceResult = () => {
    if (!voiceTranscript) return;
    chatService.sendMessage({
      offerId: offer.id,
      senderRole: userRole,
      senderName: userRole === "SELLER" ? listing.farmerProfile.displayName : offer.buyerProfile.businessName,
      messageText: voiceTranscript,
      isVoice: true,
      audioDurationSeconds: recordingSeconds || 6,
    });
    cancelVoiceRecording();
    onOfferUpdated();
  };

  const handleSendTextMessage = (textToSend?: string, attachment?: ChatMessageAttachment) => {
    const txt = textToSend || inputText;
    if (!txt.trim() && !attachment) return;

    chatService.sendMessage({
      offerId: offer.id,
      senderRole: userRole,
      senderName: userRole === "SELLER" ? listing.farmerProfile.displayName : offer.buyerProfile.businessName,
      messageText: txt,
      attachment,
    });

    setInputText("");
    onOfferUpdated();
  };

  // Open AI assistant for last buyer message
  const handleOpenAIAssistant = () => {
    const lastMsg = [...messages].reverse().find((m) => m.senderRole !== userRole);
    const expl = aiAssistantService.explainBuyerMessage(lastMsg ? lastMsg.message : "Price and moisture details");
    setAiExplanation(expl);
    setAiDraftMessage(language === "hi" ? expl.suggestedReplyHindi : expl.suggestedReplyEnglish);
    setShowAIAssistant(true);
  };

  const handleConfirmAISend = () => {
    handleSendTextMessage(aiDraftMessage);
    setShowAIAssistant(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. CHAT HEADER WORKSPACE BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-light">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-charcoal dark:text-ivory-100">
                  🏢 {offer.buyerProfile.businessName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-3xs font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>✓ Business Verified</span>
                </span>
              </div>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                {offer.buyerProfile.buyerType} • Location: {offer.buyerProfile.district}, {offer.buyerProfile.state}
              </p>
            </div>
          </div>

          {/* Action CTAs & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* UI Language Toggle (EN | हिंदी) */}
            <div className="flex items-center p-1 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg text-2xs font-black transition-all ${
                  language === "en"
                    ? "bg-forest text-white shadow-xs"
                    : "text-charcoal-muted dark:text-ivory-400"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg text-2xs font-black transition-all ${
                  language === "hi"
                    ? "bg-forest text-white shadow-xs"
                    : "text-charcoal-muted dark:text-ivory-400"
                }`}
              >
                हिंदी
              </button>
            </div>

            <button
              onClick={onOpenBuyerProfile}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 border border-ivory-300 dark:border-charcoal-light hover:bg-ivory-200 transition-colors"
            >
              [View Buyer Profile]
            </button>

            <button
              onClick={() => onOpenCropReport(listing)}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 hover:bg-blue-200 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>[View Crop Report]</span>
            </button>
          </div>
        </div>

        {/* CROP UNDER DISCUSSION BAR */}
        <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌾</span>
            <div>
              <span className="font-extrabold text-charcoal dark:text-ivory-100 block">
                Discussion: {listing.cropName} — {listing.variety} ({offer.quantityQuintals} Quintals)
              </span>
              <span className="text-2xs text-charcoal-muted dark:text-ivory-400">
                Moisture: {listing.quality.moisturePercentage}% • Grade: {listing.quality.grade} • Location: {listing.location.district}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-forest dark:text-emerald-400">
              Rate Range: ₹2,700 – ₹2,850/q
            </span>

            {/* Smart Deal CTA when terms agreed */}
            <button
              onClick={() => onGenerateSmartDeal(offer)}
              className="px-3.5 py-1.5 rounded-xl font-extrabold text-2xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber" />
              <span>Generate Smart Deal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHAT MESSAGES CANVAS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-light">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-forest dark:text-emerald-400" />
            {t("Commercial Trade Negotiation Workspace", "व्यापारिक बातचीत थ्रेड")}
          </h3>

          {/* AI Helper Trigger */}
          <button
            onClick={handleOpenAIAssistant}
            className="px-3.5 py-1.5 rounded-xl text-2xs font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 hover:bg-amber-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
            <span>✨ Help Me Communicate</span>
          </button>
        </div>

        {/* Message Thread Container */}
        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-4 max-h-[420px] overflow-y-auto">
          {messages.map((msg) => {
            const isMe = msg.senderRole === userRole;

            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1 ${isMe ? "items-end ml-auto max-w-md sm:max-w-lg" : "items-start mr-auto max-w-md sm:max-w-lg"}`}
              >
                <div className="flex items-center gap-2 text-3xs font-bold text-charcoal-muted px-1">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.isVoice && <span className="text-forest dark:text-emerald-400">🎤 Voice Note</span>}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs space-y-2 shadow-xs ${
                    isMe
                      ? "bg-forest text-white rounded-tr-none"
                      : "bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light text-charcoal dark:text-ivory-100 rounded-tl-none"
                  }`}
                >
                  {/* Voice waveform header if voice */}
                  {msg.isVoice && (
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/10 dark:bg-white/10 font-mono text-3xs">
                      <span>🎤 Voice ({msg.audioDurationSeconds || 8}s)</span>
                      <span className="opacity-75">Speech Detected</span>
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                  {/* Attachment if present */}
                  {msg.attachment && (
                    <div className="p-2.5 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-between text-2xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-bold">{msg.attachment.fileName}</span>
                      </div>
                      <button
                        onClick={() => onOpenCropReport(listing)}
                        className="px-2 py-0.5 rounded bg-white/20 font-bold hover:underline"
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Render Structured Offer Card inline in chat */}
          <OfferCardInline
            offer={offer}
            userRole={userRole}
            onAccept={() => onGenerateSmartDeal(offer)}
            onCounter={() => setShowCounterModal(true)}
            onReject={() => mandiService.updateOfferStatus(offer.id, "REJECTED")}
          />

          <div ref={chatBottomRef} />
        </div>

        {/* 3. VOICE SPEECH-TO-TEXT PANEL (IF ACTIVE) */}
        {voiceState !== "IDLE" && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-3 animate-in fade-in duration-200">
            {voiceState === "RECORDING" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
                  <span className="font-black text-xs text-rose-800 dark:text-rose-300">
                    🔴 Recording Hindi / English Speech... 00:0{recordingSeconds}
                  </span>
                </div>
                <button
                  onClick={stopVoiceRecording}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>[Stop]</span>
                </button>
              </div>
            )}

            {voiceState === "PROCESSING" && (
              <div className="flex items-center gap-3 text-xs font-bold text-amber-900 dark:text-amber-200">
                <RotateCcw className="w-4 h-4 animate-spin text-amber-600" />
                <span>⏳ Converting speech to text (Hindi / English)...</span>
              </div>
            )}

            {voiceState === "RESULT" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-extrabold uppercase text-amber-900 dark:text-amber-200">
                    Speech Detected:
                  </span>
                  <span className="text-3xs font-bold text-emerald-700 dark:text-emerald-400">
                    Confidence: 96%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-amber-300 text-xs font-extrabold text-charcoal dark:text-ivory-100">
                  "{voiceTranscript}"
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={cancelVoiceRecording}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-ivory-200 text-charcoal"
                  >
                    [Record Again]
                  </button>

                  <button
                    onClick={() => {
                      setInputText(voiceTranscript);
                      setVoiceState("IDLE");
                    }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500 text-white flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>[Edit]</span>
                  </button>

                  <button
                    onClick={sendVoiceResult}
                    className="px-4 py-1.5 rounded-xl font-extrabold text-xs bg-forest text-white flex items-center gap-1 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5 text-amber" />
                    <span>[Send]</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. CHAT INPUT TOOLBAR (TEXT, VOICE MICROPHONE, ATTACHMENTS, MAKE OFFER) */}
        <div className="flex items-center gap-2 pt-2 border-t border-ivory-200 dark:border-charcoal-light">
          {/* Attachment button */}
          <button
            onClick={() => setShowAttachmentPicker(true)}
            title="Attach crop/quality report"
            className="p-3 rounded-2xl bg-ivory-100 dark:bg-charcoal text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 transition-colors shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* LARGE VOICE MICROPHONE BUTTON */}
          <button
            onClick={startVoiceRecording}
            title="Press to speak in Hindi or English"
            className={`p-3 rounded-2xl font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm ${
              voiceState === "RECORDING"
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-amber-400 hover:bg-amber-500 text-charcoal"
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-black">🎤 Speak</span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendTextMessage();
            }}
            placeholder={
              language === "hi"
                ? "यहाँ संदेश लिखें (हिंदी या English, जैसे: 250 quintal available hai)..."
                : "Type message in English, Hindi, or Hinglish..."
            }
            className="flex-1 px-4 py-3 rounded-2xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs text-charcoal dark:text-ivory-100 focus:outline-none focus:border-forest"
          />

          {/* Make Offer Button inside Chat */}
          <button
            onClick={() => setShowOfferModal(true)}
            className="hidden sm:flex px-3.5 py-3 rounded-2xl font-extrabold text-xs bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 hover:bg-blue-200 transition-colors items-center gap-1 shrink-0"
          >
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span>Make Offer</span>
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSendTextMessage()}
            className="p-3 rounded-2xl bg-forest hover:bg-forest-dark text-white shadow-md transition-colors shrink-0"
          >
            <Send className="w-5 h-5 text-amber" />
          </button>
        </div>
      </div>

      {/* 5. NEGOTIATION TIMELINE AUDIT RECORD */}
      <NegotiationTimelineView timeline={offer.negotiationTimeline || []} />

      {/* MODALS */}
      {/* AI Assistant "Help Me Communicate" Modal */}
      {showAIAssistant && aiExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-light">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="font-black text-lg text-charcoal dark:text-ivory-100">
                  ✨ AI Conversation Assistant
                </h3>
              </div>
              <button onClick={() => setShowAIAssistant(false)} className="p-1 text-charcoal-muted font-bold">
                ✕
              </button>
            </div>

            {/* AI Query Explanation */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
              <span className="text-3xs font-extrabold uppercase text-blue-700 dark:text-blue-300 block">
                Buyer Query Explanation:
              </span>
              <p className="font-bold text-charcoal dark:text-ivory-100">
                {language === "hi" ? aiExplanation.simpleExplanationHindi : aiExplanation.simpleExplanationEnglish}
              </p>
              <p className="text-2xs text-charcoal-muted">
                Tip: {aiExplanation.recommendedAction}
              </p>
            </div>

            {/* AI Draft Response */}
            <div className="space-y-2 text-xs">
              <span className="font-extrabold text-charcoal dark:text-ivory-200 block">
                AI Formulated Response Draft (Review & Confirm):
              </span>
              <textarea
                rows={3}
                value={aiDraftMessage}
                onChange={(e) => setAiDraftMessage(e.target.value)}
                className="w-full p-3 rounded-2xl border border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 font-semibold text-charcoal dark:text-ivory-100 text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal text-3xs text-charcoal-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>The AI assistant does NOT send messages automatically. You must explicitly review and click Send.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAIAssistant(false)}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAISend}
                className="px-5 py-2 rounded-xl font-black text-xs bg-forest text-white shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-amber" />
                <span>[Send Message]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Picker Modal */}
      {showAttachmentPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ivory-200 dark:border-charcoal-light">
              <h3 className="font-extrabold text-base text-charcoal dark:text-ivory-100">
                📎 Attach Crop / Quality Evidence
              </h3>
              <button onClick={() => setShowAttachmentPicker(false)} className="text-charcoal-muted font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  handleSendTextMessage("Here is our verified Agrisense Crop Report PDF.", {
                    id: "ATT-01",
                    title: "Agrisense Verified Crop Report",
                    type: "CROP_REPORT",
                    fileName: "Agrisense_Wheat_HD2967_Report.pdf",
                    verified: true,
                  });
                  setShowAttachmentPicker(false);
                }}
                className="w-full p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light hover:border-forest text-left flex items-center gap-3 font-bold"
              >
                <FileText className="w-5 h-5 text-forest" />
                <div>
                  <span className="block text-charcoal dark:text-ivory-100">Agrisense_Crop_Report.pdf</span>
                  <span className="text-3xs text-emerald-600">✓ Verified Report</span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleSendTextMessage("Attaching moisture certificate.", {
                    id: "ATT-02",
                    title: "Lab Moisture Certificate",
                    type: "QUALITY_CERTIFICATE",
                    fileName: "Moisture_Test_11.8pct.pdf",
                    verified: true,
                  });
                  setShowAttachmentPicker(false);
                }}
                className="w-full p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light hover:border-forest text-left flex items-center gap-3 font-bold"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="block text-charcoal dark:text-ivory-100">Moisture_Test_11.8pct.pdf</span>
                  <span className="text-3xs text-blue-600">State Quality Lab Certified</span>
                </div>
              </button>
            </div>

            <p className="text-3xs text-charcoal-muted italic">
              Note: Sensitive personal identity documents (Aadhaar, land records) are protected and cannot be shared through buyer chat.
            </p>
          </div>
        </div>
      )}

      {/* Structured Offer Modal */}
      {showOfferModal && (
        <StructuredOfferModal
          cropListing={listing}
          buyerProfile={offer.buyerProfile}
          onClose={() => setShowOfferModal(false)}
          onOfferSent={() => {
            setShowOfferModal(false);
            onOfferUpdated();
          }}
        />
      )}

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <CounterOfferModal
          offer={offer}
          userRole={userRole}
          onClose={() => setShowCounterModal(false)}
          onCounterSubmitted={() => {
            setShowCounterModal(false);
            onOfferUpdated();
          }}
        />
      )}
    </div>
  );
}
