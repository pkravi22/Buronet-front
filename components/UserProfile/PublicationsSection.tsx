// components/UserProfile/PublicationsSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserPublication } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditPublicationForm from './EditPublicationForm'; // You'll create this
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatDateOnly } from '@/lib/dates';

interface PublicationsSectionProps {
  publications: UserPublication[];
  canEdit?: boolean;
  onPublicationsChange?: (publications: UserPublication[]) => void;
}

const PublicationsSection: React.FC<PublicationsSectionProps> = ({ publications, canEdit = true, onPublicationsChange }) => {
  const { deletePublication } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<UserPublication | null>(null);
  const [localPublications, setLocalPublications] = useState<UserPublication[]>(publications);

  const handleAddClick = () => {
    setEditingPublication(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (pub: UserPublication) => {
    setEditingPublication(pub);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (publicationId: number) => {
    if (confirm("Are you sure you want to delete this publication?")) {
      try {
        await deletePublication(publicationId);
        const updatedPublications = localPublications.filter(p => p.id !== publicationId);
        setLocalPublications(updatedPublications);
        onPublicationsChange?.(updatedPublications);
        alert("Publication deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete publication: ${error.message}`);
      }
    }
  };

  const handleFormClose = (newItem?: UserPublication) => {
    if (newItem) {
      const updatedPublications = editingPublication
        ? localPublications.map(p => p.id === newItem.id ? newItem : p)
        : [...localPublications, newItem];
      setLocalPublications(updatedPublications);
      onPublicationsChange?.(updatedPublications);
    }
    setIsFormOpen(false);
  };

  return (
    <UserProfileSection title="Publications" onAdd={canEdit ? handleAddClick : undefined}>
      {localPublications.length === 0 ? (
        <p className="text-gray-500 italic">No publications added yet.</p>
      ) : (
        <div className="space-y-4">
          {localPublications.map((pub) => (
            <div key={pub.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(pub)}
                    className="text-[#0096c7] hover:underline text-sm"
                    title="Edit Publication"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(pub.id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete Publication"
                  >
                    Delete
                  </button>
                </div>
              )}
              <h4 className="font-semibold text-lg text-gray-800">{pub.title}</h4>
              {pub.journalConference && <p className="text-gray-700">Journal/Conference: {pub.journalConference}</p>}
              {pub.publicationDate && <p className="text-gray-500 text-sm">Published: {formatDateOnly(pub.publicationDate, 'MMM d, yyyy')}</p>}
              {pub.url && <p className="text-[#0096c7] text-sm hover:underline"><a href={pub.url} target="_blank" rel="noopener noreferrer">View Publication</a></p>}
              {pub.abstract && <p className="text-gray-700 mt-2 text-sm">{pub.abstract}</p>}
            </div>
          ))}
        </div>
      )}

      {canEdit && isFormOpen && (
        <EditPublicationForm
          publication={editingPublication}
          onClose={handleFormClose}
        />
      )}
    </UserProfileSection>
  );
};

export default PublicationsSection;