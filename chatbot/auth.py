"""
OTP Authentication Module for SafeHer
- Sends OTP via Gmail SMTP (100% FREE)
- Stores users in a simple JSON file (MVP)
"""
import os
import json
import random
import string
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

# ─── Email Setup ───────────────────────────────────────────────
GMAIL_USER = os.getenv("GMAIL_USER")          # your Gmail address
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")  # Gmail App Password (NOT your login password)

email_configured = bool(GMAIL_USER and GMAIL_APP_PASSWORD)

if email_configured:
    print(f"✅ Email OTP configured via {GMAIL_USER}")
else:
    print("⚠️  Gmail credentials missing — OTP will only print to console (dev mode)")


# ─── In-memory OTP store ──────────────────────────────────────
# Format: { email: { "otp": "123456", "expires": timestamp, "name": "User", "attempts": 0 } }
otp_store = {}

# ─── Simple JSON-based user store ─────────────────────────────
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")


def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}


def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


def generate_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=64))


def send_email_otp(to_email, otp, name):
    """
    Send OTP via Gmail SMTP — 100% FREE.
    Returns (success: bool, message: str)
    """
    if not email_configured:
        # Dev fallback: print to console
        print(f"\n{'='*50}")
        print(f"📧 OTP for {name} ({to_email}): {otp}")
        print(f"   (Gmail not configured — console-only mode)")
        print(f"{'='*50}\n")
        return True, "OTP generated (dev mode)"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🌸 SafeHer — Your verification code is {otp}"
        msg["From"] = f"SafeHer <{GMAIL_USER}>"
        msg["To"] = to_email

        # Beautiful HTML email
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="margin:0; padding:0; background-color:#fdf2f8; font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:480px; margin:40px auto; background:white; border-radius:20px; overflow:hidden; box-shadow:0 10px 40px rgba(236,72,153,0.12);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#ec4899,#a855f7); padding:36px 32px; text-align:center;">
                    <div style="width:56px; height:56px; margin:0 auto 12px; background:rgba(255,255,255,0.2); border-radius:50%; line-height:56px; font-size:28px;">🛡️</div>
                    <h1 style="color:white; font-size:26px; margin:0; font-weight:700;">SafeHer</h1>
                    <p style="color:rgba(255,255,255,0.85); margin:6px 0 0; font-size:14px;">Your safety companion</p>
                </div>

                <!-- Body -->
                <div style="padding:36px 32px; text-align:center;">
                    <p style="color:#6b21a8; font-size:15px; margin:0 0 6px;">Hi <strong>{name}</strong>,</p>
                    <p style="color:#666; font-size:14px; margin:0 0 28px;">Use this code to verify your identity</p>

                    <!-- OTP Box -->
                    <div style="background:linear-gradient(135deg,#fdf2f8,#f3e8ff); border:2px solid #e9d5ff; border-radius:16px; padding:20px; margin:0 auto 28px; display:inline-block;">
                        <span style="font-size:36px; font-weight:800; letter-spacing:12px; color:#6b21a8; font-family:'Courier New',monospace;">{otp}</span>
                    </div>

                    <p style="color:#999; font-size:13px; margin:0 0 8px;">⏱️ This code expires in <strong>5 minutes</strong></p>
                    <p style="color:#be123c; font-size:12px; margin:0;">🔒 Never share this code with anyone</p>
                </div>

                <!-- Footer -->
                <div style="background:#fdf2f8; padding:20px 32px; text-align:center; border-top:1px solid #fce7f3;">
                    <p style="color:#9d174d; font-size:11px; margin:0; opacity:0.6;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        plain_text = f"Hi {name},\n\nYour SafeHer verification code is: {otp}\n\nThis code expires in 5 minutes.\nDo not share this code with anyone.\n\n— SafeHer Team"

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        # Send via Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())

        print(f"✅ OTP email sent to {to_email}")
        return True, "OTP sent to your email"

    except smtplib.SMTPAuthenticationError:
        print("❌ Gmail auth failed — check GMAIL_USER and GMAIL_APP_PASSWORD")
        return False, "Email service error. Please try again."

    except Exception as e:
        print(f"❌ Email send failed: {e}")
        return False, "Failed to send email. Please try again."


# ─── In-memory session tokens ─────────────────────────────────
active_sessions = {}


# ─── Routes ────────────────────────────────────────────────────

