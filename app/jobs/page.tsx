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
  const handleResize = () => {
    // Only restrict background scroll if screen is Desktop (e.g., > 1024px)
    if (window.innerWidth >= 1024) {
      document.documentElement.classList.add('restrict-scroll');
      document.body.classList.add('restrict-scroll');
    } else {
      document.documentElement.classList.remove('restrict-scroll');
      document.body.classList.remove('restrict-scroll');
    }
  };

  handleResize(); // Run on mount
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
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
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem="Jobs" />

        {/* 1. On Mobile: This container is part of the normal page scroll.
            2. On Desktop (lg): This container becomes a fixed-height scrollable area.
        */}
        <main 
          ref={mainRef} 
          className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] lg:h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-hide"
        >
          <MainContent />
          
          {/* This is the ONLY Sidebar call. 
              - On Mobile: It appears here, at the bottom of MainContent.
              - On Desktop: The lg:hidden class hides it here...
          */}
          <div className="lg:hidden mt-6">
            <RightSidebar scrollSourceRef={mainRef} />
          </div>

          <div className="lg:hidden h-20" />
        </main>

        {/* - On Desktop: This shows the sidebar to the right of the main content.
            - On Mobile: hidden ensures it doesn't double up.
        */}
        <div className="hidden lg:block">
          <RightSidebar scrollSourceRef={mainRef} />
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
