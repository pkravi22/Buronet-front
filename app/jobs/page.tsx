"use client";

import { useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import TopBar from '../../components/TopBar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import '../restrictScroll.css';

const JobsPage = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        document.documentElement.classList.add('restrict-scroll');
        document.body.classList.add('restrict-scroll');
      } else {
        document.documentElement.classList.remove('restrict-scroll');
        document.body.classList.remove('restrict-scroll');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.classList.remove('restrict-scroll');
      document.body.classList.remove('restrict-scroll');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] mb-12 sm:mb-0">
      <TopBar />

      <div className="flex flex-1 pt-[80px]">
        {/* Left navbar spacer */}
        <div className="hidden lg:block w-[20%] xl:w-[270px] shrink-0" />
        <Navbar activeItem="Jobs" />

        {/* Main scrollable area */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8
                     lg:h-[calc(100vh-80px)] lg:overflow-y-auto scrollbar-hide"
        >
          <MainContent />

          {/* Mobile sidebar */}
          <div className="lg:hidden mt-6">
            <RightSidebar scrollSourceRef={mainRef} />
          </div>
          <div className="lg:hidden h-20" />
        </main>

        {/* Desktop right sidebar */}
        <aside className="hidden lg:block w-[260px] xl:w-[280px] shrink-0 mr-4 xl:mr-6">
          <RightSidebar scrollSourceRef={mainRef} />
        </aside>
      </div>
    </div>
  );
};

export default JobsPage;
