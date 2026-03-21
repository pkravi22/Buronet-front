'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { postApi } from '@/lib/api';

const ConfirmEmailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided. Please check your email link.');
        return;
      }

      try {
        const response: any = await postApi('/auth/confirm-email', { token });
        
        console.log('Email verification response:', response);
        
        // Backend returns { success: boolean, message: string }
        if (response && response.success) {
          setStatus('success');
          setMessage(response.message || 'Your email has been verified successfully!');
        } else {
          throw new Error(response?.message || 'Email verification failed');
        }
      } catch (err: any) {
        console.error('Email verification failed:', err);
        
        // Handle specific error codes
        const errorMessage = err?.message || 'Email verification failed';
        
        if (errorMessage.includes('EXPIRED_TOKEN') || errorMessage.includes('expired')) {
          setMessage('This verification link has expired. Please request a new one.');
        } else if (errorMessage.includes('INVALID_TOKEN') || errorMessage.includes('invalid')) {
          setMessage('Invalid verification link. Please check your email and try again.');
        } else if (errorMessage.includes('ALREADY_CONFIRMED')) {
          setMessage('This email has already been confirmed. You can now log in.');
        } else {
          setMessage(errorMessage);
        }
        
        setStatus('error');
      }
    };

    verifyEmail();
  }, [isMounted, token]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="mb-4 flex justify-center">
              <LoadingSpinner />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-gray-600 mb-6">You can now log in to your account with your credentials.</p>
            <Link
              href="/login"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition-colors text-center block"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/register"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-center"
              >
                Back to Register
              </Link>
              <Link
                href="/login"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors text-center"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
