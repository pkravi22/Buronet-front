"use client";

import TopBar from '../../components/TopBar';
import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';
import '../restrictScroll.css'

const MessagingPage = () => {
  return (
    <div>
          <div className="pt-[1.5rem] mb-[4.5rem] laptop:mb-0 laptop:pt-0">
            <MainContent />
          </div>
          <div className="block laptop:hidden">
            <Navbar />
          </div>
    </div>
  );
};

export default MessagingPage; 