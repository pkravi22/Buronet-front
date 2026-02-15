'use client';
import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';
import RightBar from './components/RightBar';
import { useEffect, useRef } from "react";
import '../restrictScroll.css'

export default function CirclePage() {
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
      {/* FIX: Set to flex-col on mobile, switch to flex-row on large screens (lg) */}
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px] bg-[#EEF0F4]">
        {/* Placeholder: Keep hidden on mobile, only appears when Navbar is fixed on desktop */}
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        
        <Navbar activeItem="My Circle" />
        
        {/* FIX: Remove width constraints for mobile flow, let it be full width */}
        <main ref={mainRef} className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide">
          <MainContent />
          <div className="lg:hidden h-20" />
        </main>
        
         <div className="fixed h-[21px] lg:hidden"></div> {/* Hide fixed height div on desktop */}
        
        {/* RightBar is rendered last in the JSX, so in flex-col mode, it flows naturally below MainContent. */}
        <RightBar scrollSourceRef={mainRef}/>
      </div>
    </div>
  );
}