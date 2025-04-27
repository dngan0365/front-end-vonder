'use client'
import { useState } from 'react';
import { X } from 'lucide-react';

type LoginPromptProps = {
  message: string;
  onClose: () => void;
};

export default function LoginPrompt({ message, onClose }: LoginPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sign In Required</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
            className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 rounded-md transition font-medium"
          >
            Sign In
          </button>
          <button 
            onClick={onClose}
            className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}