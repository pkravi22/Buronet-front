// app/layout.tsx
// NO 'use client' directive here! This file should be a Server Component.

import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext'; // Our custom AuthProvider (which IS a Client Component)
import type { Metadata } from 'next'; // Import Metadata type for better type-checking
import Navbar from './Navbar';
import TopBar from './TopBar';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

// metadata export is allowed only in Server Components
export const metadata: Metadata = {
  title: 'Buronet - Professional Social Network', // Changed title from generic
  description: 'Connect with professionals, share knowledge, and grow your network', // Changed description from generic
};

// RootLayout is a Server Component by default
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <AuthProvider>
      <div className="flex bg-gray-100"> {/* Set background here */}

        {/* 1. Sidebar */}
        {/* <Navbar
        isNavOpen={isNavOpen} 
        closeNav={() => setIsNavOpen(false)} 
        />
        <div className="hidden lg:block w-[260px] shrink-0" /> */}

        {/* 2. Main Content Area (Header + Scrollable Page) */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* TopBar - Fixed at the top of the content area */}
          <TopBar
          // onMenuClick={() => setIsNavOpen(true)} 
          />

          {/* Scrollable container for the page content */}
          <main className="flex-1 overflow-y-auto lg:px-16 lg:mt-16 md:px-8 sm:px-0"> {/* Set padding here */}
            {children}
          </main>

        </div>
      </div>
    </AuthProvider>
  );
}