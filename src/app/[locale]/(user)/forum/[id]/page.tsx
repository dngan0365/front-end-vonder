'use client';

import React, { useEffect, useState } from 'react';
import { getBlogById } from '@/api/forum';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { Blog } from '@/api/forum';

export default function BlogPostDetail() {
  const params = useParams();
  const blogId = params.id as string;
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlog() {
      if (!blogId) {
        setError('Invalid blog ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const blogData = await getBlogById(blogId);
        setBlog(blogData);
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadBlog();
  }, [blogId]);

  // Calculate vote counts if blog exists
  const upvotes = blog?.votes?.filter(vote => vote.type === 'UP').length || 0;
  const downvotes = blog?.votes?.filter(vote => vote.type === 'DOWN').length || 0;
  const voteTotal = upvotes - downvotes;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700 font-medium">Error loading blog post</p>
          <p className="text-red-600 mt-2">{error || 'Blog post not found'}</p>
        </div>
        <Link href="/forum" className="text-blue-600 hover:underline">
          ← Back to forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/forum" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to forum
        </Link>

        {/* Post header */}
        <h1 className="text-3xl font-bold mt-6 mb-2">{blog.title}</h1>

        <div className="flex items-center gap-3 text-gray-600 mb-6">
          <div className="flex items-center">
            {blog.author?.image ? (
              <img
                src={blog.author.image}
                alt={blog.author.name}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                {blog.author?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span>{blog.author?.name}</span>
          </div>
          <span>•</span>
          <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}</span>
          <span>•</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Post content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Post engagement metrics */}
      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mt-4">
        <div className="flex items-center">
          <FiThumbsUp className="mr-1" />
          <span>{upvotes} upvotes</span>
        </div>
        <div className="flex items-center">
          <FiThumbsDown className="mr-1" />
          <span>{downvotes} downvotes</span>
        </div>
        <div className="flex items-center">
          <FiMessageSquare className="mr-1" />
          <span>{blog._count?.comments || 0} comments</span>
        </div>
      </div>

      {/* Comments section would go here */}
    </div>
  );
}
