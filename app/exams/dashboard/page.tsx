// File: app/exams/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { get } from '../../../lib/api';
import { Exam, ApiResponse } from '@/lib/types/exams';
import ExamCard from '../components/ExamCard';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/context/AuthContext'; // Assuming you have a useAuth hook to get the current user
import Navbar from '@/components/Navbar';

interface BookmarkType {
  userId: string,
  examId: string,
  savedDate: string
}

const ExamDashboard = () => {
  const [bookmarkedExams, setBookmarkedExams] = useState<Exam[]>([]);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get the current user
  const [isLoading, setIsLoading] = useState(true);
  
  const userId = user?.id; // This would come from an auth context

  useEffect(() => {
    const fetchBookmarkedExams = async () => {
      setIsLoading(true);
      try {
        const bookmarksResponse = await get<BookmarkType[]>(`/bookmarks/${userId}/exams`);
        if (bookmarksResponse.length > 0) {
          const examIds = bookmarksResponse.map(b => b.examId);
          const examPromises = examIds.map(id => get<Exam>(`/exams/${id}`));
          const examResults = await Promise.all(examPromises);
          const successfulExams = examResults;
          setBookmarkedExams(successfulExams);
        } else {
          setBookmarkedExams([]);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarked exams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarkedExams();
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#EEF0F4]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Bookmarked Exams</h1>
        
        <div className="mt-8">
          {isLoading ? (
            <p className="text-gray-600">Loading your bookmarked exams...</p>
          ) : bookmarkedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} isInitiallyBookmarked={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <p className="text-lg font-medium text-gray-700">You haven't bookmarked any exams yet.</p>
              <p className="text-gray-500 mt-2">Start exploring and save exams to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;