'use client';

import React, { useEffect, useState } from 'react';
import { useBlog } from '@/hooks/useBlog';
import BlogItem from '@/components/BlogItem';
import { FiAlertCircle, FiSearch, FiFilter, FiMapPin, FiClock } from 'react-icons/fi';
import { LuNewspaper } from 'react-icons/lu';
import data from '@/data/data.json';

const ForumPage = () => {
  const { blogs, isLoading, error, fetchBlogs } = useBlog();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<string>('');

  // Sample locations for demonstration
  const popularLocations = [
    'Hanoi',
    'Ho Chi Minh City',
    'Hoi An',
    'Ha Long Bay',
    'Da Nang',
    'Sapa'
  ];

  // Filter blogs by category if one is selected
  const filteredBlogs = selectedCategory 
    ? blogs.filter(blog => blog.category === selectedCategory)
    : blogs;

  // Get 3 newest posts
  const newestPosts = [...blogs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  useEffect(() => {
    setMounted(true);
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle SSR compatibility
  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center shadow-sm">
          <FiAlertCircle className="mr-3 text-xl flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area - Takes 2/3 on larger screens */}
        <div className="lg:w-2/3">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
                <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-primary animate-pulse opacity-40"></div>
              </div>
              <span className="mt-6 text-gray-600 dark:text-gray-300 font-medium">Discovering travel stories...</span>
            </div>
          )}

          {/* Blog List - Empty State */}
          {!isLoading && filteredBlogs.length === 0 && !error && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
              <div className="mb-6 bg-blue-50 dark:bg-gray-700 p-4 rounded-full inline-block">
                <LuNewspaper className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {selectedCategory ? `No posts in ${selectedCategory}` : "No travel stories yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {selectedCategory 
                  ? "Try selecting a different category"
                  : "Be the first explorer to share your Vietnam adventure!"}
              </p>
              <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:from-blue-600 hover:to-teal-500 transition-all shadow-md hover:shadow-lg">
                Create New Post
              </button>
            </div>
          )}

          {/* Blog List - With Content */}
          {!isLoading && filteredBlogs.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogItem key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Takes 1/3 on larger screens */}
        <div className="lg:w-1/3 space-y-8">
          {/* Category Filter Box */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <FiFilter className="mr-2" /> Categories
              </h3>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.Category.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    category === selectedCategory
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Location Search Box */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <FiMapPin className="mr-2" /> Search by Location
            </h3>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {popularLocations.filter(loc => 
                !searchLocation || loc.toLowerCase().includes(searchLocation.toLowerCase())
              ).map((location) => (
                <button
                  key={location}
                  className="px-3 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Posts Box */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <FiClock className="mr-2" /> Recent Posts
            </h3>
            <div className="space-y-4">
              {newestPosts.length > 0 ? (
                newestPosts.map((post) => (
                  <div key={post.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <a href={`/forum/${post.id}`} className="block">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 line-clamp-1 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No posts available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
