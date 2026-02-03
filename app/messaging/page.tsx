"use client";

import { useEffect } from 'react';

import Navbar from '../../components/Navbar';
import MainContent from './components/MainContent';
import MessagingIconNavbar from './components/MessagingIconNavbar';
import '../restrictScroll.css'

const MessagingPage = () => {
  useEffect(() => {
    document.documentElement.classList.add('restrict-scroll');
    document.body.classList.add('restrict-scroll');
    return () => {
      document.documentElement.classList.remove('restrict-scroll');
      document.body.classList.remove('restrict-scroll');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#EEF0F4]">
          <MessagingIconNavbar />
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