// src/services/chatService.js

import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// ===============================
// Send Message to Chatbot
// ===============================
export const sendMessage = async (message) => {
  try {
    const response = await api.post("/api/chat", {
      message: message,
    })

    return response.data.reply
  } catch (error) {
    console.error("Chat API Error:", error.response?.data || error.message)

    return (
      error.response?.data?.error ||
      "Something went wrong. Please try again."
    )
  }
}