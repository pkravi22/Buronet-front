"use client";

import TopBar from '@/components/TopBar';
import Navbar from '@/components/Navbar';
import { CalendarDays, Building2, Clock, BadgeIndianRupee, Edit, Download, UserCheck, ListChecks, FileText, LucideLink, FileArchive, Globe, Bookmark, Gift, Calendar, Gavel } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { get, postApi, remove } from '@/lib/api';
import { Exam, ApiResponse, AgeLimit, ExamStage, Paper } from '@/lib/types/exams';
import { useAuth } from '@/context/AuthContext'; // Assuming you have a useAuth hook to get the current user
import { formatDate as formatDateHelper } from '@/lib/helpers/DateHelper'; // Assuming you have a date helper

interface ExamDetailsPageProps {
  params: {
    id: string
  }
}

const formatAge = (age?: number) => age ? `${age} years` : 'N/A';
const formatAgeRange = (ageLimit?: AgeLimit) => {
    if (ageLimit?.minimum && ageLimit?.maximum) {
        return `${ageLimit.minimum} - ${ageLimit.maximum} years`;
    }
    if (ageLimit?.minimum) return `Min: ${ageLimit.minimum} years`;
    if (ageLimit?.maximum) return `Max: ${ageLimit.maximum} years`;
    return 'Not Specified';
};

