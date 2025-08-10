"use client";

import { TrendingUp, Clock, Briefcase, FileText, Bookmark, Bell, ChevronRight, Building2, Banknote, Shield, GraduationCap, Stethoscope, Landmark, ChevronLeft } from 'lucide-react';
import { useRef, useState } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  iconColor: string;
  trendIcon?: React.ReactNode;
  trendColor?: string;
}

const DashboardCard = ({ title, value, trend, icon, iconColor, trendIcon, trendColor = "text-[#16A34A]" }: DashboardCardProps) => (
  <div className="w-[148px] h-32 bg-gradient-to-br from-[#DDECFF] to-[#E3EAFF] rounded-xl">
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
  // Map department titles to gradient colors
  const getGradient = (title: string) => {
    switch (title.toLowerCase()) {
      case 'railway':
        return 'from-blue-500 to-indigo-600';
      case 'banking':
        return 'from-indigo-500 to-purple-600';
      case 'defense':
        return 'from-purple-500 to-pink-600';
      case 'education':
        return 'from-pink-500 to-red-600';
      case 'healthcare':
        return 'from-red-500 to-orange-600';
      case 'civil services':
        return 'from-orange-500 to-yellow-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className={`w-[180px] h-32 bg-gradient-to-br ${getGradient(title)} rounded-xl`}>
      <div className="h-full px-4 py-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <span className="text-white">
              {icon}
            </span>
          </div>
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {jobs} jobs
          </span>
        </div>
        <div>
          <h3 className="text-white text-lg font-medium">{title}</h3>
          <p className="text-white/80 text-sm">Ministry of India</p>
        </div>
      </div>
    </div>
  );
};

const MainContent = () => {
  const dashboardCards: DashboardCardProps[] = [
    {
      title: 'Total Active Jobs',
      value: '2,489',
      trend: '10 new today',
      icon: <Briefcase size={16} />,
      iconColor: 'text-[#EF4444]',
      trendIcon: <TrendingUp size={12} />,
      trendColor: 'text-[#16A34A]'
    },
    {
      title: 'Total Applications',
      value: '14',
      trend: '5 in progress',
      icon: <FileText size={16} />,
      iconColor: 'text-[#3B82F6]',
      trendIcon: <Clock size={12} />,
      trendColor: 'text-[#F59E0B]'
    },
    {
      title: 'Saved Jobs',
      value: '10',
      trend: 'updated Just now',
      icon: <Bookmark size={16} />,
      iconColor: 'text-[#22C55E]',
      trendIcon: <Clock size={12} />,
      trendColor: 'text-[#F59E0B]'
    },
    {
      title: 'New Notifications',
      value: '8',
      trend: '4 new alerts',
      icon: <Bell size={16} />,
      iconColor: 'text-[#A855F7]',
      trendIcon: <TrendingUp size={12} />,
      trendColor: 'text-[#16A34A]'
    }
  ];

  const departments = [
    {
      title: "Railway",
      jobs: 245,
      icon: <Building2 size={16} />
    },
    {
      title: "Banking",
      jobs: 189,
      icon: <Banknote size={16} />
    },
    {
      title: "Defense",
      jobs: 176,
      icon: <Shield size={16} />
    },
    {
      title: "Education",
      jobs: 154,
      icon: <GraduationCap size={16} />
    },
    {
      title: "Healthcare",
      jobs: 132,
      icon: <Stethoscope size={16} />
    },
    {
      title: "Civil Services",
      jobs: 118,
      icon: <Landmark size={16} />
    }
  ];

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
      const scrollAmount = 200;
      element.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex-1">
      <div className="flex justify-center w-full">
        <div className="w-[640px] mt-6">
          <div className="flex flex-wrap gap-4 mb-8">
            {dashboardCards.map((card, index) => (
              <div key={index} className="w-[148px]">
                <DashboardCard {...card} />
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1F2937] font-semibold text-lg">Popular Departments</h2>
              <button className="text-[#3B82F6] text-sm flex items-center gap-1 hover:text-[#2563EB]">
                View All
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="relative">
              {showDeptLeftButton && (
                <button 
                  onClick={() => scroll(departmentsScrollRef, 'left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50"
                >
                  <ChevronLeft size={20} className="text-[#6B7280]" />
                </button>
              )}
              <div className="relative">
                <div 
                  ref={departmentsScrollRef}
                  onScroll={handleDeptScroll}
                  className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {departments.map((dept, index) => (
                    <div key={index} className="w-[180px] shrink-0">
                      <DepartmentCard {...dept} />
                    </div>
                  ))}
                </div>
                <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none ${
                  showDeptLeftButton ? 'bg-gradient-to-r from-[#EEF0F4] to-transparent' : ''
                }`} />
                <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none ${
                  showDeptRightButton ? 'bg-gradient-to-l from-[#EEF0F4] to-transparent' : ''
                }`} />
              </div>
              {showDeptRightButton && (
                <button 
                  onClick={() => scroll(departmentsScrollRef, 'right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50"
                >
                  <ChevronRight size={20} className="text-[#6B7280]" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1F2937] font-semibold text-lg">Latest Job Openings</h2>
              <button className="text-[#3B82F6] text-sm flex items-center gap-1 hover:text-[#2563EB]">
                View All
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="relative">
              {showFiltersLeftButton && (
                <button 
                  onClick={() => scroll(filtersScrollRef, 'left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 flex items-center justify-center z-10 hover:text-[#3B82F6]"
                >
                  <ChevronLeft size={20} className="text-[#6B7280]" />
                </button>
              )}
              <div className="relative">
                <div 
                  ref={filtersScrollRef}
                  onScroll={handleFiltersScroll}
                  className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <button className="h-9 px-4 bg-[#3B82F6] text-white rounded-md text-sm whitespace-nowrap min-w-[82px] flex items-center justify-center shrink-0">
                    All Jobs
                  </button>
                  <button className="h-9 px-4 bg-[#F3F4F6] text-[#374151] rounded-md text-sm whitespace-nowrap min-w-[137px] flex items-center justify-center shrink-0">
                    Recommended
                  </button>
                  <button className="h-9 px-4 bg-[#F3F4F6] text-[#374151] rounded-md text-sm whitespace-nowrap min-w-[127px] flex items-center justify-center gap-2 shrink-0">
                    <Bookmark size={14} />
                    Saved Jobs
                  </button>
                  <button className="h-9 px-4 bg-[#F3F4F6] text-[#374151] rounded-md text-sm whitespace-nowrap min-w-[140px] flex items-center justify-center gap-2 shrink-0">
                    <FileText size={14} />
                    Applied Jobs
                  </button>
                  <button className="h-9 px-4 bg-[#F3F4F6] text-[#374151] rounded-md text-sm whitespace-nowrap min-w-[170px] flex items-center justify-center gap-2 shrink-0">
                    <Clock size={14} />
                    Recently Viewed
                  </button>
                </div>
                <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none ${
                  showFiltersLeftButton ? 'bg-gradient-to-r from-[#EEF0F4] to-transparent' : ''
                }`} />
                <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none ${
                  showFiltersRightButton ? 'bg-gradient-to-l from-[#EEF0F4] to-transparent' : ''
                }`} />
              </div>
              {showFiltersRightButton && (
                <button 
                  onClick={() => scroll(filtersScrollRef, 'right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 flex items-center justify-center z-10 hover:text-[#3B82F6]"
                >
                  <ChevronRight size={20} className="text-[#6B7280]" />
                </button>
              )}
            </div>
          </div>

          {/* Latest Job Cards Section */}
          <div className="w-full max-w-[640px] mx-auto mb-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: UPSC Prelims */}
              <a href="/jobs/1" className="block group">
                <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
                  <button className="absolute top-5 right-5 text-[#6B7280] hover:text-[#3B82F6]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-start">
                      <img src="/upsc-logo.png" className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
                      <div className="flex flex-col ml-3">
                        <h3 className="text-[#1F2937] text-xl font-bold leading-tight">Civil Services (Prelims)</h3>
                        <p className="text-[#4B5563] text-base font-medium mt-1">Union Public Service Commission (UPSC)</p>
                        <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
                          All India
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ₹56,100 - ₹1,77,500
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#EF4444] text-sm mb-4">
                    <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="font-medium">Deadline: Feb 28, 2025</span>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button className="bg-[#2563EB] text-white rounded-md px-7 py-2 text-base font-semibold shadow-sm hover:bg-[#1D4ED8] transition">Apply Now</button>
                  </div>
                </div>
              </a>
              {/* Card 2: SSC CGL */}
              <a href="/jobs/2" className="block group">
                <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
                  <button className="absolute top-5 right-5 text-[#6B7280] hover:text-[#3B82F6]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-start">
                      <img src="/ssc-logo.png" className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
                      <div className="flex flex-col ml-3">
                        <h3 className="text-[#1F2937] text-xl font-bold leading-tight">Combined Graduate Level (CGL)</h3>
                        <p className="text-[#4B5563] text-base font-medium mt-1">Staff Selection Commission (SSC)</p>
                        <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
                          All India
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ₹25,500 - ₹1,51,100
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#EF4444] text-sm mb-4">
                    <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="font-medium">Deadline: Mar 10, 2025</span>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button className="bg-[#2563EB] text-white rounded-md px-7 py-2 text-base font-semibold shadow-sm hover:bg-[#1D4ED8] transition">Apply Now</button>
                  </div>
                </div>
              </a>
              {/* Card 3: RRB JE */}
              <a href="/jobs/3" className="block group">
                <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
                  <button className="absolute top-5 right-5 text-[#6B7280] hover:text-[#3B82F6]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-start">
                      <img src="/rrb-logo.png" className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
                      <div className="flex flex-col ml-3">
                        <h3 className="text-[#1F2937] text-xl font-bold leading-tight">Junior Engineer (Civil)</h3>
                        <p className="text-[#4B5563] text-base font-medium mt-1">Railway Recruitment Board (RRB)</p>
                        <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
                          Multiple Locations
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ₹35,400 - ₹1,12,400
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#EF4444] text-sm mb-4">
                    <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="font-medium">Deadline: May 30, 2025</span>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button className="bg-[#2563EB] text-white rounded-md px-7 py-2 text-base font-semibold shadow-sm hover:bg-[#1D4ED8] transition">Apply Now</button>
                  </div>
                </div>
              </a>
              {/* Card 4: IBPS PO */}
              <a href="/jobs/4" className="block group">
                <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
                  <button className="absolute top-5 right-5 text-[#6B7280] hover:text-[#3B82F6]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-start">
                      <img src="/ibps-logo.png" className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
                      <div className="flex flex-col ml-3">
                        <h3 className="text-[#1F2937] text-xl font-bold leading-tight">Probationary Officer (PO)</h3>
                        <p className="text-[#4B5563] text-base font-medium mt-1">Institute of Banking Personnel Selection (IBPS)</p>
                        <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
                          Pan India
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ₹36,000 - ₹63,840
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#EF4444] text-sm mb-4">
                    <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="font-medium">Deadline: Aug 1, 2025</span>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button className="bg-[#2563EB] text-white rounded-md px-7 py-2 text-base font-semibold shadow-sm hover:bg-[#1D4ED8] transition">Apply Now</button>
                  </div>
                </div>
              </a>
              {/* Card 5: State PSC */}
              <a href="/jobs/5" className="block group">
                <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
                  <button className="absolute top-5 right-5 text-[#6B7280] hover:text-[#3B82F6]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-start">
                      <img src="/psc-logo.png" className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
                      <div className="flex flex-col ml-3">
                        <h3 className="text-[#1F2937] text-xl font-bold leading-tight">State PCS Exam</h3>
                        <p className="text-[#4B5563] text-base font-medium mt-1">State Public Service Commission</p>
                        <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
                          Statewise
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ₹56,100 - ₹1,77,500
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#EF4444] text-sm mb-4">
                    <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="font-medium">Deadline: Apr 15, 2025</span>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button className="bg-[#2563EB] text-white rounded-md px-7 py-2 text-base font-semibold shadow-sm hover:bg-[#1D4ED8] transition">Apply Now</button>
                  </div>
                </div>
              </a>
              {/* Card 6: Indian Army */}
              <a href="/jobs/6" className="block group">
                <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
                  <button className="absolute top-5 right-5 text-[#6B7280] hover:text-[#3B82F6]">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-start">
                      <img src="/army-logo.png" className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
                      <div className="flex flex-col ml-3">
                        <h3 className="text-[#1F2937] text-xl font-bold leading-tight">Technical Entry Scheme (TES)</h3>
                        <p className="text-[#4B5563] text-base font-medium mt-1">Indian Army</p>
                        <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
                          India
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ₹56,100 - ₹2,50,000
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#EF4444] text-sm mb-4">
                    <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="font-medium">Deadline: Jul 20, 2025</span>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button className="bg-[#2563EB] text-white rounded-md px-7 py-2 text-base font-semibold shadow-sm hover:bg-[#1D4ED8] transition">Apply Now</button>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent; 