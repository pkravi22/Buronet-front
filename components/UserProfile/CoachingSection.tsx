// components/UserProfile/CoachingSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserCoaching } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditCoachingForm from './EditCoachingForm'; // You'll create this
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatDateOnly } from '@/lib/dates';

interface CoachingSectionProps {
  coaching: UserCoaching[];
  canEdit?: boolean;
  onCoachingChange?: (coaching: UserCoaching[]) => void;
}

const CoachingSection: React.FC<CoachingSectionProps> = ({ coaching, canEdit = true, onCoachingChange }) => {
  const { deleteCoaching } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoaching, setEditingCoaching] = useState<UserCoaching | null>(null);
  const [localCoaching, setLocalCoaching] = useState<UserCoaching[]>(coaching);

  const handleAddClick = () => {
    setEditingCoaching(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (coach: UserCoaching) => {
    setEditingCoaching(coach);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (coachingId: number) => {
    if (confirm("Are you sure you want to delete this coaching entry?")) {
      try {
        await deleteCoaching(coachingId);
        const updatedCoaching = localCoaching.filter(c => c.id !== coachingId);
        setLocalCoaching(updatedCoaching);
        onCoachingChange?.(updatedCoaching);
        alert("Coaching entry deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete coaching entry: ${error.message}`);
      }
    }
  };

  const handleFormClose = (newItem?: UserCoaching) => {
    if (newItem) {
      const updatedCoaching = editingCoaching
        ? localCoaching.map(c => c.id === newItem.id ? newItem : c)
        : [...localCoaching, newItem];
      setLocalCoaching(updatedCoaching);
      onCoachingChange?.(updatedCoaching);
    }
    setIsFormOpen(false);
  };

  return (
    <UserProfileSection title="Coaching" onAdd={canEdit ? handleAddClick : undefined}>
      {localCoaching.length === 0 ? (
        <p className="text-gray-500 italic">No coaching entries added yet.</p>
      ) : (
        <div className="space-y-4">
          {localCoaching.map((coach) => (
            <div key={coach.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(coach)}
                    className="text-[#0096c7] hover:underline text-sm"
                    title="Edit Coaching"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(coach.id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete Coaching"
                  >
                    Delete
                  </button>
                </div>
              )}
              <h4 className="font-semibold text-lg text-gray-800">{coach.coachingInstitute}</h4>
              {coach.courseName && <p className="text-gray-700">Course: {coach.courseName}</p>}
              <p className="text-gray-500 text-sm">
                {coach.startDate ? formatDateOnly(coach.startDate, 'MMM yyyy') : 'N/A'} -{' '}
                {coach.endDate ? formatDateOnly(coach.endDate, 'MMM yyyy') : 'Present'}
              </p>
            </div>
          ))}
        </div>
      )}

      {canEdit && isFormOpen && (
        <EditCoachingForm
          coaching={editingCoaching}
          onClose={handleFormClose}
        />
      )}
    </UserProfileSection>
  );
};

export default CoachingSection;