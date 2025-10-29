// // components/Post/CreatePostModal.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { postApi } from '@/lib/api'; // Import your POST utility
// import { CreatePostDto } from '@/lib/types/post'; // <-- CHANGED: Import CreatePostDto from lib/types/post
// import LoadingSpinner from '@/components/UI/LoadingSpinner'; // Import your loading spinner component
// import { useAuth } from '@/context/AuthContext'; // To get current user ID for post creation
// import { log } from 'console';

// interface CreatePostModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onPostCreated?: () => void; // Optional callback to refetch posts after creation
// }

// const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
//   const { user, isLoading: authLoading } = useAuth(); // Get user for context (though userId is from backend)
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [imageUrl, setImageUrl] = useState('');
//   const [tagsInput, setTagsInput] = useState(''); // Raw input for tags (e.g., "tag1, tag2")
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Close modal if not open
//   useEffect(() => {
//     if (!isOpen) {
//       // Reset form when modal closes
//       setTitle('');
//       setContent('');
//       setImageUrl('');
//       setTagsInput('');
//       setError(null);
//       setIsSubmitting(false);
//     }
//   }, [isOpen]);

//   // Handle outside click to close modal
//   const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isSubmitting || authLoading || !user) return; // Prevent double submission or if user not loaded

//     setIsSubmitting(true);
//     setError(null);

//     // Prepare tags: split by comma, trim whitespace, filter out empty strings
//     const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

//     const tagsJson = JSON.stringify(tagsArray);

//     const newPost: CreatePostDto = {
//       title,
//       content,
//       imageUrl: imageUrl || null, // Send null if empty string
//       tagsJson, // Include tags
//     };

//     try {
//       // Assuming your backend has a POST /api/posts endpoint
//       // The backend will automatically get the UserId from the JWT
//       console.log('Creating post:', newPost);
//       await postApi('/posts', newPost); // Your backend endpoint
//       console.log('Post created successfully!');
//       onClose(); // Close the modal
//       onPostCreated?.(); // Trigger optional refetch in parent
//     } catch (err: any) {
//       console.error('Error creating post:', err);
//       setError(err.message || 'Failed to create post. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null; // Don't render anything if modal is not open

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//       onClick={handleOverlayClick}
//     >
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
//           aria-label="Close modal"
//         >
//           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>

//         {/* Modal Header */}
//         <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Create a Post</h2>

//         {/* Error Display */}
//         {error && (
//           <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
//         )}

//         {/* Post Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Title Input */}
//           <div>
//             <label htmlFor="post-title" className="sr-only">Post Title</label>
//             <input
//               id="post-title"
//               type="text"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
//               placeholder="Title (e.g., 'Exciting New Project!')"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//               disabled={isSubmitting}
//             />
//           </div>

//           {/* Content Textarea */}
//           <div>
//             <label htmlFor="post-content" className="sr-only">Post Content</label>
//             <textarea
//               id="post-content"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[100px]"
//               placeholder="What's on your mind? Share your thoughts..."
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               required
//               disabled={isSubmitting}
//             ></textarea>
//           </div>

//           {/* Image URL Input */}
//           <div>
//             <label htmlFor="post-image-url" className="sr-only">Image URL</label>
//             <input
//               id="post-image-url"
//               type="url"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Optional: Image URL (e.g., https://example.com/image.jpg)"
//               value={imageUrl}
//               onChange={(e) => setImageUrl(e.target.value)}
//               disabled={isSubmitting}
//             />
//           </div>

//           {/* Tags Input */}
//           <div>
//             <label htmlFor="post-tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
//             <input
//               id="post-tags"
//               type="text"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="e.g., React, Next.js, AI"
//               value={tagsInput}
//               onChange={(e) => setTagsInput(e.target.value)}
//               disabled={isSubmitting}
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors flex items-center justify-center"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <>
//                 <LoadingSpinner className="mr-2" /> Posting...
//               </>
//             ) : (
//               'Post'
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreatePostModal;

// components/Post/CreatePostModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { postApi } from '@/lib/api';
import { CreatePostDto } from '@/lib/types/post';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { Rss, Image as ImageIcon, Briefcase, ChevronDown } from 'lucide-react'; // Import icons
import { useUserProfile } from '@/hooks/useUserProfile';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  onOpenCreatePoll?: () => void; // New prop to open the poll modal
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated, onOpenCreatePoll }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { userProfile, isLoading: isProfileLoading, isError: profileError } = useUserProfile();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setImageUrl('');
      setTagsInput('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading || !user) return;

    setIsSubmitting(true);
    setError(null);

    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const newPost: CreatePostDto = {
      title: "",
      content,
      imageUrl: imageUrl || null,
      tagsJson: tagsArray,
    };

    try {
      await postApi('/posts', newPost);
      onClose();
      onPostCreated?.();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePollClick = () => {
    onClose(); // Close this modal
    onOpenCreatePoll?.(); // Open the poll modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col h-[600px]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create a Post</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info Section */}
        <div className="flex items-center p-6 pb-2">
          <div className="w-12 h-12 shrink-0">
            {userProfile?.profilePictureUrl ? (
              <Image
                src={userProfile?.profilePictureUrl}
                alt={userProfile?.username}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{userProfile?.firstName} {userProfile?.lastName}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">{userProfile?.headline}</span>
              <ChevronDown size={16} className="ml-1" />
            </div>
          </div>
        </div>

        {/* Post Form - Main content area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 pt-0">
          {/* Content Textarea */}
          <div className="flex-1 min-h-[150px]">
            <textarea
              className="w-full h-full p-2 text-lg border-none focus:ring-0 resize-none placeholder:text-gray-500"
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          {/* Tags Input */}
          <div className="mt-4">
            <label htmlFor="post-tags" className="sr-only">Tags</label>
            <input
              id="post-tags"
              type="text"
              className="w-full p-2 border-t border-b border-gray-300 focus:outline-none focus:ring-0 placeholder:text-gray-500"
              placeholder="#Add tags (e.g., React, AI)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Error Display */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          {/* Action Buttons Section */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200">
            {/* Left side icons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                title="Add an image"
                onClick={() => alert("Image upload functionality coming soon.")}
              >
                <ImageIcon size={20} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                title="Add a document"
                onClick={() => alert("Document upload functionality coming soon.")}
              >
                <Briefcase size={20} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                title="Create a poll"
                onClick={handleCreatePollClick}
              >
                <Rss size={20} />
              </button>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full transition-colors flex items-center justify-center"
              disabled={isSubmitting || content.trim().length === 0}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" /> Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;