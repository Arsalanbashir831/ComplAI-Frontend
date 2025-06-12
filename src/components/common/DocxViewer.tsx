'use client';

import { useEffect, useState } from 'react';
import mammoth from 'mammoth';

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
      className={`    rounded-lg ${containerClassName}`}
    >
      <h2 className={`text-2xl text-center font-bold mb-4 ${headingClassName}`}>
        {heading}
      </h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div
          className="prose prose-lg bg-white max-h-[500px] overflow-y-auto px-4 py-4 border rounded-md"
          style={{ scrollbarGutter: 'stable' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
