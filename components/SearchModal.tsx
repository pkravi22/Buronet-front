// buronet/components/SearchModal.tsx

import { FiSearch, FiX, FiUser, FiBriefcase, FiLink } from 'react-icons/fi';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { SearchItemType, JobSearchResultPayload, UserSearchResultPayload } from '@/lib/types/search';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchItemType | 'All'>('All');
  const { results, loading, executeSearch } = useSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      searchInputRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, executeSearch]);

  const filteredResults = useMemo(() => {
    if (activeTab === 'All') return results.results;
    return results.results.filter(item => item.type === activeTab);
  }, [activeTab, results.results]);

  if (!isOpen) return null;

  const getIcon = (type: SearchItemType) => {
    switch (type) {
      case 'User': return <FiUser size={16} className="text-[#2563EB]" />;
      case 'Job': return <FiBriefcase size={16} className="text-[#10B981]" />;
      default: return <FiLink size={16} className="text-[#9CA3AF]" />;
    }
  };

  const tabs = [
    { key: 'All', label: `All (${results.results.length})` },
    { key: 'User', label: `People (${results.totalUserCount})` },
    { key: 'Job', label: `Jobs (${results.totalJobCount})` },
  ] as const;

  return (
    <div className="fixed inset-0 z-[100] bg-white md:bg-gray-50/70 md:backdrop-blur-sm flex justify-center p-0 md:p-8 overflow-y-auto">
      <div className="w-full h-full md:max-w-4xl md:h-auto md:max-h-full bg-white md:rounded-xl shadow-2xl flex flex-col">

        {/* Search Input Bar */}
        <div className="flex items-center p-4 border-b md:border-b-0">
          <div className="relative flex-1">
            <FiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search people, jobs, posts, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-[#F3F4F6] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <button onClick={onClose} className="p-2 ml-3 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SearchItemType | 'All')}
              className={`py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'text-[#6B7280] hover:text-[#1F2937]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {loading && searchQuery.length > 0 && (
            <div className="text-center py-12 text-[#6B7280]">Loading results...</div>
          )}

          {!loading && searchQuery.length > 0 && filteredResults.length === 0 && (
            <div className="text-center py-12 text-[#6B7280]">
              No results found for &quot;{searchQuery}&quot; in {activeTab}.
            </div>
          )}

          {!loading && searchQuery.length === 0 && (
            <div className="text-center py-12 text-[#6B7280]">
              Start typing to search people, jobs, and posts across Buronet.
            </div>
          )}

          {!loading && filteredResults.length > 0 && (
            <div className="space-y-4">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-white border border-[#E5E7EB] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150"
                >
                  {/* Clickable area */}
                  <Link
                    href={item.linkUrl}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="p-2 bg-gray-100 rounded-full shrink-0">{getIcon(item.type)}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1F2937] flex items-center gap-2 truncate">
                        {item.title}
                        {item.type === 'Job' && (
                          <span className="text-xs font-medium text-[#10B981] bg-[#D1FAE5] px-2 py-0.5 rounded-full ml-1 shrink-0">
                            {(item.payload as JobSearchResultPayload)?.jobType}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-[#6B7280] truncate">{item.subtitle}</p>
                    </div>
                  </Link>

                  {/* Inline Follow button — only shown for User results */}
                  {item.type === 'User' && (item.payload as UserSearchResultPayload)?.userId && (
                    <FollowButton
                      targetUserId={(item.payload as UserSearchResultPayload).userId}
                      initialIsFollowing={(item.payload as UserSearchResultPayload).isFollowedByCurrentUser ?? false}
                      size="sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
