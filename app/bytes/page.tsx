"use client";

import Navbar from '../../components/Navbar';
import TopBar from '../../components/TopBar';
import MainContent from './components/MainContent';

const BytesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4]">
      <TopBar />
      <div className="flex flex-1 pt-[61px]">
        <div className="w-[239px]" /> {/* Placeholder for fixed navbar */}
        <Navbar activeItem="Bytes" />
        <main className="flex-1 px-6 ml-6">
          <MainContent />
        </main>
      </div>
    </div>
  );
};

export default BytesPage; 