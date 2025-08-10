// app/layout.tsx
// NO 'use client' directive here! This file should be a Server Component.

import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext'; // Our custom AuthProvider (which IS a Client Component)
import type { Metadata } from 'next'; // Import Metadata type for better type-checking
import Navbar from './Navbar';
import TopBar from './TopBar';

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
  return (
        <AuthProvider>
          <TopBar />
          <main className="flex-grow pt-8"> {/* <--- Add padding-top equal to TopBar's height */}
        {children}
      </main>
        </AuthProvider>
  );
}