'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { postApi } from '@/lib/api';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await postApi<string>('/auth/forgot-password', { email });
            setMessage(response);
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Forgot Password</h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter your email to receive a password reset link.
                </p>
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
                        <p>{message}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
                        <p>{error}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            placeholder="Email address"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-semibold bg-[#0096c7] hover:bg-cyan-700 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingSpinner /> : 'Send Reset Link'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <Link href="/login" className="font-medium text-[#0096c7] hover:text-[#00B4D8]">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
