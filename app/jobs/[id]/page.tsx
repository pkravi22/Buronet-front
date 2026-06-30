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
const ensureAbsoluteUrl = (url: string | undefined) => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const cleanJobDescription = (desc: string) => {
  if (!desc) return '';
  return desc
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      return (
        !lower.includes('welcome to this official website of sarkari result') &&
        !lower.includes('registered trademark of sarkari result') &&
        !lower.includes('disclaimer : the examination results') &&
        !lower.includes('disclaimer :') &&
        !lower.includes('sarkariresult.com')
      );
    })
    .join('\n')
    .trim();
};

const parseQualificationsTable = (list: string[]) => {
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
    const trimmed = item.trim();
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
    'from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600',
    'from-green-500 to-teal-600', 'from-orange-500 to-red-600', 'from-cyan-500 to-blue-600',
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
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-base font-medium text-gray-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-lg text-[#111827] flex items-center gap-2 mb-5">
        <span className="text-blue-600">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
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

  const parsedRows = job?.qualifications ? parseQualificationsTable(job.qualifications) : [];
  const showTable = parsedRows.length > 0 && parsedRows.some(r => r.totalPost !== '—');

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
        {isLoggedIn && <Navbar activeItem="Jobs" />}
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">Job not found</h2>
          <p className="text-gray-400 mt-2 mb-6">This job may have expired or been removed.</p>
          <Link href={isLoggedIn ? "/jobs" : "/home"} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
            <ArrowLeft size={16} /> {isLoggedIn ? "Back to Jobs" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  const desc = cleanJobDescription(job.jobDescription);

  const parsedDates = job.eligibilityNotes
    ?.filter((n) => n.startsWith('📅 Date:'))
    .map((n) => n.replace('📅 Date:', '').trim()) || [];

  const parsedFees = job.eligibilityNotes
    ?.filter((n) => n.startsWith('💰 Fee:'))
    .map((n) => n.replace('💰 Fee:', '').trim()) || [];

  const parsedAges = job.eligibilityNotes
    ?.filter((n) => n.startsWith('⏱️ Age:'))
    .map((n) => n.replace('⏱️ Age:', '').trim()) || [];

  const otherNotes = job.eligibilityNotes
    ?.filter((n) => !n.startsWith('📅 Date:') && !n.startsWith('💰 Fee:') && !n.startsWith('⏱️ Age:')) || [];

  // ── GUEST LAYOUT (no sidebar) ─────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#EEF0F4] font-sans">
        {/* Simple top bar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/home" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm font-medium">
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="w-px h-5 bg-gray-200" />
              <Link href="/home" className="flex items-center gap-2">
                <span className="text-blue-600 font-bold text-xl">Buronet</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition px-4 py-2 rounded-xl hover:bg-gray-100">
                Log in
              </Link>
              <Link href="/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition shadow-sm">
                Sign up free
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="pt-16 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/home" className="hover:text-blue-600 transition">Home</Link>
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
                    <OrgAvatar name={job.organizationName || job.companyName || 'G'} />
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl font-bold text-[#111827] text-center leading-snug mb-1">
                    {job.jobTitle}
                  </h1>
                  <p className="text-sm text-blue-600 text-center font-medium mb-5">
                    {job.organizationName || job.companyName}
                  </p>

                  {/* Sector + location badges */}
                  <div className="flex flex-wrap justify-center gap-2 mb-5">
                    {job.sector && (
                      <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">{job.sector}</span>
                    )}
                    {job.location && (
                      <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                        <MapPin size={10} />{job.location}
                      </span>
                    )}
                  </div>

                  {/* Key info */}
                  <div className="border-t border-gray-50 pt-4">
                    <InfoRow icon={<CalendarDays size={15} />} label="Post Date" value={formatDateHelper(job.dateOfIssue) || 'N/A'} />
                    <InfoRow icon={<Building2 size={15} />} label="Conducted By" value={job.companyName} />
                    <InfoRow
                      icon={<Clock size={15} />}
                      label="Last Date to Apply"
                      value={formatDateHelper(job.lastDateToApply) || 'N/A'}
                    />
                    <InfoRow icon={<BadgeIndianRupee size={15} />} label="Compensation" value={job.compensation || 'As per norms'} />
                  </div>

                  {/* CTA */}
                  <div className="mt-5 space-y-3">
                    <a
                      href={ensureAbsoluteUrl(job.applyLink?.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit size={16} /> Apply Now
                    </a>
                    {job.applyLink?.fileName && (
                      <a
                        href={ensureAbsoluteUrl(job.applyLink.fileName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm"
                      >
                        <Download size={16} /> Download Notification
                      </a>
                    )}

                    {/* Login prompt for bookmark */}
                    <Link
                      href={`/login?returnTo=/jobs/${jobId}`}
                      className="w-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm"
                    >
                      <LogIn size={16} /> Login to Save Job
                    </Link>
                  </div>
                </div>

                {/* Sign-up nudge */}
                <div className="mt-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                  <h3 className="font-bold text-sm mb-1">Get Job Alerts 🔔</h3>
                  <p className="text-blue-100 text-xs mb-4">Create a free account to get notified about new government jobs matching your profile.</p>
                  <Link href="/register" className="block w-full bg-white text-blue-600 font-bold text-sm py-2 rounded-xl text-center hover:bg-blue-50 transition">
                    Sign up free
                  </Link>
                </div>
              </div>

              {/* ── Right: Job details ───────────────────────────────────────── */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Header */}
                <div>
                  <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Job Details</h2>
                  {job.referenceNumber && (
                    <p className="text-sm text-gray-400 mt-1">Ref: {job.referenceNumber}</p>
                  )}
                </div>

                {/* Description */}
                <Card title="Job Description" icon={<FileText size={18} />}>
                  {desc ? (
                    <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line font-normal">{desc}</p>
                  ) : (
                    <p className="text-gray-400 italic text-sm font-semibold">No description available.</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-500 font-semibold">
                    {job.sector && <span>Department: <span className="font-bold text-gray-800">{job.sector}</span></span>}
                    {job.employmentType && <span>Employment: <span className="font-bold text-gray-800">{job.employmentType}</span></span>}
                  </div>
                </Card>

                {/* Important Dates */}
                {parsedDates.length > 0 && (
                  <Card title="Important Dates" icon={<CalendarDays size={18} className="text-blue-500" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsedDates.map((d, i) => {
                        const parts = d.split(':');
                        const label = parts[0];
                        const val = parts.slice(1).join(':').trim();
                        return (
                          <div key={i} className="flex flex-col p-3 bg-blue-50/40 border border-blue-100/30 rounded-xl">
                            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{label}</span>
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
                      {parsedFees.map((f, i) => {
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
                  {job.qualifications?.length > 0 || parsedAges.length > 0 || otherNotes.length > 0 ? (
                    <div className="space-y-4">
                      {job.qualifications?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Qualifications</p>
                          {showTable ? (
                            <div className="overflow-x-auto border border-gray-150/70 rounded-xl shadow-sm">
                              <table className="min-w-full divide-y divide-gray-150 text-left">
                                <thead className="bg-gray-50/70">
                                  <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Post Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Post & Eligibility</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {parsedRows.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/40 transition">
                                      <td className="px-4 py-3 text-base font-semibold text-gray-800 align-top leading-relaxed">{row.postName}</td>
                                      <td className="px-4 py-3 text-base text-gray-600 align-top">
                                        <div className="font-extrabold text-lg text-blue-600 mb-1 leading-none">{row.totalPost}</div>
                                        {row.eligibility && (
                                          <div className="text-base text-gray-500 font-medium leading-relaxed mt-1.5">{row.eligibility}</div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <ul className="space-y-1">
                              {job.qualifications.map((q, i) => (
                                <li key={i} className="flex items-start gap-2 text-base text-gray-700 font-medium">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                  {q}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {parsedAges.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Clock size={12} /> Age Limit
                          </p>
                          <ul className="space-y-1">
                            {parsedAges.map((age, i) => (
                              <li key={i} className="flex items-start gap-2 text-base text-gray-700 font-medium">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                {age}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {otherNotes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">General Notes</p>
                          <ul className="space-y-1">
                            {otherNotes.map((n, i) => (
                              <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                {n}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No eligibility details available.</p>
                  )}
                </Card>

                {/* Benefits */}
                {job.benefits?.length > 0 && (
                  <Card title="Benefits" icon={<Gift size={18} />}>
                    <ul className="space-y-1">
                      {job.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* How to Apply */}
                <Card title="How to Apply" icon={<FileText size={18} />}>
                  {job.applicationProcess?.length > 0 ? (
                    <ol className="space-y-2">
                      {job.applicationProcess.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-400 italic text-sm">Visit the official website to know the application process.</p>
                  )}
                </Card>

                {/* Important Links */}
                <Card title="Important Links" icon={<LucideLink size={18} />}>
                  <div className="space-y-3">
                    {job.applyLink?.link && job.applyLink.link !== '#' && (
                      <a
                        href={ensureAbsoluteUrl(job.applyLink.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded-xl p-4 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <Globe size={18} className="text-blue-500" />
                          <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">Apply Online / Official Website</span>
                        </div>
                        <LucideLink size={15} className="text-gray-400 group-hover:text-blue-500" />
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
                          <span className="text-sm font-medium text-gray-800 group-hover:text-red-700">Official Notification PDF</span>
                        </div>
                        <LucideLink size={15} className="text-gray-400 group-hover:text-red-500" />
                      </a>
                    )}
                    {!job.applyLink?.link && !job.applyLink?.fileName && (
                      <p className="text-gray-400 italic text-sm">No links available.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED IN LAYOUT (with sidebar) ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EEF0F4] font-sans text-gray-800">
      <Navbar activeItem="Jobs" />
      <main className="lg:pl-[284px]">
        <TopBar />
        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition mb-6">
            <ArrowLeft size={16} /> Back to Jobs
          </Link>

          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* ── Left: Overview card (sticky) ─────────────────────────── */}
            <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-center mb-4">
                  <OrgAvatar name={job.organizationName || job.companyName || 'G'} />
                </div>
                <h1 className="text-2xl font-bold text-[#111827] text-center leading-snug mb-1">
                  {job.jobTitle}
                </h1>
                <p className="text-sm text-blue-600 text-center font-medium mb-4">
                  {job.organizationName || job.companyName}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {job.sector && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">{job.sector}</span>
                  )}
                  {job.location && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                      <MapPin size={9} />{job.location}
                    </span>
                  )}
                </div>

                <div className="border-t border-gray-50 pt-3">
                  <InfoRow icon={<CalendarDays size={14} />} label="Post Date" value={formatDateHelper(job.dateOfIssue) || 'N/A'} />
                  <InfoRow icon={<Building2 size={14} />} label="Conducted By" value={job.companyName} />
                  <InfoRow icon={<Clock size={14} />} label="Last Date" value={formatDateHelper(job.lastDateToApply) || 'N/A'} />
                  <InfoRow icon={<BadgeIndianRupee size={14} />} label="Compensation" value={job.compensation || 'As per norms'} />
                </div>

                <div className="mt-4 space-y-2.5">
                  <button
                    onClick={handleToggleBookmark}
                    disabled={isBookmarking}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 border ${isBookmarked
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Bookmark size={16} className={isBookmarked ? 'fill-blue-600' : ''} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark Job'}
                  </button>
                  <a
                    href={ensureAbsoluteUrl(job.applyLink?.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Edit size={16} /> Apply Now
                  </a>
                  {job.applyLink?.fileName && (
                    <a
                      href={ensureAbsoluteUrl(job.applyLink.fileName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> Download Notification
                    </a>
                  )}
                  {user?.isAdmin && (
                    <Link
                      href={`/jobs/edit/${job.id}`}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
                    >
                      <Edit size={16} /> Edit Job
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: Details ────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Job Details</h2>
                {job.referenceNumber && (
                  <p className="text-sm text-gray-400 mt-0.5">Ref: {job.referenceNumber}</p>
                )}
              </div>

              <Card title="Job Description" icon={<FileText size={18} />}>
                {desc ? (
                  <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line font-normal">{desc}</p>
                ) : (
                  <p className="text-gray-400 italic text-sm font-semibold">No description available.</p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-500 font-semibold">
                  {job.sector && <span>Department: <span className="font-bold text-gray-800">{job.sector}</span></span>}
                  {job.employmentType && <span>Employment: <span className="font-bold text-gray-800">{job.employmentType}</span></span>}
                </div>
              </Card>

              {/* Important Dates */}
              {parsedDates.length > 0 && (
                <Card title="Important Dates" icon={<CalendarDays size={18} className="text-blue-500" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {parsedDates.map((d, i) => {
                      const parts = d.split(':');
                      const label = parts[0];
                      const val = parts.slice(1).join(':').trim();
                      return (
                        <div key={i} className="flex flex-col p-2.5 bg-blue-50/40 border border-blue-100/30 rounded-xl">
                          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{label}</span>
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
                  <div className="space-y-2">
                    {parsedFees.map((f, i) => {
                      const parts = f.split(':');
                      const label = parts[0];
                      const val = parts.slice(1).join(':').trim();
                      if (val) {
                        return (
                          <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                            <span className="text-base font-medium text-gray-600">{label}</span>
                            <span className="text-base font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">{val}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="text-base font-medium text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Eligibility & Qualifications */}
              <Card title="Eligibility & Qualifications" icon={<UserCheck size={18} />}>
                {job.qualifications?.length > 0 || parsedAges.length > 0 || otherNotes.length > 0 ? (
                  <div className="space-y-3">
                    {job.qualifications?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Qualifications</p>
                        {showTable ? (
                          <div className="overflow-x-auto border border-gray-150/70 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-150 text-left">
                              <thead className="bg-gray-50/70">
                                <tr>
                                  <th className="px-4 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Post Name</th>
                                  <th className="px-4 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Post & Eligibility</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {parsedRows.map((row, i) => (
                                  <tr key={i} className="hover:bg-gray-50/40 transition">
                                    <td className="px-4 py-3 text-base font-semibold text-gray-800 align-top leading-relaxed">{row.postName}</td>
                                    <td className="px-4 py-3 text-base text-gray-600 align-top">
                                      <div className="font-extrabold text-lg text-blue-600 mb-1 leading-none">{row.totalPost}</div>
                                      {row.eligibility && (
                                        <div className="text-base text-gray-500 font-medium leading-relaxed mt-1.5">{row.eligibility}</div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <ul className="space-y-1">
                            {job.qualifications.map((q, i) => (
                              <li key={i} className="flex items-start gap-2 text-base text-gray-700 font-medium">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                {q}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {parsedAges.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <Clock size={12} /> Age Limit
                        </p>
                        <ul className="space-y-1">
                          {parsedAges.map((age, i) => (
                            <li key={i} className="flex items-start gap-2 text-base text-gray-700 font-medium">
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
                          {otherNotes.map((n, i) => (
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
                  <p className="text-gray-400 italic text-sm font-semibold">No eligibility details available.</p>
                )}
              </Card>

              {job.benefits?.length > 0 && (
                <Card title="Benefits" icon={<Gift size={18} />}>
                  <ul className="space-y-1">
                    {job.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card title="How to Apply" icon={<FileText size={18} />}>
                {job.applicationProcess?.length > 0 ? (
                  <ol className="space-y-2">
                    {job.applicationProcess.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-400 italic text-sm">Visit the official website to know the application process.</p>
                )}
              </Card>

              <Card title="Important Links" icon={<LucideLink size={18} />}>
                <div className="space-y-3">
                  {job.applyLink?.link && job.applyLink.link !== '#' && (
                    <a href={ensureAbsoluteUrl(job.applyLink.link)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded-xl p-4 transition group">
                      <div className="flex items-center gap-3">
                        <Globe size={18} className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">Apply Online / Official Website</span>
                      </div>
                      <LucideLink size={15} className="text-gray-400" />
                    </a>
                  )}
                  {job.applyLink?.fileName && (
                    <a href={ensureAbsoluteUrl(job.applyLink.fileName)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between bg-gray-50 hover:bg-red-50 rounded-xl p-4 transition group">
                      <div className="flex items-center gap-3">
                        <FileArchive size={18} className="text-red-500" />
                        <span className="text-sm font-medium text-gray-800 group-hover:text-red-700">Official Notification PDF</span>
                      </div>
                      <LucideLink size={15} className="text-gray-400" />
                    </a>
                  )}
                  {!job.applyLink?.link && !job.applyLink?.fileName && (
                    <p className="text-gray-400 italic text-sm">No links available.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailsPage;
