import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types

# ==========================================
# 1. Setup Gemini (SAME AS YOUR CLI)
# ==========================================
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("API key not found! Check your .env file.")

client = genai.Client(api_key=GOOGLE_API_KEY)

config = types.GenerateContentConfig(
    system_instruction="""
You are an AI emotional support companion for women who may be experiencing harassment, abuse, or distress.

Provide emotional support.
Do not give legal section numbers.
Do not diagnose.
Keep responses short.
Respond in English, Tamil, or Hindi.
"""
)

chat = client.chats.create(
    model="gemini-2.5-flash",
    config=config
)

# ==========================================
# 2. Crisis Detection (SAME AS YOUR CLI)
# ==========================================
crisis_keywords = [
    "suicide", "kill myself", "end my life",
    "he is here", "unsafe", "raped", "assault"
]

def check_crisis(text):
    return any(word in text.lower() for word in crisis_keywords)

# ==========================================
# 3. Flask App Wrapper
# ==========================================
app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "SafeHer API Running 🚀"

@app.route("/api/chat", methods=["POST"])
def chat_route():
    try:
        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({"error": "Message required"}), 400

        user_input = data["message"]

        # Crisis message
        emergency_note = ""
        if check_crisis(user_input):
            emergency_note = (
                "If you are in immediate danger, contact emergency services immediately. "
            )

        # SAME Gemini call as CLI
        response = chat.send_message(user_input)

        return jsonify({
            "success": True,
            "reply": emergency_note + response.text
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🌸 Server running at http://localhost:5000")
    app.run(debug=True)