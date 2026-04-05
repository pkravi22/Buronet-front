"use client";

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import TopBar from '../../../components/TopBar';
import { useRouter } from 'next/navigation';
import { postApi } from '@/lib/api';
import { ChevronLeft, Info, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';

interface ExamFormData {
  examTitle: string;
  conductingBody: string;
  examSummary: string;
  referenceNumber: string;
  eligibilityCriteria: string;
  applicationDetails: string;
  examPattern: string;
  syllabus: string;
  links: string;
  dates: string;
  status: string;
}

const CreateExamPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExamFormData>({
    examTitle: '',
    conductingBody: '',
    examSummary: '',
    referenceNumber: '',
    eligibilityCriteria: '',
    applicationDetails: '',
    examPattern: '',
    syllabus: '',
    links: '',
    dates: '',
    status: 'active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.examTitle.trim()) {
      setError('Exam Title is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.conductingBody.trim()) {
      setError('Conducting Body is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.examSummary.trim()) {
      setError('Exam Summary is required.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        examTitle: formData.examTitle,
        conductingBody: formData.conductingBody,
        examSummary: formData.examSummary,
        referenceNumber: formData.referenceNumber || undefined,
        eligibilityCriteria: formData.eligibilityCriteria || undefined,
        applicationDetails: formData.applicationDetails || undefined,
        examPattern: formData.examPattern || undefined,
        syllabus: formData.syllabus || undefined,
        links: formData.links ? formData.links.split('\n').filter(line => line.trim() !== '') : undefined,
        dates: formData.dates ? formData.dates.split('\n').filter(line => line.trim() !== '') : undefined,
        status: formData.status
      };

      await postApi('/exams/create', payload);
      router.push('/exams');
    } catch (err: any) {
      console.error("Failed to create exam:", err);
      setError(err.message || 'Failed to create exam. Please try again.');
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
        <Navbar activeItem="Exams" />

        <main className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <Link href="/exams" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
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
                  <BookOpen size={20} className="text-blue-500" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
                    <input
                      type="text"
                      name="examTitle"
                      required
                      value={formData.examTitle}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="e.g. UPSC Civil Services Examination"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conducting Body *</label>
                    <input
                      type="text"
                      name="conductingBody"
                      required
                      value={formData.conductingBody}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="e.g. UPSC, SSC, IBPS"
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
                      placeholder="e.g. EXAM-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Exam Summary */}
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  Exam Details
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Summary *</label>
                  <textarea
                    name="examSummary"
                    required
                    rows={6}
                    value={formData.examSummary}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Overview of the exam, its importance, and key details..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                    <textarea
                      name="eligibilityCriteria"
                      rows={4}
                      value={formData.eligibilityCriteria}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Age limit, educational qualifications, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Details</label>
                    <textarea
                      name="applicationDetails"
                      rows={4}
                      value={formData.applicationDetails}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="How to apply, application fees, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Pattern</label>
                    <textarea
                      name="examPattern"
                      rows={4}
                      value={formData.examPattern}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Number of papers, duration, marking scheme, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus</label>
                    <textarea
                      name="syllabus"
                      rows={4}
                      value={formData.syllabus}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Topics covered in the exam..."
                    />
                  </div>
                </div>
              </section>

              {/* Additional Information */}
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Info size={20} className="text-blue-500" />
                  Additional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Links (One per line)</label>
                    <textarea
                      name="links"
                      rows={4}
                      value={formData.links}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="https://official-website.com&#10;https://notification.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Important Dates (One per line)</label>
                    <textarea
                      name="dates"
                      rows={4}
                      value={formData.dates}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Application Start: 01-01-2024&#10;Application End: 15-01-2024"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/exams" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Exam...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateExamPage;
