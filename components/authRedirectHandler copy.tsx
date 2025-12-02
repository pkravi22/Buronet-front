// components/AuthRedirectHandler.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import {withAuthRequired, useAuth } from '../context/AuthContext'; // Adjust path as needed
import LoadingSpinner from './UI/LoadingSpinner'; // Assuming you have a LoadingSpinner component
import { authExclusions } from './authExclusions'; // Import the authExclusions array
import { useUserProfile } from '../hooks/useUserProfile';

export const AuthRedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and isLoading from useAuth
  const { userProfile, isLoading: isProfileLoading, isProfileSetup } = useUserProfile();

  const isLoading = isAuthLoading || (user && isProfileLoading);

  useEffect(() => {
    // Define routes that are publicly accessible without authentication
    const publicRoutes = ['/login', '/register', '/complete-profile', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // --- IMPORTANT: Only make redirection decisions AFTER isLoading is false ---
    if (isLoading) {
      // console.log('AuthRedirectHandler: Still loading auth status. Skipping redirect logic.');
      return; // Do nothing while loading, let the loading spinner handle display
    }

    // --- Redirect if NOT authenticated AND trying to access a protected route ---
    if (!user && !isPublicRoute) {
      console.log(`AuthRedirectHandler: Not authenticated. Redirecting from ${pathname} to /login.`);
    //   router.push(`/login?returnTo=${encodeURIComponent(pathname + window.location.search)}`);
        const token = localStorage.getItem('token');
        if (!authExclusions.includes(pathname) && !token) {
        console.log('fetchCurrentUser: No token found in localStorage. User is not authenticated.');
        router.push(`/login`); // Redirect to login with returnTo query param
        }
        
      return; // Stop further execution
    }

    // --- Redirect if IS authenticated AND trying to access a login/register page ---
    // if (user && isPublicRoute && (pathname === '/login')) {
    //   // console.log(`AuthRedirectHandler: Authenticated. Redirecting from ${pathname} to /profile.`);
    //   // router.push('/profile'); // Or dashboard
    //   return; // Stop further execution
    // }

    // if (user && isPublicRoute && (pathname === '/register')) {
    //   // console.log(`AuthRedirectHandler: Authenticated. Redirecting from ${pathname} to /profile.`);
    //   router.push('/complete-profile'); // Or dashboard
    //   return; // Stop further execution
    // }

    if (user && isPublicRoute && (pathname === '/login' || pathname === '/register')) {
        
        if (!userProfile) {
            // Should not happen if SWR is configured correctly, but good for safety
            console.log('AuthRedirectHandler: User authenticated but profile object is missing. Redirecting to /complete-profile.');
            router.replace('/complete-profile');
            return;
        }

        // Check the profile completeness flag we defined
        if (isProfileSetup) {
            console.log(`AuthRedirectHandler: Authenticated & Profile Complete. Redirecting from ${pathname} to /profile.`);
            router.replace('/profile'); // Use replace to prevent back button issues
        } else {
            console.log(`AuthRedirectHandler: Authenticated but Profile Incomplete. Redirecting from ${pathname} to /complete-profile.`);
            router.replace('/complete-profile'); // Use replace
        }
        return; 
    }

    // console.log('AuthRedirectHandler: No redirect needed. Rendering children.');

  }, [user, isLoading, pathname, router]); // Dependencies for useEffect

  // --- Conditional Rendering based on isLoading ---
  // Render a loading spinner or null while authentication status is being determined.
  // This prevents protected content from briefly showing or redirect loops from starting prematurely.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Checking authentication...</span>
      </div>
    );
  }

  // If not loading and no redirect occurred, render the children (the actual page content)
  return <>{children}</>;
};

export default AuthRedirectHandler;