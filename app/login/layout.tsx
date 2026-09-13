import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Login | Buronet',
  description: 'Log in to your Buronet account.',
  alternates: {
    // This canonical URL explicitly tells Google to ignore any query parameters (like ?returnTo=...)
    // and treat all login URLs as just 'https://buronet.co.in/login'
    canonical: 'https://buronet.co.in/login',
  },
  robots: {
    // We also tell Googlebot not to index the login page, which is a standard SEO best practice
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
