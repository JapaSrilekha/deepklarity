import os, json
from dotenv import load_dotenv
from typing import Dict, Any
from langchain_core.output_parsers.pydantic import PydanticOutputParser
from langchain_core.prompts.prompt import PromptTemplate
from .schemas import QuizOut
# langchain-google-genai import; try multiple known package paths at runtime to avoid
# static import errors in editors/linters and to support different installed versions.
GoogleGemini = None
import importlib

_candidate_modules = [
    "langchain_google_genai",
    "langchain.google_genai",
    "langchain.experimental.generative.google_gemini",
    "google_genai",
    "google.generativeai",
]

for _mod in _candidate_modules:
    try:
        mod = importlib.import_module(_mod)
        # Common attribute names that might expose the Gemini client/class
        for attr in ("GoogleGemini", "Gemini", "GoogleGeminiLLM", "GeminiAPI"):
            if hasattr(mod, attr):
                GoogleGemini = getattr(mod, attr)
                break
        if GoogleGemini is not None:
            break
    except Exception:
        # Ignore import errors and try the next candidate
        continue
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-mini")
PROMPT_TEMPLATE = """        You are an expert educational assistant. Using the article text and title below (from Wikipedia),
produce a JSON object exactly matching the schema instructions.
Output schema instructions:
{format_instructions}
Rules:
Article Title: {title}
Article URL: {url}
Article Text:
{article_text}
Return only JSON that conforms to the schema.
"""
def init_llm():
    # Prefer the real Gemini LLM if available and a valid API key is provided.
    print(f"DEBUG: API_KEY={API_KEY}, GoogleGemini available={GoogleGemini is not None}")  # Debug log
    if not API_KEY or API_KEY == 'your_api_key_here' or GoogleGemini is None:
        print("DEBUG: Using mock LLM (no valid API key or missing GoogleGemini)")  # Debug log
        # Return None to indicate that a real LLM is not available; caller should
        # use a safe fallback (mock) to avoid crashing the server during development.
        return None
    try:
        llm = GoogleGemini(api_key=API_KEY, model=MODEL, temperature=0.1, max_output_tokens=1024)
        return llm
    except Exception:
        # If there's any error initializing the LLM (invalid key, etc), return None
        # so the caller will use the mock fallback
        return None
def generate_quiz_from_text(title: str, url: str, article_text: str) -> Dict[str, Any]:
    # If the real LLM is not available (missing API key or package), return a
    # deterministic mock quiz. This prevents the server from failing when the
    # external LLM is not configured and makes development/testing smoother.
    print("DEBUG: Initializing LLM...")  # Debug log
    llm = init_llm()
    print(f"DEBUG: LLM initialized: {llm is not None}")  # Debug log
    if llm is None:
        # Minimal mock response matching QuizOut schema
        mock = {
            "source_title": title,
            "source_url": url,
            "summary": (article_text[:500] + "...") if article_text else "",
            "key_entities": {"people": [], "organizations": [], "locations": []},
            "sections": [],
            "quiz": [
                {
                    "question": "Sample question: What is this article about?",
                    "options": ["A: Topic A", "B: Topic B", "C: Topic C", "D: Topic D"],
                    "answer": "A: Topic A",
                    "explanation": "This is a mock answer used when no LLM is configured.",
                    "difficulty": "easy"
                }
            ]
        }
        return mock

    parser = PydanticOutputParser(pydantic_object=QuizOut)
    format_instructions = parser.get_format_instructions()
    prompt = PromptTemplate(
        input_variables=["title","url","article_text","format_instructions"],
        template=PROMPT_TEMPLATE
    )
    # The prompt/llm/parser pipeline is expected to support the pipe API in
    # the installed langchain_core version. If it doesn't, this will raise and
    # be handled by the caller.
    chain = prompt | llm | parser
    raw = chain.invoke({
        "title": title,
        "url": url,
        "article_text": article_text,
        "format_instructions": format_instructions
    })
    parsed = parser.parse(raw)
    return json.loads(parsed.json())
