'use client'

import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { get } from '@/lib/api';
import type { Job } from '@/lib/types/jobs';
import JobCard from '../../../jobs/components/JobCard';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {

  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'About Us', href: '#' },
  ];

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

    const handleLogin = () => {
      router.push('/login');
    }

    const handleJoin = () => {
      router.push('/register');
    }

  const fetchAllJobs = async (page: number) => {
    setModalLoading(true);
    try {
      // Assuming same endpoint structure as MainContent.tsx reference
      const response = await get<any>(`/jobs/all?page=${page}&pageSize=${pageSize}`);
      // Adjust according to actual API response structure if needed
      setAllJobs(response.data || response);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch all jobs", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchAllJobs(1);
  };


  useEffect(() => {
    const fetchLatestJobs = async () => {
      setIsJobsLoading(true);
      setJobsError(null);
      try {
        const response = await get<Job[]>('/jobs/job-home');
        setJobs(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load jobs';
        setJobsError(message);
      } finally {
        setIsJobsLoading(false);
      }
    };

    fetchLatestJobs();
  }, []);

  const latestJobs = useMemo(() => {
    const toTime = (job: Job) => {
      const value = job.createdDate || job.updatedDate || job.dateOfIssue;
      const timestamp = value ? new Date(value).getTime() : NaN;
      return Number.isFinite(timestamp) ? timestamp : 0;
    };

    return [...jobs].sort((a, b) => toTime(b) - toTime(a)).slice(0, 3);
  }, [jobs]);

  const handleLatestJobBookmarkToggle = () => {
    router.push('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <Head>
        <title>Buronet - Connect, Learn, Succeed</title>
        <meta name="description" content="Raise your employability with Buronet. Join India's dedicated community of aspirants and professionals — network, collaborate, and rise together." />
        <link rel="icon" href="data:image/x-icon;base64," type="image/x-icon" />
      </Head>

      <div className="relative flex h-[100dvh] w-full flex-col group/design-root overflow-x-hidden overflow-y-auto">
        <div className="layout-container flex min-h-full flex-col">
          {/* Header */}
          <header className="relative flex items-center lg:grid lg:grid-cols-[1fr_auto_1fr] border-b border-solid border-border-light dark:border-border-dark pl-4 pr-2 sm:px-6 lg:px-10 py-3">
            <div className="flex items-center gap-3 text-content-light dark:text-content-dark justify-self-start">
              <div className="h-8 w-8 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold">Buronet</h2>
            </div>
            <nav className="hidden lg:flex items-center gap-8 justify-self-center">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-content-light dark:text-content-dark hover:text-primary dark:hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button onClick={handleJoin} className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors">
                  <span className="truncate">Join Now</span>
                </button>
                <button onClick={handleLogin} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent-light dark:bg-accent-dark text-content-light dark:text-content-dark text-sm font-bold leading-normal tracking-wide hover:bg-border-light dark:hover:bg-border-dark transition-colors">
                  <span className="truncate">Login</span>
                </button>
              </div>

              {/* Mobile menu toggle (kept on far right) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                className="inline-flex items-center justify-center rounded-lg h-10 w-10 text-content-light dark:text-content-dark hover:bg-border-light/40 dark:hover:bg-border-dark/40 transition-colors lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile off-canvas menu (slides in from the right) */}
            <div className="lg:hidden">
              <div
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
                  isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={closeMobileMenu}
              />
              <aside
                className={`fixed inset-y-0 right-0 z-50 w-[320px] max-w-[85vw] bg-white dark:bg-accent-dark shadow-xl border-l border-solid border-border-light dark:border-border-dark transform transition-transform duration-300 ${
                  isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
                }`}
                aria-hidden={!isMobileMenuOpen}
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-solid border-border-light dark:border-border-dark bg-white">
                    <p className="text-base font-bold text-gray-900">Menu</p>
                    <button
                      type="button"
                      onClick={closeMobileMenu}
                      aria-label="Close menu"
                      className="inline-flex items-center justify-center rounded-lg h-10 w-10 text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700">
                        Navigation
                        </p>
                      </div>
                      <div className="flex flex-col">
                        {navLinks.map((item) => (
                          <Link
                            key={`mobile-${item.label}`}
                            href={item.href}
                            onClick={closeMobileMenu}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-solid border-border-light dark:border-border-dark">
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700">
                          Actions
                        </p>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2">
                        <button
                          onClick={() => {
                            closeMobileMenu();
                            handleJoin();
                          }}
                          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-gray-100 text-gray-900 text-sm font-bold leading-normal tracking-wide hover:bg-gray-200 transition-colors"
                        >
                          <span className="truncate">Join Now</span>
                        </button>
                        <button
                          onClick={() => {
                            closeMobileMenu();
                            handleLogin();
                          }}
                          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-white text-gray-900 text-sm font-bold leading-normal tracking-wide border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <span className="truncate">Login</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </header>

          <main className="flex flex-1 flex-col items-center py-5">
            <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
              <section
                className="relative flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl bg-cover bg-center bg-no-repeat p-4 text-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url('https://img.freepik.com/premium-vector/university-campus-building-vector-illustration-college-building_781755-156.jpg')`,
                }}
              >
                <div className="flex flex-col gap-4 max-w-3xl">
                  <h1 className="text-white text-4xl md:text-5xl font-black tracking-tighter">
                    Connect, Learn, and Succeed in the Public Sector
                  </h1>
                  <p className="text-white/90 text-base md:text-lg font-normal leading-normal">
                    Raise your employability with Buronet. Join India's dedicated
                    community of aspirants and professionals — network,
                    collaborate, and rise together.
                  </p>
                </div>
                <button onClick={handleJoin} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors">
                  <span className="truncate">Join Now</span>
                </button>
              </section>

              {/* Why Choose Buronet */}
              <section className="py-16 sm:py-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-content-light dark:text-content-dark tracking-tight">
                    Why Choose Buronet?
                  </h2>
                  <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark max-w-3xl mx-auto">
                    Your launchpad to career success. Join India's verified
                    aspirant network. Get real-time job alerts, peer collaboration
                    tools, and strategic insights—all in one trusted platform.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-accent-dark p-6 text-center items-center">
                    <div className="text-primary">
                      <svg fill="currentColor" height="36px" viewBox="0 0 256 256" width="36px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                      Verified Networking
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Build connections that matter. Network with verified
                      aspirants, serving professionals, and serious peers in a
                      trusted environment.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-accent-dark p-6 text-center items-center">
                    <div className="text-primary">
                      <svg fill="currentColor" height="36px" viewBox="0 0 256 256" width="36px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M119.76,217.94A8,8,0,0,1,112,224a8.13,8.13,0,0,1-2-.24l-32-8a8,8,0,0,1-2.5-1.11l-24-16a8,8,0,1,1,8.88-13.31l22.84,15.23,30.66,7.67A8,8,0,0,1,119.76,217.94Zm132.69-96.46a15.89,15.89,0,0,1-8,9.25l-23.68,11.84-55.08,55.09a8,8,0,0,1-7.6,2.1l-64-16a8.06,8.06,0,0,1-2.71-1.25L35.86,142.87,11.58,130.73a16,16,0,0,1-7.16-21.46L29.27,59.58h0a16,16,0,0,1,21.46-7.16l22.06,11,53-15.14a8,8,0,0,1,4.4,0l53,15.14,22.06-11a16,16,0,0,1,21.46,7.16l24.85,49.69A15.9,15.9,0,0,1,252.45,121.48Zm-46.18,12.94L179.06,80H147.24L104,122c12.66,8.09,32.51,10.32,50.32-7.63a8,8,0,0,1,10.68-.61l34.41,27.57Zm-187.54-18,17.69,8.85L61.27,75.58,43.58,66.73ZM188,152.66l-27.71-22.19c-19.54,16-44.35,18.11-64.91,5a16,16,0,0,1-2.72-24.82.6.6,0,0,1,.08-.08L137.6,67.06,128,64.32,77.58,78.73,50.21,133.46l49.2,35.15,58.14,14.53Zm49.24-36.24L212.42,66.73l-17.69,8.85,24.85,49.69Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                      Informative Bytes
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Share and gain knowledge about various job and exam-related
                      queries through informative Bytes.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-accent-dark p-6 text-center items-center">
                    <div className="text-primary">
                      <svg fill="currentColor" height="36px" viewBox="0 0 256 256" width="36px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM240,56H16a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H240a8,8,0,0,0,8-8V64A8,8,0,0,0,240,56ZM193.65,184H62.35A56.78,56.78,0,0,0,24,145.65v-35.3A56.78,56.78,0,0,0,62.35,72h131.3A56.78,56.78,0,0,0,232,110.35v35.3A56.78,56.78,0,0,0,193.65,184ZM232,93.37A40.81,40.81,0,0,1,210.63,72H232ZM45.37,72A40.81,40.81,0,0,1,24,93.37V72ZM24,162.63A40.81,40.81,0,0,1,45.37,184H24ZM210.63,184A40.81,40.81,0,0,1,232,162.63V184Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                      Recent Job & Exam Updates
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Your centralized hub for all government job and exam
                      notifications. Get accurate, real-time alerts instantly.
                    </p>
                  </div>
                </div>
              </section>

              {/* Who is Buronet For */}
              <section className="py-16 sm:py-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-content-light dark:text-content-dark tracking-tight">
                    Who is Buronet For?
                  </h2>
                  <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark max-w-3xl mx-auto">
                    Buronet is for every Indian building their future through
                    competitive exams and jobs. It's where serious aspirants,
                    verified professionals, and top rankers connect to share
                    knowledge and opportunities.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-accent-dark p-6 text-center items-center">
                    <div className="text-primary">
                      <svg fill="currentColor" height="36px" viewBox="0 0 256 256" width="36px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M226.53,56.41l-96-32a8,8,0,0,0-5.06,0l-96,32A8,8,0,0,0,24,64v80a8,8,0,0,0,16,0V75.1L73.59,86.29a64,64,0,0,0,20.65,88.05c-18,7.06-33.56,19.83-44.94,37.29a8,8,0,1,0,13.4,8.74C77.77,197.25,101.57,184,128,184s50.23,13.25,65.3,36.37a8,8,0,0,0,13.4-8.74c-11.38-17.46-27-30.23-44.94-37.29a64,64,0,0,0,20.65-88l44.12-14.7a8,8,0,0,0,0-15.18ZM176,120A48,48,0,1,1,89.35,91.55l36.12,12a8,8,0,0,0,5.06,0l36.12-12A47.89,47.89,0,0,1,176,120ZM128,87.57,57.3,64,128,40.43,198.7,64Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                      Aspiring Students
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Get a head start with guidance from experienced mentors and
                      access to relevant job opportunities.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-accent-dark p-6 text-center items-center">
                    <div className="text-primary">
                      <svg fill="currentColor" height="36px" viewBox="0 0 256 256" width="36px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                      Experienced Professionals
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Expand your network, share your expertise, and find new
                      career challenges within the public sector.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-accent-dark p-6 text-center items-center">
                    <div className="text-primary">
                      <svg fill="currentColor" height="36px" viewBox="0 0 256 256" width="36px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                      Career Changers
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      Transition smoothly into a government career with support
                      from mentors and access to exclusive job listings.
                    </p>
                  </div>
                </div>
              </section>

              {/* Connect with Community */}
              <section className="py-16 sm:py-20 bg-accent-light dark:bg-accent-dark rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 sm:px-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-content-light dark:text-content-dark tracking-tight">
                      Connect with Our Community
                    </h2>
                    <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark max-w-md mx-auto md:mx-0">
                      Have questions? Get instant answers from our vibrant
                      community of aspirants and professionals.
                    </p>
                    <button className="mt-8 flex min-w-[120px] max-w-[240px] w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors mx-auto md:mx-0">
                      <span className="truncate">Chat Now</span>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      alt="Community members interacting"
                      className="rounded-lg object-cover w-full max-w-md h-64"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj_wsnMUfc2SDToxEfNLrqhTwcg59kQzLY6iG46zaZ54m4cKEd5jpZAf88HHu5-ZICDIg-gTUizqAE7A_mK2XYGXGAKaYbv5qsW1y_Bx-iXDqguDUm3F4vocIZrbMTGZTclZSdmzEfSD7kuZDO0tv6dthFsviH3qDo2PMee2pzq1mEhlIsnizch_PeHDViYCtZ6p3JQmYHFSF2SbXpgHPlV2T6SfZG_bBq1Mw1-wV-qtbNm2uLmCTFaLnN6P920k6CdsdVjNqCwVVy"
                    />
                  </div>
                </div>
              </section>

              {/* Study Zone */}
              <section className="py-16 sm:py-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-content-light dark:text-content-dark tracking-tight">
                    Designate a Dedicated Study Zone
                  </h2>
                  <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark max-w-3xl mx-auto">
                    Create a quiet and organized study space for focused work and
                    quick access to current affairs.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="flex justify-center">
                    <img
                      alt="A quiet and organized study space with a laptop, books, and a lamp."
                      className="rounded-lg object-cover w-full max-w-md h-80"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzrbhZbZxddaQfsdsbK0YFhY4QfKgShaLjrIT6rGdGrhRmBW2a1SIBML5lCbwb_GmcoQTWbE-0_kOVWiGm954xjiqlL0piCoUyVu0Tr0j1fgbBeeRmxkIEo9ABQHL9SIH91juENbkVLPLCgK2XVT5nVTOCdEO2pXX5KkaOn1z2PnqLY0_5fJ4X96T7xNZZOtIgsaZWW7LcRsQr9IbZi6_GrzF1SDs1CXdMcv9rMO4ZqzSAhNdxc7BLV67ftmFl1Q5ifucuYVKGNIjO"
                    />
                  </div>
                  <div className="flex flex-col gap-6 text-center md:text-left">
                    <div className="flex items-start gap-4">
                      <div className="text-primary pt-1">
                        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-125.66a8,8,0,0,1,0,11.31l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.31L112,132.69l42.34-42.35A8,8,0,0,1,173.66,90.34Z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                          Enhanced Focus
                        </h3>
                        <p className="text-subtle-light dark:text-subtle-dark">
                          A designated study area minimizes distractions, allowing
                          for deeper concentration and more effective learning.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-primary pt-1">
                        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-125.66a8,8,0,0,1,0,11.31l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.31L112,132.69l42.34-42.35A8,8,0,0,1,173.66,90.34Z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                          Better Problem-Solving
                        </h3>
                        <p className="text-subtle-light dark:text-subtle-dark">
                          An organized space helps in structuring thoughts and
                          approaching complex problems with a clear mind.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-primary pt-1">
                        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-125.66a8,8,0,0,1,0,11.31l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.31L112,132.69l42.34-42.35A8,8,0,0,1,173.66,90.34Z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                          Stay Updated
                        </h3>
                        <p className="text-subtle-light dark:text-subtle-dark">
                          Keep current affairs materials at hand for quick
                          reference and to stay informed on the latest
                          developments.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Start Journey */}
              <section className="py-16 sm:py-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-content-light dark:text-content-dark tracking-tight">
                    Start Your Journey with Buronet
                  </h2>
                  <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark max-w-3xl mx-auto">
                    Join a network of dedicated professionals and aspirants. Your
                    path to a successful government career begins here.
                  </p>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                  <button onClick={handleJoin} className="flex min-w-[140px] max-w-[240px] grow cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors">
                    <span className="truncate">Join the Community</span>
                  </button>
                </div>

                <div className="mt-12">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-content-light dark:text-content-dark text-center sm:text-left">
                      Latest Job Openings
                    </h3>
                    <button
                      onClick={handleOpenModal}
                      className="text-sm font-semibold text-primary hover:underline text-center sm:text-right"
                    >
                      View all jobs
                    </button>
                  </div>

                  {isJobsLoading ? (
                    <div className="text-center text-subtle-light dark:text-subtle-dark">Loading latest jobs…</div>
                  ) : jobsError ? (
                    <div className="text-center text-red-600">{jobsError}</div>
                  ) : latestJobs.length === 0 ? (
                    <div className="text-center text-subtle-light dark:text-subtle-dark">No jobs found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {latestJobs.map((job) => (
                        <JobCard
                          key={job.id ?? `${job.jobTitle}-${job.createdDate}`}
                          job={job}
                          isBookmarked={false}
                          onToggleBookmark={handleLatestJobBookmarkToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Community Feed */}
              <section className="py-16 sm:py-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-content-light dark:text-content-dark tracking-tight">
                    Community Feed
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div
                      className="w-full sm:w-48 md:w-56 flex-none bg-center bg-no-repeat aspect-video sm:aspect-square bg-cover rounded-lg"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBC6jqf3qXvD_IFb6jRIbvGQNPWsefjBmh7v2czMZAT6kIIQhqKtzI2MGpJnbXie0bc8JNeZ8d6KYXla96Hqrtr9SYPzgjchhGuZrxfnurJVFT6Ybsia7EFZzWwfG6VDlj212MIkSq9fgBiuDIMpVDrIONlUWA58lnySyCCoDUQgAYxgofKhif6b0nVtKqP0nGVCRmvCpggaA1o15hNLJXVhfEebwCU2t8gZtChYRRReN_rxn1J6MHEHB_78XRQbKrRnFiRalnCITB')`,
                      }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-content-light dark:text-content-dark text-base font-medium leading-normal">
                        Aspirant's Journey
                      </p>
                      <p className="text-subtle-light dark:text-subtle-dark text-sm font-normal leading-normal">
                        Follow Rahul's journey as he prepares for the Civil
                        Services Examination.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-4">
                    <div>
                      <p className="text-content-light dark:text-content-dark text-base font-medium leading-normal">
                        Success Story
                      </p>
                      <p className="text-subtle-light dark:text-subtle-dark text-sm font-normal leading-normal">
                        Read about Priya's success in securing a position in the
                        Ministry of Finance.
                      </p>
                    </div>
                    <div
                      className="w-full sm:w-48 md:w-56 flex-none bg-center bg-no-repeat aspect-video sm:aspect-square bg-cover rounded-lg"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrEhfkSXmJR2OospF1v-3K5ofYN7JTTalHwVTYq7dV0IdkZogTkj8PUJB7_vx1QULVi33oANYTujv4TFdI_PXRdRUdq0yIYMpzPkKdeK3VbTCjfVh0CMHZymUH4NZnL8JGgy08KFNTBnpkW0-lkl9Nw9mSxHLLZ4jGtBVboe-Bj0i0u6j793bau1-LqC5cv9gtsbS7pmCXug3KHA3xjoEZCeg_qglVP_lr3qJeb-5PGBhDsea6-k8iFHmmyKNI76lLcz4Ts2dOBjl6')`,
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div
                      className="w-full sm:w-48 md:w-56 flex-none bg-center bg-no-repeat aspect-video sm:aspect-square bg-cover rounded-lg"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCt1doZMEZ90Vzj-lgVYKw7OO6dPTqIr7WzuodAIW-dkWewShC-LileoYEfU6q5IWXksByw1YFpZKcsot5gU_-vlkq3Q9g1R8xyXtBHLg_LHUbXpnk4wLqMFn9PoUNiFjM9bxmFPhuchtCx0Mp4pKGNk9KPzz-P17vFTx1cPBoDlTTE7wFbsa67K1Vx8aPUwVsbyzRYqbPlzwilm3YVB41YB3CXIIaIMlbvBlhfdn1Z6S6_C40LsYzTcJj2Wby3hP97lCAsXJTfqrId')`,
                      }}
                    ></div>
                    <div>
                      <p className="text-content-light dark:text-content-dark text-base font-medium leading-normal">
                        Career Advice
                      </p>
                      <p className="text-subtle-light dark:text-subtle-dark text-sm font-normal leading-normal">
                        Get expert advice on navigating the government job
                        application process.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section className="py-16 sm:py-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-content-light dark:text-content-dark tracking-tight">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                  <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-accent-light dark:bg-accent-dark px-6 py-2 group">
                    <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
                      <p className="text-content-light dark:text-content-dark font-medium">
                        How does Buronet work?
                      </p>
                      <div className="text-subtle-light dark:text-subtle-dark group-open:rotate-180 transition-transform">
                        <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                      </div>
                    </summary>
                    <p className="text-subtle-light dark:text-subtle-dark text-sm pb-3">
                      Buronet connects you with verified professionals for
                      mentorship, provides exclusive job listings, and offers a
                      community platform to network with fellow government job
                      aspirants.
                    </p>
                  </details>
                  <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-accent-light dark:bg-accent-dark px-6 py-2 group">
                    <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
                      <p className="text-content-light dark:text-content-dark font-medium">
                        What types of mentorship are available?
                      </p>
                      <div className="text-subtle-light dark:text-subtle-dark group-open:rotate-180 transition-transform">
                        <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                      </div>
                    </summary>
                    <p className="text-subtle-light dark:text-subtle-dark text-sm pb-3">
                      We offer one-on-one mentorship, group sessions, and mock
                      interviews with experienced professionals from various
                      government sectors to help you prepare effectively.
                    </p>
                  </details>
                  <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-accent-light dark:bg-accent-dark px-6 py-2 group">
                    <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
                      <p className="text-content-light dark:text-content-dark font-medium">
                        How can I find job opportunities?
                      </p>
                      <div className="text-subtle-light dark:text-subtle-dark group-open:rotate-180 transition-transform">
                        <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                      </div>
                    </summary>
                    <p className="text-subtle-light dark:text-subtle-dark text-sm pb-3">
                      Our platform features a dedicated job board with exclusive
                      and verified listings for government positions. You can
                      filter and search for jobs based on your preferences and
                      qualifications.
                    </p>
                  </details>
                </div>
              </section>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-accent-light dark:bg-accent-dark text-center py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary text-sm font-medium" href="#">
                  About Us
                </a>
                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary text-sm font-medium" href="#">
                  Contact
                </a>
                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary text-sm font-medium" href="#">
                  Privacy Policy
                </a>
                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary text-sm font-medium" href="#">
                  Terms of Service
                </a>
              </div>
              <div className="flex justify-center gap-6">
                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary" href="#">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                  </svg>
                </a>
                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary" href="#">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path>
                  </svg>
                </a>
                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary" href="#">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
                  </svg>
                </a>
              </div>
              <p className="text-subtle-light dark:text-subtle-dark text-sm">
                ©️ 2024 Buronet. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">All Job Openings</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {modalLoading ? (
                <div className="flex justify-center py-20">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isBookmarked={false} 
                      onToggleBookmark={handleLatestJobBookmarkToggle}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t flex items-center justify-between bg-white">
              <button
                disabled={currentPage === 1 || modalLoading}
                onClick={() => fetchAllJobs(currentPage - 1)}
                className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>

              <button
                disabled={currentPage === totalPages || modalLoading}
                onClick={() => fetchAllJobs(currentPage + 1)}
                className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}