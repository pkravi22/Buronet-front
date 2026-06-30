// app/api/Users/profile/route.ts
// This file handles GET and PUT requests to /api/Users/profile

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
  console.log('API Route Handler: GET /api/Users/profile hit');
  try {
    if (!DOTNET_BACKEND_BASE_URL) {
      console.error('Error: DOTNET_BACKEND_URL is not set in environment variables.');
      return NextResponse.json({ message: 'Backend URL not configured' }, { status: 500 });
    }
    console.log('API Route Handler: Calling backend at', `${DOTNET_BACKEND_BASE_URL}/Users/profile`);

    // --- Authentication Logic: Forwarding the JWT ---
    // The frontend client (lib/api.ts) sends the JWT in the Authorization header.
    // We need to extract it from the incoming request to this Next.js API route
    // and forward it to the .NET backend.
    const authorizationHeader = request.headers.get('Authorization'); // Get the Authorization header from the incoming request
    console.log('API Route Handler: Received Authorization header:', authorizationHeader ? authorizationHeader.substring(0, 50) + '...' : 'None');
    const headersToForward = new Headers();
    if (authorizationHeader) {
      headersToForward.set('Authorization', authorizationHeader); // Forward the Authorization header (containing Bearer JWT)
      console.log('Forwarding Authorization header:', authorizationHeader.substring(0, 50) + '...'); // Log partial token for debugging
    } else {
      console.log('No Authorization header received from client to Next.js API route for /users/profile.');
      // If no auth header, the backend will likely return 401. Let it.
    }
    // You might also want to forward other headers like User-Agent, Accept-Language, etc. if your backend relies on them.


    // Make the actual call to the .NET backend
    const backendResponse = await fetch(`${DOTNET_BACKEND_BASE_URL}/Users/profile`, {
      method: 'GET',
      headers: headersToForward, // Use the headers with the Authorization token
    });

    console.log('API Route Handler: Backend response status', backendResponse.status);
    console.log('API Route Handler: Backend response statusText', backendResponse.statusText);

    // --- Robust Response Body Handling ---
    let responseBodyContent: any;
    try {
        // Attempt to parse as JSON first. This covers 2xx and JSON-formatted errors (e.g., 400 with JSON).
        responseBodyContent = await backendResponse.json();
        console.log('API Route Handler: Successfully parsed backend response as JSON. ', responseBodyContent);
        
    } catch (e) {
        // If JSON parsing fails (e.g., empty body for 401, HTML, plain text errors), read as text.
        console.warn('API Route Handler: Failed to parse backend response as JSON. Attempting to read as text.');
        try {
            responseBodyContent = await backendResponse.text();
        } catch (textReadError) {
            console.error('API Route Handler: Failed to read backend response as text either.', textReadError);
            responseBodyContent = backendResponse.statusText || 'Unknown error'; // Fallback
        }
    }

    if (!backendResponse.ok) {
        // If backendResponse.ok is false (e.g., 400, 401, 500)
        console.error(`API Route Handler: Backend returned error ${backendResponse.status}:`, responseBodyContent);
        
        // Forward the error status directly, with the (possibly parsed) error body
        return new NextResponse(
            typeof responseBodyContent === 'object' ? JSON.stringify(responseBodyContent) : responseBodyContent,
            {
                status: backendResponse.status,
                headers: backendResponse.headers, // Important to forward headers like WWW-Authenticate
            }
        );
    }

    // If backendResponse.ok is true, then we have valid JSON data for a successful response.
    console.log('API Route Handler: Successfully proxied response.');
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

/**
 * Handles PUT requests to /api/Users/profile
 * This proxies the request to the .NET backend to update the user's profile.
 */
export async function PUT(request: Request) {
    console.log('API Route Handler: PUT /api/Users/profile hit');
    try {
        if (!DOTNET_BACKEND_BASE_URL) {
            console.error('Error: DOTNET_BACKEND_URL is not set in environment variables.');
            return NextResponse.json({ message: 'Backend URL not configured' }, { status: 500 });
        }
        console.log('API Route Handler: Calling backend PUT at', `${DOTNET_BACKEND_BASE_URL}/Users/profile`);

        const authorizationHeader = request.headers.get('Authorization');
        const headersToForward = new Headers();
        if (authorizationHeader) {
            headersToForward.set('Authorization', authorizationHeader);
        }
        headersToForward.set('Content-Type', 'application/json'); // Ensure JSON content type for PUT request body

        // Read the request body from the frontend
        const requestBody = await request.json();

        const backendResponse = await fetch(`${DOTNET_BACKEND_BASE_URL}/Users/profile`, {
            method: 'PUT',
            headers: headersToForward,
            body: JSON.stringify(requestBody), // Send the received body to the backend
        });

        console.log('API Route Handler: Backend PUT response status', backendResponse.status);

        let responseBodyContent: any;
        try {
            responseBodyContent = await backendResponse.json();
        } catch (e) {
            console.warn('API Route Handler: Failed to parse backend PUT response as JSON. Attempting to read as text.');
            try {
                responseBodyContent = await backendResponse.text();
            } catch (textReadError) {
                console.error('API Route Handler: Failed to read backend PUT response as text either.', textReadError);
                responseBodyContent = backendResponse.statusText || 'Unknown error';
            }
        }

        if (!backendResponse.ok) {
            console.error(`API Route Handler: Backend PUT returned error ${backendResponse.status}:`, responseBodyContent);
            return new NextResponse(
                typeof responseBodyContent === 'object' ? JSON.stringify(responseBodyContent) : responseBodyContent,
                {
                    status: backendResponse.status,
                    headers: backendResponse.headers,
                }
            );
        }

        console.log('API Route Handler: Successfully proxied PUT response.');
        return new NextResponse(JSON.stringify(responseBodyContent), {
            status: backendResponse.status,
            headers: backendResponse.headers,
        });

    } catch (error: any) {
        console.error('API Route Handler: Error during proxy PUT /users/profile:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error during proxy operation' },
            { status: 500 }
        );
    }
}

// You will need to create similar route.ts files (or add these methods if they are in the same route.ts file)
// for all other specific API endpoints you have, such as:
// app/api/auth/login/route.ts (POST)
// app/api/auth/logout/route.ts (POST)
// app/api/auth/register/route.ts (POST)
// app/api/auth/me/route.ts (GET)
// app/api/users/profile/experiences/route.ts (GET and POST)
// app/api/users/profile/experiences/[id]/route.ts (PUT and DELETE)
// (and so on for all nested collections, following the pattern of forwarding Authorization header and handling responses)