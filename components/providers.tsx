// app/providers.tsx
'use client'; // This file is explicitly a Client Component

import { AuthProvider } from '../context/AuthContext'; // AuthProvider is already a Client Component
import { UnreadMessagesProvider } from '../context/UnreadMessagesContext';
import React from 'react'; // Import React for JSX
import { AuthRedirectHandler } from './authRedirectHandler'; // Import the AuthRedirectHandler component
import { Toaster } from 'react-hot-toast';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // You can nest other client-side providers here if you add them later (e.g., ThemeProvider, ReduxProvider)
    <div className="h-full flex flex-col">
      <Toaster position="top-right" />
      <AuthProvider>
      <UnreadMessagesProvider>
      <AuthRedirectHandler>
      {children}
      </AuthRedirectHandler>
      </UnreadMessagesProvider>
     </AuthProvider>
    </div>
  );
}