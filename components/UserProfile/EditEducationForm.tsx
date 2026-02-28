// components/UserProfile/EditEducationForm.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserEducation, UpdateUserEducationDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';
import { toDateOnly } from '@/lib/dates';

interface EditEducationFormProps {
  education: UserEducation | null;
  onClose: () => void;
}

const EditEducationForm: React.FC<EditEducationFormProps> = ({ education, onClose }) => {
  const { addEducation, updateEducation } = useUserProfile();
  const [formData, setFormData] = useState<UpdateUserEducationDto>({
    degree: education?.degree || '',
    major: education?.major || '',
    institution: education?.institution || '',
    startDate: toDateOnly(education?.startDate) || '',
    endDate: toDateOnly(education?.endDate) || '',
    description: education?.description || '',
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
      const dataToSend: UpdateUserEducationDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      ) as UpdateUserEducationDto;

      if (education) {
        await updateEducation(education.id, dataToSend);
      } else {
        await addEducation(dataToSend);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save education entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">{education ? 'Edit Education' : 'Add New Education'}</h2>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="degree" className="block text-gray-700 text-sm font-bold mb-2">Degree</label>
              <input type="text" id="degree" name="degree" value={formData.degree} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="major" className="block text-gray-700 text-sm font-bold mb-2">Major</label>
              <input type="text" id="major" name="major" value={formData.major || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="institution" className="block text-gray-700 text-sm font-bold mb-2">Institution</label>
              <input type="text" id="institution" name="institution" value={formData.institution} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => onClose()}
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

export default EditEducationForm;