export interface SpeechResult {
  transcript: string;
  confidence: number;
  language: "hi-IN" | "en-IN";
}

const MOCK_HINDI_TRANSCRIPTS = [
  "मेरे पास ढाई सौ क्विंटल गेहूं उपलब्ध है। moisture 11.8% है।",
  "मेरा माल 15 अक्टूबर को pickup के लिए तैयार रहेगा। rate 2880 fix कीजिये।",
  "क्वालिटी ग्रेड A है और दाना बिल्कुल साफ़ और चमकदार है।",
  "500 क्विंटल गेहूं का ऑर्डर देना चाहते हैं?",
];

const MOCK_ENGLISH_TRANSCRIPTS = [
  "I have 250 quintals of wheat available with moisture level 11.8%.",
  "Our asking rate is 2,880 rupees per quintal for Grade A quality.",
  "The crop will be ready for pickup by 15 October.",
];

export const speechService = {
  /**
   * Transcribe recorded audio with realistic demo simulation or Web Speech API fallback
   */
  async transcribeAudio(
    audioBlob?: Blob | null,
    preferredLanguage: "hi" | "en" = "hi"
  ): Promise<SpeechResult> {
    // Artificial realistic delay for speech processing
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (preferredLanguage === "hi") {
      const randomIdx = Math.floor(Math.random() * MOCK_HINDI_TRANSCRIPTS.length);
      return {
        transcript: MOCK_HINDI_TRANSCRIPTS[randomIdx],
        confidence: 0.94,
        language: "hi-IN",
      };
    } else {
      const randomIdx = Math.floor(Math.random() * MOCK_ENGLISH_TRANSCRIPTS.length);
      return {
        transcript: MOCK_ENGLISH_TRANSCRIPTS[randomIdx],
        confidence: 0.96,
        language: "en-IN",
      };
    }
  },
};
