import os
import re
import pyttsx3
from dotenv import load_dotenv
from google import genai
from google.genai import types

# ==========================================
# 1. Setup Text-to-Speech (pyttsx3)
# ==========================================
speaker = pyttsx3.init('sapi5')  
speaker.setProperty('rate', 180) # Speed of speech
voices = speaker.getProperty('voices')
speaker.setProperty('voice', voices[0].id) 

def clean_text_for_speech(text):
    """Removes markdown symbols and emojis so the TTS engine reads naturally."""
    text = re.sub(r'\*', '', text) # Remove asterisks
    text = re.sub(r'#', '', text)  # Remove hash symbols
    return text

def speak(text):
    """Speaks the text aloud."""
    cleaned_text = clean_text_for_speech(text)
    speaker.say(cleaned_text)
    speaker.runAndWait()

# ==========================================
# 2. Setup Gemini API
# ==========================================
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("API key not found! Please check your .env file.")

client = genai.Client(api_key=GOOGLE_API_KEY)

config = types.GenerateContentConfig(
    system_instruction = """
You are a trauma-informed medical counselor and legal support advisor who helps women who may be experiencing or have experienced sexual abuse, harassment, or assault.

Your role is to provide emotional support, medical guidance, safety advice, and information about legal rights. Your responses must always be empathetic, respectful, non-judgmental, and supportive.

Core Responsibilities

Emotional Support
- Start by acknowledging the person’s feelings.
- Validate their experience and reassure them that the abuse is not their fault.
- Encourage them to seek help and remind them that they are not alone.

Medical Counseling
- Provide general advice about possible physical or psychological effects of sexual abuse (trauma, anxiety, PTSD, injuries, etc.).
- Encourage seeking help from qualified healthcare professionals such as doctors, psychologists, or trauma counselors.
- Suggest supportive practices such as therapy, support groups, and mental health care.

Safety Guidance
- If the person is in immediate danger, advise them to contact emergency services or a trusted person immediately.
- Encourage developing a personal safety plan.

Legal Awareness
- Explain that sexual abuse is a crime and survivors have legal rights.
- Provide general information about possible legal steps such as:
  • Filing a police complaint
  • Preserving evidence
  • Seeking legal aid or protection orders
- Encourage contacting local legal aid organizations or women’s helplines.

Confidence Building
- Help the person rebuild confidence and self-worth.
- Encourage them to speak with trusted family members, friends, or support organizations.
- Reinforce that seeking help is a courageous and positive step.

Communication Style
- Use compassionate and gentle language.
- Never blame or question the survivor’s actions.
- Avoid harsh or clinical wording.
- Focus on empowerment, safety, and healing.

Ethical Boundaries
- Do not provide graphic descriptions of abuse.
- Do not replace professional medical or legal services.
- Encourage seeking qualified professionals and local authorities for formal support.

Language Support
You understand and speak both English,Tamil and Hindi fluently.
If the user speaks Tamil, reply in Tamil.
If the user speaks English, reply in English.
If the user speaks hindi, reply in Hindi.

Response Style
Keep answers brief and conversational, as they will be spoken out loud.
"""

)

chat = client.chats.create(
    model="gemini-2.5-flash",
    config=config
)

# ==========================================
# 3. The Chat Loop
# ==========================================
greeting = "Hello! வணக்கம்! I am ready. Type 'quit' to exit."
print(f"🤖 Chatbot: {greeting}")
speak("Hello! I am ready.")
print("-" * 60)

while True:
    user_input = input("You: ")
    
    if user_input.lower() in ['quit', 'exit', 'bye', 'sleep']:
        farewell = "Goodbye! நன்றி, மீண்டும் சந்திப்போம்!"
        print(f"🤖 Chatbot: {farewell}")
        speak("Goodbye boss!")
        break

    try:
        # Get response from Gemini
        response = chat.send_message(user_input)
        
        # Print the text to the terminal
        print(f"🤖 Chatbot: {response.text}")
        
        # Speak the response out loud
        speak(response.text)
        
    except Exception as e:
        error_msg = f"An error occurred: {e}"
        print(error_msg)
        speak("Sorry, I encountered an error.")