// app/layout.tsx
// NO 'use client' directive here! This file should be a Server Component.

import './globals.css';
import type { Metadata } from 'next';
import Providers from '../components/providers';

export const metadata: Metadata = {
  title: 'Buronet - Professional Social Network',
  description: 'Connect with professionals, share knowledge, and grow your network',
  keywords: [
    'Buronet',
    'professional network',
    'jobs in India',
    'government exams',
    'sarkari result',
    'current affairs',
    'exam updates',
    'study circles',
    'networking',
    'career growth',
  ],
  verification: {
    google: 'KoIFwBX7mVjsy-lSxDQjWHs78a78mvWSDjzV9ElfaWQ',
  },
  openGraph: {
    title: 'Buronet - Professional Social Network',
    description: 'Connect with professionals, share knowledge, and grow your network',
    url: 'https://buronet.co.in',
    siteName: 'Buronet',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buronet - Professional Social Network',
    description: 'Connect with professionals, share knowledge, and grow your network',
  },
  other: {
    'geo.region': 'IN',
    'geo.placename': 'India',
    'geo.position': '20.593684;78.96288',
    'ICBM': '20.593684, 78.96288',
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