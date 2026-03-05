from flask import Flask, request, jsonify 
import os 
from dotenv import load_dotenv
from google import genai 
from google.genai import types

load_dotenv()

app = Flask(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=GOOGLE_API_KEY)

config = types.GenerateContentConfig(
    system_instruction=(
        "You are a friendly bilingual health assistant. "
        "Reply in Tamil if user speaks Tamil. "
        "Reply in English if user speaks English. "
        "Keep answers short."
    )
)

# 🔥 IMPORTANT: create chat ONCE (same as CLI)
chat = client.chats.create(
    model="gemini-2.5-flash",   # use EXACT model that worked locally
    config=config
)

@app.route("/chat", methods=["POST"])
def chat_route():
    try:
        data = request.get_json()
        user_message = data.get("message")

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # 🔥 same working method
        response = chat.send_message(user_message)

        return jsonify({
            "reply": response.text
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)