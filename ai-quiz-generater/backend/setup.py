C:\path\to\venv\Scripts\python.exe -m pip install --upgrade pip setuptools

try:
    from setuptools import setup, find_packages
except ImportError:
    raise ImportError("setuptools is required to run this setup script; please install it with 'pip install setuptools'.")

setup(
    name="ai-quiz-generator",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn[standard]",
        "sqlalchemy",
        "python-dotenv",
        "requests",
        "beautifulsoup4",
        "pydantic",
        "langchain-core",
        "langchain-community",
        "langchain-google-genai",
    ],
)