'use client';

import React, { useEffect, useState } from 'react';
import { useBlog } from '@/hooks/useBlog';
import BlogItem from '@/components/BlogItem';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

const ForumPage = () => {
  const { blogs, isLoading, error, fetchBlogs } = useBlog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle SSR compatibility
  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Travel Forum
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover and share travel experiences in Vietnam
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <FiLoader className="animate-spin text-primary h-8 w-8" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading blogs...</span>
        </div>
      )}

      {/* Blog List */}
      {!isLoading && blogs.length === 0 && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No blogs found. Be the first to create one!</p>
        </div>
      )}

      {!isLoading && blogs.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {blogs.map((blog) => (
            <BlogItem key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPage;
