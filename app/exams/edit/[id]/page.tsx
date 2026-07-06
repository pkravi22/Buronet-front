"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { get, put } from '@/lib/api';
import { Exam, ApiResponse } from '@/lib/types/exams';
// import { Exam } from '@/lib/types/exams';
import { ArrowLeft, Save } from 'lucide-react';
import TopBar from '@/components/TopBar'; // Assuming a shared top bar

interface FormFieldProps {
  label: string;
  id: string;
  value: string | number; // Use string | number if value could be numeric
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: string; // You could be more specific: 'text' | 'number' | 'email' | 'password' | 'textarea' etc.
  required?: boolean;
  rows?: number;
}

// A reusable form field component to reduce boilerplate
// const FormField = ({ label, id, value, onChange, type = 'text', required = false, rows = 3 }) => (
const FormField: React.FC<FormFieldProps> = ({ label, id, value, onChange, type = 'text', required = false, rows = 3 }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
      />
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name === 'educationalQualification' || name === 'minimumAge' || name === 'maximumAge' || name === 'nationality' || name === 'relaxationNotes' || name === 'otherRequirements') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.eligibilityCriteria) updated.eligibilityCriteria = { otherRequirements: [] };
        
        if (name === 'educationalQualification') {
          updated.eligibilityCriteria.educationalQualification = value;
        } else if (name === 'minimumAge') {
          if (!updated.eligibilityCriteria.ageLimit) updated.eligibilityCriteria.ageLimit = { relaxationNotes: [] };
          updated.eligibilityCriteria.ageLimit.minimum = value ? parseInt(value) : undefined;
        } else if (name === 'maximumAge') {
          if (!updated.eligibilityCriteria.ageLimit) updated.eligibilityCriteria.ageLimit = { relaxationNotes: [] };
          updated.eligibilityCriteria.ageLimit.maximum = value ? parseInt(value) : undefined;
        } else if (name === 'nationality') {
          updated.eligibilityCriteria.nationality = value;
        }
        
        return updated as Exam;
      });
    } else if (name === 'applicationStartDate' || name === 'applicationEndDate' || name === 'howToApply' || name === 'applicationFee') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.applicationDetails) updated.applicationDetails = { howToApply: [] };
        
        if (name === 'applicationStartDate' || name === 'applicationEndDate') {
          // These are handled by handleDateChange
        } else if (name === 'howToApply') {
          updated.applicationDetails.howToApply = value.split('\n');
        } else if (name === 'applicationFee') {
          try {
            updated.applicationDetails.applicationFee = value ? JSON.parse(value) : null;
          } catch (e) {
            // Keep the previous value if JSON parsing fails
            console.warn('Invalid JSON for applicationFee');
          }
        }
        
        return updated as Exam;
      });
    } else if (name === 'officialWebsite' || name === 'notificationPdf') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.importantLinks) updated.importantLinks = {};
        
        if (name === 'officialWebsite') {
          updated.importantLinks.officialWebsite = value;
        } else if (name === 'notificationPdf') {
          updated.importantLinks.notificationPdf = value;
        }
        
        return updated as Exam;
      });
    } else if (name === 'preliminarySummary' || name === 'preliminaryQualifyingPapers' || name === 'preliminaryOtherDetails' || 
               name === 'mainSummary' || name === 'mainQualifyingPapers' || name === 'mainOtherDetails' ||
               name === 'preliminaryTotalMarks' || name === 'mainTotalMarks') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.examPattern) updated.examPattern = {};
        
        if (name.startsWith('preliminary')) {
          if (!updated.examPattern.preliminary) updated.examPattern.preliminary = { papers: [], qualifyingPapers: [], otherDetails: [] };
          
          if (name === 'preliminarySummary') {
            updated.examPattern.preliminary.summary = value;
          } else if (name === 'preliminaryQualifyingPapers') {
            updated.examPattern.preliminary.qualifyingPapers = value.split('\n').filter(p => p.trim());
          } else if (name === 'preliminaryOtherDetails') {
            updated.examPattern.preliminary.otherDetails = value.split('\n').filter(p => p.trim());
          } else if (name === 'preliminaryTotalMarks') {
            updated.examPattern.preliminary.totalMarks = value ? parseInt(value) : undefined;
          }
        } else {
          if (!updated.examPattern.main) updated.examPattern.main = { papers: [], qualifyingPapers: [], otherDetails: [] };
          
          if (name === 'mainSummary') {
            updated.examPattern.main.summary = value;
          } else if (name === 'mainQualifyingPapers') {
            updated.examPattern.main.qualifyingPapers = value.split('\n').filter(p => p.trim());
          } else if (name === 'mainOtherDetails') {
            updated.examPattern.main.otherDetails = value.split('\n').filter(p => p.trim());
          } else if (name === 'mainTotalMarks') {
            updated.examPattern.main.totalMarks = value ? parseInt(value) : undefined;
          }
        }
        
        return updated as Exam;
      });
    } else {
      setExam(prev => ({ ...prev, [name]: value } as Exam));
    }
  };

  // NEW: A dedicated handler for the date input to manage format conversion
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // value is in 'yyyy-mm-dd'
    
    if (name === 'applicationStartDate' || name === 'applicationEndDate') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.applicationDetails) updated.applicationDetails = { howToApply: [] };
        
        if (name === 'applicationStartDate') {
          updated.applicationDetails.applicationStartDate = fromInputFormat(value);
        } else if (name === 'applicationEndDate') {
          updated.applicationDetails.applicationEndDate = fromInputFormat(value);
        }
        
        return updated as Exam;
      });
    } else if (name === 'preliminaryDate' || name === 'mainDate') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.examDates) updated.examDates = {};
        
        if (name === 'preliminaryDate') {
          updated.examDates.preliminaryDate = fromInputFormat(value);
        } else if (name === 'mainDate') {
          updated.examDates.mainDate = fromInputFormat(value);
        }
        
        return updated as Exam;
      });
    }
  };

  // Special handler for textareas that represent string arrays
  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split('\n').filter(item => item.trim());
    
    if (name === 'postsIncluded') {
      setExam(prev => ({ ...prev, postsIncluded: arrayValue } as Exam));
    } else if (name === 'relaxationNotes') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.eligibilityCriteria) updated.eligibilityCriteria = { otherRequirements: [] };
        if (!updated.eligibilityCriteria.ageLimit) updated.eligibilityCriteria.ageLimit = { relaxationNotes: [] };
        updated.eligibilityCriteria.ageLimit.relaxationNotes = arrayValue;
        return updated as Exam;
      });
    } else if (name === 'otherRequirements') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.eligibilityCriteria) updated.eligibilityCriteria = { otherRequirements: [] };
        updated.eligibilityCriteria.otherRequirements = arrayValue;
        return updated as Exam;
      });
    } else if (name === 'howToApply') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.applicationDetails) updated.applicationDetails = { howToApply: [] };
        updated.applicationDetails.howToApply = arrayValue;
        return updated as Exam;
      });
    } else if (name === 'preliminaryQualifyingPapers') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.examPattern) updated.examPattern = {};
        if (!updated.examPattern.preliminary) updated.examPattern.preliminary = { papers: [], qualifyingPapers: [], otherDetails: [] };
        updated.examPattern.preliminary.qualifyingPapers = arrayValue;
        return updated as Exam;
      });
    } else if (name === 'preliminaryOtherDetails') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.examPattern) updated.examPattern = {};
        if (!updated.examPattern.preliminary) updated.examPattern.preliminary = { papers: [], qualifyingPapers: [], otherDetails: [] };
        updated.examPattern.preliminary.otherDetails = arrayValue;
        return updated as Exam;
      });
    } else if (name === 'mainQualifyingPapers') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.examPattern) updated.examPattern = {};
        if (!updated.examPattern.main) updated.examPattern.main = { papers: [], qualifyingPapers: [], otherDetails: [] };
        updated.examPattern.main.qualifyingPapers = arrayValue;
        return updated as Exam;
      });
    } else if (name === 'mainOtherDetails') {
      setExam(prev => {
        const updated = { ...prev };
        if (!updated.examPattern) updated.examPattern = {};
        if (!updated.examPattern.main) updated.examPattern.main = { papers: [], qualifyingPapers: [], otherDetails: [] };
        updated.examPattern.main.otherDetails = arrayValue;
        return updated as Exam;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Clean up the exam object to remove undefined values and ensure required arrays exist
      const cleanedExam = JSON.parse(JSON.stringify(exam)); // Deep clone and remove undefined
      
      // Remove originalExtraction - it has null id which causes backend validation to fail
      delete cleanedExam.originalExtraction;
      
      const response = await put<ApiResponse<null>>(`/exams/${examId}`, cleanedExam);
      setSuccess("Exam updated successfully!");
      setTimeout(() => router.push(`/exams/${examId}`), 1500);
    } catch (err) {
      setError("Failed to update exam. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaperChange = (stage: 'preliminary' | 'main', paperIndex: number, field: string, value: string) => {
    setExam(prev => {
      const updated = { ...prev };
      if (!updated.examPattern) updated.examPattern = {};
      if (!updated.examPattern[stage]) updated.examPattern[stage] = { papers: [], qualifyingPapers: [], otherDetails: [] };
      
      const papers = [...(updated.examPattern[stage]?.papers || [])];
      if (!papers[paperIndex]) papers[paperIndex] = {};
      
      if (field === 'marks' || field === 'durationHours') {
        papers[paperIndex] = { ...papers[paperIndex], [field]: value ? parseInt(value) : undefined };
      } else {
        papers[paperIndex] = { ...papers[paperIndex], [field]: value };
      }
      
      updated.examPattern[stage]!.papers = papers;
      return updated as Exam;
    });
  };

  const handleInterviewChange = (stage: 'preliminary' | 'main', field: string, value: string) => {
    setExam(prev => {
      const updated = { ...prev };
      if (!updated.examPattern) updated.examPattern = {};
      if (!updated.examPattern[stage]) updated.examPattern[stage] = { papers: [], qualifyingPapers: [], otherDetails: [] };
      if (!updated.examPattern[stage]?.interview) updated.examPattern[stage]!.interview = {};
      
      const interview = updated.examPattern[stage]!.interview!;
      if (field === 'marks') {
        interview.marks = value ? parseInt(value) : undefined;
      } else if (field === 'stageName') {
        interview.stageName = value;
      }
      
      return updated as Exam;
    });
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
          <FormField label="Application Fee (JSON format)" id="applicationFee" type="textarea" value={exam.applicationDetails?.applicationFee ? JSON.stringify(exam.applicationDetails.applicationFee) : ''} onChange={handleChange} rows={3} />

          {/* Exam Dates */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Exam Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Preliminary Exam Date" id="preliminaryDate" type="date" value={toInputFormat(exam.examDates?.preliminaryDate)} onChange={handleDateChange} />
            <FormField label="Main Exam Date" id="mainDate" type="date" value={toInputFormat(exam.examDates?.mainDate)} onChange={handleDateChange} />
          </div>

          {/* Exam Pattern */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Exam Pattern - Preliminary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Preliminary Total Marks" id="preliminaryTotalMarks" type="number" value={exam.examPattern?.preliminary?.totalMarks || ''} onChange={handleChange} />
          </div>
          <FormField label="Preliminary Exam Summary" id="preliminarySummary" type="textarea" value={exam.examPattern?.preliminary?.summary || ''} onChange={handleChange} rows={4} />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Preliminary Papers</h3>
            {Array.isArray(exam.examPattern?.preliminary?.papers) && exam.examPattern.preliminary.papers.map((paper, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Paper Name"
                    value={paper.paperName || ''}
                    onChange={(e) => handlePaperChange('preliminary', idx, 'paperName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="Marks"
                    value={paper.marks || ''}
                    onChange={(e) => handlePaperChange('preliminary', idx, 'marks', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="Duration (Hours)"
                    value={paper.durationHours || ''}
                    onChange={(e) => handlePaperChange('preliminary', idx, 'durationHours', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Type"
                    value={paper.type || ''}
                    onChange={(e) => handlePaperChange('preliminary', idx, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {exam.examPattern?.preliminary?.interview && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Preliminary Interview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Interview Stage Name"
                  value={exam.examPattern.preliminary.interview.stageName || ''}
                  onChange={(e) => handleInterviewChange('preliminary', 'stageName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Interview Marks"
                  value={exam.examPattern.preliminary.interview.marks || ''}
                  onChange={(e) => handleInterviewChange('preliminary', 'marks', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <FormField label="Preliminary Qualifying Papers (one per line)" id="preliminaryQualifyingPapers" type="textarea" value={Array.isArray(exam.examPattern?.preliminary?.qualifyingPapers) ? exam.examPattern.preliminary.qualifyingPapers.join('\n') : ''} onChange={handleArrayChange} />
          <FormField label="Preliminary Other Details (one per line)" id="preliminaryOtherDetails" type="textarea" value={exam.examPattern?.preliminary?.otherDetails ? (Array.isArray(exam.examPattern.preliminary.otherDetails) ? exam.examPattern.preliminary.otherDetails.join('\n') : '') : ''} onChange={handleArrayChange} />

          <h2 className="text-xl font-semibold border-b pb-2 pt-6">Exam Pattern - Main</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Main Total Marks" id="mainTotalMarks" type="number" value={exam.examPattern?.main?.totalMarks || ''} onChange={handleChange} />
          </div>
          <FormField label="Main Exam Summary" id="mainSummary" type="textarea" value={exam.examPattern?.main?.summary || ''} onChange={handleChange} rows={4} />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Main Papers</h3>
            {Array.isArray(exam.examPattern?.main?.papers) && exam.examPattern.main.papers.map((paper, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Paper Name"
                    value={paper.paperName || ''}
                    onChange={(e) => handlePaperChange('main', idx, 'paperName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Type"
                    value={paper.type || ''}
                    onChange={(e) => handlePaperChange('main', idx, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="Marks"
                    value={paper.marks || ''}
                    onChange={(e) => handlePaperChange('main', idx, 'marks', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="Duration (Hours)"
                    value={paper.durationHours || ''}
                    onChange={(e) => handlePaperChange('main', idx, 'durationHours', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {exam.examPattern?.main?.interview && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Main Interview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Interview Stage Name"
                  value={exam.examPattern.main.interview.stageName || ''}
                  onChange={(e) => handleInterviewChange('main', 'stageName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Interview Marks"
                  value={exam.examPattern.main.interview.marks || ''}
                  onChange={(e) => handleInterviewChange('main', 'marks', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <FormField label="Main Qualifying Papers (one per line)" id="mainQualifyingPapers" type="textarea" value={Array.isArray(exam.examPattern?.main?.qualifyingPapers) ? exam.examPattern.main.qualifyingPapers.join('\n') : ''} onChange={handleArrayChange} />
          <FormField label="Main Other Details (one per line)" id="mainOtherDetails" type="textarea" value={exam.examPattern?.main?.otherDetails ? (Array.isArray(exam.examPattern.main.otherDetails) ? exam.examPattern.main.otherDetails.join('\n') : '') : ''} onChange={handleArrayChange} />

          {/* Syllabus Summary */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Syllabus & Additional Info</h2>
          <FormField label="Syllabus Summary" id="syllabusSummary" type="textarea" value={exam.syllabusSummary || ''} onChange={handleChange} rows={5} />

          {/* Important Links */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Important Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField label="Official Website URL" id="officialWebsite" value={exam.importantLinks?.officialWebsite || ''} onChange={handleChange} />
             <FormField label="Notification PDF URL" id="notificationPdf" value={exam.importantLinks?.notificationPdf || ''} onChange={handleChange} />
          </div>

          {/* Status */}
          <h2 className="text-xl font-semibold border-b pb-2 pt-4">Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={exam.status || 'Active'}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-[#0096c7] text-white font-semibold rounded-md shadow-sm hover:bg-cyan-700 disabled:bg-cyan-300 flex items-center gap-2">
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
