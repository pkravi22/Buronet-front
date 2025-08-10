// components/UserProfile/UserProfileSection.tsx
'use client'; // This is a client component

import React from 'react';

interface UserProfileSectionProps {
  title: string;
  onAdd?: () => void; // Optional: for sections that allow adding new items
  onEditAll?: () => void; // Optional: for sections that have an overall edit button
  children: React.ReactNode;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ title, onAdd, onEditAll, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="text-blue-600 hover:underline text-sm mr-2 py-1 px-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              Add New
            </button>
          )}
          {onEditAll && (
            <button
              onClick={onEditAll}
              className="text-blue-600 hover:underline text-sm py-1 px-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              Edit All
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default UserProfileSection;