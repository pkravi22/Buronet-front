'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const RegistrationSuccessPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Redirect to login if no user
    if (!user) {
      router.push('/login');
      return;
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push('/complete-profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [user, isLoading, router]);

  const handleSkip = () => {
    router.push('/complete-profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 text-center relative z-50">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Your account has been created. You are being redirected to home. Please login again to complete your profile.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Redirecting in {timeLeft} seconds...
        </div>
        <button
          onClick={handleSkip}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Continue Now
        </button>
      </div>
    </div>
  );
};

export default RegistrationSuccessPage;
