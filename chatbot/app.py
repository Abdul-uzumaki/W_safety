import os
import re
import pyttsx3
import speech_recognition as sr
from dotenv import load_dotenv
from google import genai
from google.genai import types

# ==========================================
# 1. Setup Text-to-Speech
# ==========================================
speaker = pyttsx3.init('sapi5')
speaker.setProperty('rate', 180)
voices = speaker.getProperty('voices')
speaker.setProperty('voice', voices[0].id)

def clean_text_for_speech(text):
    text = re.sub(r'\*', '', text)
    text = re.sub(r'#', '', text)
    return text

def speak(text):
    cleaned_text = clean_text_for_speech(text)
    speaker.say(cleaned_text)
    speaker.runAndWait()

# ==========================================
# 2. Setup Speech Recognition
# ==========================================
recognizer = sr.Recognizer()
mic = sr.Microphone()

def listen():
    with mic as source:
        print("🎤 Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        print("🔍 Recognizing...")
        text = recognizer.recognize_google(audio)
        print(f"You (voice): {text}")
        return text
    except sr.UnknownValueError:
        speak("I could not understand. Please repeat.")
        return None
    except sr.RequestError:
        speak("Speech service is unavailable.")
        return None

# ==========================================
# 3. Setup Gemini API
# ==========================================
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("API key not found! Please check your .env file.")

client = genai.Client(api_key=GOOGLE_API_KEY)

config = types.GenerateContentConfig(
    system_instruction = """
You are an AI emotional support companion for women who may be experiencing harassment, abuse, or distress.

Your role is to:
- Provide emotional support and reassurance.
- Validate feelings in a compassionate and non-judgmental way.
- Encourage seeking help from trusted individuals and professionals.

Legal Guidance Rules:
- You may provide general information that harassment and assault are crimes.
- Do NOT mention specific legal section numbers or legal codes.
- Do NOT give detailed legal procedures.
- Instead, suggest contacting local authorities, women's helplines, or legal aid organizations.
- Make it clear that laws vary by country.

Medical Guidance Rules:
- Provide general wellness advice only.
- Do NOT diagnose conditions.
- Encourage seeking qualified medical or mental health professionals.

Emergency Safety:
- If user appears in immediate danger, advise contacting emergency services or a trusted person immediately.

Tone:
- Calm, supportive, and empowering.
- Short, conversational responses (since responses are spoken aloud).
- Avoid technical, legal, or clinical language.

Language:
- Respond in English, Tamil, or Hindi based on the user’s language.
"""
)
chat = client.chats.create(
    model="gemini-2.5-flash",
    config=config
)

# ==========================================
# 4. Crisis Detection
# ==========================================
crisis_keywords = [
    "suicide", "kill myself", "end my life",
    "he is here", "unsafe", "raped", "assault"
]

def check_crisis(text):
    for word in crisis_keywords:
        if word in text.lower():
            return True
    return False

# ==========================================
# 5. Start Chat
# ==========================================
greeting = "Hello! வணக்கம்! I am here for you. Type or type 'voice' to speak. Type 'quit' to exit."
print(f"🤖 Chatbot: {greeting}")
speak("Hello. I am here for you.")
print("-" * 60)

while True:
    user_input = input("You (type or say 'voice'): ")

    # Exit condition
    if user_input.lower() in ['quit', 'exit', 'bye', 'sleep']:
        farewell = "Goodbye! Stay safe."
        print(f"🤖 Chatbot: {farewell}")
        speak("Goodbye. Stay safe.")
        break

    # Voice mode trigger
    if user_input.lower() == "voice":
        user_input = listen()
        if not user_input:
            continue

    # Crisis detection
    if check_crisis(user_input):
        emergency_msg = "If you are in immediate danger, please contact emergency services right now."
        print(f"🤖 Chatbot: {emergency_msg}")
        speak(emergency_msg)

    try:
        response = chat.send_message(user_input)
        print(f"🤖 Chatbot: {response.text}")
        speak(response.text)

    except Exception as e:
        print(f"Error: {e}")
        speak("Sorry, I encountered an error.")