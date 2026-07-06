// import Link from 'next/link';
// import { MouseEvent } from 'react';
// import { Job } from '@/lib/types/jobs/';
// import { formatDate as formatDateHelper } from '@/lib/helpers/DateHelper';

// const JobCardOld = ({ job }: { job: Job }) => {
//   const logoSrc = job.logoUrl || 'https://readdy.ai/api/search-image?query=official%20government%20logo%20of%20Union%20Public%20Service%20Commission%20of%20India%20with%20emblem%20and%20blue%20and%20gold%20colors%20professional%20clean%20design%20on%20white%20background&width=120&height=120&seq=201&orientation=squarish';

//   // Handler for the bookmark button
//   const handleBookmarkClick = (e: MouseEvent<HTMLButtonElement>) => {
//     // This is the key change: it stops the click from triggering the parent Link
//     e.stopPropagation();
//     e.preventDefault(); // Also prevent the default link behavior
    
//     // Add your bookmarking logic here
//     console.log(`Bookmarking job ${job.id}`);
//     // Example: await toggleBookmark(job.id);
//   };

//   return (
//     <Link href={`/jobs/${job.id}`} className="block group">
//       <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
        
//         {/* Bookmark button now has an onClick handler */}
//         <button 
//           onClick={handleBookmarkClick}
//           className="absolute top-5 right-5 text-[#6B7280] hover:text-[#06b6d4] z-10 p-1"
//           aria-label="Bookmark job"
//         >
//           <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
//         </button>

//         <div className="flex flex-col mb-4">
//           <div className="flex items-start">
//             <img src={logoSrc} alt={`${job.companyName} logo`} className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
//             <div className="flex flex-col ml-3">
//               <h3 className="text-[#1F2937] text-xl font-bold leading-tight">{job.jobTitle}</h3>
//               <p className="text-[#4B5563] text-base font-medium mt-1">{job.companyName || job.organizationName}</p>
//               <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
//                 <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
//                 {job.location}
//               </span>
//               <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
//                 <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 {job.compensation || 'Not disclosed'}
//               </span>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 text-[#EF4444] text-sm mt-auto mb-4">
//           <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
//           <span className="font-medium">Deadline: {formatDateHelper(job.lastDateToApply)}</span>
//         </div>
        
//         {/* The redundant "View Details" button has been removed. */}
//         {/* The card itself is the call to action. */}

//       </div>
//     </Link>
//   );
// };

// export default JobCardOld;
