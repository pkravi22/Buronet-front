// components/UserProfile/EditCommunityGroupForm.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserCommunityGroup, UpdateUserCommunityGroupDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';

interface EditCommunityGroupFormProps {
  communityGroup: UserCommunityGroup | null;
  onClose: (newItem?: UserCommunityGroup) => void;
}

const EditCommunityGroupForm: React.FC<EditCommunityGroupFormProps> = ({ communityGroup, onClose }) => {
  const { addCommunityGroup, updateCommunityGroup } = useUserProfile();
  const [formData, setFormData] = useState<UpdateUserCommunityGroupDto>({
    groupName: communityGroup?.groupName || '',
    description: communityGroup?.description || '',
    url: communityGroup?.url || '',
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
      const dataToSend: UpdateUserCommunityGroupDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      ) as UpdateUserCommunityGroupDto;

      let savedItem: UserCommunityGroup;
      if (communityGroup) {
        await updateCommunityGroup(communityGroup.id, dataToSend);
        savedItem = { ...communityGroup, ...dataToSend };
      } else {
        savedItem = await addCommunityGroup(dataToSend);
      }
      onClose(savedItem);
    } catch (err: any) {
      setError(err.message || "Failed to save community group.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">{communityGroup ? 'Edit Community Group' : 'Add New Community Group'}</h2>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="groupName" className="block text-gray-700 text-sm font-bold mb-2">Group Name</label>
              <input type="text" id="groupName" name="groupName" value={formData.groupName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
            </div>
            <div>
              <label htmlFor="url" className="block text-gray-700 text-sm font-bold mb-2">URL</label>
              <input type="url" id="url" name="url" value={formData.url || ''} onChange={handleChange} className="form-input" placeholder="https://example.com/group" />
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
                className="bg-[#0096c7] text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition-colors"
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

export default EditCommunityGroupForm;