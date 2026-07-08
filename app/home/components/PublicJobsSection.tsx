'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase, CalendarDays, Award, BarChart3,
  Search, X, ChevronRight, MapPin, Clock, ChevronDown, ArrowRight, ChevronLeft
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
  importantDatesStructured?: { label: string; value: string }[];
  importantDates?: string[];
  eligibilityNotes?: string[];
}
interface PublicRes { page: number; pageSize: number; totalCount: number; totalPages: number; data: Job[] }

const TABS = [
  { id: 'job', label: 'Latest Jobs', Icon: Briefcase },
  { id: 'admit_card', label: 'Admit Cards', Icon: CalendarDays },
  { id: 'result', label: 'Results', Icon: Award },
  { id: 'update', label: 'Updates', Icon: BarChart3 },
] as const;
type TabId = typeof TABS[number]['id'];

const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  SarkariResult: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
  IndGovtJobs: { bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-400' },
  Manual: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400' },
};

const SECTOR_COLORS: Record<string, string> = {
  Railway: 'bg-cyan-100 text-cyan-700',
  Banking: 'bg-purple-100 text-purple-700',
  Defense: 'bg-red-100 text-red-700',
  Education: 'bg-emerald-100 text-emerald-700',
  Healthcare: 'bg-teal-100 text-teal-700',
  'Civil Services': 'bg-amber-100 text-amber-700',
  Government: 'bg-indigo-100 text-indigo-700',
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

function parseDateString(raw?: string): Date | null {
  if (!raw) return null;
  let d = new Date(raw);
  if (!isNaN(d.getTime())) return d;

  const match = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function daysLeft(s?: string) {
  if (!s) return null;
  const d = parseDateString(s);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function extractDeadlineString(job: Job): string | undefined {
  if (job.lastDateToApply && job.lastDateToApply.trim() !== "") {
    return job.lastDateToApply;
  }

  // Check structured important dates first
  if (job.importantDatesStructured && job.importantDatesStructured.length > 0) {
    const targets = [
      "last date for apply online",
      "last date to apply",
      "last date for apply",
      "last date online",
      "last date to register",
      "last date for registration",
      "registration last date",
      "apply online last date",
      "last date",
      "deadline",
      "application end",
      "online application end"
    ];

    for (const target of targets) {
      const found = job.importantDatesStructured.find(d => 
        d.label && d.label.toLowerCase().includes(target)
      );
      if (found && found.value && found.value.trim() !== "") {
        return found.value;
      }
    }
  }

  // Fallback to unstructured importantDates string array
  const importantDatesRaw = (job as any).importantDates as string[] | undefined;
  if (importantDatesRaw && importantDatesRaw.length > 0) {
    const targets = [
      "last date for apply online",
      "last date to apply",
      "last date for apply",
      "last date online",
      "last date to register",
      "last date for registration",
      "registration last date",
      "apply online last date",
      "last date",
      "deadline",
      "application end",
      "online application end"
    ];

    for (const target of targets) {
      const found = importantDatesRaw.find(d => d.toLowerCase().includes(target));
      if (found) {
        const parts = found.split(':');
        if (parts.length > 1) {
          const val = parts.slice(1).join(':').trim();
          if (val) return val;
        }
      }
    }
  }

  // Fallback to eligibilityNotes
  if (job.eligibilityNotes && job.eligibilityNotes.length > 0) {
    const found = job.eligibilityNotes.find(n => 
      n.includes('Date:') && n.toLowerCase().includes('last date')
    );
    if (found) {
      const val = found.replace(/📅\s*Date:\s*/g, '').replace(/last date:\s*/gi, '').trim();
      if (val) return val;
    }
  }

  return undefined;
}

const ORG_CLEAN: Record<string, string> = {
  'Post Name':  '',
  'post name':  '',
  'Post name':  '',
  'Click Here': '',
  'click here': '',
  'Sarkari Result': '',
  'sarkari result': '',
  'SarkariResult': '',
};

function cleanOrg(raw: string | undefined): string {
  if (!raw) return 'Government';
  const cleaned = ORG_CLEAN[raw.trim()] ?? raw.trim();
  if (cleaned.toLowerCase().includes('sarkari')) return 'Government';
  return cleaned || 'Government';
}

function OrgAvatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || 'G';
  const grad = AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="text-white font-bold text-[12px]">{initials}</span>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const org = cleanOrg(job.organizationName || job.companyName);
  const rawDeadline = extractDeadlineString(job);
  const days = daysLeft(rawDeadline);
  const deadlineLabel =
    days === null ? (rawDeadline ? rawDeadline.slice(0, 10) : null)
      : days < 0 ? 'Expired'
        : days === 0 ? 'Last day!'
          : days <= 7 ? `${days}d left`
            : rawDeadline ? (parseDateString(rawDeadline)?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) || rawDeadline.slice(0, 10)) : null;
  const urgent = days !== null && days >= 0 && days <= 7;
  const expired = days !== null && days < 0;
  const src = job.source && SOURCE_COLORS[job.source] ? SOURCE_COLORS[job.source] : null;
  const secCls = job.sector && SECTOR_COLORS[job.sector] ? SECTOR_COLORS[job.sector] : null;

  const href = job.id ? `/jobs/${job.id}` : job.applyLink?.link ?? '#';
  const isExternal = !job.id && !!job.applyLink?.link;

  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      {/* top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#0096c7] to-[#48cae4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div style={{ padding: '20px 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <OrgAvatar name={org} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontWeight: 700, color: '#111827', fontSize: '13px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
              {job.jobTitle}
            </h3>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>{org}</p>
          </div>
        </div>

        {/* badges & meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', margin: '8px 0' }}>
          {(src || secCls) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {/* Source tag removed */}
              {secCls && (
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }} className={secCls}>
                  {job.sector}
                </span>
              )}
            </div>
          )}

          {/* meta */}
          <div style={{ fontSize: '12px', color: '#6b7280', minWidth: 0 }}>
            {job.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={12} style={{ color: '#d1d5db', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f3f4f6', marginTop: 'auto' }}>
          {deadlineLabel ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: expired ? '#d1d5db' : urgent ? '#ef4444' : '#9ca3af', textDecoration: expired ? 'line-through' : 'none' }}>
              <Clock size={11} />
              {deadlineLabel}
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: '#d1d5db' }}>Open deadline</span>
          )}

          {isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 700, color: '#0096c7', textDecoration: 'none' }}>
              Apply <ChevronRight size={13} />
            </a>
          ) : (
            <Link href={href}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 700, color: '#0096c7', textDecoration: 'none' }}>
              View <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 animate-pulse">
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
  const [activeTab, setActiveTab] = useState<TabId>('job');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');

  const fetchJobs = useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ type: activeTab, page: String(p), pageSize: '6' });
      if (keyword.trim()) q.set('keyword', keyword.trim());
      const res = await fetch(`${API_BASE}/jobs/public?${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PublicRes = await res.json();
      setJobs(data.data ?? []);
      setTotalCount(data.totalCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setPage(p);
    } catch (err) {
      console.error('PublicJobsSection:', err);
      setJobs([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [activeTab, keyword]);

  useEffect(() => { fetchJobs(1); }, [activeTab, keyword]);

  return (
    <section style={{ background: 'linear-gradient(180deg, #f5f8fa 0%, #eef4f7 100%)', padding: '64px 0' }}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12">

        {/* ── Section header ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0f4fb', color: '#0096c7', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px', borderRadius: '999px', marginBottom: '12px' }}>
              <Briefcase size={12} />
              Government Opportunities
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0d1e2c', lineHeight: 1.15, marginBottom: '8px' }}>
              Latest Govt Jobs &amp; Exams
            </h2>
            <p style={{ color: '#6b8499', fontSize: '15px' }}>
              {loading ? (
                <span className="inline-block w-24 h-4 bg-gray-200 rounded-full animate-pulse" />
              ) : (
                <><span className="font-semibold text-[#0d1e2c]">{totalCount.toLocaleString()}</span> active listings across India</>
              )}
            </p>
          </div>

          <Link
            href="/jobs"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0096c7', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,150,199,0.3)', textDecoration: 'none', flexShrink: 0 }}
          >
            Browse all listings <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '24px' }}>
          {/* Mobile dropdown */}
          <div className="relative sm:hidden">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as TabId)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 text-[12px] font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0096c7]"
            >
              {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Desktop pills */}
          <div className="hidden sm:inline-flex" style={{ background: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: '16px', padding: '6px', gap: '4px' }}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '12px',
                  fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeTab === id ? '#0096c7' : 'transparent',
                  color: activeTab === id ? '#fff' : '#6b7280',
                  boxShadow: activeTab === id ? '0 2px 8px rgba(0,150,199,0.3)' : 'none',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search bar ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', maxWidth: '640px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '0 16px', height: '48px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setKeyword(searchInput)}
              placeholder="Search jobs, exams, organisations…"
              className="flex-1 text-[12px] outline-none bg-transparent placeholder:text-gray-400 text-gray-800"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setKeyword(''); }}>
                <X size={14} className="text-gray-400 hover:text-gray-600  transition-colors" />
              </button>
            )}
          </div>
          <button
            onClick={() => setKeyword(searchInput)}
            style={{ height: '48px', padding: '0 24px', background: '#0096c7', color: '#fff', fontSize: '14px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,150,199,0.25)', flexShrink: 0 }}
          >
            Search
          </button>
        </div>

        {/* ── Cards grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                  <p className="text-[12px] mt-1">Try a different search or tab.</p>
                </div>
              )
          }
        </div>

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              disabled={page <= 1}
              onClick={() => fetchJobs(page - 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
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
                    className={`w-9 h-9 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                      n === page ? 'bg-[#0096c7] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <span className="sm:hidden text-[12px] text-gray-500 font-medium">
              {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => fetchJobs(page + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        {!loading && (
          <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px' }}>
            <p style={{ color: '#6b8499', fontSize: '13px' }}>
              Sign up free to bookmark jobs and get deadline alerts
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
