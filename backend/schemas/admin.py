from pydantic import BaseModel


class AdminRegister(BaseModel):
    username: str
    password: str
    turnstile_token: str


class AdminLogin(BaseModel):
    username: str
    password: str
    turnstile_token: str


class AdminResponse(BaseModel):
    id: int
    username: str
    is_approved: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
