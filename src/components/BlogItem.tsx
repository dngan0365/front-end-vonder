import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';
import { Blog } from '@/api/forum';

interface BlogItemProps {
  blog: Blog;
}

const BlogItem: React.FC<BlogItemProps> = ({ blog }) => {
  // Calculate vote counts
  const upvotes = blog.votes?.filter(vote => vote.type === 'UP').length || 0;
  const downvotes = blog.votes?.filter(vote => vote.type === 'DOWN').length || 0;
  const voteTotal = upvotes - downvotes;

  // Format date
  const formattedDate = formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <Link href={`/forum/${blog.id}`}>
        <div className="cursor-pointer">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{blog.title}</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {blog.author.image ? (
                <div className="relative w-8 h-8 mr-2">
                  <Image
                    src={blog.author.image}
                    alt={blog.author.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-gray-200 dark:bg-gray-600 w-8 h-8 rounded-full mr-2 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {blog.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-300">{blog.author.name}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FiThumbsUp className="mr-1" />
                <span>{upvotes}</span>
              </div>
              <div className="flex items-center">
                <FiThumbsDown className="mr-1" />
                <span>{downvotes}</span>
              </div>
              <div className="flex items-center">
                <FiMessageSquare className="mr-1" />
                <span>{blog._count?.comments || 0}</span>
              </div>
            </div>
            <div>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">
                {blog.category}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlogItem;
