import os, json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.database import engine
from app.models import Base as ModelsBase
from app.schemas import GenerateRequest
from app.scraper import scrape_wikipedia
from app.llm import generate_quiz_from_text
from app.crud import create_quiz, list_history, get_quiz
from app.utils import get_db
load_dotenv()
ModelsBase.metadata.create_all(bind=engine)
app = FastAPI(title="DeepKlarity AI Wiki Quiz Generator")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Verify the application can start up correctly."""
    import sys
    print("Starting application...", file=sys.stderr)
    try:
        # Test database connection
        from sqlalchemy import text
        db = next(get_db())
        db.execute(text("SELECT 1"))
        print("Database connection successful", file=sys.stderr)
    except Exception as e:
        print(f"Database connection failed: {e}", file=sys.stderr)
        raise

    # Test LLM initialization
    from app.llm import init_llm
    llm = init_llm()
    print(f"LLM initialization: {'mock' if llm is None else 'real'}", file=sys.stderr)


@app.post("/generate_quiz")
async def generate_quiz(req: GenerateRequest, db: Session = Depends(get_db)):
    """Generate a quiz from a Wikipedia URL."""
    # Convert Pydantic HttpUrl to string
    req_url_str = str(req.url)
    
    try:
        from app.scraper import scrape_wikipedia
        from app.llm import generate_quiz_from_text
        
        # Get the article content
        try:
            title, html, cleaned, sections = scrape_wikipedia(req_url_str)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to scrape article: {str(e)}"
            )
            
        # Generate the quiz
        try:
            quiz_json = generate_quiz_from_text(title=title, url=req_url_str, article_text=cleaned)
            quiz_json["sections"] = sections
            quiz_json["source_title"] = title
            quiz_json["source_url"] = req_url_str
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate quiz: {str(e)}"
            )
            
        # Save to database
        try:
            db_item = create_quiz(
                db=db,
                url=req_url_str,
                title=title,
                scraped_html=html,
                scraped_content=cleaned,
                quiz_json=quiz_json
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save quiz: {str(e)}"
            )
            
        return quiz_json
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

        try:
            print("DEBUG: Starting quiz generation")  # Debug log
            quiz_json = generate_quiz_from_text(title=title, url=req_url_str, article_text=cleaned)
            print("DEBUG: Quiz generation successful")  # Debug log
        except Exception as e:
            print(f"DEBUG: Quiz generation failed: {str(e)}")  # Debug log
            traceback.print_exc()  # Print full traceback for debugging
            raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")

        quiz_json["sections"] = sections if sections else quiz_json.get("sections", [])
        quiz_json["source_title"] = title
        quiz_json["source_url"] = req_url_str

        try:
            print("DEBUG: Saving to database")  # Debug log
            db_item = create_quiz(db=db, url=req_url_str, title=title, scraped_html=html, scraped_content=cleaned, quiz_json=quiz_json)
            print("DEBUG: Save successful")  # Debug log
        except Exception as e:
            print(f"DEBUG: Database save failed: {str(e)}")  # Debug log
            traceback.print_exc()  # Print full traceback for debugging
            raise HTTPException(status_code=500, detail=f"Database save failed: {str(e)}")

        return quiz_json

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        # Catch any unexpected errors and convert to 500
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
@app.get("/history")
def history(db: Session = Depends(get_db)):
    items = list_history(db)
    return [
        {"id": i.id, "url": i.url, "title": i.title, "date_generated": i.date_generated.isoformat()}
        for i in items
    ]
@app.get("/quiz/{quiz_id}")
def read_quiz(quiz_id: int, db: Session = Depends(get_db)):
    item = get_quiz(db, quiz_id)
    if not item:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {
        "id": item.id,
        "url": item.url,
        "title": item.title,
        "date_generated": item.date_generated,
        "scraped_html": item.scraped_html,
        "scraped_content": item.scraped_content,
        "quiz": json.loads(item.full_quiz_data)
    }


@app.post("/_debug_is_wiki")
def debug_is_wiki(payload: dict):
    """Temporary debug endpoint to inspect URL parsing and is_wikipedia result."""
    url = payload.get("url")
    from app.scraper import is_wikipedia
    from urllib.parse import urlparse
    parsed = urlparse(url) if url else None
    return {"url": url, "is_wiki": is_wikipedia(url) if url else False, "parsed_netloc": parsed.netloc if parsed else None}
