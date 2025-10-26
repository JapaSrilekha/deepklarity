from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict


class QuestionOut(BaseModel):
    question: str
    options: List[str] = Field(..., min_items=4, max_items=4)
    answer: str
    explanation: Optional[str] = None
    difficulty: str = "medium"


class QuizOut(BaseModel):
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    summary: str
    key_entities: Dict[str, List[str]] = Field(default_factory=dict)
    sections: List[str] = Field(default_factory=list)
    quiz: List[QuestionOut]


class GenerateRequest(BaseModel):
    url: HttpUrl
