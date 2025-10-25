from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base
class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False, index=True)
    title = Column(String, nullable=True)
    date_generated = Column(DateTime(timezone=True), server_default=func.now())
    scraped_html = Column(Text, nullable=True)
    scraped_content = Column(Text, nullable=True)
    full_quiz_data = Column(Text, nullable=False)
