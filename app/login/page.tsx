// 'use client';
// import { useState, useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { isAuthenticated } from '@/utils/auth';

// export default function LoginPage() {
//   const [username, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const pathname = usePathname();

//    useEffect(() => {
//       if (isAuthenticated()) {
//         router.push(`/home`);
//       }
//     }, [isAuthenticated]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await fetch('https://localhost:44349/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//         credentials: 'include', // Include cookies if needed
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Login failed');

//       // Save token to localStorage or cookies
//       localStorage.setItem('token', data.token);
      
//       router.push('/profile');
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   // return (
//   //   <div>
//   //     <h1>Login</h1>
//   //     <form onSubmit={handleSubmit}>
//   //       <input type="text" value={username} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
//   //       <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
//   //       <button type="submit">Login</button>
//   //     </form>
//   //     {error && <p style={{ color: 'red' }}>{error}</p>}
//   //   </div>
//   // );

//    return (
//     <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
//         <div>
//           <img
//             className="mx-auto h-12 w-auto"
//             src="/logo.svg" // Replace with your actual logo path
//             alt="Buronet Logo"
//           />
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to Buronet
//           </h2>
//         </div>
//         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
//           <input type="hidden" name="remember" defaultValue="true" />
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div className='mb-4'>
//               <label htmlFor="username" className="sr-only">
//                 Username
//               </label>
//               <input
//                 id="uesrname"
//                 name="uesrname"
//                 type="text"
//                 value={username} 
//                 onChange={e => setEmail(e.target.value)}
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-t-md rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Username"
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 autoComplete="current-password"
//                 required
//                 className="appearance-none rounded-b-md rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <Link href="/forgot-password">
//                 {/* <a
//                   href="#"
//                   className="font-medium text-indigo-600 hover:text-indigo-500"
//                 > */}
//                   Forgot your password?
//                 {/* </a> */}
//               </Link>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                 {/* Heroicon name: lock-closed */}
//                 <svg
//                   className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                   aria-hidden="true"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </span>
//               Sign in
//             </button>
//           </div>
//         </form>

//         <div className="text-center text-sm text-gray-600">
//           Don't have an account? 
//           <Link href="/register">
//             {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"> */}
//               Sign up
//             {/* </a> */}
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
// import { isAuthenticated } from '@/utils/auth'; // <--- REMOVE THIS IMPORT
import { useAuth } from '../../context/AuthContext'; // <--- IMPORT useAuth

export default function LoginPage() {
  const [username, setUsername] = useState(''); // Changed from setEmail to setUsername for consistency
  const [password, setPassword] = useState('');
  // Get state and methods from AuthContext
  const { login, user, isLoading, error: authError } = useAuth(); // <--- Get login, user, isLoading, error from useAuth
  const router = useRouter();

  // Redirect if already logged in (using useAuth's state)
  useEffect(() => {
    // Only redirect if authentication status has been determined (not loading) AND user is present
    if (!isLoading && user) {
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/profile';
      router.replace(returnTo); // Redirect to profile or the page user was trying to access
    }
  }, [user, isLoading, router]); // Dependencies: user and isLoading from useAuth

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent submission if already loading (e.g., initial auth check or login in progress)
    if (isLoading) return;

    // Call the login function from AuthContext

    const success = await login({ username, password });
    // The redirect logic is now handled by the useEffect above, after user state updates in AuthContext
    // No need for router.push here, as useEffect will handle it
  };

  // Show loading state if AuthContext is still determining initial status or performing login
  if (isLoading) {
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
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/logo.svg" // Replace with your actual logo path
            alt="Buronet Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Buronet
          </h2>
        </div>
        {/* Display authentication errors */}
        {authError && ( // <--- Use authError from useAuth
          <p className="text-red-500 text-center mb-4">{authError}</p>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div className='mb-4'>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username" // Corrected id
                name="username" // Corrected name
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)} // Corrected state setter
                autoComplete="username" // Use 'username' for username field
                required
                className="appearance-none rounded-t-md rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="appearance-none rounded-b-md rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
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
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading} // <--- Disable button when isLoading
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
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
              {isLoading ? 'Signing in...' : 'Sign in'} {/* <--- Update button text for loading */}
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
