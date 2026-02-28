// components/UserProfile/EditExamAttemptForm.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserExamAttempt, UpdateUserExamAttemptDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';

interface EditExamAttemptFormProps {
  examAttempt: UserExamAttempt | null;
  onClose: (newItem?: UserExamAttempt) => void;
}

const EditExamAttemptForm: React.FC<EditExamAttemptFormProps> = ({ examAttempt, onClose }) => {
  const { addExamAttempt, updateExamAttempt } = useUserProfile();
  const [formData, setFormData] = useState<UpdateUserExamAttemptDto>({
    examName: examAttempt?.examName || '',
    year: examAttempt?.year || null,
    result: examAttempt?.result || '',
    remarks: examAttempt?.remarks || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const dataToSend: UpdateUserExamAttemptDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      ) as UpdateUserExamAttemptDto;

      let savedItem: UserExamAttempt;
      if (examAttempt) {
        await updateExamAttempt(examAttempt.id, dataToSend);
        savedItem = { ...examAttempt, ...dataToSend };
      } else {
        savedItem = await addExamAttempt(dataToSend);
      }
      onClose(savedItem);
    } catch (err: any) {
      setError(err.message || "Failed to save exam attempt.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">{examAttempt ? 'Edit Exam Attempt' : 'Add New Exam Attempt'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="examName" className="block text-gray-700 text-sm font-bold mb-2">Exam Name</label>
              <input type="text" id="examName" name="examName" value={formData.examName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Year</label>
              <input type="number" id="year" name="year" value={formData.year || ''} onChange={handleChange} className="form-input" placeholder="e.g., 2023" />
            </div>
            <div>
              <label htmlFor="result" className="block text-gray-700 text-sm font-bold mb-2">Result</label>
              <input type="text" id="result" name="result" value={formData.result || ''} onChange={handleChange} className="form-input" placeholder="e.g., Qualified Mains, Not Qualified" />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-gray-700 text-sm font-bold mb-2">Remarks</label>
              <textarea id="remarks" name="remarks" value={formData.remarks || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
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

export default EditExamAttemptForm;