// // File: app/jobs/[id]/page.tsx
// "use client";

// import TopBar from '@/components/TopBar';
// import Navbar from '@/components/Navbar';
// import { CalendarDays, Building2, Clock, BadgeIndianRupee, Edit, Download, UserCheck, ListChecks, FileText, LucideLink, FileArchive, Globe, Bookmark, Gift } from 'lucide-react';
// import { useEffect, useState, use } from 'react';
// import { get, postApi, remove } from '@/lib/api';
// import { Job, ApiResponse } from '@/lib/types/jobs';
// import { useAuth } from '@/context/AuthContext'; // Assuming you have a useAuth hook to get the current user
// import BookmarkButton from '../components/BookmarkButton'; // New component
// import { formatDate as formatDateHelper } from '@/lib/helpers/DateHelper'; // Assuming you have a date helper

// const JobDetailsPage = ({ params }: { params: { id: string } }) => {
//   const [job, setJob] = useState<Job | null>(null);
//   const { user } = useAuth(); // Assuming you have a useAuth hook to get the current user
//   const [isLoading, setIsLoading] = useState(true);
//   const [isBookmarking, setIsBookmarking] = useState(false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
  
//   // In a real app, you'd get the userId from an auth context
//   const userId = user?.id;

//   const resolvedParams = use(params);

//   console.log("Resolved Params:", resolvedParams);

//   useEffect(() => {
//     const jobId = resolvedParams.id;
//     if (!jobId) return;

//     const fetchJobDetails = async () => {
//       setIsLoading(true);
//       try {
//         // Fetch main job details
//         const jobResponse = await get<ApiResponse<Job>>(`/Jobs/${jobId}`);
//         // if (jobResponse.success) {
//           setJob(jobResponse);
//         // } else {
//         //   throw new Error(jobResponse.message || 'Job not found');
//         // }

//         // Fetch user's bookmarks to see if this job is saved
//         const bookmarksResponse = await get<ApiResponse<{ jobId: string }[]>>(`/jobs/${userId}/bookmarks`);
//         if (bookmarksResponse.some(b => b.jobId === jobId)) {
//           setIsBookmarked(true);
//         }


//       } catch (error) {
//         console.error("Failed to fetch job details:", error);
//         setJob(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchJobDetails();
//   }, [resolvedParams.id, userId]);

//   const handleToggleBookmark = async () => {
//       setIsBookmarking(true);
//       const originalState = isBookmarked;
//       // Optimistic UI update
//       setIsBookmarked(!originalState); 
  
//       try {
//         if (originalState) {
//           // Un-bookmark the job
//           await remove(`/jobs/${userId}/bookmarks/${job?.id}`);
//         } else {
//           // Bookmark the job
//           await postApi(`/jobs/${userId}/bookmarks`, { jobId: job?.id });
//         }
//       } catch (error) {
//         console.error("Failed to update bookmark:", error);
//         // Revert on error
//         setIsBookmarked(originalState);
//       } finally {
//         setIsBookmarking(false);
//       }
//     };

//   if (isLoading) {
//     return <div className="flex justify-center items-center h-screen">Loading job details...</div>;
//   }

//   if (isBookmarking) {
//     return <div className="flex justify-center items-center h-screen">{!isBookmarked ? "Removing Bookmark" : "Adding Bookmark"}...</div>;
//   }

//   if (!job) {
//     return <div className="flex justify-center items-center h-screen">Job not found.</div>;
//   }

//   return (
//     <div className="min-h-screen bg-[#EEF0F4] font-sans text-gray-800 mb-12">
//       <Navbar />
//       <TopBar />
//       <div className="flex flex-col mt-8">
//         <div className="min-h-[calc(100vh-72px)] bg-[#EEF0F4] py-8">
//           <div className="max-w-7xl mx-auto px-6 lg:px-8">
//             <div className="flex flex-col lg:flex-row gap-8">
//               {/* Left Column - Dynamic Overview */}
//               <div className="lg:w-1/3">
//                 <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
//                   <div className="flex flex-col">
//                     <div className="w-full flex justify-center mb-6">
//                       <img
//                         src="https://readdy.ai/api/search-image?query=official%20government%20logo%20of%20Union%20Public%20Service%20Commission%20of%20India%20with%20emblem%20and%20blue%20and%20gold%20colors%20professional%20clean%20design%20on%20white%20background&width=120&height=120&seq=201&orientation=squarish"
//                         alt="UPSC Logo"
//                         className="h-24 w-24 object-contain"
//                       />
                      
//                     </div>
//                     <div className="w-full mb-4">
//                       <h1 className="text-2xl font-bold text-gray-900 text-center">{job.jobTitle}</h1>
//                       <p className="text-gray-600 mt-2 text-center">{job.organizationName}</p>
//                     </div>
                    
