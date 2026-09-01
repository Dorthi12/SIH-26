import axios from "axios";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8001";
const RAG_SECRET_API_KEY = process.env.RAG_SECRET_API_KEY || "";

const client = axios.create({
  baseURL: RAG_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-RAG-API-KEY": RAG_SECRET_API_KEY,
  },
  timeout: 35000,
});

/**
 * Send multi-turn chat request to RAG microservice
 */
export const sendRagChat = async ({ query, conversationId, farmerProfile, userId }) => {
  try {
    const payload = {
      query,
      conversation_id: conversationId || undefined,
      farmer_profile: farmerProfile || undefined,
      user_id: userId || undefined,
    };

    const response = await client.post("/api/rag/chat", payload);
    return response.data;
  } catch (error) {
    console.error("RAG Service Chat Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail?.error || "Failed to communicate with RAG service");
  }
};

/**
 * Get conversation history from RAG microservice
 */
export const getRagConversation = async (conversationId, userId) => {
  try {
    const response = await client.get(`/api/rag/chat/${conversationId}`, {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error("RAG Service Get History Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail?.error || "Failed to retrieve conversation history");
  }
};

/**
 * Delete conversation from RAG microservice
 */
export const deleteRagConversation = async (conversationId, userId) => {
  try {
    const response = await client.delete(`/api/rag/chat/${conversationId}`, {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error("RAG Service Delete Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail?.error || "Failed to delete conversation");
  }
};

/**
 * Query RAG single-turn pipeline directly
 */
export const queryRag = async ({ query, farmerProfile, topK }) => {
  try {
    const response = await client.post("/api/rag/query", {
      query,
      farmer_profile: farmerProfile || undefined,
      top_k: topK || undefined,
    });
    return response.data;
  } catch (error) {
    console.error("RAG Service Query Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail?.error || "Failed to execute RAG query");
  }
};

export default {
  sendRagChat,
  getRagConversation,
  deleteRagConversation,
  queryRag,
};
