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
      <div className="flex flex-col lg:flex-row flex-1 pt-[80px]">
        <div className="hidden lg:block w-[20%] ml-6 xl:w-[270px] desktop:w-[260px] left-6 shrink-0" />
        <Navbar activeItem="My Circle" />

        <main 
          ref={mainRef} 
          className="w-full flex-1 px-4 sm:px-6 lg:w-[50%] lg:h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-hide"
        >
          <MainContent />
          
          <div className="lg:hidden mt-6">
            <RightBar scrollSourceRef={mainRef} />
          </div>

          <div className="lg:hidden h-20" />
        </main>

        <div className="hidden lg:block max-w-[640px] mx-auto px-4 md:px-0 laptop:w-[20%] laptop:max-w-none laptop:px-0 laptop:ml-0 laptop:mr-6 xl:w-[260px] shrink-0">
          <RightBar scrollSourceRef={mainRef} />
        </div>
      </div>
    </div>
  );
}