const ExamDetailsPage = ({ params }: ExamDetailsPageProps) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get the current user
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // In a real app, you'd get the userId from an auth context
  const userId = user?.id;
  const examId = params.id;

  useEffect(() => {
    if (!examId) return;

    const fetchExamDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch main exam details
        const examResponse = await get<ApiResponse<Exam>>(`/exams/${examId}`);
        // if (examResponse.success) {
          setExam(examResponse as any); // Kept as per your original code
        // } else {
        //   throw new Error(examResponse.message || 'Exam not found');
        // }

        // Fetch user's bookmarks to see if this exam is saved
        const bookmarksResponse = await get<any[]>(`/bookmarks/${userId}/exams`);
        if (bookmarksResponse.some(b => b.examId === examId)) {
          setIsBookmarked(true);
        }

      } catch (error) {
        console.error("Failed to fetch exam details:", error);
        setExam(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamDetails();
  }, [params.id, userId]);

  const handleToggleBookmark = async () => {
      setIsBookmarking(true);
      const originalState = isBookmarked;
      // Optimistic UI update
      setIsBookmarked(!originalState); 
  
      try {
        if (originalState) {
          // Un-bookmark the exam
          await remove(`/bookmarks/${userId}/exam/${exam?.id}`);
        } else {
          // Bookmark the exam
          await postApi(`/bookmarks/${userId}/exam`, { examId: exam?.id });
        }
      } catch (error) {
        console.error("Failed to update bookmark:", error);
        // Revert on error
        setIsBookmarked(originalState);
      } finally {
        setIsBookmarking(false);
      }
    };

  const renderExamStage = (stage: ExamStage | undefined, title: string) => {
    if (!stage) return null;
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5">
                <Gavel size={20} className="text-[#0096c7] mr-2" /> {title}
            </h3>
            <div className="space-y-4">
                {stage.summary && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Summary</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{stage.summary}</p>
                    </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">Papers</p>
                    <ul className="space-y-3">
                        {stage.papers.map((paper: Paper, index: number) => (
                            <li key={index} className="border-b last:border-b-0 pb-2">
                                <p className="text-sm font-medium text-gray-800">{paper.paperName}</p>
                                <div className="flex justify-between text-xs text-gray-600 mt-1">
                                    <span>Type: {paper.type || 'N/A'}</span>
                                    <span>Marks: {paper.marks || 'N/A'}</span>
                                    <span>Duration: {paper.durationHours ? `${paper.durationHours} hrs` : 'N/A'}</span>
                                </div>
                                {paper.notes && <p className="text-xs text-gray-500 italic mt-1">{paper.notes}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
                {stage.interview && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Interview/Personality Test</p>
                        <p className="text-sm font-medium text-gray-800">{stage.interview.stageName || 'Interview'}</p>
                        <p className="text-sm text-gray-600">Marks: {stage.interview.marks || 'N/A'}</p>
                        {stage.interview.notes && <p className="text-xs text-gray-500 italic mt-1">{stage.interview.notes}</p>}
                    </div>
                )}
                {stage.totalMarks && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Total Marks</p>
                        <p className="text-sm text-gray-700 font-medium">{stage.totalMarks}</p>
                    </div>
                )}
                {stage.qualifyingPapers.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Qualifying Papers</p>
                        <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
                            {stage.qualifyingPapers.map((q, index) => <li key={index} className="pl-1">{q}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading exam details...</div>;
  }

  if (isBookmarking) {
    return <div className="flex justify-center items-center h-screen">{!isBookmarked ? "Removing Bookmark" : "Adding Bookmark"}...</div>;
  }

  if (!exam) {
    return <div className="flex justify-center items-center h-screen">Exam not found.</div>;
  }

  const ageLimit = exam.eligibilityCriteria?.ageLimit;
  const relaxationNotes = ageLimit?.relaxationNotes;

  return (
    <div className="bg-[#EEF0F4] font-sans text-gray-800">
      <Navbar activeItem="Exams" />

      <main className="lg:pl-[284px]">
        <TopBar />
        <div className="flex flex-col mt-8">
          <div className="min-h-[calc(100vh-72px)] bg-[#EEF0F4] pt-8 pb-24 lg:py-8 lg:pb-12">
            <div className="w-full px-4 sm:px-6 lg:pl-6 lg:pr-0">
              <div className="flex flex-col justify-center lg:flex-row gap-8">
                
                {/* Left Column - Dynamic Overview */}
                <div className="lg:w-1/3">
                  <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                    <div className="flex flex-col">
                      <div className="w-full flex justify-center mb-4">
                        <img
                          // Placeholder logo - should be dynamic from your exam data if possible
                          src="https://readdy.ai/api/search-image?query=official%20government%20logo%20of%20Union%20Public%20Service%20Commission%20of%20India%20with%20emblem%20and%20blue%20and%20gold%20colors%20professional%20clean%20design%20on%20white%20background&width=120&height=120&seq=201&orientation=squarish"
                          alt="Conducting Body Logo"
                          className="h-24 w-24 object-contain"
                        />
                      </div>
                      <div className="w-full mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 text-center">{exam.examTitle}</h1>
                        <p className="text-gray-600 mt-2 text-center">{exam.conductingBody}</p>
                      </div>
                      
                      <div className="w-full mb-6">
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="w-8 text-gray-400 flex items-center justify-center"><CalendarDays size={20} /></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Notification Date</p>
                              <p className="text-sm text-gray-600">{formatDateHelper(exam.createdDate || "")}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-8 text-gray-400 flex items-center justify-center"><Building2 size={20} /></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Conducting Body</p>
                              <p className="text-sm text-gray-600">{exam.conductingBody}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-8 text-gray-400 flex items-center justify-center"><Clock size={20} /></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Application Window</p>
                              <p className="text-sm text-gray-600">
                                {formatDateHelper(exam.applicationDetails?.applicationStartDate || "")} - {formatDateHelper(exam.applicationDetails?.applicationEndDate || "")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-8 text-gray-400 flex items-center justify-center"><Calendar size={20} /></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Exam Dates</p>
                              <p className="text-sm text-gray-600">
                                Prelims: {formatDateHelper(exam.examDates?.preliminaryDate || "") || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Mains: {formatDateHelper(exam.examDates?.mainDate || "") || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full flex-col space-y-3">
                        {/* Bookmark logic removed, but can be added if needed */}
                        <a href={exam.importantLinks?.officialWebsite?.startsWith('http') ? exam.importantLinks.officialWebsite : `https://${exam.importantLinks?.officialWebsite}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#0096c7] hover:bg-cyan-700 text-white py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                          <Edit size={18} /> Apply / Official Site
                        </a>
                        {exam.importantLinks?.notificationPdf && (
                          <a href={exam.importantLinks.notificationPdf} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                            <Download size={18} /> Download Notification
                          </a>
                        )}
                        {user?.isAdmin && 
                        <a href={`edit/${exam.id}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                          <Download size={18} /> Edit Exam
                        </a>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Detailed Information Cards */}
                <div className="lg:w-[60%] mt-6 lg:mt-[24px]">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Exam Details</h2>
                    <p className="text-gray-600 mt-1">Reference Number: {exam.referenceNumber || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    
                    {/* Exam Summary / Posts Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4"><FileText size={20} className="text-[#0096c7] mr-2" /> Exam Overview</h3>
                      {exam.examSummary && (
                        <p className="text-gray-700 whitespace-pre-line mb-4">{exam.examSummary}</p>
                      )}
                      <div className="space-y-4 mt-4"> 
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Posts Included</p>
                            <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
                                {exam.postsIncluded.map((post, index) => <li key={index} className="pl-1">{post}</li>)}
                            </ul>
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Criteria Card */}
                    {exam.eligibilityCriteria && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><UserCheck size={20} className="text-[#0096c7] mr-2" /> Eligibility & Qualifications</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Educational Qualification</p>
                                    <p className="text-sm text-gray-700">{exam.eligibilityCriteria.educationalQualification || 'Not Specified'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Age Limit</p>
                                    <p className="text-sm text-gray-700">{formatAgeRange(exam.eligibilityCriteria.ageLimit)}</p>
                                    {relaxationNotes?.length! > 0 && (
                                      <ul className="text-xs text-gray-600 list-disc pl-4 mt-1 space-y-1 marker:text-gray-400">
                                        {relaxationNotes?.map((note, index) => (
                                          <li key={index} className="pl-1 italic">
                                            {note}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Other Requirements</p>
                                    <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
                                        {exam.eligibilityCriteria.otherRequirements.map((note, index) => <li key={index} className="pl-1">{note}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Syllabus Summary Card */}
                    {exam.syllabusSummary && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><ListChecks size={20} className="text-[#0096c7] mr-2" /> Syllabus Summary</h3>
                            <p className="text-gray-700 whitespace-pre-line">{exam.syllabusSummary}</p>
                        </div>
                    )}

                    {/* Exam Pattern Cards */}
                    {exam.examPattern && (
                        <>
                            {renderExamStage(exam.examPattern.preliminary, "Preliminary Stage Details")}
                            {renderExamStage(exam.examPattern.main, "Main Stage Details")}
                        </>
                    )}

                    {/* How to Apply Card */}
                    {exam.applicationDetails && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><Edit size={20} className="text-[#0096c7] mr-2" /> How to Apply</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Application Process</p>
                                    <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-2 mt-2">
                                        {exam.applicationDetails.howToApply.map((step, index) => <li key={index}>{step}</li>)}
                                    </ol>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Application Fee</p>
                                    {/* This is a simple display for the flexible applicationFee object */}
                                    <p className="text-sm text-gray-700">
                                        {exam.applicationDetails.applicationFee 
                                            ? Object.entries(exam.applicationDetails.applicationFee).map(([key, value]) => `${key}: ${value}`).join(' | ')
                                            : 'See official notification for fee details.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Important Links Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><LucideLink size={20} className="text-[#0096c7] mr-2" />Important Links</h3>
                        <div className="space-y-3"> 
                            {exam.importantLinks?.notificationPdf && (
                                <a href={exam.importantLinks.notificationPdf} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-cyan-50 transition cursor-pointer">
                                    <div className="flex items-center"><FileArchive size={18} className="text-red-500 mr-3" /><span className="text-gray-800">Official Notification PDF</span></div>
                                    <LucideLink size={16} className="text-gray-400" />
                                </a>
                            )}
                            {exam.importantLinks?.officialWebsite && (
                                <a href={exam.importantLinks.officialWebsite.startsWith('http') ? exam.importantLinks.officialWebsite : `https://${exam.importantLinks.officialWebsite}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-cyan-50 transition cursor-pointer">
                                    <div className="flex items-center"><Globe size={18} className="text-[#00B4D8] mr-3" /><span className="text-gray-800">Official Website</span></div>
                                    <LucideLink size={16} className="text-gray-400" />
                                </a>
                            )}
                            {(!exam.importantLinks?.notificationPdf && !exam.importantLinks?.officialWebsite) && (
                                <p className="text-gray-500 text-sm p-2">No specific links provided.</p>
                            )}
                        </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

};

const splitAtFirst = (text: string, separator: string = '/'): [string, string] => {
    if (!text) return ['', ''];
    const index = text.indexOf(separator);
    if (index === -1) return [text, ''];
    const part1 = text.slice(0, index);
    const part2 = text.slice(index + 1);
    return [part1, part2];
};

export default ExamDetailsPage;

