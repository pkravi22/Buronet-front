// app/api/Users/profile/route.ts
// This file handles GET and PUT requests to /api/Users/profile

import { log } from 'console';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ensure this environment variable is correctly set in your .env.local
// It should point directly to your .NET backend's base API URL (e.g., http://localhost:44349/api)
const DOTNET_BACKEND_BASE_URL = process.env.NEXT_PUBLIC_DOTNET_BACKEND_BASE;

/**
 * Handles GET requests to /api/Users/profile
 * This proxies the request to the .NET backend to fetch the user's profile.
 * It's responsible for forwarding the JWT from the frontend.
 */
export async function GET(request: Request) {
  log('API Route Handler: GET /api/Users/user hit');
  try {
    if (!DOTNET_BACKEND_BASE_URL) {
      console.error('Error: DOTNET_BACKEND_URL is not set in environment variables.');
      return NextResponse.json({ message: 'Backend URL not configured' }, { status: 500 });
    }
    const authorizationHeader = request.headers.get('Authorization'); // Get the Authorization header from the incoming request
    
    const headersToForward = new Headers();
    if (authorizationHeader) {
      headersToForward.set('Authorization', authorizationHeader); // Forward the Authorization header (containing Bearer JWT)
      console.log('Forwarding Authorization header:', authorizationHeader.substring(0, 50) + '...'); // Log partial token for debugging
    } else {
      console.log('No Authorization header received from client to Next.js API route for /users/profile.');
    }

    const backendResponse = await fetch(`${DOTNET_BACKEND_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: headersToForward, // Use the headers with the Authorization token
    });

    console.log('API Route Handler: Backend response status', backendResponse.status);
    console.log('API Route Handler: Backend response statusText', backendResponse.statusText);

    // --- Robust Response Body Handling ---
    let responseBodyContent: any;
    try {
        responseBodyContent = await backendResponse.json();
        
    } catch (e) {
        console.warn('API Route Handler: Failed to parse backend response as JSON. Attempting to read as text.');
        try {
            responseBodyContent = await backendResponse.text();
        } catch (textReadError) {
            responseBodyContent = backendResponse.statusText || 'Unknown error'; // Fallback
        }
    }

    if (!backendResponse.ok) {
        console.error(`API Route Handler: Backend returned error ${backendResponse.status}:`, responseBodyContent);
        
        return new NextResponse(
            typeof responseBodyContent === 'object' ? JSON.stringify(responseBodyContent) : responseBodyContent,
            {
                status: backendResponse.status,
                headers: backendResponse.headers, // Important to forward headers like WWW-Authenticate
            }
        );
    }
    return new NextResponse(JSON.stringify(responseBodyContent), {
      status: backendResponse.status,
      headers: backendResponse.headers,
    });

  } catch (error: any) {
    console.error('API Route Handler: Error during proxy GET /users/profile (likely network/connection to backend):', error);
    // Return a generic 500 error if something goes wrong in the proxy itself
    return NextResponse.json(
      { message: error.message || 'Internal server error during proxy operation' },
      { status: 500 }
    );
  }
}

