import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { FiThumbsUp, FiThumbsDown, FiMessageSquare, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { Blog } from '@/api/forum';
import { useAuth } from '@/context/AuthContext';
import { useBlog } from '@/hooks/useBlog';

interface BlogItemProps {
  blog: Blog;
}

const BlogItem: React.FC<BlogItemProps> = ({ blog }) => {
  // Calculate vote counts
  const upvotes = blog.votes?.filter(vote => vote.type === 'UP').length || 0;
  const downvotes = blog.votes?.filter(vote => vote.type === 'DOWN').length || 0;
  
  // Format date
  const formattedDate = formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true });
  
  // State for save status
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { user } = useAuth();
  const { checkSaveStatus, saveBlogPost, unsaveBlogPost } = useBlog();

  useEffect(() => {
    // Check if the blog is saved by the current user
    const checkBlogSaveStatus = async () => {
      if (!user) {
        setIsSaved(false);
        return;
      }
      
      try {
        const saved = await checkSaveStatus(blog.id, user.id);
        setIsSaved(saved);
      } catch (error) {
        console.error("Error checking save status:", error);
        setIsSaved(false);
      }
    };
    
    checkBlogSaveStatus();
  }, [user, blog.id, checkSaveStatus]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (!user) {
      // User needs to be logged in to save
      alert("Please log in to save this blog");
      return;
    }
    
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveBlogPost(blog.id, user.id);
      } else {
        await saveBlogPost(blog.id, user.id);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error toggling save status:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="flex items-center">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs mr-2">
                {blog.category}
              </span>
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="focus:outline-none ml-2"
                aria-label={isSaved ? "Unsave blog" : "Save blog"}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-red-500 rounded-full animate-spin"></div>
                ) : isSaved ? (
                  <FaHeart className="text-red-500 hover:text-red-600 transition-colors" />
                ) : (
                  <FiHeart className="hover:text-red-500 transition-colors" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlogItem;
