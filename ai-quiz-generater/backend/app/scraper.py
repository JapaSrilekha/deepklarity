import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re
WIKI_DOMAINS = {"en.wikipedia.org"}
def is_wikipedia(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.netloc in WIKI_DOMAINS
    except:
        return False
def scrape_wikipedia(url: str):
    if not is_wikipedia(url):
        raise ValueError("Only en.wikipedia.org URLs are supported.")
    headers = {"User-Agent": "deepklarity-ai-quiz-generator/1.0"}
    r = requests.get(url, headers=headers, timeout=15)
    r.raise_for_status()
    html = r.text
    soup = BeautifulSoup(html, "html.parser")
    title_el = soup.find(id="firstHeading")
    title = title_el.get_text(strip=True) if title_el else ""
    content_div = soup.find(id="mw-content-text") or soup.find("article") or soup
    for selector in ["table", ".infobox", ".navbox", ".vertical-navbox", "sup", "script", "style", ".reference", ".mw-references-wrap", ".thumb"]:
        for el in content_div.select(selector):
            el.decompose()
    paragraphs = []
    for p in content_div.find_all("p"):
        text = p.get_text(separator=" ", strip=True)
        if not text:
            continue
        if len(text) < 30:
            continue
        paragraphs.append(re.sub(r"\[\d+\]", "", text))
    cleaned = "\n\n".join(paragraphs)
    sections = []
    for h in content_div.find_all(["h2","h3"]):
        if h.span:
            name = h.span.get_text(strip=True)
            if name and name.lower() not in ("references","external links","see also","further reading"):
                sections.append(name)
    return title, html, cleaned, sections
