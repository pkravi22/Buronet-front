"use client";

import Link from 'next/link';
import TopBar from '@/components/TopBar';
import Navbar from '@/components/Navbar';
import {
  CalendarDays, Building2, Clock, BadgeIndianRupee, Edit, Download,
  UserCheck, FileText, LucideLink, FileArchive, Globe, Bookmark,
  Gift, ArrowLeft, LogIn, MapPin, Award,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { get, postApi, remove } from '@/lib/api';
import { Job, ApiResponse } from '@/lib/types/jobs';
import { useAuth } from '@/context/AuthContext';
import { formatDate as formatDateHelper } from '@/lib/helpers/DateHelper';

interface JobDetailsPageProps {
  params: { id: string };
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
    .replace(/since 2012/gi, '') // Usually associated with their tagline
    // Grammar corrections for common scraped text errors
    .replace(/\bthe\s+All\s+Document\b/gi, 'All Documents')
    .replace(/\bAll\s+Document\b/gi, 'All Documents')
    .replace(/\bReady\s+Scan\b/gi, 'Ready to Scan')
    .replace(/\bKindly\s+Ready\s+to\s+Scan\s+Document\b/gi, 'Kindly Scan Documents')
    .replace(/\bScan\s+Document\b/gi, 'Scan Documents')
    .replace(/\bAll\s+Column\b/gi, 'All Columns')
    .trim();
};

const cleanJobDescription = (desc: any) => {
  if (desc === null || desc === undefined) return '';
  const str = String(desc);
  let cleaned = str
    .replace(/^(\s*Short\s+Information\s*[:\-]?\s*)/i, '')
    .replace(/^(\s*Short\s+Info\s*[:\-]?\s*)/i, '');

  const footerIndex = cleaned.toLowerCase().indexOf('welcome to this official website of sarkari result');
  if (footerIndex !== -1) {
    cleaned = cleaned.substring(0, footerIndex);
  }

  const disclaimerIndex = cleaned.toLowerCase().indexOf('disclaimer : the examination results');
  if (disclaimerIndex !== -1) {
    cleaned = cleaned.substring(0, disclaimerIndex);
  }

  cleaned = cleaned
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      return (
        !lower.includes('registered trademark') &&
        !lower.includes('disclaimer :') &&
        line.trim().length > 0
      );
    })
    .join('\n')
    .trim();

  return sanitizeText(cleaned);
};

const isValidNote = (n: any) => {
  if (!n) return false;
  const lower = String(n).toLowerCase();
  if (lower.includes('pay the exam fee through online / offline fee mode only')) return false;
  if (lower.includes('sarkari result')) return false;
  if (lower.includes('result tools')) return false;
  return true;
};

