'use client';
import Link from 'next/link';
import { MouseEvent } from 'react';
import { Job } from '@/lib/types/jobs/';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Banknote, Clock, Bookmark, ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: string, isBookmarked: boolean) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SOURCE_STYLES: Record<string, { bg: string; text: string }> = {
  SarkariResult: { bg: 'bg-orange-50', text: 'text-orange-600' },
  IndGovtJobs:   { bg: 'bg-sky-50',    text: 'text-sky-600'    },
  Manual:        { bg: 'bg-gray-100',  text: 'text-gray-500'   },
};

const SECTOR_COLOURS: Record<string, string> = {
  Railway:        'bg-blue-50 text-blue-700',
  Banking:        'bg-purple-50 text-purple-700',
  Defense:        'bg-red-50 text-red-700',
  Education:      'bg-green-50 text-green-700',
  Healthcare:     'bg-teal-50 text-teal-700',
  'Civil Services': 'bg-amber-50 text-amber-700',
  Government:     'bg-indigo-50 text-indigo-700',
};

// Org-name abbreviation map — cleans up scraper artefacts like "Post Name", "SSC" for UPSSSC
const ORG_CLEAN: Record<string, string> = {
  'Post Name':  '',
  'post name':  '',
  'Post name':  '',
};

function cleanOrg(raw: string): string {
  return ORG_CLEAN[raw.trim()] ?? raw.trim();
}

function formatDeadline(raw?: string): { label: string; urgent: boolean; expired: boolean } {
  if (!raw) return { label: 'No deadline', urgent: false, expired: false };
  // Try parsing
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
    if (days < 0)  return { label: 'Expired',           urgent: false, expired: true };
    if (days === 0) return { label: 'Last day!',         urgent: true,  expired: false };
    if (days <= 7)  return { label: `${days}d left`,     urgent: true,  expired: false };
    return { label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), urgent: false, expired: false };
  }
  // Non-parseable string — return as-is truncated
  return { label: raw.slice(0, 28), urgent: false, expired: false };
}

// Initials avatar when no logo
function OrgAvatar({ name, sector }: { name: string; sector?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const colours = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
  ];
  const idx = name.charCodeAt(0) % colours.length;

  return (
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colours[idx]} flex items-center justify-center shrink-0`}>
      <span className="text-white font-bold text-sm">{initials || 'G'}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const JobCard = ({ job, isBookmarked, onToggleBookmark }: JobCardProps) => {
  const { user } = useAuth();

  const org      = cleanOrg(job.organizationName || job.companyName || 'Government');
  const deadline = formatDeadline(job.lastDateToApply);
  const source   = (job as any).source as string | undefined;
  const sector   = job.sector;
  const srcStyle = source ? (SOURCE_STYLES[source] ?? SOURCE_STYLES.Manual) : null;
  const secStyle = sector ? (SECTOR_COLOURS[sector] ?? SECTOR_COLOURS.Government) : null;

  const handleBookmark = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    onToggleBookmark(job.id!, isBookmarked);
  };

  return (
    <Link href={`/jobs/${job.id}`} className="block group focus:outline-none">
      <div className="
        relative bg-white rounded-2xl border border-gray-100
        shadow-sm hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 overflow-hidden h-full flex flex-col
      ">
        {/* Top colour accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
          scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />

        <div className="p-5 flex flex-col gap-4 flex-1">

          {/* ── Header: avatar + title + bookmark ──────────────────── */}
          <div className="flex items-start gap-3">
            <OrgAvatar name={org} sector={sector} />

            <div className="flex-1 min-w-0 pr-8">
              <h3 className="text-gray-900 font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {job.jobTitle}
              </h3>
              {org && (
                <p className="text-gray-500 text-sm mt-0.5 truncate font-medium">{org}</p>
              )}
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bookmark
                size={17}
                className={isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}
              />
            </button>
          </div>

          {/* ── Tags: source + sector ───────────────────────────────── */}
          <div className="flex flex-wrap gap-1.5">
            {/* Source tag removed */}
            {secStyle && sector && sector !== 'Government' && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${secStyle}`}>
                {sector}
              </span>
            )}
          </div>

          {/* ── Meta: location + compensation ──────────────────────── */}
          <div className="flex flex-col gap-1.5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{job.location || 'India'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Banknote size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{job.compensation || 'As per norms'}</span>
            </span>
          </div>

          {/* ── Footer: deadline + view link ────────────────────────── */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${
              deadline.expired  ? 'text-gray-400 line-through' :
              deadline.urgent   ? 'text-red-500' :
                                  'text-gray-500'
            }`}>
              <Clock size={12} className="shrink-0" />
              {deadline.expired ? 'Expired' : deadline.label}
            </span>

            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
              View <ExternalLink size={11} />
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
};

export default JobCard;
