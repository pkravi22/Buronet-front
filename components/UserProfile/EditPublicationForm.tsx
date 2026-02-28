// components/UserProfile/EditPublicationForm.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserPublication, UpdateUserPublicationDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';
import { toDateOnly } from '@/lib/dates';

interface EditPublicationFormProps {
  publication: UserPublication | null;
  onClose: (newItem?: UserPublication) => void;
}

const EditPublicationForm: React.FC<EditPublicationFormProps> = ({ publication, onClose }) => {
  const { addPublication, updatePublication } = useUserProfile();
  const [formData, setFormData] = useState<UpdateUserPublicationDto>({
    title: publication?.title || '',
    journalConference: publication?.journalConference || '',
    publicationDate: toDateOnly(publication?.publicationDate) || '',
    url: publication?.url || '',
    abstract: publication?.abstract || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const dataToSend: UpdateUserPublicationDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      ) as UpdateUserPublicationDto;

      let savedItem: UserPublication;
      if (publication) {
        await updatePublication(publication.id, dataToSend);
        savedItem = { ...publication, ...dataToSend };
      } else {
        savedItem = await addPublication(dataToSend);
      }
      onClose(savedItem);
    } catch (err: any) {
      setError(err.message || "Failed to save publication.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">{publication ? 'Edit Publication' : 'Add New Publication'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="journalConference" className="block text-gray-700 text-sm font-bold mb-2">Journal/Conference</label>
              <input type="text" id="journalConference" name="journalConference" value={formData.journalConference || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="publicationDate" className="block text-gray-700 text-sm font-bold mb-2">Publication Date</label>
              <input type="date" id="publicationDate" name="publicationDate" value={formData.publicationDate || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="url" className="block text-gray-700 text-sm font-bold mb-2">URL</label>
              <input type="url" id="url" name="url" value={formData.url || ''} onChange={handleChange} className="form-input" placeholder="https://example.com/publication" />
            </div>
            <div>
              <label htmlFor="abstract" className="block text-gray-700 text-sm font-bold mb-2">Abstract</label>
              <textarea id="abstract" name="abstract" value={formData.abstract || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPublicationForm;