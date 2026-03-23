// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch, get, postApi } from '../lib/api';
import { User, LoginData, RegisterData, UserProfile, RegisterResponse } from '../lib/types/user';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed: npm install jwt-decode
import LoadingSpinner from '../components/UI/LoadingSpinner'; // Adjust path based on your project structure
import { clearLogoutGuard, setLogoutGuard } from '../utils/auth';

// Define your User type based on what your backend returns after successful login/token verification
// Ensure 'id' is string if your backend returns it as string GUID, or Guid if you convert it.
// Based on your backend's User model, 'id' is Guid, so it will be a string GUID on frontend.
// (User interface is imported from '../lib/types/user')

// ASP.NET Core JWT claim URIs
const CLAIM_NAME_IDENTIFIER = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

/**
 * Maps a decoded ASP.NET Core JWT (with full claim URIs) to a User object.
 */
function mapJwtClaimsToUser(decoded: any): User {
  // Check for isAdmin in multiple possible locations
  const isAdmin = decoded.isAdmin === true || 
                  decoded.isAdmin === 'true' ||
                  decoded.role === 'Admin' ||
                  decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin' ||
                  false;
  
  return {
    id: decoded[CLAIM_NAME_IDENTIFIER] || decoded.sub || decoded.nameid || decoded.id || '',
    username: decoded[CLAIM_NAME] || decoded.unique_name || decoded.username || '',
    email: decoded[CLAIM_EMAIL] || decoded.email || '',
    createdAt: '',
    updatedAt: '',
    isAdmin: isAdmin,
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  error: string | null;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  isProfileError: boolean;
  isProfileSetup: boolean;
  refetchProfile: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendConfirmationEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true, becomes false after initial session check
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Clear authentication errors when the user navigates to a different page
  useEffect(() => {
    setError(null);
  }, [pathname]);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false); // Manually managed loading
  const [isProfileError, setIsProfileError] = useState(false); // Manually managed error
  
  // Computed state for simplicity
  const isProfileSetup = !!userProfile && !!userProfile?.firstName; // Use your chosen definition (e.g., !!userProfile?.firstName)

  // NEW: Synchronous Profile Fetching Logic
  const fetchAndSetProfile = async (id: string): Promise<void> => {
    setIsProfileLoading(true);
    setIsProfileError(false);
    try {
      // Always fetch the current authenticated user's profile.
      // Keeping the endpoint canonical also avoids proxy/case mismatches.
      const profile = await get<UserProfile>('/Users/profile');
        setUserProfile(profile);
        setIsProfileError(false);
    } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setUserProfile(null);
        setIsProfileError(true);
    } finally {
        setIsProfileLoading(false);
    }
  };
  
  const refetchProfile = async () => {
    if (user?.id) {
        await fetchAndSetProfile(user.id);
    }
  };

  // Function to fetch the current user's basic info from /Users/user (backend token verification)
  const fetchCurrentUser = async () => {
    console.log('fetchCurrentUser: Starting initial session check.');
    setIsLoading(true); // Indicate loading
    setError(null); // Clear any previous errors

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('fetchCurrentUser: No token found in localStorage. User is not authenticated.');
      setUser(null);
      setIsLoading(false);
      return; // No token, so no need to fetch
    }

    // Optional client-side token expiration check (for UX, not security)
    try {
      const decoded: any = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;
      if (expirationTime < Date.now()) {
        console.warn('fetchCurrentUser: Client-side token expired. Clearing token.');
        localStorage.removeItem('token');
        setUser(null);
        setIsLoading(false);
        setError('Your session has expired. Please log in again.');
        return;
      }
    } catch (decodeError) {
      console.error('fetchCurrentUser: Error decoding token client-side. Clearing token.', decodeError);
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
      setError('Invalid session token. Please log in again.');
      return;
    }


    try {
      // Call the /Users/user endpoint to verify token and get basic user info
      // This request will automatically include the Authorization header via lib/api.ts
      console.log('fetchCurrentUser: Attempting backend token verification via GET /Users/user');
      const currentUser = await get<User>('/auth/profile'); // Call the /Users/user endpoint for basic user info
      console.log("fetchCurrentUser: Backend verification successful. Current user fetched: ", currentUser);
      console.log("fetchCurrentUser: User isAdmin property:", currentUser.isAdmin);
      
      // Preserve isAdmin from current user state if backend doesn't return it
      const currentIsAdmin = user?.isAdmin;
      if (currentIsAdmin && !currentUser.isAdmin) {
        currentUser.isAdmin = currentIsAdmin;
        console.log('fetchCurrentUser: Preserved isAdmin from current user state:', currentIsAdmin);
      }
      
      setUser(currentUser); // Set user if fetch is successful
    } catch (err: any) {
      // If 401, the token is invalid or expired. Clear it.
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        console.error('fetchCurrentUser: Backend token verification failed (401/Unauthorized). Clearing token.', err);
        localStorage.removeItem('token');
        setUser(null);
        setError('Session expired or invalid. Please log in again.');
      } else {
        // Clear token on other errors too, just in case
        console.error('fetchCurrentUser: Error fetching user status from backend. Clearing token.', err);
        setError(err.message || "Failed to fetch user status.");
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      console.log('fetchCurrentUser: Initial session check complete.');
      setIsLoading(false); // Authentication check is complete
    }
  };

  useEffect(() => {
    // REMOVED: setIsLoading(true); // We don't want to trigger global loading state for login action
  }, []); // Run once on mount to check initial session status

  // --- Login Function ---
  const login = async (data: LoginData): Promise<boolean> => {
    console.log('login: Attempting login for username:', data.username);
    // REMOVED: setIsLoading(true);
    setError(null); // Clear previous errors
    console.log('login: Sending login request to backend with data:', data);
    
    try {
      // POST to backend login
      const response: { token: string; userId: string; username: string; email: string; refreshToken?: string } = await postApi('/auth/login', data);

      if (response && response.token) {
        const token = response.token;
        // If a logout guard is active (e.g., user logged out in another tab), clear it on successful login.
        clearLogoutGuard();
        localStorage.setItem('token', token);
        
        // Handle Refresh Token
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }

        const decoded = jwtDecode(token);
        const decodedUser = mapJwtClaimsToUser(decoded);
        console.log('login: Decoded JWT claims:', decoded);
        console.log('login: Mapped user object:', decodedUser);
        setUser(decodedUser);

        console.log('login: Login successful. Token received and user set in context:', decodedUser);
        
        // CRITICAL: SYNCHRONOUS FETCH PROFILE
        await fetchAndSetProfile(decodedUser.id);
        // ... (Your existing code returns true)
        return true;
      } else {
        throw new Error("Login successful but no token received.");
      }
    } catch (err: any) {
      console.error('login: Login failed:', err);
      setError(err.message || "Login failed. Please check your credentials."); // Ensure we set the error
      localStorage.removeItem('token'); // Clear any invalid token
      setUser(null);
      return false;
    } finally {
      console.log('login: Login process complete.');
      // REMOVED: setIsLoading(false);
    }
  };

  // --- Logout Function ---
  const logout = async () => {
    console.log('logout: Initiating logout process.');
    setError(null);
    try {
      // Force a 2-minute "logout guard" window so redirect logic cannot bounce back to /home.
      // This also enables continuous checking for an active session during token-clearing races.
      setLogoutGuard(2 * 60 * 1000);

      localStorage.removeItem('token'); // Clear token from storage
      localStorage.removeItem('refreshToken'); // Clear refresh token
      setUser(null); // Clear user from context
      setUserProfile(null);
      setIsProfileError(false);

      try {
        // Call backend logout endpoint (optional, for refresh token invalidation/blacklisting)
        console.log('logout: Attempting backend logout call.');
        await postApi('/auth/logout', {});
        console.log("logout: Backend logout endpoint hit successfully.");
      } catch (backendLogoutError: any) { 
        console.warn("logout: Backend logout endpoint failed (might be expected if token already cleared or endpoint doesn't exist/is unreachable):", backendLogoutError);
      }
    } catch (err: any) {
      console.error('logout: Error during client-side logout process:', err);
      setError(err.message || "Logout failed.");
    }

    // Ensure isLoading is false BEFORE navigating so the destination page
    // reads the final (null) user state instead of a stale one.
    setIsLoading(false);
    console.log('logout: Logout process complete. Navigating to /home.');

    // Use a microtask to let React flush the null-user state before the
    // navigation triggers a re-render of the target page.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    router.replace('/home');
  };

  // --- Register Function ---
  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    console.log('register: Attempting registration for username:', data.username);
    setError(null); // Clear any previous errors
    try {
      // Call register endpoint - backend now sends confirmation email instead of returning token
      const registerResponse: any = await postApi('/auth/register', data);
      
      console.log('register: Backend response:', registerResponse);

      // Backend returns just a message on success, treat any non-error response as success
      // If we got here without an exception, it's a success
      if (registerResponse && registerResponse.message) {
        console.log('register: Registration successful. Confirmation email sent.');
        
        // Don't set error, just return success
        setError(null);
        
        return { "success": true, "message": registerResponse.message } as RegisterResponse;
      } else {
        throw new Error("Registration failed - no response from server.");
      }
    } catch (err: any) {
      console.error('register: Registration failed:', err);
      const message = err?.message || "Registration failed.";
      setError(message);
      return { "success": false, "message": message } as RegisterResponse;
    } finally {
      console.log('register: Registration process complete.');
    }
  };

  // --- Verify Email Function ---
  const verifyEmail = async (token: string): Promise<boolean> => {
    console.log('verifyEmail: Attempting email verification with token');
    setError(null);
    try {
      const response: { token: string; userId: string; username: string; email: string; refreshToken?: string } = await postApi('/auth/confirm-email', { token });

      if (response && response.token) {
        console.log('verifyEmail: Email verification successful. Token received.');
        localStorage.setItem('token', response.token);
        
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        const decoded = jwtDecode(response.token);
        const decodedUser = mapJwtClaimsToUser(decoded);
        setUser(decodedUser);

        console.log('verifyEmail: User set in context:', decodedUser);
        
        // Fetch profile after email verification
        await fetchAndSetProfile(decodedUser.id);
        return true;
      } else {
        throw new Error("Email verification successful but no token received.");
      }
    } catch (err: any) {
      console.error('verifyEmail: Email verification failed:', err);
      setError(err.message || "Email verification failed.");
      return false;
    }
  };

  // --- Resend Confirmation Email Function ---
  const resendConfirmationEmail = async (email: string): Promise<boolean> => {
    console.log('resendConfirmationEmail: Attempting to resend confirmation email to:', email);
    setError(null);
    try {
      const response: { success: boolean; message?: string } = await postApi('/auth/resend-confirmation-email', { email });

      if (response && response.success) {
        console.log('resendConfirmationEmail: Confirmation email resent successfully.');
        return true;
      } else {
        throw new Error(response?.message || "Failed to resend confirmation email.");
      }
    } catch (err: any) {
      console.error('resendConfirmationEmail: Failed to resend confirmation email:', err);
      setError(err.message || "Failed to resend confirmation email.");
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const decodedUser = mapJwtClaimsToUser(decoded);
        setUser(decodedUser);
        
        // Fetch full user from API to replace JWT-based user, then fetch profile
        // Pass the decodedUser so we can preserve isAdmin if backend doesn't return it
        fetchCurrentUser().then(() => {
          fetchAndSetProfile(decodedUser.id);
        }).finally(() => setIsLoading(false));
      } catch (e) {
        // ... (Error handling)
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        error,
        userProfile,          // NEW
        isProfileLoading,     // NEW
        isProfileError,       // NEW
        isProfileSetup,       // NEW
        refetchProfile,       // NEW
        verifyEmail,          // NEW
        resendConfirmationEmail, // NEW
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- HOC for protecting pages ---
export const withAuthRequired = (Component: React.ComponentType<any>) => {
  const Wrapper: React.FC = (props) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

   

    useEffect(() => {
      console.log("withAuthRequired: Checking user authentication status...");
      if (typeof window !== 'undefined') { // Ensure running in browser
        if (!isLoading && !user) {
          const currentPath = window.location.pathname + window.location.search; 
          // CRITICAL: Ensure the entire path is passed as the returnTo value
          router.push(`/login?returnTo=${encodeURIComponent(currentPath)}`);
          console.log("This is being called/redirected to login page");
        }
      }
    }, [user, isLoading, router]); // CRITICAL: ADD isLoading and router

    if (isLoading || !user) {
      return (
        <React.Fragment>
          <div className="flex justify-center items-center h-[calc(100vh-64px)]">
            <LoadingSpinner /> <span className="ml-2 text-gray-700">Checking authentication...</span>
          </div>
        </React.Fragment>
      );
    }

    return <Component {...props} />;
  };
  Wrapper.displayName = `withAuthRequired(${Component.displayName || Component.name || 'Component'})`;
  return Wrapper;
};