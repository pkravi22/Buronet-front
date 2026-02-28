// File: MainContent.tsx

"use client";

import { TrendingUp, Clock, Briefcase, FileText, Bookmark, Bell, ChevronRight, Building2, Banknote, Shield, GraduationCap, Stethoscope, Landmark, ChevronLeft, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect, useMemo } from 'react';
import { get, remove, postApi } from '@/lib/api'; // Make sure this path is correct for your API helper
import { Job, ApiResponse } from '@/lib/types/jobs'; // Make sure this path is correct for your types
import JobCard from '../components/JobCard'; // Make sure this path is correct for your JobCard component
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

interface bookmarksResponseType {
  id: String,
  jobId: String,
  userId: String,
  savedDate: String,
}

// TypeScript Interfaces
interface DashboardCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  iconColor: string;
  trendIcon?: React.ReactNode;
  trendColor?: string;
}

interface DashboardStats {
  totalActiveJobs: number;
  newJobsToday: number;
  totalBookmarkedJobs: number;
  newJobsTodayTrend?: string;
  totalApplications?: number;
  applicationsInProgress?: number;
  bookmarkedJobsTrend?: string;
}

interface DepartmentStats {
  departmentName: string;
  jobCount: number;
}

interface DepartmentStatArray {
  data: DepartmentStats[]
}

// Reusable Components defined within the file
const DashboardCard = ({ title, value, trend, icon, iconColor, trendIcon, trendColor = "text-[#16A34A]" }: DashboardCardProps) => (
  // RESPONSIVE CHANGE: Changed w-[148px] to w-full. The grid container will now control the width.
  <div className="w-full h-32 bg-gradient-to-br from-[#DDECFF] to-[#E3EAFF] rounded-xl">
    <div className="h-full px-4 py-4 flex flex-col justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
          <span className={`${iconColor}`}>
            {icon}
          </span>
        </div>
        <div className="ml-3">
          <h3 className="text-[#1F2937] font-medium text-sm">{title}</h3>
        </div>
      </div>
      <div>
        <p className="text-[#1F2937] text-2xl font-semibold">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {trendIcon && (
            <span className={`${trendColor}`}>
              {trendIcon}
            </span>
          )}
          <p className="text-xs text-[#6B7280]">{trend}</p>
        </div>
      </div>
    </div>
  </div>
);

