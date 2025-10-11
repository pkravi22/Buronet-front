"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { get, put } from '@/lib/api';
import { Job, ApiResponse } from '@/lib/types/jobs';
import { ArrowLeft, Save } from 'lucide-react';
import TopBar from '@/components/TopBar'; // Assuming a shared top bar

// A reusable form field component to reduce boilerplate
const FormField = ({ label, id, value, onChange, type = 'text', required = false, rows = 3 }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    )}
  </div>
);

const toInputFormat = (dateStr: string | undefined): string => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return ''; // Return empty if format is incorrect
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

const fromInputFormat = (dateStr: string | undefined): string => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
};

const JobEditPage = ({ params }: { params: { id: string } }) => {
  const [job, setJob] = useState<Partial<Job>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const response = await get<ApiResponse<Job>>(`/Jobs/${jobId}`);
        // if (response.success) {
          setJob(response);
        // } else {
        //   setError(response.message || "Failed to fetch job data.");
        // }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: value }));
  };

  // NEW: A dedicated handler for the date input to manage format conversion
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // value is in 'yyyy-mm-dd'
    setJob(prev => ({ ...prev, [name]: fromInputFormat(value) })); // Convert back and save to state
  };

  // Special handler for textareas that represent string arrays
  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: value.split('\n') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await put<ApiResponse<null>>(`/Jobs/${jobId}`, job);
      // The backend returns NoContent (204), so we don't expect a body.
      // We can check the status code on the API helper if needed.
      setSuccess("Job updated successfully!");
      // Optionally, redirect after a short delay
      setTimeout(() => router.push(`/jobs/${jobId}`), 1500);
    } catch (err) {
      setError("Failed to update job. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="text-center p-8">Loading job details...</p>;
  if (error && !job?.id) return <p className="text-center p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} />
          Back to Job Details
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Job Posting</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Job Title" id="jobTitle" value={job.jobTitle || ''} onChange={handleChange} required />
            <FormField label="Company Name" id="companyName" value={job.companyName || ''} onChange={handleChange} required />
            <FormField label="Organization Name" id="organizationName" value={job.organizationName || ''} onChange={handleChange} />
            <FormField label="Sector" id="sector" value={job.sector || ''} onChange={handleChange} />
            <FormField label="Location" id="location" value={job.location || ''} onChange={handleChange} />
            <FormField label="Compensation" id="compensation" value={job.compensation || ''} onChange={handleChange} />
            <FormField label="Employment Type" id="employmentType" value={job.employmentType || ''} onChange={handleChange} />
            <FormField label="Contact Information" id="contactInformation" value={job.contactInformation || ''} onChange={handleChange} />
            <FormField 
              label="Last Date To Apply" 
              id="lastDateToApply" 
              type="date" 
              value={toInputFormat(job.lastDateToApply)} 
              onChange={handleDateChange} 
            />
            <FormField label="Apply Link URL" id="applyLink" value={job.applyLink?.link || ''} onChange={handleChange} />
            <FormField label="Apply File" id="applyFile" value={job.applyLink?.fileName || ''} onChange={handleChange} />
          </div>

          <FormField label="Job Description" id="jobDescription" type="textarea" value={job.jobDescription || ''} onChange={handleChange} rows={8}/>
          
          <FormField 
            label="Qualifications (one per line)" 
            id="qualifications" 
            type="textarea" 
            value={Array.isArray(job.qualifications) ? job.qualifications.join('\n') : ''} 
            onChange={handleArrayChange}
          />

          <FormField 
            label="Benefits (one per line)" 
            id="benefits" 
            type="textarea" 
            value={Array.isArray(job.benefits) ? job.benefits.join('\n') : ''} 
            onChange={handleArrayChange}
          />

          <FormField 
            label="Application Process (one per line)" 
            id="applicationProcess" 
            type="textarea" 
            value={Array.isArray(job.applicationProcess) ? job.applicationProcess.join('\n') : ''} 
            onChange={handleArrayChange}
          />
          
          <FormField 
            label="Eligibility Notes (one per line)" 
            id="eligibilityNotes" 
            type="textarea" 
            value={Array.isArray(job.eligibilityNotes) ? job.eligibilityNotes.join('\n') : ''} 
            onChange={handleArrayChange}
          />

          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEditPage;
