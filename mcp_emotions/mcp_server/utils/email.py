import os
from email.message import EmailMessage
import aiosmtplib

SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
FROM_EMAIL = os.getenv('FROM_EMAIL', SMTP_USER)

async def send_email(to_email: str, subject: str, body: str, html: str = None):
    message = EmailMessage()
    message["From"] = FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)
    if html:
        message.add_alternative(html, subtype="html")

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USER,
        password=SMTP_PASS,
        start_tls=True,
    )

async def send_welcome_email(to_email: str, name: str):
    subject = "Welcome to EmotionWise.ai!"
    body = f"""
Hi {name},

Welcome to EmotionWise.ai! We're excited to have you on board.

You can now log in and start exploring your emotional insights.

If you have any questions, reply to this email or contact support@emotionwise.ai.

Best regards,
The EmotionWise.ai Team
"""
    await send_email(to_email, subject, body)

async def send_verification_email(to_email: str, name: str, token: str):
    verify_url = f"https://emotionwise.ai/verify-email?token={token}"
    subject = "Verify your email for EmotionWise.ai"
    body = f"""
Hi {name},

Thank you for registering at EmotionWise.ai!

Please verify your email by clicking the link below:
{verify_url}

If you did not register, you can ignore this email.

Best regards,
The EmotionWise.ai Team
"""
    html = f"""
    <p>Hi {name},</p>
    <p>Thank you for registering at <b>EmotionWise.ai</b>!</p>
    <p><b>Please verify your email by clicking the link below:</b></p>
    <p><a href='{verify_url}' style='color:#4f46e5;font-weight:bold;'>Click here to verify your email</a></p>
    <p>If you did not register, you can ignore this email.</p>
    <p>Best regards,<br/>The EmotionWise.ai Team</p>
    """
    await send_email(to_email, subject, body, html) 