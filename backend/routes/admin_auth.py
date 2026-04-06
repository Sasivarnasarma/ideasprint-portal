import os

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.connection import get_db
from helpers.security import (create_admin_access_token,
                              decode_admin_access_token, get_password_hash,
                              verify_password)
from helpers.turnstile import verify_turnstile
from models.admin import Admin
from schemas.admin import AdminLogin, AdminRegister, AdminResponse, Token

router = APIRouter(prefix="/admin", tags=["admin"])

SUPER_ADMIN_USERNAME = os.getenv("SUPER_ADMIN_USERNAME", "admin")
SUPER_ADMIN_PASSWORD = os.getenv("SUPER_ADMIN_PASSWORD", "adminpass")


@router.post("/auth/register")
async def register_admin(
    data: AdminRegister,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    turnstile_ok = await verify_turnstile(data.turnstile_token, request.client.host)
    if not turnstile_ok:
        raise HTTPException(status_code=400, detail="Turnstile verification failed.")

    result = await db.execute(select(Admin).where(Admin.username == data.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = get_password_hash(data.password)
    new_admin = Admin(
        username=data.username, password_hash=hashed_password, is_approved=False
    )
    db.add(new_admin)
    await db.commit()

    return {"message": "Registration successful. Please wait for approval."}


@router.post("/auth/login", response_model=Token)
async def login_admin(
    data: AdminLogin,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    turnstile_ok = await verify_turnstile(data.turnstile_token, request.client.host)
    if not turnstile_ok:
        raise HTTPException(status_code=400, detail="Turnstile verification failed.")

    if data.username == SUPER_ADMIN_USERNAME and data.password == SUPER_ADMIN_PASSWORD:
        access_token = create_admin_access_token(
            username=SUPER_ADMIN_USERNAME, role="superadmin"
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": "superadmin",
        }

    result = await db.execute(select(Admin).where(Admin.username == data.username))
    db_admin = result.scalars().first()

    if not db_admin or not verify_password(data.password, db_admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not db_admin.is_approved:
        raise HTTPException(
            status_code=403, detail="Account pending approval by a Admin"
        )

    access_token = create_admin_access_token(username=db_admin.username, role="admin")
    return {"access_token": access_token, "token_type": "bearer", "role": "admin"}
