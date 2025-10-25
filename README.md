# DeepKlarity — AI Wiki Quiz Generator
This archive contains a full-stack scaffold (FastAPI backend + React frontend) for the AI Wiki Quiz Generator.
## Quick steps
1. Unzip the package.
2. Backend:
   - cd backend
   - python -m venv venv
   - source venv/bin/activate   (Windows: venv\Scripts\activate)
   - pip install -r app/requirements.txt
   - copy .env.example to .env and edit if needed
   - uvicorn app.main:app --reload --port 8000
3. Frontend:
   - cd frontend
   - npm install
   - set VITE_API_BASE in frontend/.env if needed
   - npm run dev
4. Open the frontend and test generating quizzes with Wikipedia URLs.
## Notes
- The LLM integration requires a GEMINI_API_KEY set in backend/.env to use Gemini via langchain-google-genai.
- For quick testing you can use sqlite (default). Change DATABASE_URL for Postgres/MySQL.
