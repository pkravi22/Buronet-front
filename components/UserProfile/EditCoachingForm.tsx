// components/UserProfile/EditCoachingForm.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserCoaching, UpdateUserCoachingDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';
import { toDateOnly } from '@/lib/dates';

interface EditCoachingFormProps {
  coaching: UserCoaching | null;
  onClose: () => void;
}

const EditCoachingForm: React.FC<EditCoachingFormProps> = ({ coaching, onClose }) => {
  const { addCoaching, updateCoaching } = useUserProfile();
  const [formData, setFormData] = useState<UpdateUserCoachingDto>({
    coachingInstitute: coaching?.coachingInstitute || '',
    courseName: coaching?.courseName || '',
    startDate: toDateOnly(coaching?.startDate) || '',
    endDate: toDateOnly(coaching?.endDate) || '',
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
      const dataToSend: UpdateUserCoachingDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      ) as UpdateUserCoachingDto;

      if (coaching) {
        await updateCoaching(coaching.id, dataToSend);
      } else {
        await addCoaching(dataToSend);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save coaching entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">{coaching ? 'Edit Coaching' : 'Add New Coaching'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="coachingInstitute" className="block text-gray-700 text-sm font-bold mb-2">Coaching Institute</label>
              <input type="text" id="coachingInstitute" name="coachingInstitute" value={formData.coachingInstitute} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="courseName" className="block text-gray-700 text-sm font-bold mb-2">Course Name</label>
              <input type="text" id="courseName" name="courseName" value={formData.courseName || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate || ''} onChange={handleChange} className="form-input" />
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

export default EditCoachingForm;