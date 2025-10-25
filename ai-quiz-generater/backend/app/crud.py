from .models import Quiz
from sqlalchemy.orm import Session
import json
def create_quiz(db: Session, url: str, title: str, scraped_html: str, scraped_content: str, quiz_json: dict):
    db_item = Quiz(
        url=url,
        title=title,
        scraped_html=scraped_html,
        scraped_content=scraped_content,
        full_quiz_data=json.dumps(quiz_json, ensure_ascii=False)
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
def list_history(db: Session):
    return db.query(Quiz).order_by(Quiz.date_generated.desc()).all()
def get_quiz(db: Session, quiz_id: int):
    return db.query(Quiz).filter(Quiz.id == quiz_id).first()
