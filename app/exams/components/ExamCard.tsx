import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react'; // Import useState
import { Exam } from '@/lib/types/exams/';
import { formatDate as formatDateHelper } from '@/lib/helpers/DateHelper';
import { useAuth } from '@/context/AuthContext';
import { postApi, remove } from '@/lib/api';
import { useRouter } from 'next/navigation';

// The component's props are updated to accept the initial bookmark status
interface ExamCardProps {
  exam: Exam;
  isInitiallyBookmarked: boolean;
}

const ExamCard = ({ exam, isInitiallyBookmarked }: ExamCardProps) => {
  // Internal state to manage the bookmark status for immediate UI feedback
  const [isBookmarked, setIsBookmarked] = useState(isInitiallyBookmarked);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get the current user
  const router = useRouter();

  console.log("ExamCard - isInitiallyBookmarked:", exam, isInitiallyBookmarked);

  useEffect(() => {
     setIsBookmarked(isInitiallyBookmarked);
  }, []);

  const logoSrc = 'https://readdy.ai/api/search-image?query=official%20government%20logo%20of%20Union%20Public%20Service%20Commission%20of%20India%20with%20emblem%20and%20blue%20and%20gold%20colors%20professional%20clean%20design%20on%20white%20background&width=120&height=120&seq=201&orientation=squarish';

  const handleBookmarkClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Optimistic UI update: toggle the state immediately
    const newState = !isBookmarked;    
    setIsBookmarked(newState);

    try {
      if (newState) {
        // Your API call to ADD a bookmark would go here
        console.log(`Bookmarking exam ${exam.id}`);
        await postApi(`/bookmarks/${user.id}/exam`, { Id: exam.id });
      } else {
        // Your API call to REMOVE a bookmark would go here
        console.log(`Removing bookmark for exam ${exam.id}`);
        await remove(`/bookmarks/${user.id}/exam/${exam.id}`);
      }
    } catch (error) {
      console.error("Failed to update bookmark status:", error);
      // If the API call fails, revert the state to what it was before the click
      setIsBookmarked(!newState);
    }
  };

  return (
    <Link href={`/exams/${exam.id}`} className="block group">
      <div className="bg-white rounded-xl shadow border border-[#E5E7EB] p-6 flex flex-col min-h-[270px] relative cursor-pointer group-hover:shadow-md transition-shadow" style={{boxShadow:'0 1px 2px 0 rgba(0,0,0,0.05)'}}>
        
        <button 
          onClick={handleBookmarkClick}
          className="absolute top-5 right-5 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark exam"}
        >
          {/* The SVG's class now changes based on the isBookmarked state */}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            className={`transition-all ${isBookmarked ? 'text-blue-600 fill-current' : 'text-gray-500 fill-none'}`}
          >
            <path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex flex-col mb-4">
          <div className="flex items-start">
            <img src={logoSrc} alt={`${exam.companyName} logo`} className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] bg-white" />
            <div className="flex flex-col ml-3">
              <h3 className="text-[#1F2937] text-xl font-bold leading-tight">{exam.examTitle}</h3>
              <p className="text-[#4B5563] text-base font-medium mt-1">{exam.companyName || exam.organizationName}</p>
              <span className="flex items-center gap-1 text-sm text-[#6B7280] mt-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="#6B7280" strokeWidth="1.5"/><circle cx="12" cy="11" r="2.5" stroke="#6B7280" strokeWidth="1.5"/></svg>
                {exam.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 4h9M6 8h9M9 4v12a4 4 0 0 0 4 4h2M6 12h7" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {exam.compensation || 'Not disclosed'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#EF4444] text-sm mt-auto mb-4">
          <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="2"/><path d="M9 5v4l2.5 2.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="font-medium">Deadline: {formatDateHelper(exam.lastDateToApply)}</span>
        </div>
        
      </div>
    </Link>
  );
};

export default ExamCard;

