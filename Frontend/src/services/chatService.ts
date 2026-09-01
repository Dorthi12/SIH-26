import type { BuyerOffer, OfferMessage, UserRole, ChatMessageAttachment } from "../types/mandi";
import { mandiService } from "./mandiService";

export const chatService = {
  /**
   * Get messages for an offer
   */
  getMessages(offerId: string): OfferMessage[] {
    const offer = mandiService.getOffersForSeller("FARMER-UP-1042").find((o) => o.id === offerId) ||
      mandiService.getOffersForBuyer("BUYER-001").find((o) => o.id === offerId);
    return offer ? offer.messages : [];
  },

  /**
   * Send a message in a negotiation chat
   */
  sendMessage(params: {
    offerId: string;
    senderRole: UserRole;
    senderName: string;
    messageText: string;
    isVoice?: boolean;
    audioDurationSeconds?: number;
    aiTranslatedMessage?: string;
    attachment?: ChatMessageAttachment;
  }): OfferMessage {
    const offer = mandiService.getOffersForSeller("FARMER-UP-1042").find((o) => o.id === params.offerId) ||
      mandiService.getOffersForBuyer("BUYER-001").find((o) => o.id === params.offerId);

    const newMsg: OfferMessage = {
      id: `MSG-${Date.now()}`,
      senderRole: params.senderRole,
      senderName: params.senderName,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: params.messageText,
      isVoice: params.isVoice,
      audioDurationSeconds: params.audioDurationSeconds,
      aiTranslatedMessage: params.aiTranslatedMessage,
      attachment: params.attachment,
    };

    if (offer) {
      offer.messages.push(newMsg);
      offer.updatedAt = new Date().toLocaleString();
    }

    return newMsg;
  },
};
