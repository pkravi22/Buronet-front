'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { postApi, put } from '@/lib/api';
import { CreatePostDto, UpdatePostDto, PostDto } from '@/lib/types/post';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
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
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setImageUrl('');
      setTagsInput('');
      setError(null);
      setIsSubmitting(false);
      setPostImage(null);
      setPreview(null);
    }
  }, [isOpen]);

  // Avoid leaking object URLs when user changes/removes the selected image.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const MAX_FILE_SIZE_MB = 2;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only images
    if (!file.type?.startsWith('image/') || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Only image files (JPG, PNG, WEBP, GIF) are allowed.');
      setPostImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      e.target.value = '';
      return;
    }

    // Max size: 2MB
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError('Image must be 2MB or smaller.');
      setPostImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      e.target.value = '';
      return;
    }

    // Valid file — proceed
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setPostImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading || !user) return;

    setIsSubmitting(true);
    setError(null);

    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    try {
      // Step 1: Create the post first (without image)
      const newPost: CreatePostDto = {
        title: title || content.substring(0, 50),
        content,
        image: null,
        tagsJson: tagsArray,
        isPoll: false,
      };

      const createdPost = await postApi<PostDto>('/posts', newPost);

      // Step 2: If there's an image, upload to Cloudinary and update the post
      if (preview && postImage && createdPost?.id) {
        try {
          // Get signed upload credentials from backend
          const signatureResponse = await postApi<any>('/cloudinary/get-signature', {
            resourceType: 'image',
          });

          if (!signatureResponse || !signatureResponse.signature) {
            throw new Error('Failed to get upload signature from server');
          }

          // Upload to Cloudinary with signature
          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append('file', postImage);
          cloudinaryFormData.append('signature', signatureResponse.signature);
          cloudinaryFormData.append('timestamp', signatureResponse.timestamp);
          cloudinaryFormData.append('api_key', signatureResponse.apiKey);
          cloudinaryFormData.append('upload_preset', signatureResponse.uploadPreset);
          cloudinaryFormData.append('public_id', signatureResponse.publicId);

          const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureResponse.cloudName}/image/upload`;

          const cloudinaryResponse = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: cloudinaryFormData,
          });

          if (!cloudinaryResponse.ok) {
            console.warn('Failed to upload image to Cloudinary, but post was created');
            onClose();
            onPostCreated?.();
            return;
          }

          const cloudinaryData = await cloudinaryResponse.json();
          const imageUrl = cloudinaryData.secure_url;

          // Update post with image URL
          const updateDto: UpdatePostDto = {
            title: createdPost.title,
            content: createdPost.content,
            imageUrl: imageUrl,
          };

          await put(`/posts/${createdPost.id}`, updateDto);
        } catch (imageErr) {
          console.warn('Image upload failed, but post was created:', imageErr);
        }
      }

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

  const closeModal = () => {
      setContent('');
      setImageUrl('');
      setTagsInput('');
      setError(null);
      setIsSubmitting(false);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50" onClick={handleOverlayClick}>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden bg-white rounded-xl text-left shadow-2xl transition-all w-full max-w-lg sm:w-full flex flex-col h-[600px]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create a Post</h2>
          <button
            onClick={() => closeModal()}
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
            <Image
              src={getProfileImageUrl(userProfile?.profilePictureUrl)}
              alt={userProfile?.username || user?.username || 'User'}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{userProfile?.firstName} {userProfile?.lastName}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">{userProfile?.headline}</span>
              {/* <ChevronDown size={16} className="ml-1" /> */}
            </div>
          </div>
        </div>

        {/* Post Form - Main content area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 pt-0">
           {/* Title Input */}
           <div>
             <label htmlFor="post-title" className="sr-only">Post Title</label>
             <input
               id="post-title"
               type="text"
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
               placeholder="Title (e.g., 'Exciting New Project!')"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               required
               disabled={isSubmitting}
             />
           </div>
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

          {preview && (
            <img
              src={preview}
              className="w-20 h-20 rounded-full object-cover"
              alt="Preview"
            />
          )}

          {/* Action Buttons Section */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200">
            {/* Left side icons */}
            <div className="flex items-center space-x-2">
              <label
                htmlFor="profile-image-upload"
                className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-600 inline-flex items-center justify-center"
                title="Add an image"
              >
                <ImageIcon size={20} />
              </label>

              <input
                id="profile-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              {/*<button
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
              */}
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
    </div>
  );
};

export default CreatePostModal;