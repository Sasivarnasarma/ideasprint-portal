from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    im_number = Column(String, unique=True, nullable=True)

    team = relationship("Team", back_populates="leader", uselist=False)
