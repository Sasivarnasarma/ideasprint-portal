import re
from typing import List, Optional

from pydantic import (BaseModel, EmailStr, Field,
                      model_validator)
from schemas.team import TeamMemberSchema


class SendOTPRequest(BaseModel):
    email: EmailStr
    turnstile_token: str


class ResendOTPRequest(BaseModel):
    email: EmailStr
    captcha_session_token: str


class UserVerifyOTP(BaseModel):
    email: EmailStr
    otp: str
    captcha_session_token: str


class UserFullRegistration(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., pattern=r"^07\d{8}$")
    im_number: str = Field(..., pattern=r"^IM/202\d/\d{3}$")
    verification_token: str
    team_name: str = Field(..., min_length=2, max_length=25)
    level: str = Field(..., pattern=r"^Level [1-4]$")
    idea: Optional[str] = None
    members: List[TeamMemberSchema] = Field(..., min_length=2, max_length=4)

    @model_validator(mode="after")
    def check_uniqueness(self) -> "UserFullRegistration":
        names = [self.name.lower()]
        im_numbers = [self.im_number.lower()]

        for member in self.members:
            m_name = member.name.lower()
            m_im = member.im_number.lower()

            if m_name in names:
                raise ValueError(f"Duplicate name found in team: {member.name}")
            if m_im in im_numbers:
                raise ValueError(
                    f"Duplicate IM number found in team: {member.im_number}"
                )

            names.append(m_name)
            im_numbers.append(m_im)

        if self.level == "Level 1":
            if not self.idea or not self.idea.strip():
                raise ValueError("An idea is required for Level 1 teams.")

            # Rough word count estimation by splitting on whitespace
            word_count = len(self.idea.split())
            if word_count > 100:
                raise ValueError(
                    f"Idea must be 100 words or less. Currently {word_count} words."
                )

        return self
