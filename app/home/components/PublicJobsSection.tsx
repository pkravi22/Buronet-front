'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase, CalendarDays, Award, BarChart3,
  Search, X, ChevronRight, MapPin, Clock, ChevronDown, ArrowRight,
} from 'lucide-react';

interface Job {
  id?: string;
  jobTitle: string;
  organizationName: string;
  companyName: string;
  location: string;
  compensation?: string;
  lastDateToApply?: string;
  sector?: string;
  source?: string;
  type?: string;
  applyLink?: { link: string; fileName: string };
}
interface PublicRes { totalCount: number; data: Job[] }

const TABS = [
  { id: 'job',        label: 'Latest Jobs',  Icon: Briefcase   },
  { id: 'admit_card', label: 'Admit Cards',  Icon: CalendarDays },
  { id: 'result',     label: 'Results',      Icon: Award       },
  { id: 'update',     label: 'Updates',      Icon: BarChart3   },
] as const;
type TabId = typeof TABS[number]['id'];

const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  SarkariResult: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
  IndGovtJobs:   { bg: 'bg-sky-50',    text: 'text-sky-600',    dot: 'bg-sky-400'    },
  Manual:        { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400' },
};

const SECTOR_COLORS: Record<string, string> = {
  Railway:        'bg-blue-100 text-blue-700',
  Banking:        'bg-purple-100 text-purple-700',
  Defense:        'bg-red-100 text-red-700',
  Education:      'bg-emerald-100 text-emerald-700',
  Healthcare:     'bg-teal-100 text-teal-700',
  'Civil Services':'bg-amber-100 text-amber-700',
  Government:     'bg-indigo-100 text-indigo-700',
};

