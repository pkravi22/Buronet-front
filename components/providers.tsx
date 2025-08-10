// app/providers.tsx
'use client'; // This file is explicitly a Client Component

import { AuthProvider } from '../context/AuthContext'; // AuthProvider is already a Client Component
import React from 'react'; // Import React for JSX
import { AuthRedirectHandler } from './authRedirectHandler'; // Import the AuthRedirectHandler component

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // You can nest other client-side providers here if you add them later (e.g., ThemeProvider, ReduxProvider)
    <AuthProvider>
      <AuthRedirectHandler>
      {children}
      </AuthRedirectHandler>
     </AuthProvider>
  );
}