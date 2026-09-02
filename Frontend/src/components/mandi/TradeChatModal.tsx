import React, { useState } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  Volume2,
  X,
  User,
  ShieldCheck,
  Languages,
  CheckCircle2,
  Bot,
  RefreshCw,
} from 'lucide-react';
import type { CropListing, BuyerProfile } from '../../types/mandi';
import {
  speechService,
  aiCommunicationAssistant,
} from '../../services/mandiService';

interface TradeChatModalProps {
  listing?: CropListing;
  buyer?: BuyerProfile;
  onClose: () => void;
  onNavigateToMakeOffer?: () => void;
}

export function TradeChatModal({
  listing,
  buyer,
  onClose,
  onNavigateToMakeOffer,
}: TradeChatModalProps) {
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: 'me' | 'other'; text: string; time: string; isVoice?: boolean }>
  >([
    {
      id: 'm1',
      sender: 'other',
      text: listing
        ? `Namaste! I am interested in your ${listing.crop} (${listing.variety}). Is the moisture level strictly below 12% for long storage?`
        : 'Namaste! We are looking for 800 quintals Grade-A Wheat for our Lucknow processing plant.',
      time: '10:14 AM',
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [aiAssistantSuggestion, setAiAssistantSuggestion] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Trigger Speech-to-Text Transcription
  const handleStartVoice = async () => {
    setIsRecording(true);
    setVoiceTranscript('');
    try {
      const transcript = await speechService.transcribe(undefined, language);
      setVoiceTranscript(transcript);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecording(false);
    }
  };

  const handleSendVoiceTranscript = () => {
    if (!voiceTranscript) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: 'me',
        text: voiceTranscript,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: true,
      },
    ]);
    setVoiceTranscript('');
  };

  const handleSendText = () => {
    if (!inputMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: 'me',
        text: inputMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMsg('');
  };

  // AI Communication Assistant Action
  const handleTriggerAiAssistant = () => {
    const lastOtherMsg = [...messages].reverse().find((m) => m.sender === 'other');
    const explanation = lastOtherMsg
      ? aiCommunicationAssistant.explainBuyerQuery(lastOtherMsg.text)
      : 'The counterpart is inquiring about commercial offer terms.';

    const suggested = aiCommunicationAssistant.suggestResponse(
      explanation,
      listing ? listing.askingPricePerQuintal : 2850
    );

    setAiAssistantSuggestion(`💡 AI Explanation: ${explanation}\n\n✨ Suggested Professional Reply:\n"${suggested}"`);
    setShowAiAssistant(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#17211d] rounded-3xl max-w-xl w-full h-[650px] flex flex-col shadow-2xl border border-ivory-300 dark:border-[#26362f] overflow-hidden animate-scale-up">
        {/* Chat Header */}
        <div className="p-4 bg-forest-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-700 flex items-center justify-center font-bold text-amber">
              {listing ? listing.farmerName[0] : buyer ? buyer.name[0] : 'B'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                {listing ? listing.farmerName : buyer ? buyer.name : 'Verified Trader'}
                <ShieldCheck className="w-3.5 h-3.5 text-amber" />
              </h3>
              <p className="text-2xs text-ivory-200/80 font-mono">
                {listing ? `${listing.crop} (${listing.variety})` : buyer?.location || 'Direct Trade Chat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1 text-2xs font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-amber transition-all"
            >
              <Languages className="w-3 h-3" />
              {language === 'hi' ? 'हिंदी' : 'English'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-xs hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Communication Assistant Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 border-b border-amber-200 dark:border-amber-900/40 flex items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Need help translating or formulating your negotiation reply?</span>
          </div>
          <button
            type="button"
            onClick={handleTriggerAiAssistant}
            className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-2xs hover:bg-amber-700 transition-all shrink-0"
          >
            ✨ Help Me Communicate
          </button>
        </div>

        {/* AI Assistant Modal Popover */}
        {showAiAssistant && (
          <div className="p-4 bg-forest-900/95 text-white border-b border-forest-700 space-y-3 text-xs animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                Agrisense AI Communication Advisor
              </span>
              <button
                type="button"
                onClick={() => setShowAiAssistant(false)}
                className="text-ivory-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="whitespace-pre-line text-ivory-100 leading-relaxed font-mono bg-black/30 p-3 rounded-xl border border-white/10">
              {aiAssistantSuggestion}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const match = aiAssistantSuggestion.match(/"([^"]+)"/);
                  if (match && match[1]) {
                    setInputMsg(match[1]);
                  }
                  setShowAiAssistant(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber text-charcoal font-bold text-2xs hover:bg-amber-400"
              >
                Use Message Draft
              </button>
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-ivory-100/40 dark:bg-charcoal/20">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 shadow-sm ${
                  m.sender === 'me'
                    ? 'bg-forest text-white rounded-br-none'
                    : 'bg-white dark:bg-[#17211d] text-charcoal dark:text-ivory-100 border border-ivory-300 dark:border-[#26362f] rounded-bl-none'
                }`}
              >
                {m.isVoice && (
                  <div className="flex items-center gap-1 text-[10px] opacity-80 font-bold uppercase tracking-wider mb-1">
                    <Volume2 className="w-3 h-3" />
                    Voice-to-Text Transcript
                  </div>
                )}
                <p className="leading-relaxed">{m.text}</p>
                <span className="text-[9px] opacity-60 block text-right font-mono">{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Voice Recognition Preview Drawer */}
        {voiceTranscript && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-amber-600 animate-pulse" />
                Voice Recognition Transcript:
              </span>
              <button
                type="button"
                onClick={handleStartVoice}
                className="text-2xs text-amber-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-record
              </button>
            </div>
            <p className="text-xs font-mono text-charcoal dark:text-ivory-100 bg-white dark:bg-[#17211d] p-2.5 rounded-xl border border-amber-300">
              "{voiceTranscript}"
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVoiceTranscript('')}
                className="px-3 py-1 rounded-lg text-2xs text-charcoal-muted hover:text-charcoal"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSendVoiceTranscript}
                className="px-4 py-1.5 rounded-lg bg-forest text-white text-2xs font-bold shadow-sm"
              >
                Confirm & Send Message
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-[#17211d] border-t border-ivory-300 dark:border-[#26362f] flex items-center gap-2">
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleStartVoice}
            disabled={isRecording}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-ivory-200 dark:bg-charcoal/60 text-charcoal dark:text-ivory-100 hover:bg-forest/10 hover:text-forest'
            }`}
            title="🎤 Speak (Voice-to-Text in Hindi / English)"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder={
              isRecording
                ? 'Listening to speech...'
                : language === 'hi'
                ? 'संदेश लिखें या माइक दबाएं...'
                : 'Type message or press mic...'
            }
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 text-xs text-charcoal dark:text-ivory-100 outline-none focus:ring-2 focus:ring-forest/30"
          />

          <button
            type="button"
            onClick={handleSendText}
            disabled={!inputMsg.trim()}
            className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center hover:bg-forest-600 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
