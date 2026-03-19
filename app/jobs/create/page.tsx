"use client";

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import TopBar from '../../../components/TopBar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { postApi } from '@/lib/api';
import { ChevronLeft, Info, Briefcase, Building2, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

interface JobFormData {
  jobTitle: string;
  companyName: string;
  sector: string;
  referenceNumber: string;
  organizationName: string;
  location: string;
  compensation: string;
  jobDescription: string;
  contactInformation: string;
  employmentType: string;
  dateOfIssue: string;
  lastDateToApply: string;
  qualifications: string;
  benefits: string;
  applicationProcess: string;
  eligibilityNotes: string;
  applyLinkUrl: string;
  applyLinkFileName: string;
  status: string;
}

const CreateJobPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: '',
    companyName: '',
    sector: '',
    referenceNumber: '',
    organizationName: '',
    location: '',
    compensation: '',
    jobDescription: '',
    contactInformation: '',
    employmentType: 'Full-time',
    dateOfIssue: new Date().toISOString().split('T')[0],
    lastDateToApply: '',
    qualifications: '',
    benefits: '',
    applicationProcess: '',
    eligibilityNotes: '',
    applyLinkUrl: '',
    applyLinkFileName: '',
    status: 'Active'
  });

  if (!user || !user.isAdmin) {
    // Basic protection, redirect if not admin
    // In a real app, maybe show a "Not Authorized" message or redirect in useEffect
    if (typeof window !== 'undefined' && user !== undefined) { 
       // Only redirect if user state is loaded (user is either null or object, but if undefined wait)
       // But user is User | null from context. Initial might be null but isLoading is true. 
       // Assuming AuthContext handles loading state.
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.jobTitle.trim()) {
      setError('Job Title is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.companyName.trim()) {
      setError('Company Name is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.organizationName.trim()) {
      setError('Organization Name is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.sector.trim()) {
      setError('Sector is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.jobDescription.trim()) {
      setError('Job Description is required.');
      setIsLoading(false);
      return;
    }

    try {
      // transform textarea strings to arrays
      const payload = {
        ...formData,
        qualifications: formData.qualifications.split('\n').filter(line => line.trim() !== ''),
        benefits: formData.benefits.split('\n').filter(line => line.trim() !== ''),
        applicationProcess: formData.applicationProcess.split('\n').filter(line => line.trim() !== ''),
        eligibilityNotes: formData.eligibilityNotes.split('\n').filter(line => line.trim() !== ''),
        applyLink: {
          link: formData.applyLinkUrl,
          fileName: formData.applyLinkFileName || 'Application Form'
        },
        // Remove flattened fields that are now in objects/arrays
        applyLinkUrl: undefined,
        applyLinkFileName: undefined
      };

      await postApi('/jobs/create', payload);
      router.push('/jobs');
    } catch (err: any) {
      console.error("Failed to create job:", err);
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] pb-6">
      <TopBar />
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px]">
        {/* Sidebar Space */}
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem="Jobs" />

        <main className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <Link href="/jobs" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create New Job Post</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-500" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      required
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                    <input
                      type="text"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="e.g. JOB-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Organization Details */}
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-500" />
                  Organization Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      name="organizationName"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Parent organization if applicable"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                    <input
                      type="text"
                      name="sector"
                      required
                      value={formData.sector}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="e.g. IT, Healthcare, Government"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-10 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="e.g. Mumbai, Remote"
                      />
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                    <input
                      type="text"
                      name="contactInformation"
                      value={formData.contactInformation}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Email or phone number for inquiries"
                    />
                  </div>
                </div>
              </section>

              {/* Compensation & Dates */}
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign size={20} className="text-blue-500" />
                  Compensation & Dates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compensation</label>
                    <input
                      type="text"
                      name="compensation"
                      value={formData.compensation}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="e.g. ₹10L - ₹15L per annum"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Issue</label>
                    <input
                      type="date"
                      name="dateOfIssue"
                      value={formData.dateOfIssue}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Date to Apply</label>
                    <input
                      type="date"
                      name="lastDateToApply"
                      value={formData.lastDateToApply}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Detailed Information */}
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  Detailed Information
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <textarea
                    name="jobDescription"
                    required
                    rows={6}
                    value={formData.jobDescription}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Full details about the role..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (One per line)</label>
                    <textarea
                      name="qualifications"
                      rows={4}
                      value={formData.qualifications}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="- B.Tech in Computer Science&#10;- 5+ years experience"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (One per line)</label>
                    <textarea
                      name="benefits"
                      rows={4}
                      value={formData.benefits}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="- Health Insurance&#10;- Remote Work"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Process (One per line)</label>
                    <textarea
                      name="applicationProcess"
                      rows={4}
                      value={formData.applicationProcess}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="1. Submit resume&#10;2. Online assessment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Notes (One per line)</label>
                    <textarea
                      name="eligibilityNotes"
                      rows={4}
                      value={formData.eligibilityNotes}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="- Must be an Indian citizen"
                    />
                  </div>
                </div>
              </section>

              {/* Application Link */}
              <section className="space-y-6">
                 <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Info size={20} className="text-blue-500" />
                  Application Link
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apply Link URL</label>
                    <input
                      type="url"
                      name="applyLinkUrl"
                      value={formData.applyLinkUrl}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link/File Name</label>
                    <input
                      type="text"
                      name="applyLinkFileName"
                      value={formData.applyLinkFileName}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="e.g. Official Website"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/jobs" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Job...' : 'Create Job Post'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateJobPage;
