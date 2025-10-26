import React, { useState, useRef, useEffect } from 'react';

export default function ArticleModal({ open, onClose, sections = [], html, onJumpToSection, className = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const contentRef = useRef(null);
  const printFrameRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      // Remove old highlights
      const content = contentRef.current;
      if (!content) return;

      const html = content.innerHTML;
      // Remove existing highlights
      const cleaned = html.replace(/<mark class="search-highlight">(.*?)<\/mark>/g, '$1');
      // Add new highlights
      const highlighted = cleaned.replace(
        new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        match => `<mark class="search-highlight">${match}</mark>`
      );
      content.innerHTML = highlighted;

      // Scroll to first highlight
      const firstHighlight = content.querySelector('.search-highlight');
      if (firstHighlight) {
        firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchTerm]);

  // Clear search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setHighlightedText('');
    }
  }, [open]);

  // Handle print
  const handlePrint = () => {
    // Create an iframe for clean printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    printFrameRef.current = iframe;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Write a clean document with just our content and styles
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Article Print</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
            .article-content { max-width: 800px; margin: 2em auto; padding: 0 1em; }
            h1, h2, h3 { margin-top: 1.5em; }
            p { margin: 1em 0; }
            @media print {
              .article-content { margin: 0 auto; }
            }
          </style>
        </head>
        <body>
          <div class="article-content">
            ${html}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Print and cleanup
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      printFrameRef.current = null;
    }, 100);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  if (!open) return null;

  return (
    <div className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white max-w-4xl w-full mx-4 p-4 rounded shadow max-h-[90vh] flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center pb-3 border-b sticky top-0 bg-white z-10">
          {/* Search */}
          <div className="flex-1 flex gap-2 items-center min-w-[200px]">
            <input
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search in article..."
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border rounded">
            <button
              onClick={handleZoomOut}
              className="px-2 py-1 text-sm hover:bg-gray-100 border-r"
              title="Zoom out"
            >
              −
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs"
              title="Reset zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="px-2 py-1 text-sm hover:bg-gray-100 border-l"
              title="Zoom in"
            >
              +
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
            title="Print article"
          >
            Print
          </button>

          {/* Jump to section */}
          {sections.length > 0 && (
            <select 
              onChange={e => onJumpToSection?.(e.target.value)}
              className="px-2 py-1 border rounded text-sm bg-white"
              value=""
            >
              <option value="" disabled>Jump to section...</option>
              {sections.map((section, idx) => (
                <option key={idx} value={section}>{section}</option>
              ))}
            </select>
          )}

          {/* Close button */}
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded text-sm">
            Close
          </button>
        </div>

        {/* Content */}
        <div className="mt-3 overflow-auto flex-1">
          <div 
            ref={contentRef}
            className="prose max-w-none article-content"
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease',
              width: `${(100 / (zoomLevel / 100))}%` // Maintain container width
            }}
          >
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <div className="text-sm text-gray-500">No article content available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}