@auth_bp.route("/api/auth/send-otp", methods=["POST"])
def send_otp():
    """
    Send OTP to the given email address.
    Expects JSON: { "email": "user@example.com", "name": "User Name", "phone": "9876543210" }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "Request body is required"}), 400

        email = data.get("email", "").strip().lower()
        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()

        if not name:
            return jsonify({"success": False, "error": "Name is required"}), 400

        if not email:
            return jsonify({"success": False, "error": "Email is required"}), 400

        # Basic email validation
        if "@" not in email or "." not in email.split("@")[-1]:
            return jsonify({
                "success": False,
                "error": "Please enter a valid email address"
            }), 400

        # Validate phone if provided
        if phone:
            clean_phone = phone.replace("+91", "").replace(" ", "").replace("-", "")
            if not clean_phone.isdigit() or len(clean_phone) != 10:
                return jsonify({
                    "success": False,
                    "error": "Please enter a valid 10-digit phone number"
                }), 400

        # Rate limiting: max 1 OTP per 30 seconds per email
        existing = otp_store.get(email)
        if existing and (time.time() - (existing["expires"] - 300)) < 30:
            return jsonify({
                "success": False,
                "error": "Please wait before requesting another OTP"
            }), 429

        # Generate OTP
        otp = generate_otp()

        # Send via email
        success, message = send_email_otp(email, otp, name)

        if not success:
            return jsonify({"success": False, "error": message}), 500

        # Store OTP with 5-minute expiry
        otp_store[email] = {
            "otp": otp,
            "expires": time.time() + 300,
            "name": name,
            "phone": phone.replace("+91", "").replace(" ", "").replace("-", "") if phone else "",
            "attempts": 0
        }

        masked_email = email[:3] + "****@" + email.split("@")[1]

        response_data = {
            "success": True,
            "message": f"OTP sent to {masked_email}",
        }

        # Only include dev_otp if email is NOT configured (dev mode)
        if not email_configured:
            response_data["dev_otp"] = otp

        return jsonify(response_data)

    except Exception as e:
        print(f"Error in send_otp: {e}")
        return jsonify({"success": False, "error": "Something went wrong"}), 500


@auth_bp.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    """
    Verify the OTP.
    Expects JSON: { "email": "user@example.com", "otp": "123456" }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "Request body is required"}), 400

        email = data.get("email", "").strip().lower()
        otp = data.get("otp", "").strip()

        if not email or not otp:
            return jsonify({
                "success": False,
                "error": "Email and OTP are required"
            }), 400

        # Check if OTP exists
        stored = otp_store.get(email)

        if not stored:
            return jsonify({
                "success": False,
                "error": "No OTP found. Please request a new one."
            }), 400

        # Check expiry
        if time.time() > stored["expires"]:
            del otp_store[email]
            return jsonify({
                "success": False,
                "error": "OTP has expired. Please request a new one."
            }), 400

        # Limit attempts (max 5)
        if stored["attempts"] >= 5:
            del otp_store[email]
            return jsonify({
                "success": False,
                "error": "Too many wrong attempts. Please request a new OTP."
            }), 429

        # Verify OTP
        if stored["otp"] != otp:
            stored["attempts"] += 1
            remaining = 5 - stored["attempts"]
            return jsonify({
                "success": False,
                "error": f"Invalid OTP. {remaining} attempt(s) remaining."
            }), 400

        # OTP is valid — create/update user
        name = stored["name"]
        phone = stored.get("phone", "")
        users = load_users()
        users[email] = {
            "name": name,
            "email": email,
            "phone": phone,
            "created_at": users.get(email, {}).get(
                "created_at", time.strftime("%Y-%m-%d %H:%M:%S")
            ),
            "last_login": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        save_users(users)

        # Generate session token
        token = generate_token()
        active_sessions[token] = {
            "email": email,
            "phone": phone,
            "name": name,
            "login_time": time.time()
        }

        # Clean up
        del otp_store[email]

        print(f"✅ User {name} ({email}) logged in successfully!")

        return jsonify({
            "success": True,
            "message": "Login successful!",
            "token": token,
            "user": {
                "name": name,
                "email": email,
                "phone": phone
            }
        })

    except Exception as e:
        print(f"Error in verify_otp: {e}")
        return jsonify({"success": False, "error": "Something went wrong"}), 500


@auth_bp.route("/api/auth/me", methods=["GET"])
def get_current_user():
    try:
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "error": "Not authenticated"}), 401

        token = auth_header.split("Bearer ")[1]
        session_data = active_sessions.get(token)

        if not session_data:
            return jsonify({"success": False, "error": "Session expired"}), 401

        return jsonify({
            "success": True,
            "user": {
                "name": session_data["name"],
                "email": session_data.get("email", ""),
                "phone": session_data.get("phone", "")
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    try:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[1]
            active_sessions.pop(token, None)

        return jsonify({"success": True, "message": "Logged out successfully"})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
