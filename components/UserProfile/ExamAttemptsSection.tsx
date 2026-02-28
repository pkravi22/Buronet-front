// components/UserProfile/ExamAttemptsSection.tsx
'use client'; // This is a client component

import React, { useState } from 'react';
import { UserExamAttempt } from '../../lib/types/user'; // Import from the consolidated types folder
import UserProfileSection from './UserProfileSection';
import EditExamAttemptForm from './EditExamAttemptForm';
import { useUserProfile } from '../../hooks/useUserProfile';

interface ExamAttemptsSectionProps {
  examAttempts: UserExamAttempt[];
  canEdit?: boolean;
  onExamAttemptsChange?: (examAttempts: UserExamAttempt[]) => void;
}

const ExamAttemptsSection: React.FC<ExamAttemptsSectionProps> = ({ examAttempts, canEdit = true, onExamAttemptsChange }) => {
  const { deleteExamAttempt } = useUserProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExamAttempt, setEditingExamAttempt] = useState<UserExamAttempt | null>(null);
  const [localExamAttempts, setLocalExamAttempts] = useState<UserExamAttempt[]>(examAttempts);

  const handleAddClick = () => {
    setEditingExamAttempt(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (attempt: UserExamAttempt) => {
    setEditingExamAttempt(attempt);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (attemptId: number) => {
    if (confirm("Are you sure you want to delete this exam attempt?")) {
      try {
        await deleteExamAttempt(attemptId);
        const updatedAttempts = localExamAttempts.filter(a => a.id !== attemptId);
        setLocalExamAttempts(updatedAttempts);
        onExamAttemptsChange?.(updatedAttempts);
        alert("Exam attempt deleted successfully!");
      } catch (error: any) {
        alert(`Failed to delete exam attempt: ${error.message}`);
      }
    }
  };

  const handleFormClose = (newItem?: UserExamAttempt) => {
    if (newItem) {
      const updatedAttempts = editingExamAttempt
        ? localExamAttempts.map(a => a.id === newItem.id ? newItem : a)
        : [...localExamAttempts, newItem];
      setLocalExamAttempts(updatedAttempts);
      onExamAttemptsChange?.(updatedAttempts);
    }
    setIsFormOpen(false);
  };

  return (
    <UserProfileSection title="Exam Attempts" onAdd={canEdit ? handleAddClick : undefined}>
      {localExamAttempts.length === 0 ? (
        <p className="text-gray-500 italic">No exam attempts added yet.</p>
      ) : (
        <div className="space-y-4">
          {localExamAttempts.map((attempt) => (
            <div key={attempt.id} className="relative p-4 border rounded-lg bg-gray-50">
              {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(attempt)}
                    className="text-blue-600 hover:underline text-sm"
                    title="Edit Exam Attempt"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(attempt.id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete Exam Attempt"
                  >
                    Delete
                  </button>
                </div>
              )}
              <h4 className="font-semibold text-lg text-gray-800">{attempt.examName}</h4>
              <p className="text-gray-700">Year: {attempt.year || 'N/A'}</p>
              <p className="text-gray-700">Result: {attempt.result || 'N/A'}</p>
              {attempt.remarks && <p className="text-gray-700 mt-2 text-sm">{attempt.remarks}</p>}
            </div>
          ))}
        </div>
      )}

      {canEdit && isFormOpen && (
        <EditExamAttemptForm
          examAttempt={editingExamAttempt}
          onClose={handleFormClose}
        />
      )}
    </UserProfileSection>
  );
};

export default ExamAttemptsSection;