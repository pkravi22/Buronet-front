"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { get, put } from '@/lib/api';
import { Exam, ApiResponse } from '@/lib/types/exams';
// import { Exam } from '@/lib/types/exams';
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

interface ExamEditPageProps {
  params: {
    id: string
  }
}

const ExamEditPage = ({ params } : ExamEditPageProps) => {
  const [exam, setExam] = useState<Partial<Exam>>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  // const resolvedParams = use(params);
  const examId = params.id;

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      setIsLoading(true);
      try {
        const response = await get<Exam>(`/exams/${examId}`);
        // if (response.success) {
          setExam(response);
        // } else {
        //   setError(response.message || "Failed to fetch exam data.");
        // }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExam(prev => ({ ...prev, [name]: value } as Exam));
  };

  // NEW: A dedicated handler for the date input to manage format conversion
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // value is in 'yyyy-mm-dd'
    setExam(prev => ({ ...prev, [name]: fromInputFormat(value) } as Exam)); // Convert back and save to state
  };

  // Special handler for textareas that represent string arrays
  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExam(prev => ({ ...prev, [name]: value.split('\n') } as Exam));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await put<ApiResponse<null>>(`/Exams/${examId}`, exam);
      // The backend returns NoContent (204), so we don't expect a body.
      // We can check the status code on the API helper if needed.
      setSuccess("Exam updated successfully!");
      // Optionally, redirect after a short delay
      setTimeout(() => router.push(`/exams/${examId}`), 1500);
    } catch (err) {
      setError("Failed to update exam. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="text-center p-8">Loading exam details...</p>;
  if (!exam) {
    return <p className="text-center p-8 text-red-600">{error || "Exam data could not be loaded."}</p>;
  }
  if (error && !exam?.id) return <p className="text-center p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} />
          Back to Exam Details
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Exam Posting</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          
          {/* Main Details */}
          <h2 className="text-xl font-semibold border-b pb-2">Main Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Exam Title" id="examTitle" value={exam.examTitle || ''} onChange={handleChange} required />
            <FormField label="Conducting Body" id="conductingBody" value={exam.conductingBody || ''} onChange={handleChange} />
            <FormField label="Reference Number" id="referenceNumber" value={exam.referenceNumber || ''} onChange={handleChange} />
          </div>
          <FormField label="Posts Included (one per line)" id="postsIncluded" type="textarea" value={Array.isArray(exam.postsIncluded) ? exam.postsIncluded.join('\n') : ''} onChange={handleArrayChange} />
          <FormField label="Exam Summary" id="examSummary" type="textarea" value={exam.examSummary || ''} onChange={handleChange} rows={5}/>

          {/* Eligibility Criteria */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Eligibility Criteria</h2>
          <FormField label="Educational Qualification" id="educationalQualification" type="textarea" value={exam.eligibilityCriteria?.educationalQualification || ''} onChange={handleChange} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Minimum Age" id="minimumAge" type="number" value={exam.eligibilityCriteria?.ageLimit?.minimum || ''} onChange={handleChange} />
            <FormField label="Maximum Age" id="maximumAge" type="number" value={exam.eligibilityCriteria?.ageLimit?.maximum || ''} onChange={handleChange} />
          </div>
          <FormField label="Age Relaxation Notes (one per line)" id="relaxationNotes" type="textarea" value={Array.isArray(exam.eligibilityCriteria?.ageLimit?.relaxationNotes) ? exam.eligibilityCriteria.ageLimit.relaxationNotes.join('\n') : ''} onChange={handleArrayChange} />
          <FormField label="Nationality" id="nationality" value={exam.eligibilityCriteria?.nationality || ''} onChange={handleChange} />
          <FormField label="Other Requirements (one per line)" id="otherRequirements" type="textarea" value={Array.isArray(exam.eligibilityCriteria?.otherRequirements) ? exam.eligibilityCriteria.otherRequirements.join('\n') : ''} onChange={handleArrayChange} />
          
          {/* Application Details */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Application Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Application Start Date" id="applicationStartDate" type="date" value={toInputFormat(exam.applicationDetails?.applicationStartDate)} onChange={handleDateChange} />
            <FormField label="Application End Date" id="applicationEndDate" type="date" value={toInputFormat(exam.applicationDetails?.applicationEndDate)} onChange={handleDateChange} />
          </div>
          <FormField label="How to Apply (one step per line)" id="howToApply" type="textarea" value={Array.isArray(exam.applicationDetails?.howToApply) ? exam.applicationDetails.howToApply.join('\n') : ''} onChange={handleArrayChange} />

          {/* Important Links */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Important Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField label="Official Website URL" id="officialWebsite" value={exam.importantLinks?.officialWebsite || ''} onChange={handleChange} />
             <FormField label="Notification PDF URL" id="notificationPdf" value={exam.importantLinks?.notificationPdf || ''} onChange={handleChange} />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamEditPage;
