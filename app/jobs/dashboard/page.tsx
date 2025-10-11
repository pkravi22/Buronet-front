// File: app/jobs/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { get } from '../../../lib/api';
import { Job, ApiResponse } from '@/lib/types/jobs';
import JobCard from '../components/JobCard';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/context/AuthContext'; // Assuming you have a useAuth hook to get the current user
import Navbar from '@/components/Navbar';

const JobDashboard = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get the current user
  const [isLoading, setIsLoading] = useState(true);
  
  const userId = user?.id; // This would come from an auth context

  useEffect(() => {
    const fetchBookmarkedJobs = async () => {
      setIsLoading(true);
      try {
        const bookmarksResponse = await get<any>(`/jobs/${userId}/bookmarks`);
        if (bookmarksResponse.length > 0) {
          const jobIds = bookmarksResponse.map(b => b.jobId);
          const jobPromises = jobIds.map(id => get<ApiResponse<Job>>(`/Jobs/${id}`));
          const jobResults = await Promise.all(jobPromises);
          const successfulJobs = jobResults;
          setBookmarkedJobs(successfulJobs);
        } else {
          setBookmarkedJobs([]);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarked jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarkedJobs();
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#EEF0F4]">
      <TopBar />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Bookmarked Jobs</h1>
        
        <div className="mt-8">
          {isLoading ? (
            <p className="text-gray-600">Loading your bookmarked jobs...</p>
          ) : bookmarkedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedJobs.map(job => (
                <JobCard key={job.id} job={job} isInitiallyBookmarked={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <p className="text-lg font-medium text-gray-700">You haven't bookmarked any jobs yet.</p>
              <p className="text-gray-500 mt-2">Start exploring and save jobs to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDashboard;