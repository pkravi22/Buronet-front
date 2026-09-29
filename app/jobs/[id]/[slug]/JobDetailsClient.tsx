"use client";

import Link from 'next/link';
import TopBar from '@/components/TopBar';
import Navbar from '@/components/Navbar';
import {
  CalendarDays, Building2, Clock, BadgeIndianRupee, Edit, Download,
  UserCheck, FileText, LucideLink, FileArchive, Globe, Bookmark,
  Gift, ArrowLeft, LogIn, MapPin, Award, CheckCircle2, ChevronRight,
  ShieldCheck, HelpCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { get, postApi, remove } from '@/lib/api';
import { Job, ApiResponse } from '@/lib/types/jobs';
import { useAuth } from '@/context/AuthContext';
import { formatDate as formatDateHelper } from '@/lib/helpers/DateHelper';

interface JobDetailsPageProps {
  params: { id: string; slug: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ensureAbsoluteUrl = (url: any) => {
  if (!url) return '#';
  const str = String(url);
  return /^https?:\/\//i.test(str) ? str : `https://${str}`;
};

const sanitizeText = (text: any) => {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str
    .replace(/sarkari\s*result\.com/gi, 'buronet.co.in')
    .replace(/sarkari\s*result/gi, 'Buronet')
    .replace(/sarkariresult/gi, 'Buronet')
    .replace(/freejobalert\.com/gi, 'buronet.co.in')
    .replace(/freejobalert/gi, 'Buronet')
    .replace(/since 2012/gi, '')
    .replace(/\bthe\s+All\s+Document\b/gi, 'All Documents')
    .replace(/\bAll\s+Document\b/gi, 'All Documents')
    .replace(/\bReady\s+Scan\b/gi, 'Ready to Scan')
    .replace(/\bKindly\s+Ready\s+to\s+Scan\s+Document\b/gi, 'Kindly Scan Documents')
    .replace(/\bScan\s+Document\b/gi, 'Scan Documents')
    .replace(/\bAll\s+Column\b/gi, 'All Columns')
    .trim();
};

const scrubJobText = (text: any): string => {
  if (text === null || text === undefined) return '';
  let str = String(text).trim();

  // Strip common scraper meta lines and inline author signatures
  str = str
    .replace(/^(\s*Short\s+Information\s*[:\-]?\s*)/gi, '')
    .replace(/^(\s*Short\s+Info\s*[:\-]?\s*)/gi, '')
    .replace(/updated\s+[a-z]+\s+\d+,\s+\d{4}.*?by.*?(officially verified)?/gi, '')
    .replace(/updated\s+by\s+.*?(officially verified)?/gi, '')
    .replace(/officially verified/gi, '')
    .replace(/⚡\s*get custom govt job alerts.*$/gi, '')
    .replace(/download\s+.*?\s+notification pdf/gi, '')
    .replace(/no application fee is mentioned in the official notification\.?/gi, '');

  const footerIndex = str.toLowerCase().indexOf('welcome to this official website');
  if (footerIndex !== -1) str = str.substring(0, footerIndex);

  const disclaimerIndex = str.toLowerCase().indexOf('disclaimer :');
  if (disclaimerIndex !== -1) str = str.substring(0, disclaimerIndex);

  const lines = str.split('\n').filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const lower = trimmed.toLowerCase();

    // Junk / metadata line patterns to remove
    if (lower.includes('registered trademark') || lower.includes('disclaimer :')) return false;
    if (lower.startsWith('name of the post:') || lower.startsWith('name of post:')) return false;
    if (lower.startsWith('post date:') || lower.startsWith('latest update:') || lower.startsWith('total vacancy:')) return false;
    if (lower.startsWith('advt no:') || lower.startsWith('advt. no:') || lower.startsWith('advertisement no:')) return false;
    if (lower.includes('updated by') || lower.includes('posted by') || lower.includes('uploaded by') || lower.includes('officially verified')) return false;
    if (lower.includes('click here') || lower.includes('sarkariresult') || lower.includes('freejobalert')) return false;

    // Scraper author bio patterns (e.g., "As a recruitment lead writer & editor...", "I bring over five years...")
    if (lower.includes('recruitment lead writer') || lower.includes('editor, i focus') || lower.includes('content writing') || lower.includes('delivering accurate, authentic')) return false;
    if (lower.includes('sourcing updates from official') || lower.includes('experience in professional content') || lower.includes('career-focused content')) return false;

    // Scraper promotional / ad CTA lines
    if (lower.includes('get custom govt job alerts') || lower.includes('govt job alerts by your qualification') || lower.includes('(10th | 12th | diploma')) return false;
    if (lower.includes('no application fee is mentioned in the official notification')) return false;
    if (lower.startsWith('download ') && lower.includes('notification pdf')) return false;

    return true;
  });

  return sanitizeText(lines.join('\n')).trim();
};

const renderParagraphs = (text: string) => {
  if (!text) return null;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className="space-y-3">
      {paragraphs.map((para, idx) => {
        // If paragraph is long (> 180 chars) and contains multiple sentences, format as elegant bullet items
        const sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
        if (para.length > 180 && sentences.length > 1) {
          return (
            <ul key={idx} className="space-y-2.5 my-2">
              {sentences.map((sent, sIdx) => (
                <li key={sIdx} className="flex items-start gap-2.5 text-slate-800 font-medium text-[14px] sm:text-[15px] leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-150/60">
                  <span className="w-2 h-2 rounded-full bg-[#0096c7] shrink-0 mt-2" />
                  <span>{sent.trim()}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="text-slate-800 font-medium text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-line">
            {para}
          </p>
        );
      })}
    </div>
  );
};

const isValidNote = (n: any) => {
  if (!n) return false;
  const lower = String(n).toLowerCase();
  if (lower.includes('pay the exam fee through online / offline fee mode only')) return false;
  if (lower.includes('sarkari result') || lower.includes('freejobalert')) return false;
  if (lower.includes('result tools')) return false;
  return true;
};

// Only accept strings that look like real age limits (e.g. "18-35 years", "Max 30 yr", "21 to 40")
const isValidAge = (n: string) => {
  if (!n || typeof n !== 'string') return false;
  const trimmed = n.trim();
  if (/^\d+$/.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  const educationKeywords = [
    'degree', 'diploma', 'bachelor', 'b.sc', 'b.com', 'b.tech', 'bca', 'bba',
    'mba', 'm.sc', 'm.tech', 'graduate', 'post graduate', 'recognised university', 'institute',
    'stream', 'horticulture', 'agriculture', 'forestry', 'fisheries', 'cse', 'pgdca',
    'data science', 'analytics', 'hotel management', 'fashion technology'
  ];
  if (educationKeywords.some(kw => lower.includes(kw))) return false;
  if (lower.includes('sarkari result') || lower.includes('freejobalert') || lower.includes('result tools')) return false;
  if (lower.includes('short information') || lower.includes('short info')) return false;
  const hasAgeIndicator = /\d+\s*(year|yr|वर्ष)/i.test(trimmed);
  const hasNumericRange = /\d{2}\s*[-–to]+\s*\d{2}/.test(trimmed);
  const hasAgeKeyword = /(age limit|minimum age|maximum age|max age|min age|upper age|lower age)/i.test(trimmed);
  return hasAgeIndicator || hasNumericRange || hasAgeKeyword;
};

const parseQualificationsTable = (list: any[]) => {
  const rows: { postName: string; totalPost: string; eligibility: string }[] = [];
  let currentPost: string | null = null;
  let currentTotal: string = '';
  let currentElig: string[] = [];

  const flush = () => {
    if (currentPost) {
      rows.push({
        postName: currentPost,
        totalPost: currentTotal || '—',
        eligibility: currentElig.join('; ')
      });
    }
    currentPost = null;
    currentTotal = '';
    currentElig = [];
  };

  for (let item of list) {
    const trimmed = String(item || '').trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (lower === 'post name' || lower === 'total post' || lower.includes('post eligibility details')) {
      continue;
    }

    const isNumber = /^\d+$/.test(trimmed);

    if (isNumber) {
      currentTotal = trimmed;
    } else {
      const isEligWords = ['degree', 'diploma', 'passed', 'qualification', 'eligibility', 'recognised', 'institute', 'class', 'experience', 'b.tech', 'be', 'graduate', 'soon'].some(w => lower.includes(w));

      if (currentPost && (isEligWords || (!currentTotal && currentElig.length > 0))) {
        currentElig.push(trimmed);
      } else {
        flush();
        currentPost = trimmed;
      }
    }
  }
  flush();
  return rows;
};

// ── Org initials avatar ───────────────────────────────────────────────────────
function OrgAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
  const colours = [
    'from-cyan-500 to-indigo-600', 'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600', 'from-orange-500 to-red-600', 'from-blue-600 to-cyan-600',
  ];
  const idx = (name.charCodeAt(0) || 0) % colours.length;
  return (
    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colours[idx]} flex items-center justify-center shadow-md`}>
      <span className="text-white font-black text-2xl tracking-wider">{initials || 'G'}</span>
    </div>
  );
}

// ── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0096c7] shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-base font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
function Card({
  title,
  icon,
  badgeText,
  headerGradient = 'from-slate-800 via-indigo-900 to-slate-900',
  borderColor = 'border-gray-200/80',
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badgeText?: string;
  headerGradient?: string;
  borderColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${borderColor} overflow-hidden transition-all duration-200 hover:shadow-md`}>
      <div className={`bg-gradient-to-r ${headerGradient} px-5 py-3.5 flex items-center justify-between text-white`}>
        <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2.5 tracking-wide text-white">
          <span className="p-1.5 rounded-lg bg-white/15 backdrop-blur-sm shrink-0 flex items-center justify-center">{icon}</span>
          {title}
        </h3>
        {badgeText && (
          <span className="text-[11px] font-black px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/25 uppercase tracking-wider">
            {badgeText}
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6 text-slate-800">
        {children}
      </div>
    </div>
  );
}

function cleanOrg(raw: any): string {
  if (!raw) return 'N/A';
  const c = String(raw).trim();
  const lower = c.toLowerCase();
  if (lower === 'post name' || lower === 'click here' || lower.includes('sarkari') || lower.includes('freejob')) {
    return 'N/A';
  }
  return c;
}

function extractDeadlineString(job: Job): string | undefined {
  if (job.lastDateToApply && String(job.lastDateToApply).trim() !== "") {
    return String(job.lastDateToApply);
  }

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
        d.label && String(d.label).toLowerCase().includes(target)
      );
      if (found && found.value && String(found.value).trim() !== "") {
        return String(found.value);
      }
    }
  }

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

// ── Shared Main Job Content ───────────────────────────────────────────────────
interface MainJobContentProps {
  job: Job;
  isLoggedIn: boolean;
  jobId?: string;
}

function MainJobContent({ job, isLoggedIn, jobId }: MainJobContentProps) {
  const isAdmitCard = job.type === 'admit_card';

  // Scrubbed descriptions
  const primaryDesc = scrubJobText((job.shortDescription && job.shortDescription.length > 0) ? job.shortDescription.join("\n\n") : (job as any).enrichedDescription || job.jobDescription);
  const detailedDesc = scrubJobText(job.detailedJobDescription);

  // Parse table / qualifications
  let parsedRows: any[] = [];
  let qualificationsList: string[] = [];

  if (job?.qualifications?.length > 0) {
    const firstQ = job.qualifications[0];
    if (typeof firstQ === 'object' && firstQ !== null) {
      parsedRows = job.qualifications.map((q: any) => ({
        postName: q.postName || 'Various Posts',
        totalPost: q.totalPost || '—',
        eligibility: q.eligibility || ''
      }));
    } else {
      parsedRows = parseQualificationsTable(job.qualifications as any);
      qualificationsList = job.qualifications as any;
    }
  }

  const showTable = parsedRows.length > 0;
  const hasVacancyDetails = !!((job.vacancyDetails && job.vacancyDetails.length > 0) || (job.categoryVacancyDetails && job.categoryVacancyDetails.length > 0));

  // Dates parsing
  const importantDatesRaw = (job as any).importantDates;
  const parsedDates = (job.importantDatesStructured && job.importantDatesStructured.length > 0)
    ? job.importantDatesStructured.map(d => `${String(d?.label || '')}: ${String(d?.value || '')}`)
    : (importantDatesRaw && importantDatesRaw.length > 0)
      ? importantDatesRaw.map((d: any) => String(d || ''))
      : (job.eligibilityNotes?.filter((n: any) => n && typeof n === 'string' && n.includes('Date:')) || []).map((n: string) => n.replace(/📅\s*Date:\s*/g, '').trim());

  // Fee parsing
  const feeDetailsRaw = (job as any).feeDetails;
  const parsedFees = (job.applicationFee && job.applicationFee.length > 0)
    ? job.applicationFee.map(f => f.amount ? `${String(f.category || '')}: ${String(f.amount || '')}` : String(f.category || ''))
    : (feeDetailsRaw && feeDetailsRaw.length > 0)
      ? feeDetailsRaw.map((f: any) => String(f || ''))
      : (job.eligibilityNotes?.filter((n: any) => n && typeof n === 'string' && n.includes('Fee:')) || []).map((n: string) => n.replace(/💰\s*Fee:\s*/g, '').trim());

  // Age parsing
  const ageLimitsRaw = (job as any).ageLimits;
  const parsedAges = (job.ageLimits && job.ageLimits.length > 0)
    ? job.ageLimits.filter(isValidAge)
    : ((ageLimitsRaw && ageLimitsRaw.length > 0)
      ? ageLimitsRaw.map((a: any) => String(a || ''))
      : (job.eligibilityNotes?.filter((n: any) => n && typeof n === 'string' && (n.includes('Age Limit:') || n.includes('Age:'))) || []).map((n: string) => n.replace(/🧑\s*Age( Limit)?:\s*/g, '').trim())
    ).filter(isValidAge);

  // Other notes filtering
  const otherNotesRaw = (job as any).otherNotes;
  let otherNotes = (otherNotesRaw && otherNotesRaw.length > 0) ? otherNotesRaw.map((n: any) => String(n || '')) : [];
  if (otherNotes.length === 0 && job.eligibilityNotes?.length > 0) {
    otherNotes = job.eligibilityNotes.filter((n: any) => n && typeof n === 'string' && !isValidAge(n) && !n.includes('Date:') && !n.includes('Fee:'));
  }
  otherNotes = otherNotes.filter((n: string) => {
    if (!n) return false;
    const lower = n.toLowerCase();
    if (lower.includes('age limit') || lower.includes('age:') || lower.includes('minimum age') || lower.includes('maximum age') || lower.includes('age relaxation')) return false;
    if (lower.includes('fee:') || lower.includes('fee details') || lower.includes('application fee')) return false;
    if (lower.includes('date:') || lower.includes('important dates') || lower.includes('last date')) return false;
    if (lower.includes('short information') || lower.includes('short info')) return false;
    if (parsedAges.some((age: string) => age.trim() === n.trim())) return false;
    return true;
  });

  const applicationSteps = (job.howToApply && job.howToApply.length > 0)
    ? job.howToApply
    : (job.applicationProcess && job.applicationProcess.length > 0 ? job.applicationProcess : []);

  const renderVacancyTable = (details: Record<string, string>[]) => {
    if (!details || details.length === 0) return null;
    const tables: Record<string, string>[][] = [];
    let currentTable: Record<string, string>[] = [];
    let currentKeys = new Set<string>();

    for (const row of details) {
      if ('col_0' in row || 'col_1' in row || Object.keys(row).some(k => k.toLowerCase().startsWith('col_'))) {
        continue;
      }
      const rowKeys = Object.keys(row);
      if (rowKeys.length === 0) continue;
      const nonCommonKeys = rowKeys.filter(k => k !== 'Post Name' && k !== 'Total Post');
      const hasOverlap = nonCommonKeys.some(k => currentKeys.has(k));

      if (currentTable.length > 0 && !hasOverlap && rowKeys.some(k => k.toLowerCase().includes('eligibility') || k.toLowerCase().includes('gen') || k.toLowerCase().includes('obc') || k.toLowerCase().includes('total'))) {
        tables.push(currentTable);
        currentTable = [row];
        currentKeys = new Set(rowKeys);
      } else {
        currentTable.push(row);
        rowKeys.forEach(k => currentKeys.add(k));
      }
    }
    if (currentTable.length > 0) tables.push(currentTable);
    if (tables.length === 0) return null;

    return (
      <div className="space-y-4 my-3">
        {tables.map((tableData, tableIdx) => {
          const headers = Array.from(new Set(tableData.flatMap(row => Object.keys(row))));
          return (
            <div key={tableIdx} className="overflow-x-auto border border-blue-150/70 rounded-xl shadow-sm">
              <table className="min-w-full divide-y divide-blue-150 text-left">
                <thead className="bg-blue-50/70">
                  <tr>
                    {headers.map((h, idx) => (
                      <th key={idx} className="px-4 py-3 text-[15px] font-extrabold text-blue-900 uppercase tracking-wider">
                        {sanitizeText(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 bg-white">
                  {tableData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-blue-50/40 transition">
                      {headers.map((h, cIdx) => {
                        const val = row[h] || '—';
                        const isTotal = h.toLowerCase().includes('total');
                        return (
                          <td key={cIdx} className={`px-4 py-3 text-sm align-top leading-relaxed ${isTotal ? 'font-extrabold text-[#0096c7]' : 'text-slate-800 font-medium'}`}>
                            {sanitizeText(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  const detailsTitle = isAdmitCard ? 'Admit Card Details' : (job.type === 'job' ? 'Job Details' : 'Overview');
  const descriptionTitle = isAdmitCard ? 'About the Exam' : (job.type === 'job' ? 'Notification Overview' : 'Overview');

  return (
    <div className="flex-1 min-w-0 space-y-5">
      {/* Top Header */}
      <div>
        <div className="flex items-center flex-wrap gap-2 mb-2">
          {isAdmitCard && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[15px] font-extrabold border border-emerald-200 uppercase tracking-wider">
              <Award size={14} /> Admit Card Available
            </span>
          )}
          {job.sector && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[15px] font-extrabold border border-cyan-200 uppercase tracking-wider">
              {job.sector}
            </span>
          )}
          {job.totalVacancies && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[15px] font-extrabold border border-amber-300 uppercase tracking-wider">
              🔥 {job.totalVacancies} Vacancies
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">{job.jobTitle}</h1>
        {job.referenceNumber && (
          <p className="text-[15px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Advt / Ref No: {job.referenceNumber}</p>
        )}
      </div>

      {/* Primary Overview Card */}
      {/* {primaryDesc && (
        <Card
          title={descriptionTitle}
          icon={<FileText size={18} className="text-cyan-200" />}
          badgeText="Summary"
          headerGradient="from-slate-800 via-indigo-900 to-slate-900"
          borderColor="border-slate-200"
        >
          {renderParagraphs(primaryDesc)}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-[15px] sm:text-sm text-slate-600 font-semibold">
            {job.sector && <span>Department: <span className="font-extrabold text-slate-900">{job.sector}</span></span>}
            {job.employmentType && <span>Employment: <span className="font-extrabold text-slate-900">{job.employmentType}</span></span>}
          </div>
        </Card>
      )} */}

      {/* Detailed Role Overview Card */}
      {detailedDesc && (
        <Card
          title="Detailed Role & Recruitment Info"
          icon={<FileText size={18} className="text-indigo-200" />}
          badgeText="Official Details"
          headerGradient="from-indigo-700 via-purple-800 to-indigo-900"
          borderColor="border-indigo-200"
        >
          {renderParagraphs(detailedDesc)}
        </Card>
      )}

      {/* Side-by-Side Grid for Dates & Fee Structure */}
      {(parsedDates.length > 0 || parsedFees.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Important Dates */}
          {parsedDates.length > 0 && (
            <Card
              title="Important Dates"
              icon={<CalendarDays size={18} className="text-emerald-200" />}
              badgeText="Schedule"
              headerGradient="from-emerald-700 via-teal-700 to-emerald-800"
              borderColor="border-emerald-200"
            >
              <div className="space-y-2.5">
                {parsedDates.map((d: string, i: number) => {
                  const parts = d.split(':');
                  const label = parts[0];
                  const val = parts.slice(1).join(':').trim();
                  return (
                    <div key={i} className="flex flex-col p-3 bg-emerald-50/60 border-l-4 border-emerald-500 rounded-r-xl border-t border-b border-r border-emerald-100">
                      <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">{sanitizeText(label)}</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{val ? sanitizeText(val) : 'As per schedule'}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Application Fee */}
          {parsedFees.length > 0 && (
            <Card
              title="Application Fee"
              icon={<BadgeIndianRupee size={18} className="text-amber-200" />}
              badgeText="Fee Structure"
              headerGradient="from-amber-600 via-orange-600 to-amber-700"
              borderColor="border-amber-200"
            >
              <div className="space-y-2.5">
                {parsedFees.map((f: string, i: number) => {
                  const parts = f.split(':');
                  const label = parts[0];
                  const val = parts.slice(1).join(':').trim();
                  if (val) {
                    return (
                      <div key={i} className="flex items-center justify-between bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                        <span className="text-[15px] sm:text-sm font-extrabold text-slate-800">{sanitizeText(label)}</span>
                        <span className="text-[15px] sm:text-sm font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shrink-0">{sanitizeText(val)}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="text-[15px] sm:text-sm font-extrabold text-slate-800 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                      {sanitizeText(label)}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Eligibility & Qualifications Card */}
      {(hasVacancyDetails || parsedRows.length > 0 || qualificationsList.length > 0 || parsedAges.length > 0 || otherNotes.length > 0) && (
        <Card
          title="Eligibility & Qualification Criteria"
          icon={<UserCheck size={18} className="text-blue-200" />}
          badgeText="Requirements"
          headerGradient="from-blue-700 via-indigo-700 to-cyan-800"
          borderColor="border-blue-200"
        >
          <div className="space-y-5">
            {job.vacancyDetails && job.vacancyDetails.length > 0 && (
              <div>
                <p className="text-[15px] font-black text-blue-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Vacancy & Eligibility Details
                </p>
                {renderVacancyTable(job.vacancyDetails)}
              </div>
            )}
            {job.categoryVacancyDetails && job.categoryVacancyDetails.length > 0 && (
              <div>
                <p className="text-[15px] font-black text-blue-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Category Wise Vacancy Breakdown
                </p>
                {renderVacancyTable(job.categoryVacancyDetails)}
              </div>
            )}
            {job.qualifications && job.qualifications.length > 0 && (
              <div>
                <p className="text-[15px] font-black text-blue-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" /> Educational Qualifications
                </p>
                {showTable ? (
                  <div className="overflow-x-auto border border-blue-100 rounded-xl shadow-sm">
                    <table className="min-w-full divide-y divide-blue-100 text-left">
                      <thead className="bg-blue-50/80">
                        <tr>
                          <th className="px-4 py-3 text-[15px] font-black text-blue-900 uppercase tracking-wider">Post Name</th>
                          <th className="px-4 py-3 text-[15px] font-black text-blue-900 uppercase tracking-wider">Total Posts & Eligibility Criteria</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50 bg-white">
                        {parsedRows.map((row, i) => (
                          <tr key={i} className="hover:bg-blue-50/40 transition">
                            <td className="px-4 py-3 text-sm font-extrabold text-slate-900 align-top leading-relaxed">{sanitizeText(row.postName)}</td>
                            <td className="px-4 py-3 text-sm text-slate-800 align-top">
                              <div className="font-black text-base text-cyan-700 mb-1">{sanitizeText(row.totalPost)}</div>
                              {row.eligibility && (
                                <div className="text-[15px] sm:text-sm text-slate-700 font-semibold leading-relaxed mt-1">{sanitizeText(row.eligibility)}</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {qualificationsList.map((q: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-[15px] sm:text-sm font-extrabold text-slate-800 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        {sanitizeText(q)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {parsedAges.length > 0 && (
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
                <p className="text-[15px] font-black text-purple-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={15} className="text-purple-700" /> Age Criteria & Relaxation
                </p>
                <ul className="space-y-2">
                  {parsedAges.map((age: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] sm:text-sm font-bold text-purple-950">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                      {sanitizeText(age)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {otherNotes.length > 0 && (
              <div>
                <p className="text-[15px] font-black text-slate-500 uppercase tracking-wider mb-2">Important Instructions & Notes</p>
                <ul className="space-y-2">
                  {otherNotes.map((n: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] sm:text-sm text-slate-700 font-semibold">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      {sanitizeText(n)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Selection Procedure Card (Only rendered if non-empty!) */}
      {job.selectionProcess && job.selectionProcess.length > 0 && (
        <Card
          title="Selection Procedure"
          icon={<Award size={18} className="text-purple-200" />}
          badgeText="Stages"
          headerGradient="from-violet-700 via-purple-700 to-indigo-800"
          borderColor="border-purple-200"
        >
          <ol className="space-y-2.5">
            {job.selectionProcess.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-sm font-semibold text-slate-800 bg-purple-50/60 p-2 rounded-xl border border-purple-100">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white font-black text-[15px] flex items-center justify-center shrink-0 shadow-sm mt-0.5">{i + 1}</span>
                <span className="break-words min-w-0 pt-0.5 text-[14px] leading-relaxed font-semibold">{sanitizeText(step)}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* How to Apply Card (Only rendered if non-empty!) */}
      {applicationSteps && applicationSteps.length > 0 && (
        <Card
          title="How to Apply"
          icon={<FileText size={18} className="text-sky-200" />}
          badgeText="Step-by-Step"
          headerGradient="from-sky-700 via-cyan-700 to-blue-800"
          borderColor="border-sky-200"
        >
          <ol className="space-y-2.5">
            {applicationSteps.filter(isValidNote).map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-sm font-bold text-slate-800 bg-sky-50/70 p-2 rounded-xl border border-sky-100">
                <span className="w-7 h-7 rounded-full bg-[#0096c7] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">{i + 1}</span>
                <span className="break-words min-w-0 pt-0.5 leading-relaxed">{sanitizeText(step)}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Required Documents Card (Only rendered if non-empty!) */}
      {job.documentsRequired && job.documentsRequired.length > 0 && (
        <Card
          title="Required Documents for Application"
          icon={<UserCheck size={18} className="text-teal-200" />}
          badgeText="Checklist"
          headerGradient="from-teal-700 via-emerald-700 to-teal-800"
          borderColor="border-teal-200"
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {job.documentsRequired.map((doc, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] sm:text-sm font-extrabold text-slate-800 bg-teal-50/60 p-3 rounded-xl border border-teal-100">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <span className="break-words min-w-0 leading-relaxed">{sanitizeText(doc)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Important Links Card */}
      <Card
        title="Important Official Links"
        icon={<LucideLink size={18} className="text-slate-200" />}
        badgeText="Official Portals"
        headerGradient="from-slate-900 via-gray-800 to-slate-900"
        borderColor="border-slate-300"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {job.importantLinks && job.importantLinks.length > 0 ? (
            job.importantLinks
              .filter(lnk => {
                if (!lnk.label) return false;
                const lower = lnk.label.toLowerCase();
                return !lower.includes('android') && !lower.includes('telegram') && !lower.includes('sarkari') && !lower.includes('youtube') && !lower.includes('facebook') && !lower.includes('instagram') && !lower.includes('whatsapp');
              })
              .map((lnk, i) => (
                isLoggedIn ? (
                  <a
                    key={i}
                    href={ensureAbsoluteUrl(lnk.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-4 rounded-xl font-extrabold text-[15px] sm:text-sm transition-all shadow-sm hover:shadow-md ${lnk.type === 'pdf'
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white'
                      : lnk.type === 'apply'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {lnk.type === 'pdf' ? (
                        <FileArchive size={20} className="text-white shrink-0" />
                      ) : lnk.type === 'apply' ? (
                        <Globe size={20} className="text-white shrink-0" />
                      ) : (
                        <LucideLink size={20} className="text-slate-500 shrink-0" />
                      )}
                      <span>{sanitizeText(lnk.label)}</span>
                    </div>
                    <LucideLink size={16} className="opacity-80" />
                  </a>
                ) : (
                  <Link
                    key={i}
                    href={`/login?returnTo=/jobs/${jobId}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 text-slate-800 font-extrabold text-[15px] sm:text-sm transition group"
                  >
                    <div className="flex items-center gap-3">
                      <LogIn size={18} className="text-[#0096c7]" />
                      <span>Login to Access {sanitizeText(lnk.label)}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0096c7]" />
                  </Link>
                )
              ))
          ) : (
            <>
              {job.applyLink?.link && job.applyLink.link !== '#' && (
                isLoggedIn ? (
                  <a
                    href={ensureAbsoluteUrl(job.applyLink.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-[15px] sm:text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-white shrink-0" />
                      <span>{isAdmitCard ? 'Download Admit Card / Portal' : 'Apply Online / Official Portal'}</span>
                    </div>
                    <LucideLink size={16} className="text-white" />
                  </a>
                ) : (
                  <Link
                    href={`/login?returnTo=/jobs/${jobId}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-[#0096c7] font-extrabold text-[15px] sm:text-sm transition group"
                  >
                    <div className="flex items-center gap-3">
                      <LogIn size={18} />
                      <span>Login to {isAdmitCard ? 'Download Admit Card' : 'Apply Online'}</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                )
              )}

              {job.applyLink?.fileName && (
                isLoggedIn ? (
                  <a
                    href={ensureAbsoluteUrl(job.applyLink.fileName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-[15px] sm:text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileArchive size={20} className="text-white shrink-0" />
                      <span>Official Notification PDF</span>
                    </div>
                    <LucideLink size={16} className="text-white" />
                  </a>
                ) : (
                  <Link
                    href={`/login?returnTo=/jobs/${jobId}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-[15px] sm:text-sm transition group"
                  >
                    <div className="flex items-center gap-3">
                      <LogIn size={18} />
                      <span>Login to Download Official Notification PDF</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                )
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const JobDetailsClient = ({ initialJob }: { initialJob: Job | null }) => {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(initialJob);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const isLoggedIn = !!user;
  const userId = user?.id;
  const jobId = job?.id;

  useEffect(() => {
    document.documentElement.classList.remove('restrict-scroll');
    document.body.classList.remove('restrict-scroll');
  }, []);

  useEffect(() => {
    if (userId && job) {
      const fetchBookmarkStatus = async () => {
        try {
          const bookmarksResponse = await get<any[]>(`/bookmarks/${userId}/jobs`);
          if (bookmarksResponse.some(b => b.jobId === job.id)) setIsBookmarked(true);
        } catch (error) {
          console.error('Failed to fetch bookmarks:', error);
        }
      };
      fetchBookmarkStatus();
    }
  }, [userId, job?.id]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsBookmarking(true);
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      if (prev) {
        await remove(`/bookmarks/${userId}/job/${job?.id}`);
      } else {
        await postApi(`/bookmarks/${userId}/job`, { Id: job?.id });
      }
    } catch {
      setIsBookmarked(prev);
    } finally {
      setIsBookmarking(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-[#EEF0F4] flex items-center justify-center">
        {isLoggedIn && <Navbar activeItem="Jobs & Exams" />}
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">Job Not Found</h2>
          <p className="text-gray-400 mt-2 mb-6">This job listing may have expired or been removed.</p>
          <Link href={isLoggedIn ? "/jobs" : "/home"} className="inline-flex items-center gap-2 bg-[#0096c7] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-cyan-700 transition shadow-md">
            <ArrowLeft size={16} /> {isLoggedIn ? "Back to Jobs & Exams" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  const isAdmitCard = job.type === 'admit_card';

  return (
    <div className="min-h-screen bg-[#EEF0F4] font-sans text-slate-800">
      {/* Navigation Header */}
      {isLoggedIn ? (
        <Navbar activeItem="Jobs & Exams" />
      ) : (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
            <Link href="/home" className="flex items-center gap-2.5">
              <img src="/Logo.PNG" alt="Buronet Logo" className="w-[34px] h-[34px] object-cover" />
              <span className="text-[#0d1e2c] font-extrabold text-[22px] tracking-tight">Buronet</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/home#hero" className="text-[16px] font-bold text-gray-600 hover:text-[#0096c7] transition">Home</Link>
              <Link href="/home#jobs" className="text-[16px] font-bold text-gray-600 hover:text-[#0096c7] transition">Jobs</Link>
              <Link href="/home#community" className="text-[16px] font-bold text-gray-600 hover:text-[#0096c7] transition">Community</Link>
              <Link href="/home#resources" className="text-[16px] font-bold text-gray-600 hover:text-[#0096c7] transition">Resources</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex items-center justify-center text-sm font-bold text-[#0d1e2c] bg-transparent border-[1.5px] border-[#0d1e2c]/20 hover:border-[#0096c7] hover:text-[#0096c7] transition px-5 py-2 rounded-xl">
                Login
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center text-sm font-bold text-white bg-[#0096c7] hover:bg-[#007aa3] shadow-md hover:-translate-y-0.5 transition px-5 py-2 rounded-xl">
                Join Now
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className={isLoggedIn ? "lg:pl-[284px]" : ""}>
        {isLoggedIn && <TopBar />}
        <div className={`pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto`}>

          {/* Breadcrumb / Back button */}
          <div className="mb-6">
            <Link
              href={isLoggedIn ? "/jobs" : "/home"}
              className="inline-flex items-center gap-2 text-[15px] sm:text-sm font-bold text-slate-500 hover:text-[#0096c7] transition"
            >
              <ArrowLeft size={16} /> {isLoggedIn ? "Back to Jobs & Exams" : "Back to Home"}
            </Link>
          </div>

          {/* Expanded 2-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left Sidebar Overview Card */}
            <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-24 ">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ">
                <div className="flex justify-center mb-4">
                  <OrgAvatar name={cleanOrg(job.organizationName || job.companyName) === 'N/A' ? 'G' : cleanOrg(job.organizationName || job.companyName)} />
                </div>
                <h2 className="text-xl font-black text-slate-900 text-center leading-snug mb-1">
                  {job.jobTitle}
                </h2>
                {/* <div className="font-bold text-slate-600 text-[15px] sm:text-sm text-center mb-3">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Conducted By</span>
                  {cleanOrg(job.organizationName || job.companyName)}
                </div> */}

                {isAdmitCard && (
                  <div className="flex justify-center mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[15px] font-black border border-emerald-200">
                      <Award size={14} /> Admit Card Released
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {job.sector && (
                    <span className="text-[15px] font-extrabold px-3 py-1 bg-cyan-50 text-cyan-800 rounded-full border border-cyan-100">{job.sector}</span>
                  )}
                  {job.location && (
                    <span className="text-[15px] font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-full flex items-center gap-1 border border-slate-200">
                      <MapPin size={12} />{job.location}
                    </span>
                  )}
                </div>

                {/* Information Rows */}
                <div className="border-t border-gray-100 pt-3">
                  <InfoRow icon={<CalendarDays size={15} />} label={isAdmitCard ? 'Release Date' : 'Post Date'} value={formatDateHelper(job.dateOfIssue) || 'N/A'} />
                  <InfoRow icon={<Building2 size={15} />} label="Organization" value={cleanOrg(job.companyName || job.organizationName)} />
                  <InfoRow icon={<Clock size={15} />} label={isAdmitCard ? 'Exam Date' : 'Last Date'} value={formatDateHelper(extractDeadlineString(job) || '') || 'N/A'} />
                  {!isAdmitCard && <InfoRow icon={<BadgeIndianRupee size={15} />} label="Compensation" value={job.compensation || 'As per norms'} />}
                </div>

                {/* Primary Sidebar CTAs */}
                <div className="mt-5 space-y-2.5">
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={handleToggleBookmark}
                        disabled={isBookmarking}
                        className={`w-full py-2.5 rounded-xl font-extrabold text-[15px] sm:text-sm transition flex items-center justify-center gap-2 border ${isBookmarked
                          ? 'bg-cyan-50 border-cyan-300 text-[#0096c7]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <Bookmark size={16} className={isBookmarked ? 'fill-cyan-600' : ''} />
                        {isAdmitCard
                          ? (isBookmarked ? 'Exam Saved' : 'Save Exam')
                          : (isBookmarked ? 'Bookmarked' : 'Bookmark Job')
                        }
                      </button>

                      {isAdmitCard ? (
                        job.applyLink?.link && job.applyLink.link !== '#' ? (
                          <a
                            href={ensureAbsoluteUrl(job.applyLink.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-extrabold text-[15px] sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <Download size={16} /> Download Admit Card
                          </a>
                        ) : null
                      ) : (
                        <a
                          href={ensureAbsoluteUrl(job.applyLink?.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#0096c7] hover:bg-cyan-700 text-white py-2.5 rounded-xl font-extrabold text-[15px] sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Edit size={16} /> Apply Online Now
                        </a>
                      )}

                      {job.applyLink?.fileName && (
                        <a
                          href={ensureAbsoluteUrl(job.applyLink.fileName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2.5 rounded-xl font-extrabold text-[15px] sm:text-sm transition flex items-center justify-center gap-2"
                        >
                          <FileArchive size={16} /> Official Notification PDF
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/login?returnTo=/jobs/${jobId}`}
                        className="w-full bg-[#0096c7] hover:bg-cyan-700 text-white py-3 rounded-xl font-extrabold text-[15px] sm:text-sm transition shadow-md flex items-center justify-center gap-2"
                      >
                        <LogIn size={16} /> {isAdmitCard ? 'Login to Download Admit Card' : 'Login to Apply Online'}
                      </Link>
                      {job.applyLink?.fileName && (
                        <Link
                          href={`/login?returnTo=/jobs/${jobId}`}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl font-extrabold text-[15px] sm:text-sm transition flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> Login to View Official PDF
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!isLoggedIn && (
                <div className="mt-4 bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-2xl p-5 text-white shadow-sm">
                  <h3 className="font-extrabold text-sm mb-1">Get Direct Alerts 🔔</h3>
                  <p className="text-cyan-100 text-[15px] mb-4 leading-relaxed">
                    Create a free account to get verified government exam notifications and instant updates matching your eligibility.
                  </p>
                  <Link href="/register" className="block w-full bg-white text-[#0096c7] font-extrabold text-[15px] py-2.5 rounded-xl text-center hover:bg-cyan-50 transition shadow-sm">
                    Register Free Account
                  </Link>
                </div>
              )}
            </div>

            {/* Right Main Content Area */}
            <MainJobContent job={job} isLoggedIn={isLoggedIn} jobId={jobId} />

          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailsClient;
