"use client";

import { useRef } from 'react';
import Navbar from '../../components/Navbar';
import TopBar from '../../components/TopBar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import '../restrictScroll.css'

const JobsPage = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px]">
         {/* Placeholder correctly collapses on smaller screens */}
         <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem="Exams" />
        {/* FIX: Remove width constraints for mobile flow, let it be full width */}
        <main ref={mainRef} className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <MainContent />
        </main>
        
        <div className="fixed h-[21px] lg:hidden"></div> {/* Hide fixed height div on desktop */}
        
        {/* RightBar is rendered last in the JSX, so in flex-col mode, it flows naturally below MainContent. */}
        <RightSidebar scrollSourceRef={mainRef} />
      </div>
    </div>
  );
};

export default JobsPage; 

// return (
//     <div className="min-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
//       <TopBar />
//       {/*         CRITICAL FIX: Use responsive padding/margin instead of fixed placeholder + fixed ml-6.
//         Use a grid/flex layout that handles the sidebar's presence correctly.
//         The content needs to shift left on mobile where the Navbar is hidden/collapsed.
//       */}
//       <div className="flex flex-1 pt-[61px]">
//         {/* Placeholder correctly collapses on smaller screens */}
//         <div className="hidden lg:block xl:w-[270px] laptop:w-[245px] left-6 shrink-0" />
//         {/* Navbar: Fixed width on large screens, hidden on small screens (e.g., up to md) */}
//         <Navbar activeItem="Jobs" /> {/* Navbar should handle its own responsive hiding/showing */}

//         {/* Main Content Area */}
//         {/*           NEW: Use a responsive margin *only* on large screens (lg:ml-[239px]) 
//           to account for the fixed-position Navbar. 
//           On small screens, MainContent will take up the full width. 
//         */}
//         <main className="w-[100%] flex-1 px-4 sm:px-6 xl:w-full laptop:w-[50%] laptop:ml-3">
//           <MainContent />
//         </main>

//         {/* RightSidebar: Fixed width, but hide on smaller screens if necessary */}
//         <div className="hidden fixed h-[21px]"></div>
//         <RightSidebar />
//       </div>
//     </div>
//   );