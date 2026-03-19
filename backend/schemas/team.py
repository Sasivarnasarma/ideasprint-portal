from typing import List

from pydantic import BaseModel, Field


class TeamMemberSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., pattern=r"^07\d{8}$")
    im_number: str = Field(..., pattern=r"^IM/202\d/\d{3}$")


class TeamMemberResponse(BaseModel):
    id: int
    name: str
    phone: str

    class Config:
        from_attributes = True


class TeamRegisterStage3(BaseModel):
    team_name: str
    members: List[TeamMemberSchema]


class TeamResponse(BaseModel):
    id: int
    name: str
    leader_id: int
    members: List[TeamMemberResponse]

    class Config:
        from_attributes = True
