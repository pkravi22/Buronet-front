// components/SiteLayout.tsx
"use client";

import { useState } from 'react';
import TopBar from '@/components/TopBar';    // Adjust path based on your project structure
import Navbar from '@/components/Navbar';    // Adjust path based on your project structure

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // State for the navbar now lives in this central client component
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1">
      {/* The toggle function is passed to the TopBar */}
      <TopBar onMenuClick={() => setIsNavOpen(!isNavOpen)} />

      {/* <div className="flex flex-1 pt-[61px]"> */}
        {/* Placeholder for the left navbar */}
        {/* <div className="hidden lg:block lg:w-[260px] shrink-0" /> */}

        {/* The state and close function are passed to the Navbar */}
        <Navbar isNavOpen={isNavOpen} closeNav={() => setIsNavOpen(false)} />

        {/* The rest of the page (including the page-specific RightBar) will be rendered here */}
        <main className="h-full lg:pl-[284px] overflow-y-scroll">
        {/* The actual page content {children} is rendered inside this scrollable container. */}
        {children}
      </main>
      {/* </div> */}
    </div>
  );
}