"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { get, put } from '@/lib/api';
import { Job, ApiResponse } from '@/lib/types/jobs';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import TopBar from '@/components/TopBar';

interface FormFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  type?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  id, 
  value, 
  onChange, 
  type = 'text', 
  required = false, 
  rows = 3,
  placeholder = '',
  className = ''
}) => (
  <div className={`space-y-1 ${className}`}>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">{label}</label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-gray-800"
      />
    ) : type === 'select' ? (
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange as any}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white text-gray-800"
      />
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-gray-800"
      />
    )}
  </div>
);

const toInputFormat = (dateStr: string | undefined): string => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0]; // ISO yyyy-MM-dd
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day.length <= 2 && month.length <= 2 && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return '';
};

const fromInputFormat = (dateStr: string | undefined): string => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};

const JobEditPage = () => {
  const params = useParams();
  const jobId = params?.id as string;
  const router = useRouter();

  const [job, setJob] = useState<Partial<Job>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States for JSON textareas
  const [datesJson, setDatesJson] = useState('[]');
  const [feesJson, setFeesJson] = useState('[]');
  const [vacancyJson, setVacancyJson] = useState('[]');
  const [categoryVacancyJson, setCategoryVacancyJson] = useState('[]');
  const [linksJson, setLinksJson] = useState('[]');

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const response = await get<Job>(`/Jobs/${jobId}`);
        setJob(response);
        
        // Initialize JSON fields
        setDatesJson(JSON.stringify(response.importantDatesStructured || [], null, 2));
        setFeesJson(JSON.stringify(response.applicationFee || [], null, 2));
        setVacancyJson(JSON.stringify(response.vacancyDetails || [], null, 2));
        setCategoryVacancyJson(JSON.stringify(response.categoryVacancyDetails || [], null, 2));
        setLinksJson(JSON.stringify(response.importantLinks || [], null, 2));
      } catch (err) {
        setError("Failed to load job details. The job might not exist.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'applyLink' || name === 'applyFile') {
      setJob(prev => {
        const updated = { ...prev };
        if (!updated.applyLink) updated.applyLink = { link: '', fileName: '' };
        
        if (name === 'applyLink') {
          updated.applyLink.link = value;
        } else if (name === 'applyFile') {
          updated.applyLink.fileName = value;
        }
        return updated;
      });
    } else {
      setJob(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: fromInputFormat(value) }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: value.split('\n').filter(line => line.trim() !== '') }));
  };

  const parseJsonField = (jsonStr: string, fieldName: string) => {
    const trimmed = jsonStr.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        throw new Error("Must be a JSON array");
      }
      return parsed;
    } catch (err: any) {
      throw new Error(`[${fieldName}] - Invalid JSON structure: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse and assign structured scraper JSON fields
      const updatedJob = {
        ...job,
        importantDatesStructured: parseJsonField(datesJson, "Important Dates Structured"),
        applicationFee: parseJsonField(feesJson, "Application Fee"),
        vacancyDetails: parseJsonField(vacancyJson, "Vacancy Details"),
        categoryVacancyDetails: parseJsonField(categoryVacancyJson, "Category Vacancy Details"),
        importantLinks: parseJsonField(linksJson, "Important Links"),
      };

      await put<ApiResponse<null>>(`/Jobs/${jobId}`, updatedJob);
      setSuccess("Job posting updated successfully!");
      setTimeout(() => router.push(`/jobs/${jobId}`), 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update the job. Please check details and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 font-medium">Loading job details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar />
      <div className="max-w-5xl mx-auto py-8 px-4">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Edit Job Posting</h1>
            <p className="text-gray-500 mt-1">Modify details, scraper results, and structured tables below.</p>
          </div>
          <span className="px-3 py-1 bg-cyan-100 text-cyan-800 font-semibold rounded-full text-sm">
            Admin Mode
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <div className="text-red-850 text-sm font-semibold">{error}</div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6 flex items-start gap-3">
            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
            <div className="text-green-800 text-sm font-semibold">{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Job Title" id="jobTitle" value={job.jobTitle || ''} onChange={handleChange} required />
              <FormField label="Company Name" id="companyName" value={job.companyName || ''} onChange={handleChange} required />
              <FormField label="Organization Name" id="organizationName" value={job.organizationName || ''} onChange={handleChange} />
              <FormField label="Sector" id="sector" value={job.sector || ''} onChange={handleChange} />
              <FormField label="Source (Scraper / Portal)" id="source" value={job.source || ''} onChange={handleChange} placeholder="e.g. SarkariResult, Manual" />
              
              <div className="space-y-1">
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700">Type</label>
                <select
                  id="type"
                  name="type"
                  value={job.type || 'job'}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white text-gray-800"
                >
                  <option value="job">Job</option>
                  <option value="admit_card">Admit Card</option>
                  <option value="result">Result</option>
                  <option value="update">Update</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700">Status</label>
                <select
                  id="status"
                  name="status"
                  value={job.status || 'active'}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white text-gray-800"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <FormField label="Reference Number" id="referenceNumber" value={job.referenceNumber || ''} onChange={handleChange} />
              <FormField label="Employment Type" id="employmentType" value={job.employmentType || ''} onChange={handleChange} placeholder="e.g. Full-time, Contract" />
              <FormField label="Location" id="location" value={job.location || ''} onChange={handleChange} />
              <FormField label="Compensation" id="compensation" value={job.compensation || ''} onChange={handleChange} />
              <FormField label="Source URL" id="sourceUrl" value={job.sourceUrl || ''} onChange={handleChange} placeholder="https://..." className="md:col-span-2" />
            </div>
          </div>

          {/* Card 2: Dates & Links */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Dates & Contact Info</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Date of Issue" 
                id="dateOfIssue" 
                type="date" 
                value={toInputFormat(job.dateOfIssue)} 
                onChange={handleDateChange} 
              />
              <FormField 
                label="Last Date To Apply" 
                id="lastDateToApply" 
                type="date" 
                value={toInputFormat(job.lastDateToApply)} 
                onChange={handleDateChange} 
              />
              <FormField label="Apply Link URL" id="applyLink" value={job.applyLink?.link || ''} onChange={handleChange} />
              <FormField label="Apply File/Notification" id="applyFile" value={job.applyLink?.fileName || ''} onChange={handleChange} />
              <FormField label="Contact Information" id="contactInformation" value={job.contactInformation || ''} onChange={handleChange} className="md:col-span-2" />
            </div>
          </div>

          {/* Card 3: Descriptions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Job Description & Highlights</h2>
            <FormField label="Main Description" id="jobDescription" type="textarea" value={job.jobDescription || ''} onChange={handleChange} rows={6} />
            <FormField 
              label="Short Description paragraphs (one paragraph per line)" 
              id="shortDescription" 
              type="textarea" 
              value={Array.isArray(job.shortDescription) ? job.shortDescription.join('\n') : ''} 
              onChange={handleArrayChange}
              rows={4}
            />
          </div>

          {/* Card 4: Plain arrays */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Requirements & Details (One per line)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Qualifications" 
                id="qualifications" 
                type="textarea" 
                value={Array.isArray(job.qualifications) ? job.qualifications.join('\n') : ''} 
                onChange={handleArrayChange}
                rows={5}
              />
              <FormField 
                label="Benefits" 
                id="benefits" 
                type="textarea" 
                value={Array.isArray(job.benefits) ? job.benefits.join('\n') : ''} 
                onChange={handleArrayChange}
                rows={5}
              />
              <FormField 
                label="Application Process Steps" 
                id="applicationProcess" 
                type="textarea" 
                value={Array.isArray(job.applicationProcess) ? job.applicationProcess.join('\n') : ''} 
                onChange={handleArrayChange}
                rows={5}
              />
              <FormField 
                label="Eligibility Notes" 
                id="eligibilityNotes" 
                type="textarea" 
                value={Array.isArray(job.eligibilityNotes) ? job.eligibilityNotes.join('\n') : ''} 
                onChange={handleArrayChange}
                rows={5}
              />
              <FormField 
                label="How To Apply" 
                id="howToApply" 
                type="textarea" 
                value={Array.isArray(job.howToApply) ? job.howToApply.join('\n') : ''} 
                onChange={handleArrayChange}
                rows={5}
              />
              <FormField 
                label="Age Limits" 
                id="ageLimits" 
                type="textarea" 
                value={Array.isArray(job.ageLimits) ? job.ageLimits.join('\n') : ''} 
                onChange={handleArrayChange}
                rows={5}
              />
            </div>
          </div>

          {/* Card 5: JSON Editors */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Structured Data (JSON Arrays)</h2>
              <p className="text-sm text-gray-500 mt-1">Edit nested lists and scraper tables. Ensure values are formatted as valid JSON arrays.</p>
            </div>

            <div className="space-y-6">
              {/* Important Dates */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Important Dates Structured (JSON Array)</label>
                <textarea
                  value={datesJson}
                  onChange={e => setDatesJson(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-gray-50 text-gray-800"
                />
                <p className="text-xs text-gray-400">Format: {"[ { \"label\": \"Application Start\", \"value\": \"14/08/2026\" } ]"}</p>
              </div>

              {/* Application Fee */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Application Fee (JSON Array)</label>
                <textarea
                  value={feesJson}
                  onChange={e => setFeesJson(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-gray-50 text-gray-800"
                />
                <p className="text-xs text-gray-400">Format: {"[ { \"category\": \"General / OBC\", \"amount\": \"100\" } ]"}</p>
              </div>

              {/* Vacancy Details */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Vacancy Details (JSON Array of Objects)</label>
                <textarea
                  value={vacancyJson}
                  onChange={e => setVacancyJson(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-gray-50 text-gray-800"
                />
                <p className="text-xs text-gray-400">Format: {"[ { \"Post Name\": \"Junior Engineer\", \"Total Post\": \"4098\" } ]"}</p>
              </div>

              {/* Category Vacancy Details */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Category Vacancy Details (JSON Array of Objects)</label>
                <textarea
                  value={categoryVacancyJson}
                  onChange={e => setCategoryVacancyJson(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-gray-50 text-gray-800"
                />
                <p className="text-xs text-gray-400">Format: {"[ { \"Post Name\": \"Junior Engineer\", \"UR\": \"1650\", \"SC\": \"600\" } ]"}</p>
              </div>

              {/* Important Links */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Important Links (JSON Array)</label>
                <textarea
                  value={linksJson}
                  onChange={e => setLinksJson(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-gray-50 text-gray-800"
                />
                <p className="text-xs text-gray-400">Format: {"[ { \"label\": \"Apply Online\", \"url\": \"https://...\", \"type\": \"apply\" } ]"}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            {error && <p className="text-sm font-semibold text-red-650">{error}</p>}
            {success && <p className="text-sm font-semibold text-green-600">{success}</p>}
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-[#0096c7] text-white font-semibold rounded-xl shadow-md hover:bg-cyan-700 transition-all disabled:bg-cyan-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEditPage;
