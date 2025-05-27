'use client';

import mammoth from 'mammoth';
import { useEffect, useState } from 'react';

export default function DocxViewer({
  filePath,
  heading = 'Document Viewer',
  containerClassName = '',
  headingClassName = '',
}: {
  filePath: string;
  heading?: string;
  containerClassName?: string;
  headingClassName?: string;
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocx = async () => {
      try {
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();

        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
      } catch (err) {
        console.error(err);
        setError('Failed to load document.');
      }
    };

    if (filePath) {
      fetchDocx();
    }
  }, [filePath]);

  return (
    <div
      className={`p-6 max-w-full mx-auto bg-white rounded-lg ${containerClassName}`}
    >
      <h2 className={`text-2xl font-bold mb-4 ${headingClassName}`}>
        {heading}
      </h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div
          className="prose prose-lg max-h-[500px] overflow-y-auto px-4 py-2 border rounded-md"
          style={{ scrollbarGutter: 'stable' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
