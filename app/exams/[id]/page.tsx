"use client";

import React from 'react';

// Use the simplest possible props interface for testing
interface MinimalExamDetailsPageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Use React.FC for explicit typing
const MinimalExamDetailsPage: React.FC<MinimalExamDetailsPageProps> = ({ params }) => {
  
  // Only render the param to confirm it's received correctly
  return (
    <div>
      <h1>Minimal Exam Details Page</h1>
      <p>Exam ID from params: {params.id}</p>
    </div>
  );
};

export default MinimalExamDetailsPage;