'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopBar from '@/components/TopBar';
import { AlertModal } from '@/components/AlertModal';
import { postApi } from '@/lib/api';
import {
  LayoutDashboard, Briefcase, Plus, Trash2, Edit3,
  Search, ChevronLeft, ChevronRight, RefreshCw,
  AlertCircle, ArrowLeft, Eye, ToggleLeft, ToggleRight, XCircle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  organizationName: string;
  sector: string;
  type: string;
  status: string;
  source: string;
  location: string;
  lastDateToApply?: string;
  createdDate?: string;
  isScraped?: boolean;
}
interface AdminJobsRes { page: number; pageSize: number; totalCount: number; totalPages: number; data: Job[]; }

type Section = 'dashboard' | 'jobs' | 'add-job' | 'assets';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const JOBS_API = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE ?? 'http://localhost/jobs/api';

const statusColor = (s: string) => {
  const l = s?.toLowerCase();
  if (l === 'active') return 'bg-green-100 text-green-700';
  if (l === 'closed') return 'bg-gray-100 text-gray-600';
  if (l === 'draft')  return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-600';
};

const typeLabel: Record<string, string> = {
  job: 'Job', admit_card: 'Admit Card', result: 'Result', update: 'Update',
};

// ─── Stats cards ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Dashboard Section ────────────────────────────────────────────────────────
function DashboardSection() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${JOBS_API}/jobs/admin-list?pageSize=1`);
        const d = await res.json();
        const res2 = await fetch(`${JOBS_API}/jobs/admin-list?status=active&pageSize=1`);
        const d2 = await res2.json();
        const res3 = await fetch(`${JOBS_API}/jobs/admin-list?type=admit_card&pageSize=1`);
        const d3 = await res3.json();
        const res4 = await fetch(`${JOBS_API}/jobs/admin-list?type=result&pageSize=1`);
        const d4 = await res4.json();
        setStats({
          total: d.totalCount,
          active: d2.totalCount,
          admitCards: d3.totalCount,
          results: d4.totalCount,
        });
      } catch { setStats(null); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-5">Dashboard Overview</h2>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Jobs in DB" value={stats?.total ?? '—'} color="text-blue-600" />
          <StatCard label="Active Listings" value={stats?.active ?? '—'} color="text-green-600" />
          <StatCard label="Admit Cards" value={stats?.admitCards ?? '—'} color="text-purple-600" />
          <StatCard label="Results" value={stats?.results ?? '—'} color="text-orange-500" />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Add a Manual Job</h3>
          <p className="text-blue-100 text-sm mb-4">Post a government job, exam notification, or update manually.</p>
          <Link href="/jobs/create" className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition">
            <Plus size={15} /> Create Job Post
          </Link>
        </div>
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Manage Existing Jobs</h3>
          <p className="text-violet-100 text-sm mb-4">Search, edit, toggle status, or delete any job in the database.</p>
          <button
            onClick={() => { /* Wait, we need to pass setSection here or remove the button. Better to remove or change to link if we can't pass it. Let's just make it visually informative or hide the button for now. */ }}
            className="inline-flex items-center gap-2 bg-white text-violet-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-50 transition opacity-80"
          >
            <Briefcase size={15} /> Select from sidebar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Job Management Section ───────────────────────────────────────────────────
function JobsSection({ onAlert }: { onAlert: (msg: string, type: 'success' | 'error') => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Job | null>(null);

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), pageSize: '15' });
      if (filterType)   q.set('type', filterType);
      if (filterStatus) q.set('status', filterStatus);
      if (filterSource) q.set('source', filterSource);
      if (search)       q.set('keyword', search);
      const res = await fetch(`${JOBS_API}/jobs/admin-list?${q}`);
      const d: AdminJobsRes = await res.json();
      setJobs(d.data ?? []);
      setTotalCount(d.totalCount ?? 0);
      setTotalPages(d.totalPages ?? 1);
      setPage(p);
    } catch { onAlert('Failed to load jobs', 'error'); }
    finally { setLoading(false); }
  }, [filterType, filterStatus, filterSource, search, onAlert]);

  useEffect(() => { fetchJobs(1); }, [filterType, filterStatus, filterSource, search, fetchJobs]);

  const handleDelete = async (job: Job) => {
    setDeletingId(job.id);
    try {
      const res = await fetch(`${JOBS_API}/jobs/${job.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      onAlert(`"${job.jobTitle.slice(0, 40)}..." deleted`, 'success');
      fetchJobs(page);
    } catch { onAlert('Failed to delete job', 'error'); }
    finally { setDeletingId(null); setConfirmDelete(null); }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status?.toLowerCase() === 'active' ? 'Closed' : 'Active';
    try {
      const res = await fetch(`${JOBS_API}/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...job, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      onAlert(`Status changed to ${newStatus}`, 'success');
      fetchJobs(page);
    } catch { onAlert('Failed to update status', 'error'); }
  };

  return (
    <div>
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Delete Job?</h3>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              This will <strong>permanently delete</strong> "{confirmDelete.jobTitle.slice(0, 60)}...". This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
              >
                {deletingId === confirmDelete.id ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Job Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">{totalCount.toLocaleString()} total jobs in database</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchJobs(page)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition cursor-pointer">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/jobs/create" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
            <Plus size={14} /> Add Job
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
            placeholder="Search by keyword…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">All Types</option>
          <option value="job">Job</option>
          <option value="admit_card">Admit Card</option>
          <option value="result">Result</option>
          <option value="update">Update</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">All Sources</option>
          <option value="SarkariResult">SarkariResult</option>
          <option value="IndGovtJobs">IndGovtJobs</option>
          <option value="Manual">Manual</option>
        </select>
        {(search || filterType || filterStatus || filterSource) && (
          <button onClick={() => { setSearch(''); setSearchInput(''); setFilterType(''); setFilterStatus(''); setFilterSource(''); }} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 cursor-pointer">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/5" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Briefcase size={32} className="opacity-30 mb-3" />
            <p className="font-semibold">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Last Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 leading-snug line-clamp-1 max-w-xs">{job.jobTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{job.organizationName || job.companyName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        {typeLabel[job.type?.toLowerCase()] ?? job.type ?? 'Job'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{job.source ?? 'Manual'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(job.status)}`}>
                        {job.status ?? 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                      {job.lastDateToApply ? job.lastDateToApply.slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/jobs/${job.id}`} title="View" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/jobs/edit/${job.id}`} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
                          <Edit3 size={15} />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(job)}
                          title={job.status?.toLowerCase() === 'active' ? 'Set Closed' : 'Set Active'}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition cursor-pointer"
                        >
                          {job.status?.toLowerCase() === 'active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(job)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => fetchJobs(page - 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                <ChevronLeft size={14} /> Prev
              </button>
              <button disabled={page >= totalPages} onClick={() => fetchJobs(page + 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Asset Deletion Section ───────────────────────────────────────────────────
function AssetsSection({ onAlert }: { onAlert: (msg: string, type: 'success' | 'error') => void }) {
  const [urlInput, setUrlInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) { onAlert('Please enter a URL', 'error'); return; }
    setIsDeleting(true);
    try {
      await postApi('/cloudinary/delete-assets', { url: urlInput });
      onAlert('Asset deleted successfully', 'success');
      setUrlInput('');
    } catch (err: any) {
      onAlert(err.message || 'Failed to delete asset', 'error');
    } finally { setIsDeleting(false); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-5">Delete Cloudinary Assets</h2>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-lg">
        <p className="text-sm text-gray-500 mb-5">Remove images/videos from Cloudinary by providing their URL. This action cannot be undone.</p>
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Asset URL <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              disabled={isDeleting}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isDeleting || !urlInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 size={15} />
            {isDeleting ? 'Deleting…' : 'Delete Asset'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'jobs',      label: 'Job Management', Icon: Briefcase },
  { id: 'add-job',   label: 'Add New Job', Icon: Plus },
  { id: 'assets',    label: 'Delete Assets', Icon: Trash2 },
] as const;

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>('dashboard');
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showAlert = (msg: string, type: 'success' | 'error') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Guard
  if (isLoading) return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">Loading...</div>;
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm mb-6">You don't have permission to access the admin panel.</p>
          <Link href="/home" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-sm">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // If "Add New Job" nav clicked → redirect to create page
  const handleNav = (id: Section) => {
    if (id === 'add-job') { router.push('/jobs/create'); return; }
    setSection(id);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <TopBar />

      {alert && (
        <AlertModal
          duration={4000}
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-[1280px] mx-auto pt-[77px] px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-5 mt-5">

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-[240px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-[85px] overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Panel</p>
                <p className="text-sm font-bold text-gray-800 mt-1 truncate">{user.email}</p>
              </div>
              <nav className="p-2 flex flex-col gap-0.5">
                {NAV.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleNav(id as Section)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left cursor-pointer ${
                      section === id && id !== 'add-job'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : id === 'add-job'
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
                <hr className="my-2 border-gray-100" />
                <button onClick={() => router.push('/home')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition w-full text-left cursor-pointer">
                  <ArrowLeft size={16} /> Back to Site
                </button>
              </nav>
            </div>
          </aside>

          {/* ── Main content ───────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {section === 'dashboard' && <DashboardSection />}
            {section === 'jobs'      && <JobsSection onAlert={showAlert} />}
            {section === 'assets'    && <AssetsSection onAlert={showAlert} />}
          </main>
        </div>
      </div>
    </div>
  );
}
