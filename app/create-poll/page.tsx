// app/create-poll/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth, withAuthRequired } from '../../context/AuthContext';
import { CreatePollDto } from '../../lib/types/post';
import { postApi } from '../../lib/api';

const CreatePollPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']); // Start with 2 options
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      image: imageUrl || null,
      tagsJson: tags,
      options: filteredOptions,
      isPoll : true,
    };

    try {
      await postApi('/posts/poll', newPoll);
      router.push('/home'); // Redirect to home feed after creating poll
    } catch (err: any) {
      console.error('Error creating poll:', err);
      setError(err.message || 'Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner /> <span className="ml-2 text-gray-700">Loading user data...</span>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
      router.push('/login'); // Redirect unauthenticated users
      return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#EEF0F4] py-8">
        <div className="max-w-xl mx-auto px-4 lg:px-8 bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Create a Poll</h1>
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="mt-2 flex items-center text-[#0096c7] hover:underline text-sm"
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
    </AppLayout>
  );
};

export default withAuthRequired(CreatePollPage);
