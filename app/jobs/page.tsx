// "use client";

// import Navbar from '../../components/Navbar';
// import TopBar from '../../components/TopBar';
// import MainContent from './components/MainContent';
// import RightSidebar from './components/RightSidebar';

// const JobsPage = () => {
//   return (
//     <div className="min-h-screen flex flex-col bg-[#EEF0F4] mb-6">
//       <TopBar />
//       <div className="flex flex-1 pt-[61px]">
//         <div className="w-[239px]" /> {/* Placeholder for fixed navbar */}
//         <Navbar activeItem="Jobs" />
//         <main className="flex-1 px-6 ml-6">
//           <MainContent />
//         </main>
//         <RightSidebar />
//       </div>
//     </div>
//   );
// };

// export default JobsPage; 

"use client";

import { useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import TopBar from '../../components/TopBar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import '../restrictScroll.css'

const JobsPage = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('restrict-scroll');
    document.body.classList.add('restrict-scroll');
    return () => {
      document.documentElement.classList.remove('restrict-scroll');
      document.body.classList.remove('restrict-scroll');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] pb-6 mb-12 sm:mb-0">
      <TopBar />
      {/*         CRITICAL FIX: Use responsive padding/margin instead of fixed placeholder + fixed ml-6.
        Use a grid/flex layout that handles the sidebar's presence correctly.
        The content needs to shift left on mobile where the Navbar is hidden/collapsed.
      */}
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px]">
        {/* Placeholder correctly collapses on smaller screens */}
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        {/* Navbar: Fixed width on large screens, hidden on small screens (e.g., up to md) */}
        <Navbar activeItem="Jobs" /> {/* Navbar should handle its own responsive hiding/showing */}

        {/* Main Content Area */}
        {/*           NEW: Use a responsive margin *only* on large screens (lg:ml-[239px]) 
          to account for the fixed-position Navbar. 
          On small screens, MainContent will take up the full width. 
        */}
        <main ref={mainRef} className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <MainContent />
        </main>

        {/* RightSidebar: Fixed width, but hide on smaller screens if necessary */}
        <div className="hidden fixed h-[21px] lg:hidden"></div>
        <RightSidebar scrollSourceRef={mainRef} />
      </div>
    </div>
  );
};

export default JobsPage;
