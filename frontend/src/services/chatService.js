// src/services/chatService.js

import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// ===============================
// Send Message to Chatbot
// ===============================
export const sendMessage = async (message, token) => {
  try {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await api.post("/api/chat", {
      message: message,
    }, { headers })

    return response.data.reply
  } catch (error) {
    console.error("Chat API Error:", error.response?.data || error.message)

    return (
      error.response?.data?.error ||
      "Something went wrong. Please try again."
    )
  }
}