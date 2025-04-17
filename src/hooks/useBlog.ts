import { useState, useEffect, useCallback } from 'react';
import {
  Blog,
  BlogVoteType,
  CreateBlogDto,
  UpdateBlogDto,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  voteBlog,
  getBlogVoteSummary,
  getUserVoteOnBlog
} from '@/api/forum';

interface UseBlogReturn {
  blogs: Blog[];
  blog: Blog | null;
  isLoading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  fetchBlogById: (id: string) => Promise<void>;
  addBlog: (userId: string, blogData: CreateBlogDto) => Promise<void>;
  editBlog: (id: string, userId: string, blogData: UpdateBlogDto) => Promise<void>;
  removeBlog: (id: string, userId: string) => Promise<void>;
  voteBlogPost: (blogId: string, userId: string, voteType: BlogVoteType) => Promise<void>;
  getVoteSummary: (blogId: string) => Promise<{ upvotes: number; downvotes: number; total: number }>;
  getUserVote: (blogId: string, userId: string) => Promise<{ type: 'UP' | 'DOWN' | null }>;
}

export const useBlog = (): UseBlogReturn => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllBlogs();
      setBlogs(data);
    } catch (err) {
      setError('Failed to fetch blogs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBlogById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBlogById(id);
      setBlog(data);
    } catch (err) {
      setError(`Failed to fetch blog with ID ${id}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBlog = useCallback(async (userId: string, blogData: CreateBlogDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newBlog = await createBlog(userId, blogData);
      setBlogs(prev => [newBlog, ...prev]);
    } catch (err) {
      setError('Failed to create blog');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editBlog = useCallback(async (id: string, userId: string, blogData: UpdateBlogDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedBlog = await updateBlog(id, userId, blogData);
      setBlogs(prev => prev.map(blog => blog.id === id ? updatedBlog : blog));
      if (blog && blog.id === id) {
        setBlog(updatedBlog);
      }
    } catch (err) {
      setError(`Failed to update blog with ID ${id}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [blog]);

  const removeBlog = useCallback(async (id: string, userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteBlog(id, userId);
      setBlogs(prev => prev.filter(blog => blog.id !== id));
      if (blog && blog.id === id) {
        setBlog(null);
      }
    } catch (err) {
      setError(`Failed to delete blog with ID ${id}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [blog]);

  const voteBlogPost = useCallback(async (blogId: string, userId: string, voteType: BlogVoteType) => {
    try {
      await voteBlog(blogId, userId, voteType);
      // Don't automatically refetch blog anymore to prevent reload
      // We'll handle UI updates in the component directly
      // Successfully voted, no return value needed
    } catch (err) {
      setError(`Failed to vote on blog with ID ${blogId}`);
      console.error(err);
      throw err;
    }
  }, []);

  const getVoteSummary = useCallback(async (blogId: string) => {
    try {
      return await getBlogVoteSummary(blogId);
    } catch (err) {
      console.error(`Failed to get vote summary for blog with ID ${blogId}:`, err);
      return { upvotes: 0, downvotes: 0, total: 0 };
    }
  }, []);

  const getUserVote = useCallback(async (blogId: string, userId: string) => {
    try {
      return await getUserVoteOnBlog(blogId, userId);
    } catch (err) {
      console.error(`Failed to get user vote for blog with ID ${blogId}:`, err);
      return { type: null };
    }
  }, []);

  return {
    blogs,
    blog,
    isLoading,
    error,
    fetchBlogs,
    fetchBlogById,
    addBlog,
    editBlog,
    removeBlog,
    voteBlogPost,
    getVoteSummary,
    getUserVote
  };
};
