// components/UserProfile/SkillsSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserSkill } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditSkillForm from './EditSkillForm';
import { useUserProfile } from '../../hooks/useUserProfile';

interface SkillsSectionProps {
  skills: UserSkill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const { deleteSkill } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);

  const handleAddClick = () => {
    setEditingSkill(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (skill: UserSkill) => {
    setEditingSkill(skill);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (skillId: number) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      try {
        await deleteSkill(skillId);
        alert("Skill deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete skill: ${error.message}`);
      }
    }
  };

  return (
    <UserProfileSection title="Skills" onAdd={handleAddClick}>
      {skills.length === 0 ? (
        <p className="text-gray-500 italic">No skills added yet. Click "Add New" to add one.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div key={skill.id} className="relative bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center group">
              <span>{skill.skillName} {skill.level && `(${skill.level})`}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-blue-200 bg-opacity-75 rounded-full opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                <button
                  onClick={() => handleEditClick(skill)}
                  className="text-blue-700 hover:text-blue-900 text-xs font-bold"
                  title="Edit Skill"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(skill.id)}
                  className="text-red-700 hover:text-red-900 text-xs font-bold"
                  title="Delete Skill"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <EditSkillForm
          skill={editingSkill}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </UserProfileSection>
  );
};

export default SkillsSection;