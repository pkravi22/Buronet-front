// app/layout.tsx
// NO 'use client' directive here! This file should be a Server Component.

import './globals.css';
import type { Metadata } from 'next';
import Providers from '../components/providers';

export const metadata: Metadata = {
  title: 'Buronet - Professional Social Network',
  description: 'Connect with professionals, share knowledge, and grow your network',
  verification: {
    google: 'KoIFwBX7mVjsy-lSxDQjWHs78a78mvWSDjzV9ElfaWQ',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}