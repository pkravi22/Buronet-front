"use client";

import {
  TrendingUp, Clock, Briefcase, FileText, Bookmark, Bell,
  ChevronRight, Building2, Banknote, Shield, GraduationCap,
  Stethoscope, Landmark, ChevronLeft, Plus,
  Search, X, Filter, RefreshCw, CalendarDays, Award, BarChart3,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { get, remove, postApi } from '@/lib/api';
import { Job } from '@/lib/types/jobs';
import JobCard from './JobCard';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

// ── Types ─────────────────────────────────────────────────────────────────────
interface BookmarkItem { id: string; jobId: string; userId: string; savedDate: string }
interface DashboardStats {
  totalActiveJobs: number; newJobsToday: number; totalBookmarkedJobs: number;
  newJobsTodayTrend?: string; totalApplications?: number;
  applicationsInProgress?: number; bookmarkedJobsTrend?: string;
}
interface DepartmentStat { departmentName: string; jobCount: number }
interface PublicRes { page: number; pageSize: number; totalCount: number; totalPages: number; data: Job[] }

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'job',        label: 'Latest Jobs',  Icon: Briefcase    },
  { id: 'admit_card', label: 'Admit Cards',  Icon: CalendarDays },
  { id: 'result',     label: 'Results',      Icon: Award        },
  { id: 'update',     label: 'Updates',      Icon: BarChart3    },
] as const;
type TabId = typeof TABS[number]['id'];

const SECTORS  = ['All', 'Railway', 'Banking', 'Defense', 'Education', 'Healthcare', 'Civil Services', 'Government'];
const SOURCES  = ['All Sources', 'SarkariResult', 'IndGovtJobs', 'Manual'];
const PAGE_SIZE = 12;

// ── Small reusable pieces ─────────────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon, colour }: {
  title: string; value: string; sub: string;
  icon: React.ReactNode; colour: string
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colour}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-sm font-semibold text-gray-700 truncate">{title}</p>
      <p className="text-xs text-gray-400 truncate">{sub}</p>
    </div>
  </div>
);

