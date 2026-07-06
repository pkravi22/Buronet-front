// components/UserProfile/ExperienceSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserExperience } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditExperienceForm from './EditExperienceForm'; // Form for adding/editing experience
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatDateOnly } from '@/lib/dates';

interface ExperienceSectionProps {
  experiences: UserExperience[];
  onExperiencesChange?: (experiences: UserExperience[]) => void;
  canEdit?: boolean;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences, onExperiencesChange, canEdit = true }) => {
  const { deleteExperience } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<UserExperience | null>(null);

  const handleAddClick = () => {
    setEditingExperience(null); // Clear any previous editing state for new entry
    setIsFormOpen(true);
  };

  const handleEditClick = (exp: UserExperience) => {
    setEditingExperience(exp);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (experienceId: number) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      try {
        await deleteExperience(experienceId);
        // Update local state immediately
        if (onExperiencesChange) {
          onExperiencesChange(experiences.filter(e => e.id !== experienceId));
        }
        alert("Experience deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete experience: ${error.message}`);
      }
    }
  };

  const handleFormClose = (newExperience?: UserExperience) => {
    setIsFormOpen(false);
    // Update local state if a new experience was added
    if (newExperience && onExperiencesChange) {
      if (editingExperience) {
        // Update existing
        onExperiencesChange(experiences.map(e => e.id === newExperience.id ? newExperience : e));
      } else {
        // Add new
        onExperiencesChange([...experiences, newExperience]);
      }
    }
  };

  return (
    <UserProfileSection title="Target Exam / Experience" onAdd={canEdit ? handleAddClick : undefined}>
      {experiences.length === 0 ? (
        <p className="text-gray-500 italic">No experiences added yet.</p>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(exp)}
                    className="text-[#0096c7] hover:underline text-sm"
                    title="Edit Experience"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(exp.id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete Experience"
                  >
                    Delete
                  </button>
                </div>
              )}
              <h4 className="font-semibold text-lg text-gray-800">{exp.title} at {exp.organization}</h4>
              <p className="text-gray-500 text-sm">
                {exp.startDate ? formatDateOnly(exp.startDate, 'MMM yyyy') : 'N/A'} -{' '}
                {exp.endDate ? formatDateOnly(exp.endDate, 'MMM yyyy') : 'Present'}
              </p>
              {exp.description && <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {canEdit && isFormOpen && (
        <EditExperienceForm
          experience={editingExperience} // Pass null for new, object for edit
          onClose={handleFormClose}
        />
      )}
    </UserProfileSection>
  );
};

export default ExperienceSection;