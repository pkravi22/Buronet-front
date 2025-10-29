"use client";

import { FiBell, FiSearch, FiUser, FiSettings, FiLogOut, FiMenu, FiChevronLeft, FiBriefcase, FiLink } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '@/utils/auth'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SearchModal from '@/components/SearchModal';
import { useNotifications } from '@/hooks/useNotifications';
import { SearchItemType, UnifiedSearchResultItem, SearchResultDto } from '@/lib/types/search';
import { useSearch } from '@/hooks/useSearch';
import { RiComputerFill } from 'react-icons/ri';

const setItemLink = (results: SearchResultDto) => {
  results.results.forEach((item) => {
    if(item.type === "Job"){
      item.linkUrl = `/jobs/${item.id}`
    } else if(item.type === "User") {

    } else if(item.type === "Post") {

    }
  })
}

const TopBar = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

   // --- NEW STATE FOR SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Refs for closing dropdowns/search
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null); // Ref for the entire search area

  // Use the search hook
  const { results, loading, executeSearch } = useSearch();

  const { 
        notifications, 
        unreadCount, 
        isLoading: isNotifLoading, 
        markAsRead 
    } = useNotifications();

  // --- SEARCH LOGIC (Debounced Effect) ---
  useEffect(() => {
    // Only search if the query is at least 2 characters long
    if (searchQuery.length > 1) {
      // Open the results dropdown
      setShowSearchResults(true); 
      
      const timer = setTimeout(() => {
        executeSearch(searchQuery);
      }, 300); // Debounce time

      setItemLink(results);
      
      return () => clearTimeout(timer);
    } else {
      // Close the results dropdown if query is too short or empty
      setShowSearchResults(false);
    }
  }, [searchQuery, executeSearch]);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

   // Helper function to get an icon based on search result type
  const getIcon = (type: SearchItemType) => {
    switch (type) {
      case 'User': return <FiUser size={16} className="text-[#2563EB]" />;
      case 'Job': return <FiBriefcase size={16} className="text-[#10B981]" />;
      default: return <FiLink size={16} className="text-[#9CA3AF]" />;
    }
  };

  // Component to render the search results dropdown
  const SearchResultsDropdown = () => (
    <div className="absolute top-11 left-0 right-0 w-full md:w-[448px] bg-white rounded-lg shadow-xl border border-[#E5E7EB] max-h-96 overflow-y-auto z-50">
        
        {loading && (
            <div className="p-4 text-center text-[#6B7280]">Searching...</div>
        )}
        
        {!loading && results.results.length === 0 && searchQuery.length > 1 && (
            <div className="p-4 text-center text-[#6B7280]">No results found for "{searchQuery}"</div>
        )}        

        {!loading && results.results.length > 0 && (
            <div className="p-2">
                <p className="px-2 py-1 text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] mb-1">
                   Results ({results.totalUserCount} People, {results.totalJobCount} Jobs)
                </p>

                {results.results.slice(0, 8).map((item) => (
                    <Link
                        key={item.id}
                        href={item.linkUrl}
                        onClick={() => {
                            setShowSearchResults(false);
                            setIsMobileSearchOpen(false);
                            setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">{getIcon(item.type)}</div>
                        <div className="flex-grow">
                            <p className="font-medium text-[#1F2937] leading-tight">{item.title}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5 leading-tight">{item.subtitle}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                            item.type === 'Job' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                           {item.type}
                        </span>
                    </Link>
                ))}
            </div>
        )}
        
        {/* View All Button (If more results exist) */}
        {results.results.length > 8 && (
            <div className="p-2 border-t border-[#E5E7EB]">
                <Link href={`/search?q=${searchQuery}`} className="block text-center text-[#2563EB] text-sm font-medium hover:text-[#1D4ED8]">
                    View All Results
                </Link>
            </div>
        )}
    </div>
  );

  // const notifications = [
  //   {
  //     id: 1,
  //     title: 'New job alert',
  //     message: 'Railway Recruitment Board has posted new jobs',
  //     time: '5 min ago',
  //     read: false
  //   },
  //   {
  //     id: 2,
  //     title: 'Application update',
  //     message: 'Your application for SSC CGL has been shortlisted',
  //     time: '1 hour ago',
  //     read: false
  //   },
  //   {
  //     id: 3,
  //     title: 'Profile view',
  //     message: 'Someone viewed your profile',
  //     time: '2 hours ago',
  //     read: true
  //   }
  // ];

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);
  const handleNotificationClick = (id: string, url: string) => {
        markAsRead(id); // Mark as read via optimistic update and API call
        setShowNotifications(false);
        if (url) {
            router.push(url);
        }
    };

  return (
    <>
    {/* 1. DIM BACKGROUND OVERLAY */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setShowSearchResults(false)} 
        />
      )}
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center h-[61px] bg-white border-b border-[#E5E7EB] px-4">
        
        {/* --- DEFAULT VIEW (Not searching on mobile) --- */}
        <div className={`flex w-full items-center justify-between ${isSearchModalOpen ? 'hidden' : 'flex'}`}>
            {/* Left Section (Menu Button and Logo) */}
            <div className="flex items-center gap-2">
                {/* <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-800">
                    <FiMenu size={24} />
                </button> */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/home')}>
                    <div className="flex items-center justify-center w-9 h-9">
                        <img src="/Logo.png" alt="Buronet Logo" className="w-7 h-7" />
                    </div>
                    <span className="hidden sm:block text-xl font-semibold bg-gradient-to-b from-[#488AFF] to-[#2563EB] text-transparent bg-clip-text">
                        Buronet
                    </span>
                </div>
            </div>

            {/* Search Bar (Tablet & Up) */}
            {/* <div className="hidden md:flex flex-1 justify-center items-center px-4">
                <div className="relative w-full max-w-[448px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                        <FiSearch size={14} />
                    </div>
                    <input type="text" placeholder="Search..." className="w-full h-9 pl-12 pr-4 bg-[#F3F4F6] rounded-full text-[#6B7280] focus:outline-none" />
                </div>
            </div> */}

            {/* Search Bar (Tablet & Up) - With Dropdown Logic */}
              <div ref={searchContainerRef} className="hidden md:flex flex-1 justify-center items-center px-4 relative">
                  <div className="relative w-full max-w-[448px]">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                          <FiSearch size={14} />
                      </div>
                      <input 
                          type="text" 
                          placeholder="Search for people, posts, or jobs..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
                          className="w-full h-9 pl-12 pr-4 bg-[#F3F4F6] rounded-full text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" 
                      />
                      
                      {/* Search Results Dropdown */}
                      {showSearchResults && <SearchResultsDropdown />}
                  </div>
              </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Mobile-only Search Icon */}
                <button onClick={() => setIsSearchModalOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-gray-800">
                    <FiSearch size={18} />
                </button>

                {/* --- NOTIFICATION BELL SECTION --- */}
            <div className="relative" ref={notificationsRef}>
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-gray-50 rounded-full cursor-pointer"
                >
                    <FiBell size={18} className="text-[#6B7280]" />
                    {/* Display UNREAD COUNT from backend */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full flex items-center justify-center text-xs text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2 z-50">
                        <div className="px-4 py-2 border-b border-[#E5E7EB]">
                            <h3 className="font-medium text-[#1F2937]">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {isNotifLoading && (
                                <div className="p-4 text-center text-[#6B7280] text-sm">Loading...</div>
                            )}

                            {!isNotifLoading && notifications.length === 0 && (
                                <div className="p-4 text-center text-[#6B7280] text-sm">No new notifications.</div>
                            )}

                            {/* --- DYNAMICALLY RENDER BACKEND DATA --- */}
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.id, notification.redirectUrl)}
                                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                        !notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-[#1F2937]">{notification.title}</p>
                                            <p className="text-sm text-[#6B7280] mt-1">{notification.message}</p>
                                        </div>
                                        {/* Use the server-provided timeAgo field */}
                                        <span className="text-xs text-[#9CA3AF] flex-shrink-0 ml-2">
                                            {notification.timeAgo}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* <div className="px-4 py-2 border-t border-[#E5E7EB]">
                            <button 
                                // This button would ideally link to a full /notifications page
                                className="w-full text-center text-[#2563EB] text-sm font-medium hover:text-[#1D4ED8]"
                                onClick={() => router.push('/notifications')}
                            >
                                View All Notifications
                            </button>
                        </div> */}
                    </div>
                )}
            </div>

                {/* Profile Section */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center bg-[#F3F4F6] rounded-full h-[31px] px-1 border border-[#E5E7EB] hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="w-[25px] h-[25px] bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">
                      U
                    </div>
                    <img
                      src="/chevron-down.svg"
                      alt="Expand"
                      className="w-3 h-3 ml-2 opacity-50"
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2">
                      <div className="px-4 py-2 border-b border-[#E5E7EB]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm text-gray-600">
                            U
                          </div>
                          <div>
                            <p className="font-medium text-[#1F2937]">{user?.username}</p>
                            <p className="text-sm text-[#6B7280]">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" className="w-full px-4 py-2 text-left text-[#1F2937] hover:bg-gray-50 flex items-center gap-2" onClick={() => router.push('/profile')}>
                          <FiUser size={16} />
                          <span>Profile</span>
                        </Link>
                        {/* <button className="w-full px-4 py-2 text-left text-[#1F2937] hover:bg-gray-50 flex items-center gap-2">
                          <FiSettings size={16} />
                          <span>Settings</span>
                        </button> */}
                        <button className="w-full px-4 py-2 text-left text-[#EF4444] hover:bg-gray-50 flex items-center gap-2" onClick={logout}>
                          <FiLogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
        </div>

        {/* --- ACTIVE MOBILE SEARCH VIEW --- */}
        {/* {isMobileSearchOpen && (
            <div className="flex w-full items-center gap-2 md:hidden">
                <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 text-gray-600 hover:text-gray-800">
                    <FiChevronLeft size={24} />
                </button>
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                        <FiSearch size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-10 pl-10 pr-4 bg-[#F3F4F6] rounded-lg text-[#6B7280] focus:outline-none"
                        autoFocus
                    />
                </div>
            </div>
        )} */}
        {/* --- ACTIVE MOBILE SEARCH VIEW --- */}
          {isMobileSearchOpen && (
              <div ref={searchContainerRef} className="flex w-full items-center gap-2 md:hidden relative">
                  <button onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }} className="p-2 text-gray-600 hover:text-gray-800">
                      <FiChevronLeft size={24} />
                  </button>
                  <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                          <FiSearch size={16} />
                      </div>
                      <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
                          className="w-full h-10 pl-10 pr-4 bg-[#F3F4F6] rounded-lg text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                          autoFocus
                      />
                      
                      {/* Search Results Dropdown (Mobile uses the same component) */}
                      {showSearchResults && <SearchResultsDropdown />}
                  </div>
              </div>
          )}
    </div>
    </>
  );
};

export default TopBar;