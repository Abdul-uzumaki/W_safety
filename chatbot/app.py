from dotenv import load_dotenv
import os

# Load environment variables first!
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from auth import auth_bp

# ==========================================
# 1. Setup
# ==========================================
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY", "safeher-secret-key-change-in-production")

# Register auth blueprint
app.register_blueprint(auth_bp)

# ==========================================
# 2. Gemini Chat Setup (optional — app works for auth even without it)
# ==========================================
chat = None
try:
    from google import genai
    from google.genai import types

    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if GOOGLE_API_KEY:
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
        print("✅ Gemini AI connected")
    else:
        print("⚠️  No GOOGLE_API_KEY — chat disabled, auth still works")
except Exception as e:
    print(f"⚠️  Gemini init failed ({e}) — chat disabled, auth still works")

# ==========================================
# 3. Crisis Detection
# ==========================================
crisis_keywords = [
    "suicide", "kill myself", "end my life",
    "he is here", "unsafe", "raped", "assault"
]

def check_crisis(text):
    return any(word in text.lower() for word in crisis_keywords)

# ==========================================
# 4. Routes
# ==========================================
@app.route("/")
def home():
    return "SafeHer API Running 🚀"

@app.route("/api/chat", methods=["POST"])
def chat_route():
    try:
        if not chat:
            return jsonify({"error": "Chat AI not configured. Set GOOGLE_API_KEY in .env"}), 503

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
    app.run(debug=True, port=5000)