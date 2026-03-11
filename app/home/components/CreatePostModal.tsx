'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { postApi, put } from '@/lib/api';
import { CreatePostDto, UpdatePostDto, PostDto } from '@/lib/types/post';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { Image as ImageIcon } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { userProfile } = useUserProfile();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setTitle('');
      setTagsInput('');
      setError(null);
      setIsSubmitting(false);
      setPostImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }, [isOpen, preview]);

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

  const handleRemoveImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPostImage(null);
    setError(null);
    // Reset the file input
    const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading || !user) return;

    setError(null);

    // Validation: Title is mandatory
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    // Validation: Content is mandatory
    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    setIsSubmitting(true);

    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    try {
      // Step 1: Create the post first (without image)
      const newPost: CreatePostDto = {
        title: title.trim(),
        content: content.trim(),
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
            image: imageUrl,
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

  const closeModal = () => {
      setContent('');
      setTitle('');
      setTagsInput('');
      setError(null);
      setIsSubmitting(false);
      setPostImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Create a Post</h2>
          <button
            onClick={() => closeModal()}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info Section */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100 shrink-0">
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
            <h3 className="text-base font-semibold text-gray-900">{userProfile?.firstName} {userProfile?.lastName}</h3>
            <p className="text-sm text-gray-500">{userProfile?.headline}</p>
          </div>
        </div>

        {/* Post Form - Scrollable content area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-6 py-4 space-y-4 flex-1">
           {/* Title Input */}
           <div>
             <label htmlFor="post-title" className="sr-only">Post Title</label>
             <div className="flex items-center justify-between mb-1">
               <span className="text-sm font-medium text-gray-700">Title</span>
               <span className="text-xs text-red-500">*Required</span>
             </div>
             <input
               id="post-title"
               type="text"
               className={`w-full p-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold transition-colors ${
                 title.trim() ? 'border-green-300 bg-green-50' : 'border-gray-300'
               }`}
               placeholder="Title (e.g., 'Exciting New Project!')"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               required
               disabled={isSubmitting}
             />
             {/* {!title.trim() && (
               <p className="text-xs text-red-500 mt-1">Title is required</p>
             )} */}
           </div>
          {/* Content Textarea */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Content</span>
              <span className="text-xs text-red-500">*Required</span>
            </div>
            <textarea
              className={`w-full h-32 p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder:text-gray-500 transition-colors ${
                content.trim() ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isSubmitting}
            ></textarea>
            {/* {!content.trim() && (
              <p className="text-xs text-red-500 mt-1">Content is required</p>
            )} */}
          </div>
          
          {/* Tags Input */}
          <div className="mt-4">
            <label htmlFor="post-tags" className="sr-only">Tags</label>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Tags</span>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
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
            <p className="text-red-500 text-sm text-center mt-2 bg-red-50 p-2 rounded">{error}</p>
          )}

          {/* Image Preview - Only 1 image allowed */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Image</span>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            {preview && (
              <div className="relative w-fit">
                <img
                  src={preview}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-300"
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-md"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-xs text-gray-500 mt-2">1 image selected (max 1 allowed)</p>
              </div>
            )}
          </div>

          {/* Action Buttons Section */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
            {/* Left side icons */}
            <div className="flex items-center space-x-2">
              <label
                htmlFor="profile-image-upload"
                className={`cursor-pointer p-2 rounded-full inline-flex items-center justify-center transition-colors ${
                  postImage 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={postImage ? "Only 1 image allowed" : "Add an image"}
              >
                <ImageIcon size={20} />
              </label>

              <input
                id="profile-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={!!postImage}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || !title.trim() || !content.trim()}
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
          </div>
        </form>
      </div>
     </div>
  );
};

export default CreatePostModal;