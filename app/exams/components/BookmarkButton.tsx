// File: components/BookmarkButton.tsx
"use client";

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { postApi, remove } from '@/lib/api'; // Your API helper functions

interface BookmarkButtonProps {
  userId: string;
  jobId: string;
  initialIsBookmarked: boolean;
  size?: number; // Optional size prop for the icon
}

const BookmarkButton = ({ userId, jobId, initialIsBookmarked, size = 24 }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBookmark = async () => {
    setIsLoading(true);
    const originalState = isBookmarked;
    // Optimistic UI update
    setIsBookmarked(!originalState); 

    try {
      if (originalState) {
        // Un-bookmark the job
        await remove(`/jobs/${userId}/bookmarks/${jobId}`);
      } else {
        // Bookmark the job
        await postApi(`/jobs/${userId}/bookmarks`, { jobId });
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      // Revert on error
      setIsBookmarked(originalState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isLoading}
      title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
    >
      <Bookmark
            size={size}
        className={`transition-all ${isBookmarked ? 'text-[#0096c7] fill-cyan-600' : 'text-gray-500 hover:text-gray-800'}`}
      />
    </button>
  );
};

export default BookmarkButton;