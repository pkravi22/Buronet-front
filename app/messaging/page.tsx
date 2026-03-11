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
    <div className="h-screen ultra:h-[75vh] xl-ultra:h-[55vh] bg-[#EEF0F4]">
          <MessagingIconNavbar />
          <MainContent />
          <div className="block laptop:hidden">
            <Navbar activeItem="Messaging" />
          </div>
    </div>
  );
};

export default MessagingPage; 