from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict
class QuestionOut(BaseModel):
    question: str
    options: List[str] = Field(..., min_items=4, max_items=4)
    answer: str
    explanation: Optional[str] = None
    difficulty: Optional[str] = "medium"
class QuizOut(BaseModel):
    source_title: Optional[str]
    source_url: Optional[str]
    summary: str
    key_entities: Optional[Dict[str, List[str]]] = {}
    sections: Optional[List[str]] = []
    quiz: List[QuestionOut]
class GenerateRequest(BaseModel):
    url: HttpUrl
