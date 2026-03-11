// app/register/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
// Assuming AppLayout is for authenticated parts of the app.
// For login/register pages, it's common to NOT use a global layout like AppLayout
// unless it's specifically designed for unauthenticated pages too.
// Removed AppLayout as per typical auth page design.
// import AppLayout from '../../components/AppLayout';
// import { postApi } from '../../lib/api'; // Assuming this is a helper for API calls
import LoadingSpinner from '../../components/UI/LoadingSpinner'; // Assuming this component exists
import { useAuth } from '../../context/AuthContext'; // Assuming this context exists
import { RegisterData, RegisterResponse } from '../../lib/types/user'; // Assuming this type exists
import { validatePassword, DEFAULT_MIN_PASSWORD_LENGTH } from '@/lib/helpers/password';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Added email state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track hydration
  const { register, user, isLoading, error: authError } = useAuth();
  const router = useRouter();

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handles the form submission for registration
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault(); // Prevent default form submission behavior

  //   // If registration is already in progress, do nothing
  //   if (isLoading) return;

  //   // Call the register function from AuthContext with collected data
  //   await register({ username, email, password });
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim();
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!emailLooksValid) {
      return;
    }

    const passwordValidation = validatePassword(password, DEFAULT_MIN_PASSWORD_LENGTH);
    if (!passwordValidation.isValid) {
      // Let the inline password validation message handle this.
      return;
    }

    setIsSubmitting(true);
    await register({ username, email: normalizedEmail, password } as RegisterData);
    setIsSubmitting(false);
    // Redirect is handled by AuthContext
  };

  const passwordError = useMemo(() => {
    if (!password) return null;
    const result = validatePassword(password, DEFAULT_MIN_PASSWORD_LENGTH);
    return result.isValid ? null : result.errorMessage ?? null;
  }, [password]);

  const usernameError = useMemo(() => {
    if (!username) return null;
    if (username.length > 20) return 'Username must not exceed 20 characters.';
    return null;
  }, [username]);

  const emailError = useMemo(() => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return null;
    if (normalizedEmail.includes(' ')) return 'Email must not contain spaces.';
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    return emailLooksValid ? null : 'Please enter a valid email address.';
  }, [email]);

  // Show a loading spinner when registration is in progress
  if (!isMounted || isLoading) {
    return (
      // Removed AppLayout as per typical auth page design.
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner /> <span className="ml-2 text-gray-700">Registering...</span>
      </div>
    );
  }

  return (
    // Removed AppLayout as per typical auth page design.
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8"> {/* Added space-y-8 here */}
        <div>
          {/* Logo - ensure you have a logo.svg in your public folder */}
          <img
            className="mx-auto h-12 w-auto"
            src="/Logo.png"
            alt="Buronet Logo"
          />
          {/* Heading for the register page */}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 mb-6"> {/* Added mb-6 for spacing below heading */}
            Sign up for Buronet
          </h2>
        </div>

        {/* Display authentication errors if any */}
        {authError && (
          <p className="text-red-500 text-center mb-4">{authError}</p>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6"> {/* mt-8 for spacing above form */}
          {/* Hidden input for remembering state, if needed (often for login, less for register) */}
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm"> {/* Removed -space-y-px from here */}
            {/* Username Input */}
            <div className='mb-4'> {/* Each input div now manages its own bottom margin */}
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
                <span className="text-red-500" aria-hidden="true"> *</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.slice(0, 20))}
                maxLength={20}
                autoComplete="username" // Use 'username' for username field
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
              {usernameError && (
                <p className="text-xs text-red-500 mt-1">{usernameError}</p>
              )}
            </div>
            {/* Email Input */}
            <div className='mb-4'> {/* Each input div now manages its own bottom margin */}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
                <span className="text-red-500" aria-hidden="true"> *</span>
              </label>
              <input
                id="email"
                name="email"
                type="email" // Changed type to email
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>
            {/* Password Input */}
            <div> {/* No mb-4 here as it's the last input before the button */}
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
                <span className="text-red-500" aria-hidden="true"> *</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password" // Use 'new-password' for registration
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer z-20"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least {DEFAULT_MIN_PASSWORD_LENGTH} characters, no spaces, and include uppercase, lowercase, number, and special character.
                </p>
              )}
            </div>
          </div>

          {/* No "Remember me" or "Forgot password" for register page usually */}
          {/* You can add them if your design requires, but typically they are on login */}
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link href="/forgot-password">
                Forgot your password?
              </Link>
            </div>
          </div> */}

          {/* Register Button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading || !!emailError || !!passwordError || !!usernameError} // Disable button when invalid/loading
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {/* Lock icon */}
                <svg
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {isLoading ? 'Registering...' : 'Sign up'} {/* Button text changes based on loading state */}
            </button>
          </div>
        </form>

        {/* Link to Login Page */}
        <div className="text-center text-sm text-gray-600 mt-4"> {/* Added mt-4 for spacing above this div */}
          Already have an account?
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