// Only accept strings that look like real age limits (e.g. "18-35 years", "Max 30 yr", "21 to 40")
const isValidAge = (n: string) => {
  if (!n || typeof n !== 'string') return false;
  const trimmed = n.trim();
  // Reject pure numbers (vacancy counts like 104, 381, 456)
  if (/^\d+$/.test(trimmed)) return false;
  // Reject strings that are mostly educational qualifications
  const lower = trimmed.toLowerCase();
  const educationKeywords = ['degree', 'diploma', 'bachelor', 'b.sc', 'b.com', 'b.tech', 'bca', 'bba',
    'mba', 'm.sc', 'm.tech', 'graduate', 'post graduate', 'recognised university', 'institute',
    'stream', 'horticulture', 'agriculture', 'forestry', 'fisheries', 'cse', 'pgdca',
    'data science', 'analytics', 'hotel management', 'fashion technology'];
  if (educationKeywords.some(kw => lower.includes(kw))) return false;
  // Reject sarkari junk
  if (lower.includes('sarkari result') || lower.includes('result tools')) return false;
  // Reject short description summaries
  if (lower.includes('short information') || lower.includes('short info')) return false;
  // Must contain a year/age indicator OR a numeric range
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
    'from-green-500 to-teal-600', 'from-orange-500 to-red-600', 'from-cyan-500 to-cyan-600',
  ];
  const idx = (name.charCodeAt(0) || 0) % colours.length;
  return (
    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colours[idx]} flex items-center justify-center shadow-lg`}>
      <span className="text-white font-bold text-2xl">{initials || 'G'}</span>
    </div>
  );
}

// ── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0096c7] shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-medium font-bold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-gray-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-lg text-[#111827] flex items-center gap-2 mb-5">
        <span className="text-[#0096c7]">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function cleanOrg(raw: any): string {
  if (!raw) return 'N/A';
  const c = String(raw).trim();
  const lower = c.toLowerCase();
  if (lower === 'post name' || lower === 'click here' || lower.includes('sarkari')) {
    return 'N/A';
  }
  return c;
}

function extractDeadlineString(job: Job): string | undefined {
  if (job.lastDateToApply && String(job.lastDateToApply).trim() !== "") {
    return String(job.lastDateToApply);
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
        d.label && String(d.label).toLowerCase().includes(target)
      );
      if (found && found.value && String(found.value).trim() !== "") {
        return String(found.value);
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

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className={`min-h-screen bg-[#EEF0F4] animate-pulse ${isLoggedIn ? '' : ''}`}>
      {isLoggedIn && <div className="hidden lg:block fixed top-0 left-0 w-[270px] h-full bg-white border-r border-gray-100" />}
      <div className={`${isLoggedIn ? 'lg:pl-[284px]' : ''} pt-20 px-4 sm:px-6 max-w-6xl mx-auto`}>
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <div className="lg:w-[320px] shrink-0 bg-white rounded-2xl h-96" />
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl h-48" />
            <div className="bg-white rounded-2xl h-36" />
            <div className="bg-white rounded-2xl h-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admit Card Right Content (shared between guest and logged-in) ─────────────
interface AdmitCardContentProps {
  job: Job;
  desc: string;
  parsedDates: string[];
  otherNotes: string[];
  showLinks?: boolean;
  jobId?: string;
}

function AdmitCardRightContent({ job, desc, parsedDates, otherNotes, showLinks = true, jobId }: AdmitCardContentProps) {
  return (
    <div className="flex-1 min-w-0 space-y-3">
      {/* Header */}
      <div>
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[14px] font-medium font-bold border border-green-200">
            <Award size={14} /> Admit Card
          </span>
          {job.sector && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-[14px] font-medium font-bold border border-cyan-200">
              {job.sector}
            </span>
          )}
        </div>
        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">{job.jobTitle}</h2>
        {job.referenceNumber && <p className="text-base font-medium text-gray-500 mt-1">Ref: {job.referenceNumber}</p>}
      </div>

      {/* About the Exam */}
      <Card title="About the Exam" icon={<FileText size={18} />}>
        {desc ? (
          <p className="text-gray-700 font-medium text-[15px] leading-relaxed whitespace-pre-line">{desc}</p>
        ) : (
          <p className="text-gray-400 italic text-[14px] font-medium">No description available.</p>
        )}
        {(job.sector || job.employmentType) && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-600 font-bold">
            {job.sector && <span>Department: <span className="font-extrabold text-gray-800">{job.sector}</span></span>}
            {job.employmentType && <span>Type: <span className="font-extrabold text-gray-800">{job.employmentType}</span></span>}
          </div>
        )}
      </Card>

      {/* Important Dates */}
      {parsedDates.length > 0 && (
        <Card title="Important Dates" icon={<CalendarDays size={18} className="text-[#00B4D8]" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedDates.map((d, i) => {
              const parts = d.split(':');
              const label = parts[0];
              const val = parts.slice(1).join(':').trim();
              return (
                <div key={i} className="flex flex-col p-2.5 bg-cyan-50/40 border border-cyan-100/30 rounded-xl">
                  <span className="text-[14px] font-medium font-semibold text-[#0096c7] uppercase tracking-wider">{label}</span>
                  <span className="text-base font-bold text-gray-800 mt-1">{val || 'As per schedule'}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* How to Download Admit Card */}
      <Card title="How to Download Admit Card" icon={<Download size={18} />}>
        <ol className="space-y-2">
          {job.applicationProcess?.length > 0 ? job.applicationProcess.filter(isValidNote).map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] font-medium text-gray-700">
              <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#0096c7] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="break-words min-w-0">{sanitizeText(step)}</span>
            </li>
          )) : [
            'Visit the official website of the conducting body.',
            'Find and click the Admit Card / Hall Ticket download section.',
            'Enter your Registration Number and Date of Birth.',
            'Click Submit to view your Admit Card.',
            'Download and take a printout for the exam day.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] font-medium text-gray-700">
              <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#0096c7] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="break-words min-w-0">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Important Instructions */}
      {(otherNotes.length > 0 || (job.qualifications?.length ?? 0) > 0) && (
        <Card title="Important Instructions" icon={<UserCheck size={18} />}>
          <ul className="space-y-1.5">
            {[...otherNotes, ...(job.qualifications ?? [])].slice(0, 12).map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] font-medium text-gray-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                {sanitizeText(n)}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Important Links */}
      <Card title="Important Links" icon={<LucideLink size={18} />}>
        <div className="space-y-3">
          {showLinks ? (
            <>
              {job.applyLink?.link && job.applyLink.link !== '#' && (
                <a href={ensureAbsoluteUrl(job.applyLink.link)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between bg-green-50 hover:bg-green-100 rounded-xl p-4 transition group">
                  <div className="flex items-center gap-3">
                    <Download size={18} className="text-green-600" />
                    <span className="text-[14px] font-medium font-semibold text-gray-800 group-hover:text-green-700">Download Admit Card</span>
                  </div>
                  <LucideLink size={15} className="text-gray-400 group-hover:text-green-500" />
                </a>
              )}
              {job.applyLink?.fileName && (
                <a href={ensureAbsoluteUrl(job.applyLink.fileName)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-50 hover:bg-red-50 rounded-xl p-4 transition group">
                  <div className="flex items-center gap-3">
                    <FileArchive size={18} className="text-red-500" />
                    <span className="text-[14px] font-medium text-gray-800 group-hover:text-red-700">Official Notification PDF</span>
                  </div>
                  <LucideLink size={15} className="text-gray-400 group-hover:text-red-500" />
                </a>
              )}
            </>
          ) : (
            <>
              <Link href={`/login?returnTo=/jobs/${jobId}`}
                className="flex items-center justify-between bg-green-50 hover:bg-green-100 rounded-xl p-4 transition group">
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-green-600" />
                  <span className="text-[14px] font-medium font-semibold text-gray-800 group-hover:text-green-700">Login to Download Admit Card</span>
                </div>
                <LogIn size={15} className="text-gray-400 group-hover:text-green-500" />
              </Link>
              {job.applyLink?.fileName && (
                <Link href={`/login?returnTo=/jobs/${jobId}`}
                  className="flex items-center justify-between bg-gray-50 hover:bg-red-50 rounded-xl p-4 transition group">
                  <div className="flex items-center gap-3">
                    <FileArchive size={18} className="text-red-500" />
                    <span className="text-[14px] font-medium text-gray-800 group-hover:text-red-700">Login to View Official PDF</span>
                  </div>
                  <LogIn size={15} className="text-gray-400 group-hover:text-red-500" />
                </Link>
              )}
            </>
          )}
          {showLinks && !job.applyLink?.link && !job.applyLink?.fileName && (
            <p className="text-gray-400 italic text-[14px] font-medium">No links available yet. Please check the official website.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// Convenience wrappers
function GuestAdmitCardContent(props: AdmitCardContentProps) {
  return <AdmitCardRightContent {...props} showLinks={false} />;
}
function LoggedInAdmitCardContent(props: AdmitCardContentProps) {
  return <AdmitCardRightContent {...props} showLinks={true} />;
}

// ── Main component ────────────────────────────────────────────────────────────
const JobDetailsPage = ({ params }: JobDetailsPageProps) => {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const isLoggedIn = !!user;
  const userId = user?.id;
  const jobId = params.id;

  useEffect(() => {
    document.documentElement.classList.remove('restrict-scroll');
    document.body.classList.remove('restrict-scroll');
  }, []);

  useEffect(() => {
    if (!jobId) return;
    const fetchJobDetails = async () => {
      setIsLoading(true);
      try {
        const jobResponse = await get<ApiResponse<Job>>(`/Jobs/${jobId}`);
        setJob(jobResponse as any);
        if (userId) {
          const bookmarksResponse = await get<any[]>(`/bookmarks/${userId}/jobs`);
          if (bookmarksResponse.some(b => b.jobId === jobId)) setIsBookmarked(true);
        }
      } catch (error) {
        console.error('Failed to fetch job details:', error);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId, userId]);



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

  if (isLoading) return <LoadingSkeleton isLoggedIn={isLoggedIn} />;

  if (!job) {
    return (
      <div className="min-h-screen bg-[#EEF0F4] flex items-center justify-center">
        {isLoggedIn && <Navbar activeItem="Jobs & Exams" />}
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">Job not found</h2>
          <p className="text-gray-400 mt-2 mb-6">This job may have expired or been removed.</p>
          <Link href={isLoggedIn ? "/jobs" : "/home"} className="inline-flex items-center gap-2 bg-[#0096c7] text-white px-5 py-2.5 rounded-xl font-semibold text-[14px] font-medium hover:bg-cyan-700 transition">
            <ArrowLeft size={16} /> {isLoggedIn ? "Back to Jobs" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  let descParagraphs = (job.shortDescription && job.shortDescription.length > 0)
    ? job.shortDescription.map(cleanJobDescription)
    : [cleanJobDescription((job as any).enrichedDescription ?? job.jobDescription)];

  const joinedDesc = descParagraphs.join(" ").trim();
  // Fallback to "Short Information" notes if description is empty or too brief/generic (under 120 chars)
  if (joinedDesc.length < 120) {
    const notes = [...(job.eligibilityNotes || []), ...((job as any).otherNotes || [])];
    const shortInfoNote = notes.find((n: string) => n && (n.toLowerCase().includes('short information') || n.toLowerCase().includes('short info')));
    if (shortInfoNote) {
      const cleaned = shortInfoNote
        .replace(/^(age\s+limit:\s*)?short\s+information:\s*/gi, '')
        .replace(/^short\s+info:\s*/gi, '')
        .trim();
      descParagraphs = [cleanJobDescription(cleaned)];
    }
  }

  const isAdmitCard = job.type === 'admit_card';

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

  const detailsTitle = isAdmitCard ? 'Admit Card Details' : (job.type === 'job' ? 'Job Details' : 'Short Description');
  const descriptionTitle = isAdmitCard ? 'About the Exam' : (job.type === 'job' ? 'Job Description' : 'Short Description');

  const importantDatesRaw = (job as any).importantDates;
  const parsedDates = (job.importantDatesStructured && job.importantDatesStructured.length > 0)
    ? job.importantDatesStructured.map(d => `${d.label}: ${d.value}`)
    : (importantDatesRaw && importantDatesRaw.length > 0)
      ? importantDatesRaw
      : (job.eligibilityNotes?.filter((n: string) => n.includes('Date:')) || []).map((n: string) => n.replace(/📅\s*Date:\s*/g, '').trim());

  const feeDetailsRaw = (job as any).feeDetails;
  const parsedFees = (job.applicationFee && job.applicationFee.length > 0)
    ? job.applicationFee.map(f => f.amount ? `${f.category}: ${f.amount}` : f.category)
    : (feeDetailsRaw && feeDetailsRaw.length > 0)
      ? feeDetailsRaw
      : (job.eligibilityNotes?.filter((n: string) => n.includes('Fee:')) || []).map((n: string) => n.replace(/💰\s*Fee:\s*/g, '').trim());

  const ageLimitsRaw = (job as any).ageLimits;
  const parsedAges = (job.ageLimits && job.ageLimits.length > 0)
    ? job.ageLimits.filter(isValidAge)
    : ((ageLimitsRaw && ageLimitsRaw.length > 0)
      ? ageLimitsRaw
      : (job.eligibilityNotes?.filter((n: string) => n.includes('Age Limit:') || n.includes('Age:')) || []).map((n: string) => n.replace(/🧑\s*Age( Limit)?:\s*/g, '').trim())
    ).filter(isValidAge);

  const otherNotesRaw = (job as any).otherNotes;
  let otherNotes = (otherNotesRaw && otherNotesRaw.length > 0) ? otherNotesRaw : [];
  if (otherNotes.length === 0 && job.eligibilityNotes?.length > 0) {
    otherNotes = job.eligibilityNotes;
  }

  // Filter otherNotes to prevent duplication with Age Limit, Fee, Important Dates, or Short Description sections.
  otherNotes = otherNotes.filter((n: string) => {
    if (!n) return false;
    const lower = n.toLowerCase();

    // 1. Exclude age limits/relaxation rules (which belong in the Age Limit section)
    if (lower.includes('age limit') || lower.includes('age:') || lower.includes('minimum age') || lower.includes('maximum age') || lower.includes('age relaxation')) return false;

    // 2. Exclude application fee details (which belong in the Application Fee section)
    if (lower.includes('fee:') || lower.includes('fee details') || lower.includes('application fee')) return false;

    // 3. Exclude dates/deadlines (which belong in the Important Dates section)
    if (lower.includes('date:') || lower.includes('important dates') || lower.includes('last date')) return false;

    // 4. Exclude "Short Information" summaries
    if (lower.includes('short information') || lower.includes('short info')) return false;

    // 5. Exclude any item that is already in parsedAges
    if (parsedAges.some((age: string) => age.trim() === n.trim())) return false;

    return true;
  });

  const applicationSteps = (job.howToApply && job.howToApply.length > 0)
    ? job.howToApply
    : job.applicationProcess || [];

  const renderVacancyTable = (details: Record<string, string>[]) => {
    if (!details || details.length === 0) return null;

    // Partition rows into tables based on schema compatibility
    const tables: Record<string, string>[][] = [];
    let currentTable: Record<string, string>[] = [];
    let currentKeys = new Set<string>();

    for (const row of details) {
      // Filter out col_0/col_1 metadata
      if ('col_0' in row || 'col_1' in row || Object.keys(row).some(k => k.toLowerCase().startsWith('col_'))) {
        continue;
      }

      const rowKeys = Object.keys(row);
      if (rowKeys.length === 0) continue;

      // Group rows if they share columns beyond "Post Name" and "Total Post"
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

    if (currentTable.length > 0) {
      tables.push(currentTable);
    }

    if (tables.length === 0) return null;

    return (
      <div className="space-y-4 my-3">
        {tables.map((tableData, tableIdx) => {
          const headers = Array.from(new Set(tableData.flatMap(row => Object.keys(row))));
          return (
            <div key={tableIdx} className="overflow-x-auto border border-gray-150/70 rounded-xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-150 text-left">
                <thead className="bg-gray-50/70">
                  <tr>
                    {headers.map((h, idx) => (
                      <th key={idx} className="px-4 py-3 text-[14px] font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {tableData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/40 transition">
                      {headers.map((h, cIdx) => {
                        const val = row[h] || '—';
                        const isTotal = h.toLowerCase().includes('total');
                        return (
                          <td key={cIdx} className={`px-4 py-3 text-[14px] align-top leading-relaxed ${
                            isTotal ? 'font-bold text-[#0096c7]' : 'text-gray-700 font-medium'
                          }`}>
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

  // ── GUEST LAYOUT (no sidebar) ─────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#EEF0F4] font-sans">
        {/* Simple top bar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/home" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-[14px] font-medium">
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="w-px h-5 bg-gray-200" />
              <Link href="/home" className="flex items-center gap-2">
                <span className="text-[#0096c7] font-bold text-xl">Buronet</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-[14px] font-medium font-semibold text-gray-600 hover:text-gray-900 transition px-4 py-2 rounded-xl hover:bg-gray-100">
                Log in
              </Link>
              <Link href="/register" className="text-[14px] font-medium font-semibold text-white bg-[#0096c7] hover:bg-cyan-700 px-4 py-2 rounded-xl transition shadow-sm">
                Sign up free
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="pt-16 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[14px] font-medium text-gray-400 mb-6">
              <Link href="/home" className="hover:text-[#0096c7] transition">Home</Link>
              <span>/</span>
              <span className="text-gray-600 truncate max-w-[300px]">{job.jobTitle}</span>
            </div>

            {/* Main grid */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">

              {/* ── Left: Overview card (sticky on desktop) ─────────────────── */}
              <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {/* Org logo */}
                  <div className="flex justify-center mb-5">
                    <OrgAvatar name={cleanOrg(job.organizationName || job.companyName) === 'N/A' ? 'G' : cleanOrg(job.organizationName || job.companyName)} />
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl font-bold text-[#111827] text-center leading-snug mb-1">
                    {job.jobTitle}
                  </h1>
                  <div className="font-medium text-gray-700 leading-tight text-center mb-3">
                    <span className="block text-xs text-gray-400 mb-0.5">Conducted By</span>
                    {cleanOrg(job.organizationName || job.companyName)}
                  </div>

                  {/* Admit card badge for admit_card type */}
                  {isAdmitCard && (
                    <div className="flex justify-center mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-[14px] font-medium font-bold border border-green-200">
                        <Award size={14} /> Admit Card Available
                      </span>
                    </div>
                  )}

                  {/* Sector + location badges */}
                  <div className="flex flex-wrap justify-center gap-2 mb-5 mt-2">
                    {job.sector && (
                      <span className="text-xs font-semibold px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full">{job.sector}</span>
                    )}
                    {job.location && (
                      <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                        <MapPin size={10} />{job.location}
                      </span>
                    )}
                  </div>

                  {/* Key info — labels change for admit cards */}
                  <div className="border-t border-gray-50 pt-4">
                    <InfoRow icon={<CalendarDays size={15} />} label={isAdmitCard ? 'Release Date' : 'Post Date'} value={formatDateHelper(job.dateOfIssue) || 'N/A'} />
                    <InfoRow icon={<Building2 size={15} />} label="Conducted By" value={cleanOrg(job.companyName || job.organizationName)} />
                    <InfoRow
                      icon={<Clock size={15} />}
                      label={isAdmitCard ? 'Exam Date' : 'Last Date to Apply'}
                      value={formatDateHelper(extractDeadlineString(job) || '') || 'N/A'}
                    />
                    {!isAdmitCard && <InfoRow icon={<BadgeIndianRupee size={15} />} label="Compensation" value={job.compensation || 'As per norms'} />}
                  </div>

                  {/* CTA — all redirect to login for guests */}
                  <div className="mt-5 space-y-3">
                    <Link
                      href={`/login?returnTo=/jobs/${jobId}`}
                      className="w-full bg-[#0096c7] hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-[14px] font-medium"
                    >
                      <LogIn size={16} /> {isAdmitCard ? 'Login to Download Admit Card' : 'Login to Apply'}
                    </Link>
                    {job.applyLink?.fileName && (
                      <Link
                        href={`/login?returnTo=/jobs/${jobId}`}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 text-[14px] font-medium"
                      >
                        <Download size={16} /> {isAdmitCard ? 'Login to View Official PDF' : 'Login to Download Notification'}
                      </Link>
                    )}
                    <Link
                      href={`/login?returnTo=/jobs/${jobId}`}
                      className="w-full border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 text-gray-600 hover:text-[#0096c7] py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 text-[14px] font-medium"
                    >
                      <LogIn size={16} /> {isAdmitCard ? 'Login to Save Exam' : 'Login to Save Job'}
                    </Link>
                  </div>
                </div>

                {/* Sign-up nudge */}
                <div className="mt-4 bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-2xl p-5 text-white">
                  <h3 className="font-bold text-[14px] font-medium mb-1">{isAdmitCard ? 'Get Exam Alerts 🔔' : 'Get Job Alerts 🔔'}</h3>
                  <p className="text-cyan-100 text-xs mb-4">
                    Create a free account to get notified about new {isAdmitCard ? 'government exam updates and admit cards' : 'government jobs'} matching your profile.
                  </p>
                  <Link href="/register" className="block w-full bg-white text-[#0096c7] font-bold text-[14px] font-medium py-2 rounded-xl text-center hover:bg-cyan-50 transition">
                    Sign up free
                  </Link>
                </div>
              </div>

              {/* ── Right: Content — admit card or standard job layout ─────── */}
              {isAdmitCard ? (
                <GuestAdmitCardContent
                  job={job}
                  desc={joinedDesc}
                  parsedDates={parsedDates}
                  otherNotes={otherNotes}
                  jobId={jobId}
                />
              ) : (
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Header */}
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">{detailsTitle}</h2>
                    {job.referenceNumber && (
                      <p className="text-base font-medium text-gray-500 mt-1">Ref: {job.referenceNumber}</p>
                    )}
                  </div>

                  {/* Description */}
                  <Card title={descriptionTitle} icon={<FileText size={18} />}>
                    {descParagraphs.length > 0 && descParagraphs[0] !== "" ? (
                      descParagraphs.map((p, idx) => (
                        <p key={idx} className="text-gray-700 font-medium text-[15px] leading-relaxed whitespace-pre-line mb-3 last:mb-0">{p}</p>
                      ))
                    ) : (
                      <p className="text-gray-400 italic text-[14px] font-medium font-semibold">No description available.</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-600 font-bold">
                      {job.sector && <span>Department: <span className="font-extrabold text-gray-800">{job.sector}</span></span>}
                      {job.employmentType && <span>Employment: <span className="font-extrabold text-gray-800">{job.employmentType}</span></span>}
                    </div>
                  </Card>

                  {/* Important Dates */}
                  {parsedDates.length > 0 && (
                    <Card title="Important Dates" icon={<CalendarDays size={18} className="text-[#00B4D8]" />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsedDates.map((d: string, i: number) => {
                          const parts = d.split(':');
                          const label = parts[0];
                          const val = parts.slice(1).join(':').trim();
                          return (
                            <div key={i} className="flex flex-col p-2.5 bg-cyan-50/40 border border-cyan-100/30 rounded-xl">
                              <span className="text-[14px] font-medium font-semibold text-[#0096c7] uppercase tracking-wider">{label}</span>
                              <span className="text-base font-bold text-gray-800 mt-1">{val || 'As per schedule'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Application Fee */}
                  {parsedFees.length > 0 && (
                    <Card title="Application Fee" icon={<BadgeIndianRupee size={18} className="text-green-500" />}>
                      <div className="space-y-2.5">
                        {parsedFees.map((f: string, i: number) => {
                          const parts = f.split(':');
                          const label = parts[0];
                          const val = parts.slice(1).join(':').trim();
                          if (val) {
                            return (
                              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                <span className="text-base font-medium text-gray-600">{label}</span>
                                <span className="text-base font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">{val}</span>
                              </div>
                            );
                          }
                          return (
                            <div key={i} className="text-base font-semibold text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Eligibility & Qualifications */}
                  <Card title="Eligibility & Qualifications" icon={<UserCheck size={18} />}>
                    {hasVacancyDetails || job.qualifications?.length > 0 || parsedAges.length > 0 || otherNotes.length > 0 ? (
                      <div className="space-y-4">
                        {hasVacancyDetails ? (
                          <div className="space-y-4">
                            {job.vacancyDetails && job.vacancyDetails.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Vacancy & Eligibility Details</p>
                                {renderVacancyTable(job.vacancyDetails)}
                              </div>
                            )}
                            {job.categoryVacancyDetails && job.categoryVacancyDetails.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Category Wise Vacancy Details</p>
                                {renderVacancyTable(job.categoryVacancyDetails)}
                              </div>
                            )}
                          </div>
                        ) : job.qualifications?.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Qualifications</p>
                            {showTable ? (
                              <div className="overflow-x-auto border border-gray-150/70 rounded-xl shadow-sm">
                                <table className="min-w-full divide-y divide-gray-150 text-left">
                                  <thead className="bg-gray-50/70">
                                    <tr>
                                      <th className="px-4 py-3 text-[14px] font-medium font-semibold text-gray-500 uppercase tracking-wider">Post Name</th>
                                      <th className="px-4 py-3 text-[14px] font-medium font-semibold text-gray-500 uppercase tracking-wider">Total Post & Eligibility</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 bg-white">
                                    {parsedRows.map((row, i) => (
                                      <tr key={i} className="hover:bg-bg-gray-50/40 transition">
                                        <td className="px-4 py-3 text-base font-semibold text-gray-800 align-top leading-relaxed">{row.postName}</td>
                                        <td className="px-4 py-3 text-base text-gray-600 align-top">
                                          <div className="font-extrabold text-lg text-[#0096c7] mb-1 leading-none">{row.totalPost}</div>
                                          {row.eligibility && (
                                            <div className="text-base text-gray-500 font-medium leading-relaxed mt-1.5">{sanitizeText(row.eligibility)}</div>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <ul className="space-y-1">
                                {qualificationsList.map((q: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-[14px] font-medium text-gray-700">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                    {sanitizeText(q)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : null}

                        {parsedAges.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                              <Clock size={12} /> Age Limit
                            </p>
                            <ul className="space-y-1">
                              {parsedAges.map((age: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-[14px] font-medium text-gray-700">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                  {sanitizeText(age)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}


                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-[14px] font-medium">No eligibility details available.</p>
                    )}
                  </Card>

                  {/* Benefits */}
                  {job.benefits?.length > 0 && (
                    <Card title="Benefits" icon={<Gift size={18} />}>
                      <ul className="space-y-2">
                        {job.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-base font-medium text-gray-700">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                            {sanitizeText(b)}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* How to Apply */}
                  <Card title="How to Apply" icon={<FileText size={18} />}>
                    {applicationSteps?.length > 0 ? (
                      <ol className="space-y-2">
                        {applicationSteps.filter(isValidNote).map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-[14px] font-medium text-gray-700">
                            <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#0096c7] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <span className="break-words min-w-0">{sanitizeText(step)}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-gray-400 italic text-[14px] font-medium">Visit the official website to know the application process.</p>
                    )}
                  </Card>

                  {/* Important Links */}
                  <Card title="Important Links" icon={<LucideLink size={18} />}>
                    <div className="space-y-3">
                      {job.importantLinks && job.importantLinks.length > 0 ? (
                        job.importantLinks
                          .filter(lnk => {
                            if (!lnk.label) return false;
                            const lower = lnk.label.toLowerCase();
                            return !lower.includes('android') && !lower.includes('telegram') && !lower.includes('sarkari') && !lower.includes('youtube') && !lower.includes('facebook') && !lower.includes('instagram') && !lower.includes('whatsapp');
                          })
                          .map((lnk, i) => (
                          <a
                            key={i}
                            href={ensureAbsoluteUrl(lnk.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-between bg-gray-50 rounded-xl p-4 transition group ${lnk.type === 'pdf' ? 'hover:bg-red-50' : 'hover:bg-cyan-50'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {lnk.type === 'pdf' ? (
                                <FileArchive size={18} className="text-red-500" />
                              ) : lnk.type === 'apply' ? (
                                <Globe size={18} className="text-[#00B4D8]" />
                              ) : (
                                <LucideLink size={18} className="text-gray-400" />
                              )}
                              <span className={`text-[14px] font-medium text-gray-800 ${lnk.type === 'pdf' ? 'group-hover:text-red-700' : 'group-hover:text-cyan-700'
                                }`}>
                                {sanitizeText(lnk.label)}
                              </span>
                            </div>
                            <LucideLink size={15} className={`text-gray-400 ${lnk.type === 'pdf' ? 'group-hover:text-red-500' : 'group-hover:text-[#00B4D8]'
                              }`} />
                          </a>
                        ))
                      ) : (
                        <>
                          {job.applyLink?.link && job.applyLink.link !== '#' && (
                            <a
                              href={ensureAbsoluteUrl(job.applyLink.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between bg-gray-50 hover:bg-cyan-50 rounded-xl p-4 transition group"
                            >
                              <div className="flex items-center gap-3">
                                <Globe size={18} className="text-[#00B4D8]" />
                                <span className="text-[14px] font-medium text-gray-800 group-hover:text-cyan-700">Apply Online / Official Website</span>
                              </div>
                              <LucideLink size={15} className="text-gray-400 group-hover:text-[#00B4D8]" />
                            </a>
                          )}
                          {job.applyLink?.fileName && (
                            <a
                              href={ensureAbsoluteUrl(job.applyLink.fileName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between bg-gray-50 hover:bg-red-50 rounded-xl p-4 transition group"
                            >
                              <div className="flex items-center gap-3">
                                <FileArchive size={18} className="text-red-500" />
                                <span className="text-[14px] font-medium text-gray-800 group-hover:text-red-700">Official Notification PDF</span>
                              </div>
                              <LucideLink size={15} className="text-gray-400 group-hover:text-red-500" />
                            </a>
                          )}
                          {!job.applyLink?.link && !job.applyLink?.fileName && (
                            <p className="text-gray-400 italic text-[14px] font-medium">No links available.</p>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED IN LAYOUT (with sidebar) ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EEF0F4] font-sans text-gray-800">
      <Navbar activeItem="Jobs & Exams" />
      <main className="lg:pl-[284px]">
        <TopBar />
        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-gray-500 hover:text-[#0096c7] transition mb-6">
            <ArrowLeft size={16} /> Back to Jobs & Exams
          </Link>

          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* ── Left: Overview card (sticky) ─────────────────────────── */}
            <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-center mb-4">
                  <OrgAvatar name={cleanOrg(job.organizationName || job.companyName) === 'N/A' ? 'G' : cleanOrg(job.organizationName || job.companyName)} />
                </div>
                <h1 className="text-2xl font-bold text-[#111827] text-center leading-snug mb-1">
                  {job.jobTitle}
                </h1>
                <div className="font-medium text-gray-700 leading-tight text-center mb-3">
                  <span className="block text-xs text-gray-400 mb-0.5 uppercase tracking-wide">Conducted By</span>
                  {cleanOrg(job.organizationName || job.companyName)}
                </div>

                {/* Admit card badge */}
                {isAdmitCard && (
                  <div className="flex justify-center mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-[14px] font-medium font-bold border border-green-200">
                      <Award size={14} /> Admit Card Available
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {job.sector && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-full">{job.sector}</span>
                  )}
                  {job.location && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                      <MapPin size={9} />{job.location}
                    </span>
                  )}
                </div>

                <div className="border-t border-gray-50 pt-3">
                  <InfoRow icon={<CalendarDays size={14} />} label={isAdmitCard ? 'Release Date' : 'Post Date'} value={formatDateHelper(job.dateOfIssue) || 'N/A'} />
                  <InfoRow icon={<Building2 size={14} />} label="Conducted By" value={cleanOrg(job.companyName || job.organizationName)} />
                  <InfoRow icon={<Clock size={14} />} label={isAdmitCard ? 'Exam Date' : 'Last Date'} value={formatDateHelper(extractDeadlineString(job) || '') || 'N/A'} />
                  {!isAdmitCard && <InfoRow icon={<BadgeIndianRupee size={14} />} label="Compensation" value={job.compensation || 'As per norms'} />}
                </div>

                <div className="mt-4 space-y-2.5">
                  <button
                    onClick={handleToggleBookmark}
                    disabled={isBookmarking}
                    className={`w-full py-2.5 rounded-xl font-semibold text-[14px] font-medium transition flex items-center justify-center gap-2 border ${isBookmarked
                      ? 'bg-cyan-50 border-cyan-200 text-[#0096c7]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Bookmark size={16} className={isBookmarked ? 'fill-cyan-600' : ''} />
                    {isAdmitCard
                      ? (isBookmarked ? 'Exam Saved' : 'Save Exam')
                      : (isBookmarked ? 'Bookmarked' : 'Bookmark Job')
                    }
                  </button>
                  {isAdmitCard ? (
                    <>
                      {job.applyLink?.link && job.applyLink.link !== '#' && (
                        <a
                          href={ensureAbsoluteUrl(job.applyLink.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-[14px] font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> Download Admit Card
                        </a>
                      )}
                      {job.applyLink?.fileName && (
                        <a
                          href={ensureAbsoluteUrl(job.applyLink.fileName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium text-[14px] font-medium transition flex items-center justify-center gap-2"
                        >
                          <FileArchive size={16} /> Official Notification PDF
                        </a>
                      )}
                      {!job.applyLink?.link && !job.applyLink?.fileName && (
                        <p className="text-xs text-center text-gray-400 py-1">Admit card link not yet available.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <a
                        href={ensureAbsoluteUrl(job.applyLink?.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#0096c7] hover:bg-cyan-700 text-white py-2.5 rounded-xl font-semibold text-[14px] font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Edit size={16} /> Apply Now
                      </a>
                      {job.applyLink?.fileName && (
                        <a
                          href={ensureAbsoluteUrl(job.applyLink.fileName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium text-[14px] font-medium transition flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> Download Notification
                        </a>
                      )}
                    </>
                  )}
                  {user?.isAdmin && (
                    <Link
                      href={`/jobs/edit/${job.id}`}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-xl font-medium text-[14px] font-medium transition flex items-center justify-center gap-2"
                    >
                      <Edit size={16} /> Edit Job
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: Details — admit card or standard job layout ──────── */}
            {isAdmitCard ? (
              <LoggedInAdmitCardContent
                job={job}
                desc={joinedDesc}
                parsedDates={parsedDates}
                otherNotes={otherNotes}
                jobId={jobId}
              />
            ) : (
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">{detailsTitle}</h2>
                  {job.referenceNumber && (
                    <p className="text-[14px] font-medium text-gray-400 mt-0.5">Ref: {job.referenceNumber}</p>
                  )}
                </div>

                <Card title={descriptionTitle} icon={<FileText size={18} />}>
                  {descParagraphs.length > 0 && descParagraphs[0] !== "" ? (
                    descParagraphs.map((p, idx) => (
                      <p key={idx} className="text-gray-600 text-lg leading-relaxed whitespace-pre-line font-normal mb-3 last:mb-0">{p}</p>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-[14px] font-medium font-semibold">No description available.</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-500 font-semibold">
                    {job.sector && <span>Department: <span className="font-bold text-gray-800">{job.sector}</span></span>}
                    {job.employmentType && <span>Employment: <span className="font-bold text-gray-800">{job.employmentType}</span></span>}
                  </div>
                </Card>

                {/* Important Dates */}
                {parsedDates.length > 0 && (
                  <Card title="Important Dates" icon={<CalendarDays size={18} className="text-[#00B4D8]" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {parsedDates.map((d: string, i: number) => {
                        const parts = d.split(':');
                        const label = parts[0];
                        const val = parts.slice(1).join(':').trim();
                        return (
                          <div key={i} className="flex flex-col p-2.5 bg-cyan-50/40 border border-cyan-100/30 rounded-xl">
                            <span className="text-[14px] font-medium font-semibold text-[#0096c7] uppercase tracking-wider">{sanitizeText(label)}</span>
                            <span className="text-base font-bold text-gray-800 mt-1">{val ? sanitizeText(val) : 'As per schedule'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Application Fee */}
                {parsedFees.length > 0 && (
                  <Card title="Application Fee" icon={<BadgeIndianRupee size={18} className="text-green-500" />}>
                    <div className="space-y-2">
                      {parsedFees.map((f: string, i: number) => {
                        const parts = f.split(':');
                        const label = parts[0];
                        const val = parts.slice(1).join(':').trim();
                        if (val) {
                          return (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-base font-medium text-gray-600">{sanitizeText(label)}</span>
                              <span className="text-base font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">{sanitizeText(val)}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={i} className="text-base font-medium text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            {sanitizeText(label)}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Eligibility & Qualifications */}
                <Card title="Eligibility & Qualifications" icon={<UserCheck size={18} />}>
                  {hasVacancyDetails || job.qualifications?.length > 0 || parsedAges.length > 0 || otherNotes.length > 0 ? (
                    <div className="space-y-3">
                      {hasVacancyDetails ? (
                        <div className="space-y-4">
                          {job.vacancyDetails && job.vacancyDetails.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Vacancy & Eligibility Details</p>
                              {renderVacancyTable(job.vacancyDetails)}
                            </div>
                          )}
                          {job.categoryVacancyDetails && job.categoryVacancyDetails.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Category Wise Vacancy Details</p>
                              {renderVacancyTable(job.categoryVacancyDetails)}
                            </div>
                          )}
                        </div>
                      ) : job.qualifications?.length > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Qualifications</p>
                          {showTable ? (
                            <div className="overflow-x-auto border border-gray-150/70 rounded-xl shadow-sm">
                              <table className="min-w-full divide-y divide-gray-150 text-left">
                                <thead className="bg-gray-50/70">
                                  <tr>
                                    <th className="px-4 py-3 text-[14px] font-medium font-semibold text-gray-500 uppercase tracking-wider">Post Name</th>
                                    <th className="px-4 py-3 text-[14px] font-medium font-semibold text-gray-500 uppercase tracking-wider">Total Post & Eligibility</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {parsedRows.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/40 transition">
                                      <td className="px-4 py-3 text-base font-semibold text-gray-800 align-top leading-relaxed">{sanitizeText(row.postName)}</td>
                                      <td className="px-4 py-3 text-base text-gray-600 align-top">
                                        <div className="font-extrabold text-lg text-[#0096c7] mb-1 leading-none">{sanitizeText(row.totalPost)}</div>
                                        {row.eligibility && (
                                          <div className="text-base text-gray-500 font-medium leading-relaxed mt-1.5">{sanitizeText(row.eligibility)}</div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <ul className="space-y-1">
                              {qualificationsList.map((q: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-[14px] font-medium text-gray-700">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                  {sanitizeText(q)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}

                      {parsedAges.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                            <Clock size={12} /> Age Limit
                          </p>
                          <ul className="space-y-1">
                            {parsedAges.map((age: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-[14px] font-medium text-gray-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                {age}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {otherNotes.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">General Notes</p>
                          <ul className="space-y-1">
                            {otherNotes.map((n: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-base text-gray-600 font-medium">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                {n}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-[14px] font-medium font-semibold">No eligibility details available.</p>
                  )}
                </Card>

                {job.benefits?.length > 0 && (
                  <Card title="Benefits" icon={<Gift size={18} />}>
                    <ul className="space-y-1">
                      {job.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-[14px] font-medium text-gray-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <Card title="How to Apply" icon={<FileText size={18} />}>
                  {applicationSteps?.length > 0 ? (
                    <ol className="space-y-2">
                      {applicationSteps.filter(isValidNote).map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-[14px] font-medium text-gray-700">
                          <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#0096c7] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span className="break-words min-w-0">{sanitizeText(step)}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-400 italic text-[14px] font-medium">Visit the official website to know the application process.</p>
                  )}
                </Card>

                <Card title="Important Links" icon={<LucideLink size={18} />}>
                  <div className="space-y-3">
                    {job.importantLinks && job.importantLinks.length > 0 ? (
                      job.importantLinks
                        .filter(lnk => {
                          if (!lnk.label) return false;
                          const lower = lnk.label.toLowerCase();
                          return !lower.includes('android') && !lower.includes('telegram') && !lower.includes('sarkari') && !lower.includes('youtube') && !lower.includes('facebook') && !lower.includes('instagram') && !lower.includes('whatsapp');
                        })
                        .map((lnk, i) => (
                        <a
                          key={i}
                          href={ensureAbsoluteUrl(lnk.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-between bg-gray-50 rounded-xl p-4 transition group ${lnk.type === 'pdf' ? 'hover:bg-red-50' : 'hover:bg-cyan-50'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {lnk.type === 'pdf' ? (
                              <FileArchive size={18} className="text-red-500" />
                            ) : lnk.type === 'apply' ? (
                              <Globe size={18} className="text-[#00B4D8]" />
                            ) : (
                              <LucideLink size={18} className="text-gray-400" />
                            )}
                            <span className={`text-[14px] font-medium text-gray-800 ${lnk.type === 'pdf' ? 'group-hover:text-red-700' : 'group-hover:text-cyan-700'
                              }`}>
                              {sanitizeText(lnk.label)}
                            </span>
                          </div>
                          <LucideLink size={15} className={`text-gray-400 ${lnk.type === 'pdf' ? 'group-hover:text-red-500' : 'group-hover:text-[#00B4D8]'
                            }`} />
                        </a>
                      ))
                    ) : (
                      <>
                        {job.applyLink?.link && job.applyLink.link !== '#' && (
                          <a href={ensureAbsoluteUrl(job.applyLink.link)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between bg-gray-50 hover:bg-cyan-50 rounded-xl p-4 transition group">
                            <div className="flex items-center gap-3">
                              <Globe size={18} className="text-[#00B4D8]" />
                              <span className="text-[14px] font-medium text-gray-800 group-hover:text-cyan-700">Apply Online / Official Website</span>
                            </div>
                            <LucideLink size={15} className="text-gray-400" />
                          </a>
                        )}
                        {job.applyLink?.fileName && (
                          <a href={ensureAbsoluteUrl(job.applyLink.fileName)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between bg-gray-50 hover:bg-red-50 rounded-xl p-4 transition group">
                            <div className="flex items-center gap-3">
                              <FileArchive size={18} className="text-red-500" />
                              <span className="text-[14px] font-medium text-gray-800 group-hover:text-red-700">Official Notification PDF</span>
                            </div>
                            <LucideLink size={15} className="text-gray-400" />
                          </a>
                        )}
                        {!job.applyLink?.link && !job.applyLink?.fileName && (
                          <p className="text-gray-400 italic text-[14px] font-medium">No links available.</p>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailsPage;
