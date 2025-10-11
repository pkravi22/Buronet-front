"use client";

import Navbar from '../../components/Navbar';
import TopBar from '../../components/TopBar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';

const JobsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] mb-6">
      <TopBar />
      <div className="flex flex-1 pt-[61px]">
        <div className="w-[239px]" /> {/* Placeholder for fixed navbar */}
        <Navbar activeItem="Jobs" />
        <main className="flex-1 px-6 ml-6">
          <MainContent />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default JobsPage; 