export interface AIExplanationResult {
  buyerMessage: string;
  simpleExplanationHindi: string;
  simpleExplanationEnglish: string;
  recommendedAction: string;
  suggestedReplyHindi: string;
  suggestedReplyEnglish: string;
}

export const aiAssistantService = {
  /**
   * Explains what the buyer is asking in simple terms and suggests responses
   */
  explainBuyerMessage(message: string): AIExplanationResult {
    const text = message.toLowerCase();

    if (text.includes("moisture") || text.includes("नमी")) {
      return {
        buyerMessage: message,
        simpleExplanationHindi: "खरीदार पूछ रहा है कि क्या गेहूं में नमी की मात्रा 12% से कम है?",
        simpleExplanationEnglish: "The buyer is asking whether the wheat moisture level is below 12%.",
        recommendedAction: "Confirm moisture level from your lab report or moisture meter.",
        suggestedReplyHindi: "जी हाँ, नमी का स्तर 11.8% है और लैब रिपोर्ट सत्यापित है।",
        suggestedReplyEnglish: "Yes, the moisture level is 11.8% and backed by official quality test certificate.",
      };
    }

    if (text.includes("price") || text.includes("rate") || text.includes("मूल्य") || text.includes("2850")) {
      return {
        buyerMessage: message,
        simpleExplanationHindi: "खरीदार ₹2,850 प्रति क्विंटल की दर से माल खरीदना चाहता है।",
        simpleExplanationEnglish: "The buyer is proposing a rate of ₹2,850 per quintal.",
        recommendedAction: "State your counter price or accept their offer.",
        suggestedReplyHindi: "हमारी मांग दर ₹2,880/क्विंटल है। हम इससे कम पर नहीं बेच सकते।",
        suggestedReplyEnglish: "Our asking price is ₹2,880 per quintal. We would prefer not to go below this price.",
      };
    }

    if (text.includes("pickup") || text.includes("delivery") || text.includes("कब")) {
      return {
        buyerMessage: message,
        simpleExplanationHindi: "खरीदार पूछ रहा है कि फसल कब और कैसे उठाई जाएगी?",
        simpleExplanationEnglish: "The buyer is inquiring about pickup date and logistics arrangements.",
        recommendedAction: "Confirm ready date for farmgate pickup.",
        suggestedReplyHindi: "मेरा माल 15 अक्टूबर को खेत से pickup के लिए तैयार रहेगा।",
        suggestedReplyEnglish: "My produce will be ready for pickup on 15 October at farmgate.",
      };
    }

    return {
      buyerMessage: message,
      simpleExplanationHindi: "खरीदार व्यापारिक शर्तों (मात्रा, गुणवत्ता और मूल्य) पर बातचीत कर रहा है।",
      simpleExplanationEnglish: "The buyer is discussing trade terms regarding quantity, quality, and price.",
      recommendedAction: "Provide accurate details regarding your crop grade.",
      suggestedReplyHindi: "हमारे पास नियमानुसार Grade A गुणवत्ता का माल उपलब्ध है।",
      suggestedReplyEnglish: "We have Grade A certified produce ready for trade as per required specs.",
    };
  },

  /**
   * Draft a response based on farmer input
   */
  draftResponse(prompt: string, targetLanguage: "hi" | "en" = "hi"): string {
    const p = prompt.toLowerCase();

    if (p.includes("rate") || p.includes("2850") || p.includes("कम")) {
      return targetLanguage === "hi"
        ? "हमारी मांग दर ₹2,850 प्रति क्विंटल है। इससे कम पर सौदा संभव नहीं है।"
        : "Our asking price is ₹2,850 per quintal. We prefer not to go below this price.";
    }

    if (p.includes("pickup") || p.includes("15")) {
      return targetLanguage === "hi"
        ? "मेरा माल 15 अक्टूबर को pickup के लिए पूरी तरह तैयार रहेगा।"
        : "My produce will be ready for pickup on 15 October.";
    }

    return targetLanguage === "hi"
      ? `प्रस्तावित संदेश: ${prompt}`
      : `Proposed message: ${prompt}`;
  },

  /**
   * Translate text between Hindi and English
   */
  translate(text: string, toLanguage: "hi" | "en"): string {
    if (toLanguage === "en") {
      if (text.includes("मेरे पास 250 क्विंटल")) {
        return "I have 250 quintals of wheat available.";
      }
      if (text.includes("15 अक्टूबर")) {
        return "My produce will be ready for pickup on 15 October.";
      }
      return `Translated to English: "${text}"`;
    } else {
      if (text.toLowerCase().includes("ready for pickup")) {
        return "मेरा माल 15 अक्टूबर को pickup के लिए तैयार रहेगा।";
      }
      return `हिंदी अनुवाद: "${text}"`;
    }
  },
};
