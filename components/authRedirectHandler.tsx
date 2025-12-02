'use client';

import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { withAuthRequired, useAuth } from '../context/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';
import { authExclusions } from './authExclusions';

export const AuthRedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, 
    isLoading: isAuthLoading, // Renamed to keep separate if needed, but let's use the single combined state below
    userProfile, 
    isProfileSetup, 
    isProfileError,
    isProfileLoading // Use this new state
  } = useAuth();
  // Ensure useUserProfile is returning isProfileSetup

  // Combined loading state: Wait for Auth check, AND if authenticated, wait for Profile check
  const isLoading = isAuthLoading || (user && isProfileLoading);

  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/complete-profile', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // 1. Wait for stability (Auth and Profile data must be loaded)
    if (isLoading) {
      return;
    }

    // 2. Security Check: Unauthenticated access to protected routes
    if (!user && !isPublicRoute) {
      const token = localStorage.getItem('token');
      if (!authExclusions.includes(pathname) && !token) {
        console.log(`AuthRedirectHandler: Not authenticated. Redirecting from ${pathname} to /login.`);
        // Note: Best practice is to include returnTo query here.
        router.push(`/login`); 
      }
      return;
    }

    // 3. Profile Enforcement (for authenticated users)
    if (user && userProfile) {

      // A. Profile Incomplete: Force redirect to /complete-profile from ANY other page
      if (!isProfileSetup && pathname !== '/complete-profile') {
        console.log('AuthRedirectHandler: Profile incomplete. Forcing redirect to /complete-profile.');
        router.replace('/complete-profile');
        return;
      }

      // B. Profile Complete: Redirect away from public/setup pages
      if (isProfileSetup && publicRoutes.includes(pathname)) {
        const finalDestination = '/home';
        console.log(`AuthRedirectHandler: Profile complete. Redirecting from public page (${pathname}) to ${finalDestination}.`);
        router.replace(finalDestination);
        return;
      }
    }

    // if (user) { 
    //     // CRITICAL FIX: The check should use the combined state (Error OR Incomplete Setup)
    //     const profileNeedsAttention = isProfileError || !isProfileSetup; 

    //     // A. Profile Error/Incomplete: Force redirect to /complete-profile from ANY other page
    //     if (profileNeedsAttention && pathname !== '/complete-profile') {
    //         console.log(`AuthRedirectHandler: Profile needs attention (${isProfileError ? 'API Error' : 'Incomplete'}). Forcing redirect to /complete-profile.`);
    //         router.replace('/complete-profile');
    //         return;
    //     }

    //     // B. Profile Complete: Redirect away from public/setup pages
    //     // This check should only run if the profile does NOT need attention
    //     if (!profileNeedsAttention && publicRoutes.includes(pathname)) {
    //         const finalDestination = '/home';
    //         console.log(`AuthRedirectHandler: Profile complete. Redirecting from public page (${pathname}) to ${finalDestination}.`);
    //         router.replace(finalDestination);
    //         return;
    //     }
    // }

  }, [user, userProfile, isProfileSetup, isProfileError, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Checking authentication...</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRedirectHandler;