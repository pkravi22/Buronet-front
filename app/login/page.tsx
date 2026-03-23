'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
// import { isAuthenticated } from '@/utils/auth'; // <--- REMOVE THIS IMPORT
import { useAuth } from '../../context/AuthContext'; // <--- IMPORT useAuth

export default function LoginPage() {
  const [username, setUsername] = useState(''); // Changed from setEmail to setUsername for consistency
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New local loading state
  const [isMounted, setIsMounted] = useState(false); // Track hydration
  // Get state and methods from AuthContext
  const { login, user, isLoading, error: authError } = useAuth(); // <--- Get login, user, isLoading, error from useAuth
  const router = useRouter();

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if already logged in (using useAuth's state)
  // ... (keep useEffect commented or logic as is)

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        // Call the login function from AuthContext
        const success = await login({ username, password, rememberMe });
        setIsSubmitting(false);
        
        // CRITICAL: If login was successful, immediately push to a protected page.
        // The AuthRedirectHandler will now take over on /profile.
        if (success) {
            // Optional: Get returnTo from query params, otherwise default to /profile
            const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/home';
            router.push(returnTo); 
        }
    };

  // Show loading state ONLY if AuthContext is initializing (checking session)
  // We assume if isLoading is true AND we are not submitting locally, it's the initial check.
  // Note: AuthContext.isLoading is now ONLY true during initialization (fetchCurrentUser), not during login().
  if (!isMounted || isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Loading...</h2>
          {/* Optional: Add a spinner here */}
        </div>
      </div>
    );
  }

  // If user is already logged in, this component should not render the form.
  // The useEffect above should handle the redirect, but as a safeguard:
  if (user) {
      return null; // Or a message like "You are already logged in."
  }


  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ultra:min-h-[calc(100vh/1.25)] xl-ultra:min-h-[calc(100vh/1.45)]">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="https://res.cloudinary.com/db65bnadc/image/upload/v1774283069/bgvvq08zbwrh0rulsgyf.png" // Replace with your actual logo path
            alt="Buronet Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Buronet
          </h2>
        </div>
        {/* Display authentication errors */}
        {authError && ( // <--- Use authError from useAuth
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-center mb-2">{authError}</p>
            {authError.includes('Email not confirmed') && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm text-red-600 mb-2">Didn't receive the confirmation email?</p>
                <Link
                  href={`/check-email?email=${encodeURIComponent(username)}`}
                  className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-center text-sm"
                >
                  Resend Confirmation Email
                </Link>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className='mb-4'>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username / Email
                <span className="text-red-500" aria-hidden="true"> *</span>
              </label>
              <input
                id="username" // Corrected id
                name="username" // Corrected name
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)} // Corrected state setter
                autoComplete="username" // Accepts username or email (browser still uses 'username')
                required
                className="appearance-none rounded-t-md rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username or Email"
              />
            </div>
            <div>
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
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {!isSubmitting && (
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
                )}
              </span>
              {isSubmitting ? (
                 <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
