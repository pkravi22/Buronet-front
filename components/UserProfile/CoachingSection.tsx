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
}

const CoachingSection: React.FC<CoachingSectionProps> = ({ coaching, canEdit = true }) => {
  const { deleteCoaching } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoaching, setEditingCoaching] = useState<UserCoaching | null>(null);

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
        alert("Coaching entry deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete coaching entry: ${error.message}`);
      }
    }
  };

  return (
    <UserProfileSection title="Coaching" onAdd={canEdit ? handleAddClick : undefined}>
      {coaching.length === 0 ? (
        <p className="text-gray-500 italic">No coaching entries added yet.</p>
      ) : (
        <div className="space-y-4">
          {coaching.map((coach) => (
            <div key={coach.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(coach)}
                    className="text-blue-600 hover:underline text-sm"
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
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </UserProfileSection>
  );
};

export default CoachingSection;