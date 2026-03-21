import html
import logging
import os
import secrets
import smtplib
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from fastapi.concurrency import run_in_threadpool
import resend

logger = logging.getLogger(__name__)

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


def generate_otp(length=6):
    return "".join(secrets.choice(string.digits) for _ in range(length))


def load_template(template_name: str) -> str:
    template_path = TEMPLATES_DIR / template_name
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error(f"Template not found: {template_path}")
        return None


def _send_email_sync(to_email: str, subject: str, body: str):
    if RESEND_API_KEY:
        try:
            params: resend.Emails.SendParams = {
                "from": f"ideasprint 2026 <{RESEND_FROM_EMAIL}>",
                "to": [to_email],
                "subject": subject,
                "html": body,
            }
            email_response = resend.Emails.send(params)
            logger.info(f"Email sent successfully via Resend to {to_email}")
            return True
        except Exception as e:
            logger.error(
                f"Resend API failed to send email to {to_email}: {e}. Falling back to SMTP."
            )

    try:
        msg = MIMEMultipart()
        msg["From"] = f"ideasprint 2026 <{SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "html"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(FROM_EMAIL, to_email, text)
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_email(to_email: str, subject: str, body: str):
    return await run_in_threadpool(_send_email_sync, to_email, subject, body)


async def send_otp_email(to_email: str, otp: str, purpose: str = "registration"):
    subject = "Your Verification OTP for ideasprint"
    heading = "Verify Your Email"
    description = f"Use the verification code below to complete your {purpose}. This code will expire in 5 minutes."

    template = load_template("otp_email.html")
    if template:
        body = template.replace("{{OTP_CODE}}", otp)
        body = body.replace("{{heading}}", heading)
        body = body.replace("{{description}}", description)
    else:
        body = f"<p>{heading}</p><p>{description}</p><p>Your OTP is: <b>{otp}</b></p>"

    logger.info(f"Sending OTP email to {to_email} for purpose: {purpose}")
    return await send_email(to_email, subject, body)


async def send_welcome_email(
    to_email: str,
    name: str,
    phone: str,
    leader_im: str,
    team_name: str,
    members: list = None,
):
    subject = "Welcome to ideasprint 2026 - Registration Successful!"

    members_html = ""
    if members and len(members) > 0:
        members_html += """
                            <!-- Members Section Label -->
                            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #03C7B3; text-transform: uppercase; letter-spacing: 1.5px;">Team Members</p>
        """
        for i, m in enumerate(members):
            m_name = html.escape(m.name)
            m_im = html.escape(m.im_number)
            m_phone = html.escape(m.phone)
            members_html += f"""
                            <!-- Member {i+1} Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(3, 199, 179, 0.06); border: 1px solid rgba(3, 199, 179, 0.2); border-radius: 12px; margin-bottom: 12px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <!-- Member badge -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                                            <tr>
                                                <td style="background: rgba(3, 199, 179, 0.18); border-radius: 50px; padding: 3px 12px;">
                                                    <span style="font-size: 11px; color: #03C7B3; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Member {i+1}</span>
                                                </td>
                                            </tr>
                                        </table>
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding-bottom: 8px; border-bottom: 1px solid rgba(3, 199, 179, 0.08);">
                                                    <p style="margin: 0 0 2px; font-size: 11px; color: rgba(251,255,254,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                                                    <p style="margin: 0; font-size: 15px; color: #FBFFFE; font-weight: 600;">{m_name}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(3, 199, 179, 0.08);">
                                                    <p style="margin: 0 0 2px; font-size: 11px; color: rgba(251,255,254,0.4); text-transform: uppercase; letter-spacing: 0.5px;">IM Number</p>
                                                    <p style="margin: 0; font-size: 14px; color: rgba(251,255,254,0.85);">{m_im}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 8px;">
                                                    <p style="margin: 0 0 2px; font-size: 11px; color: rgba(251,255,254,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Phone</p>
                                                    <p style="margin: 0; font-size: 14px; color: rgba(251,255,254,0.85);">{m_phone}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
            """
        members_html += """
                            <!-- Spacer after members -->
                            <div style="height: 20px;"></div>
        """

    template = load_template("welcome_email.html")
    if template:
        body = template.replace("{{name}}", html.escape(name))
        body = body.replace("{{email}}", html.escape(to_email).replace("@", "&#64;"))
        body = body.replace("{{phone}}", html.escape(phone))
        body = body.replace("{{leader_im}}", html.escape(leader_im))
        body = body.replace("{{team_name}}", html.escape(team_name))
        body = body.replace("{{members_section}}", members_html)
    else:
        body = f"""
        <p>Registration Successful!</p>
        <p>Hi {name}, welcome to ideasprint 2026!</p>
        <ul>
            <li>Team Name: {team_name}</li>
            <li>Leader Name: {name}</li>
            <li>IM Number: {leader_im}</li>
            <li>Email: {to_email}</li>
            <li>Phone: {phone}</li>
        </ul>
        """

    logger.info(f"Sending welcome email to {to_email}")
    return await send_email(to_email, subject, body)


async def send_submission_success_email(
    to_email: str,
    name: str,
    team_name: str,
):
    subject = "Proposal Submission Successful - ideasprint 2026"

    template = load_template("submission_success.html")
    if template:
        body = template.replace("{{name}}", html.escape(name))
        body = body.replace("{{team_name}}", html.escape(team_name))
    else:
        body = f"""
        <p>Proposal Submission Successful!</p>
        <p>Hi {html.escape(name)},</p>
        <p>Your proposal for team <b>{html.escape(team_name)}</b> has been successfully submitted for ideasprint 2026.</p>
        <p>Thank you for participating!</p>
        """

    logger.info(f"Sending submission success email to {to_email}")
    return await send_email(to_email, subject, body)
