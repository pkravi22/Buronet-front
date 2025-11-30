// components/UI/LoadingSpinner.tsx
'use client'; // This is a client component

import React from 'react';

interface LoadingSpinnerProps {
  className?: string; // The '?' makes the prop optional
}

// const LoadingSpinner: React.FC = () => {
const LoadingSpinner = ({ className = '' }: LoadingSpinnerProps) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;