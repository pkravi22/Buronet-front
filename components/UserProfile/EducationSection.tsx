// components/UserProfile/EducationSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserEducation } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditEducationForm from './EditEducationForm'; // You'll create this
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatDateOnly } from '@/lib/dates';

interface EducationSectionProps {
  education: UserEducation[];
  onEducationChange?: (education: UserEducation[]) => void;
  canEdit?: boolean;
}

const EducationSection: React.FC<EducationSectionProps> = ({ education, onEducationChange, canEdit = true }) => {
  const { deleteEducation } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<UserEducation | null>(null);

  const handleAddClick = () => {
    setEditingEducation(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (edu: UserEducation) => {
    setEditingEducation(edu);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (educationId: number) => {
    if (confirm("Are you sure you want to delete this education entry?")) {
      try {
        await deleteEducation(educationId);
        // Update local state immediately
        if (onEducationChange) {
          onEducationChange(education.filter(e => e.id !== educationId));
        }
        alert("Education entry deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete education entry: ${error.message}`);
      }
    }
  };

  const handleFormClose = (newEducation?: UserEducation) => {
    setIsFormOpen(false);
    // Update local state if a new education was added
    if (newEducation && onEducationChange) {
      if (editingEducation) {
        // Update existing
        onEducationChange(education.map(e => e.id === newEducation.id ? newEducation : e));
      } else {
        // Add new
        onEducationChange([...education, newEducation]);
      }
    }
  };

  return (
    <UserProfileSection title="Education" onAdd={canEdit ? handleAddClick : undefined}>
      {education.length === 0 ? (
        <p className="text-gray-500 italic">No education entries added yet.</p>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(edu)}
                    className="text-[#0096c7] hover:underline text-sm"
                    title="Edit Education"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(edu.id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete Education"
                  >
                    Delete
                  </button>
                </div>
              )}
              <h4 className="font-semibold text-lg text-gray-800">{edu.degree} {edu.major && `(${edu.major})`}</h4>
              <p className="text-gray-700">{edu.institution}</p>
              <p className="text-gray-500 text-sm">
                {edu.startDate ? formatDateOnly(edu.startDate, 'MMM yyyy') : 'N/A'} -{' '}
                {edu.endDate ? formatDateOnly(edu.endDate, 'MMM yyyy') : 'Present'}
              </p>
              {edu.description && <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {canEdit && isFormOpen && (
        <EditEducationForm
          education={editingEducation}
          onClose={handleFormClose}
        />
      )}
    </UserProfileSection>
  );
};

export default EducationSection;