const AVATAR_GRADIENTS = [
  'from-[#0096c7] to-[#0077a3]',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-[#0096c7]',
  'from-amber-500 to-orange-500',
];

const API_BASE = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE ?? 'http://localhost/api';

function daysLeft(s?: string) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function OrgAvatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || 'G';
  const grad = AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="text-white font-bold text-sm">{initials}</span>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const org = job.organizationName || job.companyName || 'Government';
  const days = daysLeft(job.lastDateToApply);
  const deadlineLabel =
    days === null   ? null
    : days < 0      ? 'Expired'
    : days === 0    ? 'Last day!'
    : days <= 7     ? `${days}d left`
    : job.lastDateToApply!.slice(0, 10);
  const urgent  = days !== null && days >= 0 && days <= 7;
  const expired = days !== null && days < 0;
  const src     = job.source && SOURCE_COLORS[job.source] ? SOURCE_COLORS[job.source] : null;
  const secCls  = job.sector  && SECTOR_COLORS[job.sector]  ? SECTOR_COLORS[job.sector]  : null;

  const href       = job.id ? `/jobs/${job.id}` : job.applyLink?.link ?? '#';
  const isExternal = !job.id && !!job.applyLink?.link;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#0096c7] to-[#48cae4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* header */}
        <div className="flex items-start gap-3">
          <OrgAvatar name={org} />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#0096c7] transition-colors duration-200">
              {job.jobTitle}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{org}</p>
          </div>
        </div>

        {/* badges */}
        {(src || secCls) && (
          <div className="flex flex-wrap gap-1.5">
            {src && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${src.bg} ${src.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${src.dot}`} />
                {job.source}
              </span>
            )}
            {secCls && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${secCls}`}>
                {job.sector}
              </span>
            )}
          </div>
        )}

        {/* meta */}
        <div className="space-y-1 text-xs text-gray-500">
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-gray-300 shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
          {deadlineLabel ? (
            <span className={`flex items-center gap-1 text-[11px] font-semibold ${expired ? 'text-gray-300 line-through' : urgent ? 'text-red-500' : 'text-gray-400'}`}>
              <Clock size={10} />
              {deadlineLabel}
            </span>
          ) : (
            <span className="text-[11px] text-gray-300">Open deadline</span>
          )}

          {isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-[#0096c7] hover:text-[#007aa3] transition-colors">
              Apply <ChevronRight size={12} />
            </a>
          ) : (
            <Link href={href}
              className="inline-flex items-center gap-0.5 text-xs font-bold text-[#0096c7] hover:text-[#007aa3] transition-colors">
              View <ChevronRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-gray-200 rounded-full w-4/5" />
          <div className="h-3 bg-gray-100 rounded-full w-3/5" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-4 w-24 bg-gray-100 rounded-full" />
        <div className="h-4 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3 bg-gray-100 rounded-full w-2/3 mb-4" />
      <div className="flex justify-between pt-3 border-t border-gray-50">
        <div className="h-3 w-14 bg-gray-200 rounded-full" />
        <div className="h-3 w-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export default function PublicJobsSection() {
  const [activeTab, setActiveTab]     = useState<TabId>('job');
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [totalCount, setTotalCount]   = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword]         = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ type: activeTab, page: '1', pageSize: '6' });
      if (keyword.trim()) q.set('keyword', keyword.trim());
      const res = await fetch(`${API_BASE}/jobs/public?${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PublicRes = await res.json();
      setJobs(data.data ?? []);
      setTotalCount(data.totalCount ?? 0);
    } catch (err) {
      console.error('PublicJobsSection:', err);
      setJobs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, keyword]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <section className="py-16 md:py-20 lg:py-24" style={{ background: 'linear-gradient(180deg, #f5f8fa 0%, #eef4f7 100%)' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e0f4fb] text-[#0096c7] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <Briefcase size={12} />
              Government Opportunities
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-[#0d1e2c] leading-tight mb-2">
              Latest Govt Jobs &amp; Exams
            </h2>
            <p className="text-[#6b8499] text-base">
              {loading ? (
                <span className="inline-block w-24 h-4 bg-gray-200 rounded-full animate-pulse" />
              ) : (
                <><span className="font-semibold text-[#0d1e2c]">{totalCount.toLocaleString()}</span> active listings across India</>
              )}
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-[#0096c7] hover:bg-[#007aa3] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap text-sm"
          >
            Browse all listings <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          {/* Mobile dropdown */}
          <div className="relative sm:hidden">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as TabId)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0096c7]"
            >
              {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Desktop pills */}
          <div className="hidden sm:inline-flex bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 gap-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-[#0096c7] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search bar ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-10 max-w-2xl">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 h-12 shadow-sm focus-within:border-[#0096c7] focus-within:ring-2 focus-within:ring-[#0096c7]/20 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setKeyword(searchInput)}
              placeholder="Search jobs, exams, organisations…"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 text-gray-800"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setKeyword(''); }}>
                <X size={14} className="text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            )}
          </div>
          <button
            onClick={() => setKeyword(searchInput)}
            className="h-12 px-6 bg-[#0096c7] hover:bg-[#007aa3] text-white text-sm font-semibold rounded-2xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* ── Cards grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : jobs.length > 0
              ? jobs.map((j, i) => <JobCard key={j.id ?? i} job={j} />)
              : (
                <div className="col-span-full flex flex-col items-center py-20 text-gray-400">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Briefcase size={28} className="opacity-40" />
                  </div>
                  <p className="font-semibold text-gray-500">No listings found</p>
                  <p className="text-sm mt-1">Try a different search or tab.</p>
                </div>
              )
          }
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        {!loading && totalCount > 6 && (
          <div className="text-center mt-14">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-[#0096c7] hover:bg-[#007aa3] text-white font-bold px-10 h-13 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-base"
            >
              View all {totalCount.toLocaleString()} listings
              <ArrowRight size={17} />
            </Link>
            <p className="text-[#6b8499] text-sm mt-4">
              Sign up free to bookmark jobs and get deadline alerts
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
