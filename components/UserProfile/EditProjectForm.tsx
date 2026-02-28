// components/UserProfile/EditProjectForm.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserProject, UpdateUserProjectDto } from '../../lib/types/user'; // Import from the consolidated types folder
import { useUserProfile } from '../../hooks/useUserProfile';
import { toDateOnly } from '@/lib/dates';

interface EditProjectFormProps {
  project: UserProject | null;
  onClose: (newItem?: UserProject) => void;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ project, onClose }) => {
  const { addProject, updateProject } = useUserProfile();
  const [formData, setFormData] = useState<UpdateUserProjectDto>({
    projectName: project?.projectName || '',
    description: project?.description || '',
    startDate: toDateOnly(project?.startDate) || '',
    endDate: toDateOnly(project?.endDate) || '',
    url: project?.url || '',
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
      const dataToSend: UpdateUserProjectDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      ) as UpdateUserProjectDto;

      let savedItem: UserProject;
      if (project) {
        await updateProject(project.id, dataToSend);
        savedItem = { ...project, ...dataToSend };
      } else {
        savedItem = await addProject(dataToSend);
      }
      onClose(savedItem);
    } catch (err: any) {
      setError(err.message || "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-8">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-2xl font-bold text-gray-800">{project ? 'Edit Project' : 'Add New Project'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="projectName" className="block text-gray-700 text-sm font-bold mb-2">Project Name</label>
              <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
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
              <label htmlFor="url" className="block text-gray-700 text-sm font-bold mb-2">URL</label>
              <input type="url" id="url" name="url" value={formData.url || ''} onChange={handleChange} className="form-input" placeholder="https://example.com/project" />
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

export default EditProjectForm;