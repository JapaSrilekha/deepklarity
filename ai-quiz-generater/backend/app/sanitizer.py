from bs4 import BeautifulSoup
import re

def sanitize_html(html: str) -> str:
    """
    Clean and sanitize HTML content:
    - Remove scripts, iframes, and other potentially dangerous elements
    - Strip inline styles and event handlers
    - Remove navigation elements, ads, and other non-content sections
    - Keep main article content with basic formatting (p, h1-h6, ul, ol, etc.)
    """
    if not html:
        return ""

    # Parse HTML
    soup = BeautifulSoup(html, 'html.parser')

    # Remove potentially dangerous elements
    for tag in soup.find_all(['script', 'iframe', 'style', 'noscript']):
        tag.decompose()

    # Remove common navigation/sidebar elements
    selectors = [
        '#mw-navigation', '.mw-jump-link', '#mw-head',  # Wikipedia nav
        '.navigation', '.nav', '.navbar', '.header', '.footer',
        '.sidebar', '.ad', '.advertisement',
        '#toc',  # table of contents (we handle sections separately)
        '.mw-editsection',  # Wikipedia edit links
    ]
    for selector in selectors:
        for element in soup.select(selector):
            element.decompose()

    # Remove all inline styles and event handlers
    for tag in soup.find_all(True):
        # Remove style attribute and on* event handlers
        attrs_to_remove = [attr for attr in tag.attrs if attr == 'style' or attr.startswith('on')]
        for attr in attrs_to_remove:
            del tag[attr]

        # Remove class attributes (optional - uncomment if you want to strip classes)
        # if 'class' in tag.attrs:
        #     del tag['class']

    # Extract and clean main content
    main_content = soup.find('div', id='mw-content-text') or soup.find('main') or soup.find('article') or soup
    
    # Convert to string and clean up whitespace
    html = str(main_content)
    html = re.sub(r'\s+', ' ', html)  # normalize whitespace
    html = re.sub(r'>\s+<', '><', html)  # remove whitespace between tags

    return html

def extract_text_content(html: str) -> str:
    """Extract clean text content from HTML for text-only display."""
    if not html:
        return ""
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Remove unwanted elements
    for tag in soup(['script', 'style', 'nav', 'header', 'footer']):
        tag.decompose()
    
    # Get text and normalize whitespace
    text = soup.get_text(separator='\n')
    text = re.sub(r'\n\s*\n', '\n\n', text)  # collapse multiple newlines
    text = text.strip()
    
    return text