const DepartmentCard = ({ title, jobs, icon }: { title: string; jobs: number; icon: React.ReactNode }) => {
  const getGradient = (title: string) => {
    switch (title.toLowerCase()) {
      case 'railway': return 'from-blue-500 to-indigo-600';
      case 'banking': return 'from-indigo-500 to-purple-600';
      case 'defense': return 'from-purple-500 to-pink-600';
      case 'education': return 'from-pink-500 to-red-600';
      case 'healthcare': return 'from-red-500 to-orange-600';
      case 'civil services': return 'from-orange-500 to-yellow-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className={`w-[180px] h-32 bg-gradient-to-br ${getGradient(title)} rounded-xl`}>
      <div className="h-full px-4 py-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <span className="text-white">{icon}</span>
          </div>
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">{jobs} jobs</span>
        </div>
        <div>
          <h3 className="text-white text-lg font-medium">{title}</h3>
          <p className="text-white/80 text-sm">Ministry of India</p>
        </div>
      </div>
    </div>
  );
};

// Main Component
const MainContent = () => {
  // State for dynamic job data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<bookmarksResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get the current user
  const { unreadCount } = useNotifications(); // Get unread notification count
  const [activeTab, setActiveTab] = useState('All Jobs');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Number of jobs per page

  // Data fetching effect for jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await get<Job[]>('/jobs/job-home');
        const bookmarksResponse = await get<bookmarksResponseType[]>(`/bookmarks/${user?.id}/jobs`);
        const dashboardStatsResponse = await get<DashboardStats>(`/dashboard/job/stats/${user?.id}`);
        const departmentStatsResponse = await get<DepartmentStatArray>(`/dashboard/jobs/departments`);
        console.log("Jobs response:", response);
        // if (response.success) {
        setJobs(response);
        setBookmarkedJobs(bookmarksResponse);
        setDashboardStats(dashboardStatsResponse);
        setDepartmentStats(departmentStatsResponse.data);
        console.log("Bookmarks response:", bookmarksResponse);
        // console.log("bookmarked Jobs response:", );
        
        // } else {
        //   console.error(response.message);
        //   setJobs([]);
        // }


      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  const fetchAllJobs = async (page: number) => {
  setModalLoading(true);
  try {
    // Note: Ensure your C# backend has an endpoint like: /api/jobs/all?page=1&pageSize=10
    const response = await get<any>(`/jobs/all?page=${page}&pageSize=${pageSize}`);
    
    // Logic: Adapt the following based on your specific API response structure
    setAllJobs(response.data || response); 
    setTotalPages(response.totalPages || 1);
    setCurrentPage(page);
  } catch (error) {
    console.error("Failed to fetch all jobs", error);
  } finally {
    setModalLoading(false);
  }
};

const handleOpenModal = () => {
  setIsModalOpen(true);
  fetchAllJobs(1); // Reset to page 1 on open
};

  const filteredJobs = useMemo(() => {
    switch (activeTab) {
      case 'Saved Jobs':
        return jobs.filter(job => bookmarkedJobs.some(b => b.jobId === job.id!));
      case 'Recommended':
        // Placeholder: Add logic for recommended jobs later
        return [];
      case 'All Jobs':
      default:
        return jobs;
    }
  }, [activeTab, jobs, bookmarkedJobs]);

  const toggleBookmark = async (jobId: string, isCurrentlyBookmarked: boolean) => {
  try {
    if (isCurrentlyBookmarked) {
      await remove(`/bookmarks/${user?.id}/job/${jobId}`);
      setBookmarkedJobs(prev => prev.filter(b => b.jobId !== jobId));
    } else {
      await postApi(`/bookmarks/${user?.id}/job`, { Id: jobId });
      setBookmarkedJobs(prev => [
        ...prev,
        { jobId, userId: user?.id!, id: '', savedDate: new Date().toISOString() }
      ]);
    }
  } catch (err) {
    console.error("Bookmark toggle failed", err);
  }
};



  // Static data for dashboard and departments
  const dashboardCards: DashboardCardProps[] = [
    { title: 'Total Active Jobs', value: dashboardStats?.totalActiveJobs.toString() || '0', trend: dashboardStats?.newJobsTodayTrend || `${dashboardStats?.newJobsToday || 0} new today`, icon: <Briefcase size={16} />, iconColor: 'text-[#EF4444]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]' },
    { title: 'Total Applications', value: dashboardStats?.totalApplications?.toString() || '_', trend: dashboardStats?.applicationsInProgress ? `${dashboardStats.applicationsInProgress} in progress` : 'Coming soon!', icon: <FileText size={16} />, iconColor: 'text-[#3B82F6]', trendIcon: <Clock size={12} />, trendColor: 'text-[#F59E0B]' },
    { title: 'Saved Jobs', value: dashboardStats?.totalBookmarkedJobs.toString() || '0', trend: dashboardStats?.bookmarkedJobsTrend || 'updated Just now', icon: <Bookmark size={16} />, iconColor: 'text-[#22C55E]', trendIcon: <Clock size={12} />, trendColor: 'text-[#F59E0B]' },
    { title: 'New Notifications', value: unreadCount.toString(), trend: `${unreadCount} new alerts`, icon: <Bell size={16} />, iconColor: 'text-[#A855F7]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]' }
  ];

  const departments = [
    { title: "Railway", jobs: departmentStats.find(d => d.departmentName === "Railway")?.jobCount || 0, icon: <Building2 size={16} /> },
    { title: "Banking", jobs: departmentStats.find(d => d.departmentName === "Banking")?.jobCount || 0, icon: <Banknote size={16} /> },
    { title: "Defense", jobs: departmentStats.find(d => d.departmentName === "Defense")?.jobCount || 0, icon: <Shield size={16} /> },
    { title: "Education", jobs: departmentStats.find(d => d.departmentName === "Education")?.jobCount || 0, icon: <GraduationCap size={16} /> },
    { title: "Healthcare", jobs: departmentStats.find(d => d.departmentName === "Healthcare")?.jobCount || 0, icon: <Stethoscope size={16} /> },
    { title: "Civil Services", jobs: departmentStats.find(d => d.departmentName === "Civil Services")?.jobCount || 0, icon: <Landmark size={16} /> }
  ];

  // Logic for horizontal scrolling sections
  const departmentsScrollRef = useRef<HTMLDivElement>(null);
  const filtersScrollRef = useRef<HTMLDivElement>(null);
  const [showDeptLeftButton, setShowDeptLeftButton] = useState(false);
  const [showDeptRightButton, setShowDeptRightButton] = useState(true);
  const [showFiltersLeftButton, setShowFiltersLeftButton] = useState(false);
  const [showFiltersRightButton, setShowFiltersRightButton] = useState(true);

  const handleDeptScroll = () => {
    if (departmentsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = departmentsScrollRef.current;
      setShowDeptLeftButton(scrollLeft > 0);
      setShowDeptRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleFiltersScroll = () => {
    if (filtersScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filtersScrollRef.current;
      setShowFiltersLeftButton(scrollLeft > 0);
      setShowFiltersRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    const element = ref.current;
    if (element) {
      element.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const jobTabs = [
    { id: 'All Jobs', label: 'All Jobs' },
    // { id: 'Recommended', label: 'Recommended' },
    { id: 'Saved Jobs', label: 'Saved Jobs', icon: <Bookmark size={14} /> },
  ];

  return (
    <div className="flex-1">
      <div className="flex justify-center w-full">
        {/* RESPONSIVE CHANGE: Replaced fixed w-[640px] with w-full max-w-[640px] and added responsive padding */}
        <div className="w-full max-w-[640px] px-4 md:px-0">
          {/* Dashboard Cards Section */}
          {/* RESPONSIVE CHANGE: Replaced flex-wrap with a responsive grid. Removed fixed-width wrapper from loop. */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {dashboardCards.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </div>

          {/* Popular Departments Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1F2937] font-semibold text-lg">Popular Departments</h2>
              {/* <button className="text-[#3B82F6] text-sm flex items-center gap-1 hover:text-[#2563EB]">View All<ChevronRight size={16} /></button> */}
            </div>
            <div className="relative">
              {/* RESPONSIVE CHANGE: Hide scroll buttons on mobile (md:flex) */}
              {showDeptLeftButton && <button onClick={() => scroll(departmentsScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center z-10 hover:bg-gray-50 hidden md:flex"><ChevronLeft size={20} className="text-[#6B7280]" /></button>}
              <div className="relative">
                <div ref={departmentsScrollRef} onScroll={handleDeptScroll} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
                  {departments.map((dept, index) => <div key={index} className="w-[180px] shrink-0"><DepartmentCard {...dept} /></div>)}
                </div>
              </div>
              {/* RESPONSIVE CHANGE: Hide scroll buttons on mobile (md:flex) */}
              {showDeptRightButton && <button onClick={() => scroll(departmentsScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center z-10 hover:bg-gray-50 hidden md:flex"><ChevronRight size={20} className="text-[#6B7280]" /></button>}
            </div>
          </div>

          {/* Latest Job Openings Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1F2937] font-semibold text-lg">Latest Job Openings</h2>
              <div className="flex items-center gap-4">
                {user?.isAdmin && (
                  <Link href="/jobs/create" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={16} />
                    <span>Create Job</span>
                  </Link>
                )}
                <button 
                  onClick={handleOpenModal}
                  className="text-[#3B82F6] text-sm flex items-center gap-1 hover:text-[#2563EB]"
                >
                  View All<ChevronRight size={16} />
                </button>
              </div>
            </div>
            {/* RESPONSIVE CHANGE: Added overflow-x-auto and scrollbar-hide to make tabs scroll on mobile */}
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4 overflow-x-auto scrollbar-hide">
              {jobTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-9 px-4 rounded-md text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#F3F4F6] text-[#374151] hover:bg-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Latest Job Cards Section - This was already responsive! */}
          <div className="w-full max-w-[640px] mx-auto mb-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <p className="col-span-2 text-center text-gray-500">Loading...</p>
              ) : filteredJobs.length > 0 ? (
                // KEY CHANGE 5: Render the filtered list
                filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={bookmarkedJobs.some(b => b.jobId === job.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))
              ) : (
                <p className="col-span-2 text-center text-gray-500">
                  {activeTab === 'Saved Jobs' ? 'You have no saved jobs.' : 'No job openings found.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">All Job Openings</h2>
        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={24} className="text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {modalLoading ? (
          <div className="flex justify-center py-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isBookmarked={bookmarkedJobs.some(b => b.jobId === job.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t flex items-center justify-between bg-white">
        <button
          disabled={currentPage === 1 || modalLoading}
          onClick={() => fetchAllJobs(currentPage - 1)}
          className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        
        <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>

        <button
          disabled={currentPage === totalPages || modalLoading}
          onClick={() => fetchAllJobs(currentPage + 1)}
          className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default MainContent;