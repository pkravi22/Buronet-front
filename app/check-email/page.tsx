'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { postApi } from '@/lib/api';

const CheckEmailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('Email address not found. Please register again.');
      return;
    }

    setIsResending(true);
    setResendError('');
    setResendMessage('');

    try {
      const response: any = await postApi('/auth/resend-confirmation-email', { email });
      
      if (response && response.success) {
        setResendMessage('Confirmation email sent! Please check your inbox.');
      } else {
        throw new Error(response?.message || 'Failed to resend email');
      }
    } catch (err: any) {
      console.error('Resend email failed:', err);
      setResendError(err?.message || 'Failed to resend confirmation email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl font-bold text-green-900 mb-2">Registration Successful!</h1>
          
          {/* Subheading */}
          <p className="text-green-700 font-semibold mb-4">
            Check your email to verify your account
          </p>

          {/* Email Display */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-600 mb-1">Confirmation link sent to:</p>
            <p className="text-lg font-bold text-green-900 break-all">
              {email || 'your email address'}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-green-900 mb-3">What's next?</p>
            <ol className="space-y-2 text-sm text-green-800">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Check your email inbox for our confirmation message</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Complete your profile and start using Buronet</span>
              </li>
            </ol>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-amber-900 mb-2 text-sm">💡 Tip:</p>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• Check your spam or junk folder if you don't see the email</li>
              <li>• The link will expire in 1 week</li>
              <li>• You can request a new link below if needed</li>
            </ul>
          </div>

          {/* Success/Error Messages */}
          {resendMessage && (
            <div className="bg-green-100 border border-green-400 rounded-lg p-3 mb-4 text-sm text-green-800">
              ✓ {resendMessage}
            </div>
          )}

          {resendError && (
            <div className="bg-red-100 border border-red-400 rounded-lg p-3 mb-4 text-sm text-red-800">
              ✕ {resendError}
            </div>
          )}

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Resend Confirmation Email</span>
              </>
            )}
          </button>

          {/* Back to Login Link */}
          <Link
            href="/login"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Back to Login
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-center text-green-700 text-sm mt-6">
          Already verified? <Link href="/login" className="font-bold hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