const DeptCard = ({ title, jobs, icon }: { title: string; jobs: number; icon: React.ReactNode }) => {
  const g: Record<string, string> = {
    railway: 'from-blue-500 to-blue-700', banking: 'from-violet-500 to-purple-700',
    defense: 'from-red-500 to-rose-700', education: 'from-emerald-500 to-green-700',
    healthcare: 'from-cyan-500 to-teal-700', 'civil services': 'from-amber-500 to-orange-600',
  };
  return (
    <div className={`min-w-[160px] h-28 rounded-2xl bg-gradient-to-br ${g[title.toLowerCase()] ?? 'from-blue-500 to-indigo-700'} p-4 flex flex-col justify-between`}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white">{icon}</div>
        <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{jobs}</span>
      </div>
      <div>
        <p className="text-white font-bold text-sm">{title}</p>
        <p className="text-white/70 text-xs">Ministry of India</p>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="h-5 w-20 bg-gray-100 rounded-md" />
      <div className="h-5 w-16 bg-gray-100 rounded-md" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
      <div className="h-3 w-20 bg-gray-200 rounded" />
      <div className="h-3 w-10 bg-gray-200 rounded" />
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MainContent() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  // Tab + filters
  const [activeTab,   setActiveTab]   = useState<TabId>('job');
  const [sector,      setSector]      = useState('All');
  const [source,      setSource]      = useState('All Sources');
  const [searchInput, setSearchInput] = useState('');
  const [keyword,     setKeyword]     = useState('');

  // Pagination
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Data
  const [jobs,          setJobs]          = useState<Job[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [bookmarks,     setBookmarks]     = useState<BookmarkItem[]>([]);
  const [dashStats,     setDashStats]     = useState<DashboardStats | null>(null);
  const [deptStats,     setDeptStats]     = useState<DepartmentStat[]>([]);

  // Dept scroll
  const deptRef = useRef<HTMLDivElement>(null);
  const [deptLeft,  setDeptLeft]  = useState(false);
  const [deptRight, setDeptRight] = useState(true);
  const scrollDept = (d: 'left' | 'right') =>
    deptRef.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' });
  const onDeptScroll = () => {
    const el = deptRef.current;
    if (!el) return;
    setDeptLeft(el.scrollLeft > 0);
    setDeptRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  // Fetch public jobs
  const fetchJobs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ type: activeTab, page: String(p), pageSize: String(PAGE_SIZE) });
      if (sector  !== 'All')         q.set('sector',  sector);
      if (source  !== 'All Sources') q.set('source',  source);
      if (keyword.trim())            q.set('keyword', keyword.trim());
      const res = await get<PublicRes>(`/jobs/public?${q}`);
      setJobs(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalCount(res.totalCount ?? 0);
      setPage(p);
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, sector, source, keyword]);

  useEffect(() => { fetchJobs(1); }, [activeTab, sector, source, keyword]);

  // Fetch legacy dashboard / bookmarks (auth-gated)
  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      get<BookmarkItem[]>(`/bookmarks/${user.id}/jobs`),
      get<DashboardStats>(`/dashboard/job/stats/${user.id}`),
      get<{ data: DepartmentStat[] }>('/dashboard/jobs/departments'),
    ]).then(([bk, ds, dept]) => {
      setBookmarks(bk ?? []);
      setDashStats(ds);
      setDeptStats(dept?.data ?? []);
    }).catch(console.error);
  }, [user?.id]);

  // Bookmark toggle
  const toggleBookmark = async (jobId: string, bookmarked: boolean) => {
    if (!user) return;
    try {
      if (bookmarked) {
        await remove(`/bookmarks/${user.id}/job/${jobId}`);
        setBookmarks(p => p.filter(b => b.jobId !== jobId));
      } else {
        await postApi(`/bookmarks/${user.id}/job`, { Id: jobId });
        setBookmarks(p => [...p, { jobId, userId: user.id!, id: '', savedDate: new Date().toISOString() }]);
      }
    } catch (e) { console.error(e); }
  };

  const activeTabLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Latest Jobs';
  const emptyMsg: Record<TabId, string> = {
    job: 'No job openings found.', admit_card: 'No admit cards found.',
    result: 'No results found.', update: 'No updates found.',
  };

  const statCards = [
    { title: 'Active Jobs',       value: (dashStats?.totalActiveJobs ?? totalCount).toString(),       sub: `${dashStats?.newJobsToday ?? 0} new today`,       icon: <Briefcase    size={20} className="text-blue-600"   />, colour: 'bg-blue-50'   },
    { title: 'Applications',      value: dashStats?.totalApplications?.toString() ?? '—',            sub: 'Track coming soon',                                 icon: <FileText     size={20} className="text-purple-600"/>, colour: 'bg-purple-50' },
    { title: 'Saved Jobs',        value: (dashStats?.totalBookmarkedJobs ?? bookmarks.length).toString(), sub: 'Updated now',                                  icon: <Bookmark     size={20} className="text-green-600" />, colour: 'bg-green-50'  },
    { title: 'Notifications',     value: unreadCount.toString(),                                     sub: `${unreadCount} unread`,                             icon: <Bell         size={20} className="text-amber-600" />, colour: 'bg-amber-50'  },
  ];

  const depts = [
    { title: 'Railway',         icon: <Building2    size={16} />, jobs: deptStats.find(d => d.departmentName === 'Railway')?.jobCount         ?? 0 },
    { title: 'Banking',         icon: <Banknote     size={16} />, jobs: deptStats.find(d => d.departmentName === 'Banking')?.jobCount         ?? 0 },
    { title: 'Defense',         icon: <Shield       size={16} />, jobs: deptStats.find(d => d.departmentName === 'Defense')?.jobCount         ?? 0 },
    { title: 'Education',       icon: <GraduationCap size={16}/>, jobs: deptStats.find(d => d.departmentName === 'Education')?.jobCount       ?? 0 },
    { title: 'Healthcare',      icon: <Stethoscope  size={16} />, jobs: deptStats.find(d => d.departmentName === 'Healthcare')?.jobCount      ?? 0 },
    { title: 'Civil Services',  icon: <Landmark     size={16} />, jobs: deptStats.find(d => d.departmentName === 'Civil Services')?.jobCount  ?? 0 },
  ];

  const hasFilters = sector !== 'All' || source !== 'All Sources' || keyword;

  return (
    <div className="w-full py-6 space-y-8">

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* ── Popular Departments ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Departments</h2>
        <div className="relative">
          {deptLeft && (
            <button onClick={() => scrollDept('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white rounded-full shadow-md hidden md:flex items-center justify-center hover:bg-gray-50">
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
          )}
          <div ref={deptRef} onScroll={onDeptScroll} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {depts.map((d, i) => <DeptCard key={i} {...d} />)}
          </div>
          {deptRight && (
            <button onClick={() => scrollDept('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white rounded-full shadow-md hidden md:flex items-center justify-center hover:bg-gray-50">
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* ── Jobs Section ────────────────────────────────────────────────── */}
      <div>
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Government Jobs</h2>
            <p className="text-sm text-gray-400 mt-0.5">{totalCount.toLocaleString()} listings · updated automatically</p>
          </div>
          {user?.isAdmin && (
            <Link href="/jobs/create" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
              <Plus size={15} /> Add Job
            </Link>
          )}
        </div>

        {/* ── Tabs — desktop pills, mobile dropdown ───────────────────── */}
        <div className="mb-5">
          {/* Mobile: dropdown */}
          <div className="relative md:hidden">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as TabId)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Desktop: pill tabs */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter Bar ──────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm space-y-3">
          {/* Search row */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-400 transition-colors">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setKeyword(searchInput)}
                placeholder={`Search ${activeTabLabel.toLowerCase()}…`}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-800"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(''); setKeyword(''); }} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setKeyword(searchInput)}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 rounded-xl transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => fetchJobs(1)}
              className="shrink-0 p-2.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <Filter size={12} /> Filters
            </div>

            {/* Sector */}
            <div className="relative">
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm text-gray-700 font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Source */}
            <div className="relative">
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm text-gray-700 font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={() => { setSector('All'); setSource('All Sources'); setKeyword(''); setSearchInput(''); }}
                className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Active chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2">
              {sector !== 'All' && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">
                  {sector} <button onClick={() => setSector('All')}><X size={10} /></button>
                </span>
              )}
              {source !== 'All Sources' && (
                <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full font-semibold">
                  {source} <button onClick={() => setSource('All Sources')}><X size={10} /></button>
                </span>
              )}
              {keyword && (
                <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-semibold">
                  "{keyword}" <button onClick={() => { setKeyword(''); setSearchInput(''); }}><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Cards Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : jobs.length > 0
              ? jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={bookmarks.some(b => b.jobId === job.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))
              : (
                <div className="col-span-full flex flex-col items-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Briefcase size={28} className="text-gray-300" />
                  </div>
                  <p className="font-semibold text-gray-500">{emptyMsg[activeTab]}</p>
                  <p className="text-sm text-gray-400 mt-1">Try clearing filters or check back later.</p>
                </div>
              )
          }
        </div>

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              disabled={page <= 1}
              onClick={() => fetchJobs(page - 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = page <= 3 ? i + 1 : page + i - 2;
                if (n < 1 || n > totalPages) return null;
                return (
                  <button
                    key={n}
                    onClick={() => fetchJobs(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      n === page ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <span className="sm:hidden text-sm text-gray-500 font-medium">
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => fetchJobs(page + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* bottom padding for mobile nav */}
      <div className="h-6" />
    </div>
  );
}
