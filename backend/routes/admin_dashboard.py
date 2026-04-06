from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database.connection import get_db
from helpers.security import decode_admin_access_token
from models.admin import Admin
from models.team import Team

router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBearer()


def get_current_admin(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    payload = decode_admin_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


def get_current_superadmin(admin_data: dict = Depends(get_current_admin)):
    if admin_data.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Super Admin privileges required")
    return admin_data


@router.get("/auth/me")
async def get_me(admin_data: dict = Depends(get_current_admin)):
    return {"username": admin_data["username"], "role": admin_data["role"]}


@router.get("/dashboard/metrics")
async def get_dashboard_metrics(
    admin_data: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)
):
    total_registrations = await db.execute(select(func.count(Team.id)))
    total_reg_count = total_registrations.scalar() or 0

    total_proposals_query = await db.execute(
        select(func.count(Team.id))
        .where(Team.youtube_link != None)
        .where(Team.youtube_link != "")
        .where(Team.pdf_link != None)
        .where(Team.pdf_link != "")
    )
    total_prop_count = total_proposals_query.scalar() or 0

    total_admins_query = await db.execute(
        select(func.count(Admin.id)).where(Admin.is_approved == True)
    )
    total_admin_count = total_admins_query.scalar() or 0

    return {
        "total_registrations": total_reg_count,
        "total_proposals": total_prop_count,
        "total_admins": total_admin_count,
    }


@router.get("/teams")
async def get_all_teams(
    admin_data: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Team).options(selectinload(Team.members), selectinload(Team.leader))
    )
    teams = result.scalars().all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "level": t.level,
            "youtube_link": t.youtube_link,
            "pdf_link": t.pdf_link,
            "leader_name": t.leader.name if t.leader else None,
            "member_count": len(t.members) + (1 if t.leader else 0),
        }
        for t in teams
    ]


@router.get("/teams/{team_id}")
async def get_team_details(
    team_id: int,
    admin_data: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Team)
        .where(Team.id == team_id)
        .options(selectinload(Team.members), selectinload(Team.leader))
    )
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")

    return {
        "id": t.id,
        "name": t.name,
        "level": t.level,
        "idea": t.idea,
        "youtube_link": t.youtube_link,
        "pdf_link": t.pdf_link,
        "leader": {
            "id": t.leader.id,
            "name": t.leader.name,
            "email": t.leader.email,
            "phone": t.leader.phone,
            "im_number": t.leader.im_number,
        }
        if t.leader
        else None,
        "members": [
            {"id": m.id, "name": m.name, "phone": m.phone, "im_number": m.im_number}
            for m in t.members
        ],
    }


@router.get("/admins")
async def get_all_admins(
    admin_data: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Admin))
    admins = result.scalars().all()
    return [
        {
            "id": a.id,
            "username": a.username,
            "is_approved": a.is_approved,
            "created_at": a.created_at,
        }
        for a in admins
    ]


@router.post("/admins/{admin_id}/approve")
async def approve_admin(
    admin_id: int,
    admin_data: dict = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    db_admin = result.scalars().first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    db_admin.is_approved = True
    await db.commit()
    return {"message": "Admin approved successfully"}


@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    admin_data: dict = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    db_admin = result.scalars().first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    await db.delete(db_admin)
    await db.commit()
    return {"message": "Admin removed successfully"}
