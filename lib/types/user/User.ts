export interface User { // Your core User type
  id: string; // CHAR(36) GUID
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean | undefined;
  isEmailConfirmed?: boolean; // Email confirmation status
  // PasswordHash and PasswordSalt are NOT here for security
}

// --- New: Types for Login and Registration ---
export interface LoginData {
  username: string; // Username or Email
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}