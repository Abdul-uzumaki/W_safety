import os
import smtplib
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

print(f"Testing SMTP for {GMAIL_USER}...")

try:
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        print("✅ Login successful!")
except Exception as e:
    print(f"❌ Login failed: {e}")
