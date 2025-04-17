"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Authenticating...');

  // This effect runs only on the client side
  useEffect(() => {
    // Get token from the URL using the useSearchParams hook
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Authentication failed: No token received');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    try {
      // Store token in localStorage
      localStorage.setItem('auth_token', token);

      // Parse JWT to get user information
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        console.log('Parsed JWT payload:', payload);
        
        // Extract user email ID first - these should always be present
        const id = payload.sub || '';
        const email = payload.email || '';
        
        // For the name, we have a few fallback strategies
        let name = '';
        
        // 1. Try to get name from payload directly
        if (payload.name) {
          name = payload.name;
        } 
        // 2. Extract name from email (before the @ symbol)
        else if (email) {
          name = email.split('@')[0];
          // Capitalize first letter and replace dots/underscores with spaces
          name = name.charAt(0).toUpperCase() + 
                name.slice(1).replace(/[._]/g, ' ');
        }
        // 3. Fallback to "User"
        else {
          name = 'User';
        }
        
        // Create user object
        const user = {
          id,
          email,
          name,
          role: payload.role || 'user'
        };
        
        console.log('Constructed user object:', user);
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        setStatus('success');
        setMessage(`Welcome, ${name}! Authentication successful. Redirecting...`);
        
        // Give a moment to show the success message before redirecting
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (error) {
        console.error('Error parsing JWT token', error);
        setStatus('error');
        setMessage('Authentication successful but there was a problem with your session.');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Auth processing error:', error);
      setStatus('error');
      setMessage('Authentication failed: Error processing your login.');
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          </>
        )}
        
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}