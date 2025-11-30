// lib/api.ts

// Define your backend API base URL from environment variables.
// NEXT_PUBLIC_BACKEND_API_URL should be set in your .env.local file (e.g., https://localhost:44349/api)
var API_BASE = process.env.NEXT_PUBLIC_DOTNET_BACKEND_BASE || "http://localhost:3000/api";
// const API_BASE = "http://localhost:3000/api";

// Interface for configuring API requests
interface FetchConfig {
  method?: string; // HTTP method (GET, POST, PUT, DELETE, etc.)
  body?: any; // Request body (for POST, PUT)
  contentType?: string; // Content-Type header (e.g., 'application/json', 'multipart/form-data')
}

/**
 * Generic API fetch function. Handles authorization, content type, and error parsing.
 * @param url The endpoint URL relative to API_BASE (e.g., '/users/me').
 * @param config Configuration object for the fetch request (method, body, contentType).
 * @returns A Promise that resolves to the parsed JSON response, or null for 204 No Content.
 * @throws Error if the response is not OK (status 4xx or 5xx).
 */
export async function apiFetch<T>(
  url: string,
  config: FetchConfig = {}
): Promise<T> {
  console.log("apiFetch called with URL:", url, "and body", config.body);
  // Prepare headers, including Content-Type and Authorization if a token exists
  const headers: HeadersInit = {
    // Set Content-Type unless body is FormData (which sets its own Content-Type)
    ...(config.body && config.contentType !== 'multipart/form-form-data' && { 'Content-Type': config.contentType || 'application/json' }),
    // Add Authorization header if a token is found in localStorage
    ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
  };

  // Prepare the request configuration for fetch
  const requestConfig: RequestInit = {
    method: config.method || 'GET', // Default method is GET
    headers,
    // If body is FormData, pass it directly. Otherwise, stringify if it exists.
    body: config.body instanceof FormData ? config.body : (config.body ? JSON.stringify(config.body) : undefined),
    credentials: 'omit', // JWTs are typically sent in headers, not cookies here, so omit credentials by default.
                         // If your backend sets HttpOnly cookies, you might need 'include' here.
  };

  try {
    if (url.toLowerCase().includes("bytes")) {
      API_BASE = process.env.NEXT_PUBLIC_BYTES_BACKEND_BASE || "http://localhost:3000/api";
    } 
    else if ((url.toLowerCase().includes("job")) || (url.toLowerCase().includes("exam"))) {
      API_BASE = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || "http://localhost:3000/api";
    } else {
      API_BASE = process.env.NEXT_PUBLIC_DOTNET_BACKEND_BASE || "http://localhost:3000/api";
    }
    console.log("API call URL: ", `${API_BASE}${url}`); // Log the full URL being called
    const response = await fetch(`${API_BASE}${url}`, requestConfig);

    // --- CRITICAL FIX START: Read body only once ---
    // Read the response body as text first. This consumes the stream.
    // We do this to handle cases where the response might not be JSON (e.g., plain text errors).
    const responseText = await response.text();
    let parsedBody: any;

    // Try to parse the text as JSON if it's not empty.
    if (responseText) {
      try {
        parsedBody = JSON.parse(responseText);
      } catch (e) {
        // If JSON parsing fails, the body is likely plain text or HTML (e.g., for non-JSON error responses).
        // Keep it as text so we can still display it in error messages.
        parsedBody = responseText;
      }
    } else {
      // If responseText is empty, parsedBody remains null.
      parsedBody = null;
    }
    // --- CRITICAL FIX END ---

    if (!response.ok) {
        // If response.ok is false (e.g., 400, 401, 500 status codes)
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;

        // Attempt to extract a more specific error message from the parsed body
        if (parsedBody && typeof parsedBody === 'object' && (parsedBody.message || parsedBody.title || parsedBody.errors)) {
            // Common ASP.NET Core validation errors (parsedBody.errors) or generic messages
            errorMessage = parsedBody.message || parsedBody.title || JSON.stringify(parsedBody.errors);
        } else if (parsedBody) {
            // If it's plain text (not JSON)
            errorMessage = parsedBody;
        }

        console.error(`Error fetching ${url}:`, errorMessage, "Status:", response.status, "Raw Body:", responseText);
        throw new Error(errorMessage); // Throw an error with the extracted message
    }

    // If response.ok is true AND the response body is empty (e.g., 204 No Content), return null.
    // Otherwise, return the parsed body (which is now guaranteed to be JSON if !response.ok didn't throw).
    if (response.status === 204 || responseText === null || responseText === '') {
        return null as T;
    }

    return parsedBody as T; // Return the successfully parsed JSON body

  } catch (error: any) {
    console.error(`Error in apiFetch for ${url}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// Convenience functions for common HTTP methods
export const get = <T>(url: string) => apiFetch<T>(url, { method: 'GET' });
export const postApi = <T>(url: string, body: any, contentType?: string) => apiFetch<T>(url, { method: 'POST', body, contentType });

// --- FIX: Added PUT and DELETE convenience functions ---
export const put = <T>(url: string, body: any, contentType?: string) => apiFetch<T>(url, { method: 'PUT', body, contentType });
export const remove = <T>(url: string) => apiFetch<T>(url, { method: 'DELETE' });
