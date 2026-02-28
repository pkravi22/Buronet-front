// components/UserProfile/EditSkillForm.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserSkill, UpdateUserSkillDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';

interface EditSkillFormProps {
  skill: UserSkill | null; // Null for new, object for edit
  onClose: () => void;
}

const EditSkillForm: React.FC<EditSkillFormProps> = ({ skill, onClose }) => {
  const { addSkill, updateSkill } = useUserProfile();
  const [formData, setFormData] = useState<UpdateUserSkillDto>({
    skillName: skill?.skillName || '',
    level: skill?.level || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const dataToSend: UpdateUserSkillDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      ) as UpdateUserSkillDto;

      if (skill) {
        await updateSkill(skill.id, dataToSend);
      } else {
        await addSkill(dataToSend);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save skill.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">{skill ? 'Edit Skill' : 'Add New Skill'}</h2>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="skillName" className="block text-gray-700 text-sm font-bold mb-2">Skill Name</label>
              <input type="text" id="skillName" name="skillName" value={formData.skillName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="level" className="block text-gray-700 text-sm font-bold mb-2">Level</label>
              <select id="level" name="level" value={formData.level || ''} onChange={handleChange} className="form-select">
                <option value="">Select Level (Optional)</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
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

export default EditSkillForm;