//                     <div className="w-full mb-6">
//                       <div className="space-y-4">
//                         <div className="flex items-start">
//                           <div className="w-8 text-gray-400 flex items-center justify-center"><CalendarDays size={20} /></div>
//                           <div className="flex-1">
//                             <p className="text-sm font-medium text-gray-700">Post Date</p>
//                             <p className="text-sm text-gray-600">{formatDateHelper(job.dateOfIssue)}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           <div className="w-8 text-gray-400 flex items-center justify-center"><Building2 size={20} /></div>
//                           <div className="flex-1">
//                             <p className="text-sm font-medium text-gray-700">Conducted By</p>
//                             <p className="text-sm text-gray-600">{job.companyName}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           <div className="w-8 text-gray-400 flex items-center justify-center"><Clock size={20} /></div>
//                           <div className="flex-1">
//                             <p className="text-sm font-medium text-gray-700">Important Dates</p>
//                             <p className="text-sm text-gray-600">Last date to apply: {formatDateHelper(job.lastDateToApply)}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           <div className="w-8 text-gray-400 flex items-center justify-center"><BadgeIndianRupee size={20} /></div>
//                           <div className="flex-1">
//                             <p className="text-sm font-medium text-gray-700">Compensation</p>
//                             <p className="text-sm text-gray-600">{job.compensation}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex w-full flex-col space-y-3">
//                       <a href="#" onClick={handleToggleBookmark} rel="noopener noreferrer" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
//                         <Bookmark size={18} className={`transition-all ${isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-gray-500 hover:text-gray-800'}` }/> {isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
//                       </a>                      
//                       {/* Share button can be added here */}
//                       <a href={job.applyLink?.link} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2">
//                         <Edit size={18} /> Apply Now
//                       </a>
//                       <a href={job.applyLink?.fileName} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
//                         <Download size={18} /> Download Notification
//                       </a>
//                       {user?.isAdmin && 
//                       <a href={`edit/${job.id}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
//                         <Download size={18} /> Edit Job
//                       </a>}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column - Detailed Information Cards */}
//               <div className="lg:w-[60%] mt-6 lg:mt-[24px]">
//                 <div className="mb-8">
//                   <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
//                   <p className="text-gray-600 mt-1">Reference Number: {job.referenceNumber}</p>
//                 </div>
//                 <div className="grid grid-cols-1 gap-8">
//                   {/* Job Description Card */}
//                   <div className="bg-white rounded-xl shadow-sm p-6">
//                     <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4"><FileText size={20} className="text-blue-600 mr-2" /> Job Description</h3>
//                     <p className="text-gray-700 whitespace-pre-line">{job.jobDescription}</p>
//                     <div className="space-y-4 mt-4">                      
//                       <div className="bg-gray-50 rounded-lg p-2 pl-0">
//                         <p className="text-sm text-gray-500">Department : {job.sector}</p>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-2 pl-0">
//                         <p className="text-sm text-gray-500">Employment Type : {job.employmentType}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Benefits Card */}
//                   <div className="bg-white rounded-xl shadow-sm p-6">
//                     <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><Gift size={20} className="text-blue-600 mr-2" />Benefits</h3>
//                     <div className="space-y-4">                      
//                       <div className="bg-gray-50 rounded-lg p-4">
//                         <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
//                           {job.benefits.map((benefit, index) => <li key={index} className="pl-1">{benefit}</li>)}
//                         </ul>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Eligibility Criteria Card */}
//                   <div className="bg-white rounded-xl shadow-sm p-6">
//                     <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><UserCheck size={20} className="text-blue-600 mr-2" /> Eligibility & Qualifications</h3>
//                     <div className="space-y-4">
//                       <div className="bg-gray-50 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Qualifications</p>
//                         <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
//                           {job.qualifications.map((q, index) => <li key={index} className="pl-1">{q}</li>)}
//                         </ul>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Eligibility Notes</p>
//                         <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 marker:text-gray-400">
//                           {job.eligibilityNotes.map((note, index) => <li key={index} className="pl-1">{note}</li>)}
//                         </ul>
//                       </div>
//                     </div>
//                   </div>

//                   {/* How to Apply Card */}
//                   <div className="bg-white rounded-xl shadow-sm p-6">
//                     <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><FileText size={20} className="text-blue-600 mr-2" /> How to Apply</h3>
//                     <div className="space-y-4">
//                       <div className="bg-gray-50 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Application Process</p>
//                         <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-2 mt-2">
//                            {job.applicationProcess.map((step, index) => <li key={index}>{step}</li>)}
//                         </ol>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-4">
//                         <p className="text-sm text-gray-500 mb-1">Contact Information</p>
//                         <p className="text-sm text-gray-700">{job.contactInformation}</p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* NOTE: The "Important Links" card below is static. */}
//                   {/* You would need to add a field like `importantLinks: [{title: string, url: string}]` */}
//                   {/* to your backend Job model to make this dynamic. */}
//                   <div className="bg-white rounded-xl shadow-sm p-6">
//                     <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-5"><LucideLink size={20} className="text-blue-600 mr-2" />Important Links</h3>
//                     <div className="space-y-3">                                      
//                       <a href={job.applyLink?.fileName} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
//                         <div className="flex items-center"><FileArchive size={18} className="text-red-500 mr-3" /><span className="text-gray-800">Official Notification PDF</span></div>
//                         <LucideLink size={16} className="text-gray-400" />
//                       </a>
//                       <a href={`https://${job.applyLink?.link.split('/')[0]}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
//                         <div className="flex items-center"><Globe size={18} className="text-blue-500 mr-3" /><span className="text-gray-800">Official Website</span></div>
//                         <LucideLink size={16} className="text-gray-400" />
//                       </a>
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

// };

// export default JobDetailsPage;