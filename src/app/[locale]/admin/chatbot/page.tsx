'use client';

import React, { useState } from 'react';
import { refreshChatbotIndex } from '@/api/chatbot';
import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminChatbotPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      redirect('/');
    }
  }, [isAuthenticated, loading, user]);

  const handleRefreshIndex = async () => {
    setRefreshing(true);
    setStatus(null);
    
    try {
      await refreshChatbotIndex();
      setStatus({
        type: 'success',
        message: 'Knowledge index refreshed successfully!'
      });
    } catch (error) {
      console.error('Error refreshing index:', error);
      setStatus({
        type: 'error',
        message: 'Failed to refresh knowledge index. Please try again.'
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Chatbot Administration</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Knowledge Base</h2>
          <p className="text-gray-600 mb-4">
            Refresh the chatbot's knowledge index to include the latest documents and data.
            This process may take a few minutes depending on the size of your data.
          </p>
          
          <button
            onClick={handleRefreshIndex}
            disabled={refreshing}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md flex items-center disabled:bg-blue-300"
          >
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Refreshing Index...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Refresh Knowledge Index
              </>
            )}
          </button>
          
          {status && (
            <div className={`mt-4 p-4 rounded-md flex items-start ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}