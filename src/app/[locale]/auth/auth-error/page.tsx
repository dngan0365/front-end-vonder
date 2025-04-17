'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const message = searchParams.get('message');
    
    // Map error codes to user-friendly messages
    switch(message) {
      case 'auth-initialization-failed':
        setErrorMessage('Authentication initialization failed. Please try again later.');
        break;
      case 'authentication-failed':
        setErrorMessage('Authentication failed. Please check your credentials and try again.');
        break;
      case 'server-error':
        setErrorMessage('A server error occurred during authentication. Please try again later.');
        break;
      default:
        setErrorMessage('An unexpected error occurred during authentication.');
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">{errorMessage}</p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/auth/login"
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-center"
          >
            Try Again
          </Link>
          <Link 
            href="/"
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-md text-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
