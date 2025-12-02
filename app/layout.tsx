// app/layout.tsx
// NO 'use client' directive here! This file should be a Server Component.

import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Providers from '../components/providers'; // Import the Providers component
import { useUserProfile } from '@/hooks/useUserProfile';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Buronet - Professional Social Network',
  description: 'Connect with professionals, share knowledge, and grow your network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}