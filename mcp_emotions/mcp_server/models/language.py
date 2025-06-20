from sqlalchemy import Column, Integer, String
from db.base import Base

class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(5), unique=True, nullable=False)
    name = Column(String(50), nullable=False) 