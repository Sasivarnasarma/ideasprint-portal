from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.connection import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    level = Column(String, nullable=False, server_default="Level 1")
    idea = Column(String, nullable=True)
    leader_id = Column(Integer, ForeignKey("users.id"))
    youtube_link = Column(String, nullable=True)
    pdf_link = Column(String, nullable=True)

    leader = relationship("User", back_populates="team")
    members = relationship(
        "TeamMember", back_populates="team", cascade="all, delete-orphan"
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    im_number = Column(String, unique=True, nullable=False)

    team = relationship("Team", back_populates="members")
