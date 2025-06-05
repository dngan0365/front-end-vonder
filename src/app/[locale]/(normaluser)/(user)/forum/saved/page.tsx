'use client';

import React, { useEffect, useState } from 'react';
import { FiBookmark, FiInfo } from 'react-icons/fi';
import Link from 'next/link';
import { Blog, getUserSavedBlogs } from '@/api/forum';
import { useAuth } from '@/context/AuthContext';
import BlogItem from '@/components/BlogItem';

export default function SavedBlogs() {
  const [savedBlogs, setSavedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSavedBlogs() {
      if (!user?.id) {
        setSavedBlogs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const savedBlogsData = await getUserSavedBlogs(user.id);
        // The API returns SaveBlog objects with blog relation, so we need to extract the blog data
        const blogs = savedBlogsData.map(savedBlog => savedBlog.blog);
        setSavedBlogs(blogs);
      } catch (err) {
        console.error('Error fetching saved blogs:', err);
        setError('Failed to load saved blogs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedBlogs();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Sign in to view your saved blogs
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be logged in to save blogs and view your saved collection.
          </p>
          <Link 
            href="/signin" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Saved Blogs
        </h1>
        <Link 
          href="/forum" 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Back to Forum
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-2 border-blue-400 animate-pulse opacity-40"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your saved blogs...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg border border-red-100 dark:border-red-800">
          <div className="flex items-start">
            <FiInfo className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                Something went wrong
              </h3>
              <p className="mt-1 text-red-700 dark:text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 text-sm bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : savedBlogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {savedBlogs.map(blog => (
            <BlogItem key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <FiBookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
            No saved blogs yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            When you save blogs, they'll appear here so you can easily find them later.
          </p>
          <Link
            href="/forum"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors font-medium"
          >
            Explore Blogs
          </Link>
        </div>
      )}
    </div>
  );
}
