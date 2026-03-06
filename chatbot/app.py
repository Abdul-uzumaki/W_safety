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
# 3. Crisis & Depression Detection
# ==========================================
crisis_keywords = [
    "suicide", "kill myself", "end my life",
    "he is here", "unsafe", "raped", "assault", "hurt me"
]

depression_keywords = [
    "depressed", "hopeless", "worthless", "want to die", 
    "give up", "lonely", "sad", "unhappy", "pain", "suffering"
]

def check_crisis(text):
    return any(word in text.lower() for word in crisis_keywords)

def check_depression(text):
    # Basic keyword check for now
    return any(word in text.lower() for word in depression_keywords)

# ─── Forward to Health Backend ───────────────────────────
import requests

NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:4000/api")

def trigger_guardian_notification(auth_token):
    try:
        if not auth_token: return False
        
        headers = {"Authorization": auth_token}
        response = requests.post(f"{NODE_BACKEND_URL}/health/notify-guardian", headers=headers, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"⚠️ Failed to trigger guardian notification: {e}")
        return False

# ==========================================
# 4. Routes
# ==========================================
@app.route("/")
def home():
    return "SafeHer API Running 🚀"

@app.route("/api/chat", methods=["POST"])
def chat_route():
    try:
        data = request.get_json()
        auth_header = request.headers.get("Authorization")

        if not data or "message" not in data:
            return jsonify({"error": "Message required"}), 400

        user_input = data["message"]
        print(f"💬 Received: {user_input}")

        # Crisis detection
        is_crisis = check_crisis(user_input)
        is_depressed = check_depression(user_input)
        print(f"🔍 Crisis: {is_crisis}, Depressed: {is_depressed}")

        emergency_note = ""
        if is_crisis:
            emergency_note = "🚨 [URGENT] Please stay safe. If you are in immediate danger, call 112 now. "
        elif is_depressed:
            emergency_note = "💜 [SUPPORT] I'm sending a gentle alert to your guardian so they can reach out. You are not alone. "
            # Trigger notification to Node backend
            if auth_header:
                trigger_guardian_notification(auth_header)

        try:
            if chat:
                response = chat.send_message(user_input)
                reply = response.text
            else:
                reply = "Gemini AI is not configured. I'm in fallback mode."
        except Exception as e:
            print(f"⚠️ Gemini Error: {e}")
            # Fallback for leaked keys or quota issues
            reply = "I'm here to support you. (Note: AI is currently in fallback mode due to API issues, but I'm still listening!)"

        return jsonify({
            "success": True,
            "reply": emergency_note + reply,
            "triggered_alert": is_depressed or is_crisis
        })

    except Exception as e:
        print("CRITICAL ERROR:", e)
        return jsonify({"error": "Internal server error. Please try again later."}), 500


if __name__ == "__main__":
    print("🌸 Server running at http://localhost:5000")
    app.run(debug=True, port=5000)