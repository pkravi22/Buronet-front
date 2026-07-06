// components/UserProfile/CommunityGroupsSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserCommunityGroup } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditCommunityGroupForm from './EditCommunityGroupForm'; // You'll create this
import { useUserProfile } from '../../hooks/useUserProfile';

interface CommunityGroupsSectionProps {
  communityGroups: UserCommunityGroup[];
  canEdit?: boolean;
  onCommunityGroupsChange?: (communityGroups: UserCommunityGroup[]) => void;
}

const CommunityGroupsSection: React.FC<CommunityGroupsSectionProps> = ({ communityGroups, canEdit = true, onCommunityGroupsChange }) => {
  const { deleteCommunityGroup } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCommunityGroup, setEditingCommunityGroup] = useState<UserCommunityGroup | null>(null);
  const [localCommunityGroups, setLocalCommunityGroups] = useState<UserCommunityGroup[]>(communityGroups);

  const handleAddClick = () => {
    setEditingCommunityGroup(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (group: UserCommunityGroup) => {
    setEditingCommunityGroup(group);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (groupId: number) => {
    if (confirm("Are you sure you want to delete this community group?")) {
      try {
        await deleteCommunityGroup(groupId);
        const updatedGroups = localCommunityGroups.filter(g => g.id !== groupId);
        setLocalCommunityGroups(updatedGroups);
        onCommunityGroupsChange?.(updatedGroups);
        alert("Community group deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete community group: ${error.message}`);
      }
    }
  };

  const handleFormClose = (newItem?: UserCommunityGroup) => {
    if (newItem) {
      const updatedGroups = editingCommunityGroup
        ? localCommunityGroups.map(g => g.id === newItem.id ? newItem : g)
        : [...localCommunityGroups, newItem];
      setLocalCommunityGroups(updatedGroups);
      onCommunityGroupsChange?.(updatedGroups);
    }
    setIsFormOpen(false);
  };

  return (
    <UserProfileSection title="Community Groups" onAdd={canEdit ? handleAddClick : undefined}>
      {localCommunityGroups.length === 0 ? (
        <p className="text-gray-500 italic">No community groups added yet.</p>
      ) : (
        <div className="space-y-4">
          {localCommunityGroups.map((group) => (
            <div key={group.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(group)}
                    className="text-[#0096c7] hover:underline text-sm"
                    title="Edit Group"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(group.id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete Group"
                  >
                    Delete
                  </button>
                </div>
              )}
              <h4 className="font-semibold text-lg text-gray-800">{group.groupName}</h4>
              {group.description && <p className="text-gray-700 mt-2 text-sm">{group.description}</p>}
            </div>
          ))}
        </div>
      )}

      {canEdit && isFormOpen && (
        <EditCommunityGroupForm
          communityGroup={editingCommunityGroup}
          onClose={handleFormClose}
        />
      )}
    </UserProfileSection>
  );
};

export default CommunityGroupsSection;