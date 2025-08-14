// components/Post/CreatePollModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { postApi } from '@/lib/api'; // Import your POST utility
import { CreatePollDto } from '@/lib/types/post';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void; // Optional callback to refetch posts after creation
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']); // Start with 2 options
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal if not open
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setImageUrl('');
      setTagsInput('');
      setOptions(['', '']);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading || !user) return;

    setIsSubmitting(true);
    setError(null);

    const filteredOptions = options.filter(option => option.trim() !== '');
    if (filteredOptions.length < 2) {
      setError('A poll must have at least 2 options.');
      setIsSubmitting(false);
      return;
    }

    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const newPoll: CreatePollDto = {
      title,
      content,
      imageUrl: imageUrl || null,
      tags,
      options: filteredOptions,
    };

    try {
      await postApi('/posts/poll', newPoll);
      onClose();
      onPostCreated?.();
    } catch (err: any) {
      console.error('Error creating poll:', err);
      setError(err.message || 'Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Create a Poll</h2>

        {error && (
          <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Question Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question for the community?"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add more context to your poll..."
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm resize-y"
              rows={3}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Add an image URL to your poll..."
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Poll Options</label>
            {options.map((option, index) => (
              <div key={index} className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm"
                  required
                  disabled={isSubmitting}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center text-blue-600 hover:underline text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Option
              </button>
            )}
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., #exams, #UPSC, #news"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner className="mr-2" /> : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
