from pydantic import BaseModel, EmailStr, Field


class SendOTPRequest(BaseModel):
    email: EmailStr
    turnstile_token: str
    purpose: str = Field(..., description="Must be 'registration' or 'submission'")


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    captcha_session_token: str
    purpose: str = Field(..., description="Must be 'registration' or 'submission'")


class ResendOTPRequest(BaseModel):
    email: EmailStr
    captcha_session_token: str
    purpose: str = Field(..., description="Must be 'registration' or 'submission'")
