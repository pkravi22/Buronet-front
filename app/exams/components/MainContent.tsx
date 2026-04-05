// File: MainContent.tsx

"use client";

import { TrendingUp, Clock, Briefcase, FileText, Bookmark, Bell, ChevronRight, Building2, Banknote, Shield, GraduationCap, Stethoscope, Landmark, ChevronLeft, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect, useMemo } from 'react';
import { get, remove, postApi } from '@/lib/api'; // Make sure this path is correct for your API helper
import { Exam, ApiResponse } from '@/lib/types/exams'; // Make sure this path is correct for your types
import ExamCard from '../components/ExamCard'; // Make sure this path is correct for your ExamCard component
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

interface bookmarksResponseType {
  id: String,
  examId: String,
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
  totalActiveExams: number;
  newExamsToday: number;
  totalBookmarkedExams: number;
  newExamsTodayTrend?: string;
  totalApplications?: number;
  applicationsInProgress?: number;
  bookmarkedExamsTrend?: string;
}

interface DepartmentStats {
  departmentName: string;
  examCount: number;
}

// Reusable Components defined within the file
const DashboardCard = ({ title, value, trend, icon, iconColor, trendIcon, trendColor = "text-[#16A34A]" }: DashboardCardProps) => (
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

// Main Component
const MainContent = () => {
  // State for dynamic exam data
  const [exams, setExams] = useState<Exam[]>([]);
  const [bookmarkedExams, setBookmarkedExams] = useState<bookmarksResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get the current user
  const { unreadCount } = useNotifications(); // Get unread notification count
  const [activeTab, setActiveTab] = useState('All Exams');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Data fetching effect for exams
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        const response = await get<Exam[]>('/exams');
        const bookmarksResponse = await get<bookmarksResponseType[]>(`/bookmarks/${user?.id}/exams`);
        const dashboardStatsResponse = await get<DashboardStats>(`/dashboard/exam/stats/${user?.id}`);
        console.log("Exams bookmark response:", bookmarksResponse);
        // if (response.success) {
        setExams(response);
        setBookmarkedExams(bookmarksResponse);
        setDashboardStats(dashboardStatsResponse);
        // console.log("Bookmarks response:", bookmarksResponse);
        // console.log("bookmarked Exams response:", );
        
        // } else {
        //   console.error(response.message);
        //   setExams([]);
        // }


      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, [user]);

  const fetchAllExams = async (page: number) => {
    setModalLoading(true);
    try {
      // Prefer server-side pagination if available.
      const response = await get<any>(`/exams/all?page=${page}&pageSize=${pageSize}`);
      const data = response?.data ?? response?.items ?? response;

      if (Array.isArray(data)) {
        setAllExams(data);
        setTotalPages(response?.totalPages || response?.pageCount || 1);
      } else {
        setAllExams([]);
        setTotalPages(1);
      }

      setCurrentPage(page);
    } catch (error) {
      // Fallback: fetch all exams and paginate client-side.
      try {
        const full = await get<Exam[]>('/exams');
        const pages = Math.max(1, Math.ceil(full.length / pageSize));
        const start = (page - 1) * pageSize;
        setAllExams(full.slice(start, start + pageSize));
        setTotalPages(pages);
        setCurrentPage(page);
      } catch (fallbackError) {
        console.error("Failed to fetch all exams", fallbackError);
        setAllExams([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchAllExams(1);
  };

    const toggleBookmark = async (examId: string, isCurrentlyBookmarked: boolean) => {
    try {
      if (isCurrentlyBookmarked) {
        await remove(`/bookmarks/${user?.id}/exam/${examId}`);
        setBookmarkedExams(prev => prev.filter(b => b.examId !== examId));
      } else {
        await postApi(`/bookmarks/${user?.id}/exam`, { Id: examId });
        setBookmarkedExams(prev => [
          ...prev,
          { examId: examId, userId: user?.id!, id: '', savedDate: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  const filteredExams = useMemo(() => {
    switch (activeTab) {
      case 'Saved Exams':
        return exams.filter(exam => bookmarkedExams.some(b => b.examId === exam.id!));
      case 'Recommended':
        // Placeholder: Add logic for recommended exams later
        return [];
      case 'All Exams':
      default:
        console.log("this is running");
        return exams;
    }
  }, [activeTab, exams, bookmarkedExams]);

  console.log("filtered exams:", filteredExams);


  // Static data for dashboard and departments
  const dashboardCards: DashboardCardProps[] = [
    { title: 'Total Active Exams', value: dashboardStats?.totalActiveExams.toString() || '0', trend: dashboardStats?.newExamsTodayTrend || `${Math.floor(dashboardStats?.newExamsToday || 0)} new today`, icon: <Briefcase size={16} />, iconColor: 'text-[#EF4444]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]' },
    { title: 'Total Applications', value: dashboardStats?.totalApplications?.toString() || '0', trend: dashboardStats?.applicationsInProgress ? `${Math.floor(dashboardStats.applicationsInProgress)} in progress` : 'Coming Soon!', icon: <FileText size={16} />, iconColor: 'text-[#3B82F6]', trendIcon: <Clock size={12} />, trendColor: 'text-[#F59E0B]' },
    { title: 'Saved Exams', value: dashboardStats?.totalBookmarkedExams.toString() || '0', trend: dashboardStats?.bookmarkedExamsTrend || 'updated Just now', icon: <Bookmark size={16} />, iconColor: 'text-[#22C55E]', trendIcon: <Clock size={12} />, trendColor: 'text-[#F59E0B]' },
    { title: 'New Notifications', value: unreadCount.toString(), trend: `${unreadCount} new alerts`, icon: <Bell size={16} />, iconColor: 'text-[#A855F7]', trendIcon: <TrendingUp size={12} />, trendColor: 'text-[#16A34A]' }
  ];

  // const departments = [
  //   { title: "Railway", exams: departmentStats.find(d => d.departmentName === "Railway")?.examCount || 0, icon: <Building2 size={16} /> },
  //   { title: "Banking", exams: departmentStats.find(d => d.departmentName === "Banking")?.examCount || 0, icon: <Banknote size={16} /> },
  //   { title: "Defense", exams: departmentStats.find(d => d.departmentName === "Defense")?.examCount || 0, icon: <Shield size={16} /> },
  //   { title: "Education", exams: departmentStats.find(d => d.departmentName === "Education")?.examCount || 0, icon: <GraduationCap size={16} /> },
  //   { title: "Healthcare", exams: departmentStats.find(d => d.departmentName === "Healthcare")?.examCount || 0, icon: <Stethoscope size={16} /> },
  //   { title: "Civil Services", exams: departmentStats.find(d => d.departmentName === "Civil Services")?.examCount || 0, icon: <Landmark size={16} /> }
  // ];

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

  const examTabs = [
    { id: 'All Exams', label: 'All Exams' },
    // { id: 'Recommended', label: 'Recommended' },
    { id: 'Saved Exams', label: 'Saved Exams', icon: <Bookmark size={14} /> },
  ];

  return (
    <div className="flex-1">
      <div className="flex justify-center w-full">
        {/* RESPONSIVE CHANGE: Replaced fixed w-[640px] with w-full max-w-[640px] and added responsive padding */}
        <div className="w-full max-w-[640px] px-4 md:px-0">
          {/* Dashboard Cards Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {dashboardCards.map((card, index) => (
              <div key={index} className="w-full desktop:w-[148px]"><DashboardCard {...card} /></div>
            ))}
          </div>

          {/* Popular Departments Section
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1F2937] font-semibold text-lg">Popular Departments</h2>
              <button className="text-[#3B82F6] text-sm flex items-center gap-1 hover:text-[#2563EB]">View All<ChevronRight size={16} /></button>
            </div>
            <div className="relative">
              {showDeptLeftButton && <button onClick={() => scroll(departmentsScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50"><ChevronLeft size={20} className="text-[#6B7280]" /></button>}
              <div className="relative">
                <div ref={departmentsScrollRef} onScroll={handleDeptScroll} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
                  {departments.map((dept, index) => <div key={index} className="w-[180px] shrink-0"><DepartmentCard {...dept} /></div>)}
                </div>
              </div>
              {showDeptRightButton && <button onClick={() => scroll(departmentsScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50"><ChevronRight size={20} className="text-[#6B7280]" /></button>}
            </div>
          </div> */}

          {/* Latest Exam Openings Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1F2937] font-semibold text-lg">Latest Exam Openings</h2>
              <div className="flex items-center gap-4">
                {user?.isAdmin && (
                  <Link href="/exams/create" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={16} />
                    <span>Create Exam</span>
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
            {/* KEY CHANGE 4: Functional Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4 overflow-x-auto scrollbar-hide">
              {examTabs.map(tab => (
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

          {/* Latest Exam Cards Section - DYNAMIC & FILTERED */}
          <div className="w-full max-w-[640px] mx-auto mb-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <p className="col-span-2 text-center text-gray-500">Loading...</p>
              ) : filteredExams.length > 0 ? (
                // KEY CHANGE 5: Render the filtered list
                filteredExams.map(exam => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    isBookmarked={bookmarkedExams.some(b => b.examId === exam.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))
              ) : (
                <p className="col-span-2 text-center text-gray-500">
                  {activeTab === 'Saved Exams' ? 'You have no saved exams.' : 'No active exams found.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">All Exam Openings</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {modalLoading ? (
                <div className="flex justify-center py-20">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allExams.map(exam => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      isBookmarked={bookmarkedExams.some(b => b.examId === exam.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-between bg-white">
              <button
                disabled={currentPage === 1 || modalLoading}
                onClick={() => fetchAllExams(currentPage - 1)}
                className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>

              <button
                disabled={currentPage === totalPages || modalLoading}
                onClick={() => fetchAllExams(currentPage + 1)}
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