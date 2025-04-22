import { useState } from 'react';
import { BsCloudCheck } from 'react-icons/bs';

export const DocumentInput = ({ initialTitle = 'Untitled Document' }) => {
  const [title, setTitle] = useState(initialTitle);
  const [isSaved, setIsSaved] = useState(true); // Initially saved

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsSaved(false); // Mark as unsaved
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="text-lg px-0.1 cursor-pointer truncate bg-transparent border-none outline-none"
        title="Document title"
        aria-label="Document title"
      />
      {isSaved ? (
        <BsCloudCheck className="text-green-500" title="Saved" />
      ) : (
        <BsCloudCheck className="text-gray-500" title="Unsaved" />
      )}
    </div>
  );
};
