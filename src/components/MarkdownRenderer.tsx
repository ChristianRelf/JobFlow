import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Simple markdown renderer to avoid dependency issues
const parseMarkdown = (content: string): string => {
  if (!content) return '';
  
  try {
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background: #1f2937; color: #e5e7eb; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0;"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return content; // Return original content if parsing fails
  }
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500">No content available</p>
      </div>
    );
  }

  let htmlContent;
  try {
    htmlContent = parseMarkdown(content);
    // Wrap in paragraphs if not already wrapped
    if (!htmlContent.includes('<p>') && !htmlContent.includes('<h1>') && !htmlContent.includes('<h2>') && !htmlContent.includes('<h3>')) {
      htmlContent = `<p>${htmlContent}</p>`;
    }
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error rendering content. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`prose prose-lg max-w-none leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        lineHeight: '1.8',
        fontSize: '17px',
        color: '#374151'
      }}
    />
  );
};

export default MarkdownRenderer;