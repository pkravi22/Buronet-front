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
  Railway: 'bg-blue-100 text-blue-700',
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
    days === null ? null
      : days < 0 ? 'Expired'
        : days === 0 ? 'Last day!'
          : days <= 7 ? `${days}d left`
            : job.lastDateToApply!.slice(0, 10);
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

        {/* badges */}
        {(src || secCls) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {src && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '999px', background: src.bg.replace('bg-', ''), color: src.text.replace('text-', '') }} className={`${src.bg} ${src.text}`}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%' }} className={src.dot} />
                {job.source}
              </span>
            )}
            {secCls && (
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }} className={secCls}>
                {job.sector}
              </span>
            )}
          </div>
        )}

        {/* meta */}
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {job.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={12} style={{ color: '#d1d5db', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
            </div>
          )}
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
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');

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
    <section style={{ background: 'linear-gradient(180deg, #f5f8fa 0%, #eef4f7 100%)', padding: '64px 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>

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
              className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0096c7]"
            >
              {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Desktop pills */}
          <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: '16px', padding: '6px', gap: '4px' }}>
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
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 text-gray-800"
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
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
          <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '16px', paddingBottom: '8px' }}>
            <Link
              href="/jobs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0096c7',
                color: '#fff',
                fontWeight: 700,
                padding: '14px 40px',
                borderRadius: '16px',
                boxShadow: '0 6px 20px rgba(0,150,199,0.35)',
                textDecoration: 'none',
                fontSize: '15px',
                transition: 'all 0.2s',
              }}
            >
              View all {totalCount.toLocaleString()} listings
              <ArrowRight size={17} />
            </Link>
            <p style={{ color: '#6b8499', fontSize: '13px', marginTop: '14px' }}>
              Sign up free to bookmark jobs and get deadline alerts
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
