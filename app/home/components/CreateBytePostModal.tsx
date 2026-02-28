'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { postApi } from '@/lib/api';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

interface CreateByteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBytePostCreated?: () => void;
}

const CLOUDINARY_CLOUD_NAME = 'db65bnadc';
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_DURATION = 30; // 30 seconds
const UPLOAD_SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB for upload

const CreateByteModal: React.FC<CreateByteModalProps> = ({ isOpen, onClose, onBytePostCreated }) => {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const [byteFile, setByteFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const validateVideoFile = (file: File): string | null => {
    // Check file size
    if (file.size > UPLOAD_SIZE_LIMIT) {
      return `File size exceeds 50 MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      return 'Please select a valid video file.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const validationError = validateVideoFile(file);
      if (validationError) {
        setError(validationError);
        setByteFile(null);
        return;
      }

      // Check video duration
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        if (video.duration > MAX_VIDEO_DURATION) {
          setError(`Video duration exceeds 30 seconds limit. Current duration: ${Math.round(video.duration)}s`);
          setByteFile(null);
          setVideoDuration(null);
        } else {
          setByteFile(file);
          setVideoDuration(video.duration);
          setError(null);
        }
      };
      video.onerror = () => {
        setError('Unable to read video file. Please try another file.');
        setByteFile(null);
        setVideoDuration(null);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading || !user || !byteFile) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Get signed upload credentials from backend
      const signatureResponse = await postApi<any>('/cloudinary/get-signature', {
        resourceType: 'video',
      });

      if (!signatureResponse || !signatureResponse.signature) {
        throw new Error('Failed to get upload signature from server');
      }

      // Step 2: Upload the file to Cloudinary with signature
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', byteFile);
      cloudinaryFormData.append('signature', signatureResponse.signature);
      cloudinaryFormData.append('timestamp', signatureResponse.timestamp);
      cloudinaryFormData.append('api_key', signatureResponse.apiKey);
      cloudinaryFormData.append('public_id', signatureResponse.publicId);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
      
      const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      if (!cloudinaryResponse.ok) {
        throw new Error('Failed to upload video to Cloudinary.');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const mediaUrl = cloudinaryData.secure_url;
      // Create a thumbnail URL using Cloudinary transformations
      const thumbnailUrl = cloudinaryData.secure_url.replace(/\.mp4$/, '.jpg');

      // Step 3: Send the URLs to your backend
      const backendPayload = {
        Title: title,
        Description: description,
        MediaUrl: mediaUrl,
        ThumbnailUrl: thumbnailUrl,
        CreatorPic: getProfileImageUrl(userProfile?.profilePictureUrl),
      };

      await postApi('/bytes/upload', backendPayload);

      onClose();
      onBytePostCreated?.();
    } catch (err: any) {
      console.error('Error during upload process:', err);
      setError(err.message || 'Failed to upload byte. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setTitle('');
    setDescription('');
    setByteFile(null);
    setError(null);
    setIsSubmitting(false);
    onClose();
    };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden bg-white rounded-xl text-left shadow-2xl transition-all w-full max-w-lg sm:w-full p-6">
          <button
            onClick={() => closeModal()}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Upload a Byte</h2>
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="byte-file" className="block text-sm font-medium text-gray-700">Video File</label>
            <input
              id="byte-file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
              disabled={isSubmitting}
            />
            {byteFile && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Selected: {byteFile.name}</p>
                <p>Size: {(byteFile.size / 1024 / 1024).toFixed(2)} MB / 10 MB</p>
                {videoDuration && <p>Duration: {Math.round(videoDuration)}s / 30s</p>}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="byte-title" className="sr-only">Title</label>
            <input
              id="byte-title"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
              placeholder="Title (e.g., 'My latest project in 60s!')"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="byte-description" className="sr-only">Description</label>
            <textarea
              id="byte-description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[100px]"
              placeholder="What do you want to say about this byte?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors flex items-center justify-center disabled:bg-indigo-400"
            disabled={isSubmitting || !byteFile || title.trim().length === 0 || description.trim().length === 0}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner /> Uploading...
              </>
            ) : (
              'Upload Byte'
            )}
          </button>
        </form>
      </div>
     </div>
    </div>
  );
};

export default CreateByteModal;