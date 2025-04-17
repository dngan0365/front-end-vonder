'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiTag, FiThumbsUp, FiThumbsDown, FiMessageSquare, FiUser, FiSend } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { Blog, BlogVoteType, CreateReplyDto, ReplyVoteType } from '@/api/forum';
import { useBlog } from '@/hooks/useBlog';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/context/AuthContext';
import CommentItem from '@/components/CommentItem';

export default function BlogPostDetail() {
  const params = useParams();
  const blogId = params.id as string;
  const { user } = useAuth();
  const userId = user?.id;

  const { blog, isLoading, error, fetchBlogById, voteBlogPost, getUserVote } = useBlog();
  const { 
    comments, 
    isLoading: commentsLoading,
    error: commentsError,
    fetchComments,
    addComment,
    editComment,
    removeComment,
    voteOnComment,
    getCommentVotes,
    getUserCommentVote,
    addReply,
    editReply,
    removeReply,
    voteOnReply,
    getReplyVotes,
    getUserReplyVote
  } = useComments();
  
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null);
  const [userVoteLoading, setUserVoteLoading] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [commentVotesMap, setCommentVotesMap] = useState<Record<string, { upvotes: number; downvotes: number; total: number }>>({}); 
  const [userCommentVotesMap, setUserCommentVotesMap] = useState<Record<string, 'UP' | 'DOWN' | null>>({});
  
  // Reply state
  const [replyVotesMap, setReplyVotesMap] = useState<Record<string, { upvotes: number; downvotes: number; total: number }>>({});
  const [userReplyVotesMap, setUserReplyVotesMap] = useState<Record<string, 'UP' | 'DOWN' | null>>({});

  const [localVoteCounts, setLocalVoteCounts] = useState<{
    upvotes: number;
    downvotes: number;
  }>({ upvotes: 0, downvotes: 0 });

  useEffect(() => {
    if (blogId) {
      fetchBlogById(blogId);
      fetchComments(blogId);
    }
  }, [blogId, fetchBlogById, fetchComments]);

  useEffect(() => {
    if (blog) {
      const up = blog.votes?.filter(vote => vote.type === 'UP').length || 0;
      const down = blog.votes?.filter(vote => vote.type === 'DOWN').length || 0;
      setLocalVoteCounts({ upvotes: up, downvotes: down });
    }
  }, [blog]);

  useEffect(() => {
    async function getUserVoteStatus() {
      if (blogId && userId) {
        setUserVoteLoading(true);
        try {
          const { type } = await getUserVote(blogId, userId);
          setUserVote(type);
          console.log('User vote fetched:', type);
        } catch (err) {
          console.error('Error fetching user vote:', err);
        } finally {
          setUserVoteLoading(false);
        }
      }
    }

    if (userId) {
      getUserVoteStatus();
    } else {
      setUserVote(null);
    }
  }, [blogId, userId, getUserVote]);

  // Fetch votes for each comment
  useEffect(() => {
    async function fetchCommentVotes() {
      if (!comments.length || !blogId) return;
      
      // Create a copy of the current votes map
      const votesMap: Record<string, { upvotes: number; downvotes: number; total: number }> = { ...commentVotesMap };
      
      // Fetch votes for each comment
      for (const comment of comments) {
        try {
          const votes = await getCommentVotes(comment.id);
          votesMap[comment.id] = votes;
        } catch (err) {
          console.error(`Failed to get votes for comment ${comment.id}:`, err);
          votesMap[comment.id] = { upvotes: 0, downvotes: 0, total: 0 };
        }
      }
      
      setCommentVotesMap(votesMap);
    }
    
    fetchCommentVotes();
  }, [comments, blogId, getCommentVotes]);
  
  // Fetch current user's votes on comments
  useEffect(() => {
    async function fetchUserCommentVotes() {
      if (!comments.length || !userId) return;
      
      const userVotesMap: Record<string, 'UP' | 'DOWN' | null> = { ...userCommentVotesMap };
      
      for (const comment of comments) {
        try {
          const { type } = await getUserCommentVote(comment.id, userId);
          userVotesMap[comment.id] = type;
        } catch (err) {
          console.error(`Failed to get user vote for comment ${comment.id}:`, err);
          userVotesMap[comment.id] = null;
        }
      }
      
      setUserCommentVotesMap(userVotesMap);
    }
    
    if (userId) {
      fetchUserCommentVotes();
    } else {
      // Reset all user votes if not logged in
      const emptyUserVotes: Record<string, null> = {};
      comments.forEach(comment => {
        emptyUserVotes[comment.id] = null;
      });
      setUserCommentVotesMap(emptyUserVotes);
    }
  }, [comments, userId, getUserCommentVote]);

  // Fetch votes for each reply
  useEffect(() => {
    async function fetchReplyVotes() {
      if (!comments.length) return;
      
      const votesMap: Record<string, { upvotes: number; downvotes: number; total: number }> = { ...replyVotesMap };
      
      for (const comment of comments) {
        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            if (!votesMap[reply.id]) {
              try {
                const votes = await getReplyVotes(reply.id);
                votesMap[reply.id] = votes;
              } catch (err) {
                console.error(`Failed to get votes for reply ${reply.id}:`, err);
                votesMap[reply.id] = { upvotes: 0, downvotes: 0, total: 0 };
              }
            }
          }
        }
      }
      
      setReplyVotesMap(votesMap);
    }
    
    fetchReplyVotes();
  }, [comments, getReplyVotes]);
  
  // Fetch current user's votes on replies
  useEffect(() => {
    async function fetchUserReplyVotes() {
      if (!comments.length || !userId) return;
      
      const userVotesMap: Record<string, 'UP' | 'DOWN' | null> = { ...userReplyVotesMap };
      
      for (const comment of comments) {
        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            try {
              const { type } = await getUserReplyVote(reply.id, userId);
              userVotesMap[reply.id] = type;
            } catch (err) {
              console.error(`Failed to get user vote for reply ${reply.id}:`, err);
              userVotesMap[reply.id] = null;
            }
          }
        }
      }
      
      setUserReplyVotesMap(userVotesMap);
    }
    
    if (userId) {
      fetchUserReplyVotes();
    } else {
      // Reset all user votes if not logged in
      const emptyUserVotes: Record<string, null> = {};
      comments.forEach(comment => {
        if (comment.replies) {
          comment.replies.forEach(reply => {
            emptyUserVotes[reply.id] = null;
          });
        }
      });
      setUserReplyVotesMap(emptyUserVotes);
    }
  }, [comments, userId, getUserReplyVote]);

  const handleVote = async (voteType: 'UP' | 'DOWN') => {
    if (!userId) {
      alert('Please sign in to vote');
      return;
    }

    const previousVote = userVote;
    const previousCounts = { ...localVoteCounts };

    const isRemovingVote = userVote === voteType;
    const isChangingVote = userVote !== null && userVote !== voteType;

    setLocalVoteCounts(prev => {
      const newCounts = { ...prev };

      if (isRemovingVote) {
        if (voteType === 'UP') newCounts.upvotes = Math.max(0, newCounts.upvotes - 1);
        else newCounts.downvotes = Math.max(0, newCounts.downvotes - 1);
      } else if (isChangingVote) {
        if (voteType === 'UP') {
          newCounts.upvotes += 1;
          newCounts.downvotes = Math.max(0, newCounts.downvotes - 1);
        } else {
          newCounts.downvotes += 1;
          newCounts.upvotes = Math.max(0, newCounts.upvotes - 1);
        }
      } else {
        if (voteType === 'UP') newCounts.upvotes += 1;
        else newCounts.downvotes += 1;
      }

      return newCounts;
    });

    setUserVote(isRemovingVote ? null : voteType);

    try {
      const newVoteType: BlogVoteType = { type: voteType };
      await voteBlogPost(blogId, userId, newVoteType);
    } catch (error) {
      console.error('Error voting:', error);
      setUserVote(previousVote);
      setLocalVoteCounts(previousCounts);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Please sign in to comment');
      return;
    }
    
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      await addComment(userId, {
        blogId,
        content: commentText.trim()
      });
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!userId) return;
    
    try {
      await editComment(commentId, userId, { content: newContent });
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error; // let the component handle the error
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!userId) return;
    
    try {
      await removeComment(commentId, userId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };
  
  const handleVoteComment = async (commentId: string, voteType: { type: 'UP' | 'DOWN' }) => {
    if (!userId) {
      alert('Please sign in to vote');
      return;
    }
    
    // Get the current vote
    const currentVote = userCommentVotesMap[commentId] || null;
    const currentVoteCounts = commentVotesMap[commentId] || { upvotes: 0, downvotes: 0, total: 0 };
    
    // Optimistically update UI
    const isRemovingVote = currentVote === voteType.type;
    const isChangingVote = currentVote !== null && currentVote !== voteType.type;
    
    // Update user vote map optimistically
    setUserCommentVotesMap(prev => ({
      ...prev,
      [commentId]: isRemovingVote ? null : voteType.type
    }));
    
    // Update vote counts optimistically
    setCommentVotesMap(prev => {
      const newCounts = { 
        ...prev[commentId] || { upvotes: 0, downvotes: 0, total: 0 }
      };
      
      if (isRemovingVote) {
        // Removing a vote
        if (voteType.type === 'UP') newCounts.upvotes = Math.max(0, newCounts.upvotes - 1);
        else newCounts.downvotes = Math.max(0, newCounts.downvotes - 1);
        newCounts.total = Math.max(0, newCounts.total - 1);
      } else if (isChangingVote) {
        // Changing vote direction
        if (voteType.type === 'UP') {
          newCounts.upvotes += 1;
          newCounts.downvotes = Math.max(0, newCounts.downvotes - 1);
        } else {
          newCounts.downvotes += 1;
          newCounts.upvotes = Math.max(0, newCounts.upvotes - 1);
        }
      } else {
        // New vote
        if (voteType.type === 'UP') newCounts.upvotes += 1;
        else newCounts.downvotes += 1;
        newCounts.total += 1;
      }
      
      return {
        ...prev,
        [commentId]: newCounts
      };
    });
    
    try {
      await voteOnComment(commentId, userId, voteType);
    } catch (error) {
      console.error('Error voting on comment:', error);
      // Revert optimistic updates on failure
      setUserCommentVotesMap(prev => ({
        ...prev,
        [commentId]: currentVote
      }));
      
      setCommentVotesMap(prev => ({
        ...prev,
        [commentId]: currentVoteCounts
      }));
      
      throw error;
    }
  };

  const handleReply = async (userId: string, replyData: CreateReplyDto) => {
    try {
      await addReply(userId, replyData);
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  };
  
  const handleEditReply = async (replyId: string, userId: string, content: string) => {
    try {
      await editReply(replyId, userId, { content });
    } catch (error) {
      console.error('Error editing reply:', error);
      throw error;
    }
  };
  
  const handleDeleteReply = async (replyId: string, userId: string) => {
    try {
      await removeReply(replyId, userId);
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  };
  
  const handleVoteReply = async (replyId: string, userId: string, voteType: ReplyVoteType) => {
    if (!userId) {
      alert('Please sign in to vote');
      return;
    }
    
    // Get the current vote
    const currentVote = userReplyVotesMap[replyId] || null;
    const currentVoteCounts = replyVotesMap[replyId] || { upvotes: 0, downvotes: 0, total: 0 };
    
    // Optimistically update UI
    const isRemovingVote = currentVote === voteType.type;
    const isChangingVote = currentVote !== null && currentVote !== voteType.type;
    
    // Update user vote map optimistically
    setUserReplyVotesMap(prev => ({
      ...prev,
      [replyId]: isRemovingVote ? null : voteType.type
    }));
    
    // Update vote counts optimistically
    setReplyVotesMap(prev => {
      const newCounts = { 
        ...prev[replyId] || { upvotes: 0, downvotes: 0, total: 0 }
      };
      
      if (isRemovingVote) {
        // Removing a vote
        if (voteType.type === 'UP') newCounts.upvotes = Math.max(0, newCounts.upvotes - 1);
        else newCounts.downvotes = Math.max(0, newCounts.downvotes - 1);
        newCounts.total = newCounts.upvotes - newCounts.downvotes;
      } else if (isChangingVote) {
        // Changing vote direction
        if (voteType.type === 'UP') {
          newCounts.upvotes += 1;
          newCounts.downvotes = Math.max(0, newCounts.downvotes - 1);
        } else {
          newCounts.downvotes += 1;
          newCounts.upvotes = Math.max(0, newCounts.upvotes - 1);
        }
        newCounts.total = newCounts.upvotes - newCounts.downvotes;
      } else {
        // New vote
        if (voteType.type === 'UP') newCounts.upvotes += 1;
        else newCounts.downvotes += 1;
        newCounts.total = newCounts.upvotes - newCounts.downvotes;
      }
      
      return {
        ...prev,
        [replyId]: newCounts
      };
    });
    
    try {
      await voteOnReply(replyId, userId, voteType);
    } catch (error) {
      console.error('Error voting on reply:', error);
      // Revert optimistic updates on failure
      setUserReplyVotesMap(prev => ({
        ...prev,
        [replyId]: currentVote
      }));
      
      setReplyVotesMap(prev => ({
        ...prev,
        [replyId]: currentVoteCounts
      }));
      
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
            <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-t-4 border-blue-400 animate-pulse opacity-40"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your travel story...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load blog post</h2>
          <p className="text-red-600">{error || 'Blog post not found'}</p>
        </div>
        <Link href="/forum" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
          <FiArrowLeft className="mr-2" /> Back to forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Link href="/forum" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium mb-6 group">
        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to forum
      </Link>

      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8 md:p-10">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <FiTag className="mr-1" /> {blog.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">{blog.title}</h1>

          {/* Author and Date */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-400 to-teal-400 p-0.5 rounded-full">
                {blog.author?.image ? (
                  <img
                    src={blog.author.image}
                    alt={blog.author.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                    <FiUser className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <span className="font-medium text-gray-800 dark:text-gray-200">{blog.author?.name}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Travel Enthusiast</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiCalendar className="mr-2 text-gray-400" />
              <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : ''}</span>
            </div>
          </div>

          {/* Main Content */}
          <div 
            className="prose max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Voting Section */}
        <div className="bg-gray-50 dark:bg-gray-750 px-8 md:px-10 py-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleVote('UP')}
                disabled={isLoading || userVoteLoading}
                className={`flex items-center px-4 py-2 rounded-full transition-all ${
                  userVote === 'UP'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Upvote"
              >
                <FiThumbsUp className={`mr-2 ${userVote === 'UP' ? 'fill-green-600 dark:fill-green-300' : ''}`} />
                <span className="font-medium">{localVoteCounts.upvotes}</span>
              </button>
              
              <button
                onClick={() => handleVote('DOWN')}
                disabled={isLoading || userVoteLoading}
                className={`flex items-center px-4 py-2 rounded-full transition-all ${
                  userVote === 'DOWN'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Downvote"
              >
                <FiThumbsDown className={`mr-2 ${userVote === 'DOWN' ? 'fill-red-600 dark:fill-red-300' : ''}`} />
                <span className="font-medium">{localVoteCounts.downvotes}</span>
              </button>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
              <FiMessageSquare className="mr-2" />
              <span className="font-medium">{comments.length} comments</span>
            </div>
          </div>

          {userVoteLoading && (
            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <div className="w-3 h-3 rounded-full border-t-2 border-blue-500 animate-spin mr-2"></div>
              Loading vote status...
            </div>
          )}

          {!userId && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-750 border border-blue-100 dark:border-gray-600 rounded-lg text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-3">Join the conversation and share your thoughts</p>
              <Link 
                href="/signin" 
                className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Sign in to vote & comment
              </Link>
            </div>
          )}
        </div>
        
        {/* Comments Section */}
        <div className="px-8 md:px-10 py-8 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Comments</h3>
          
          {/* Comment Form */}
          {userId && (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-400 to-teal-400 p-0.5 rounded-full">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name || ''}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                        <FiUser className="text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    placeholder="Share your thoughts..."
                    value={commentText}
                    rows={3}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={submittingComment}
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors hover:bg-blue-700"
                    >
                      {submittingComment ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2" />
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Comments List */}
          <div className="space-y-2">
            {commentsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-600 dark:text-gray-300">Loading comments...</span>
                </div>
              </div>
            ) : comments.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.id}
                    comment={comment}
                    currentUserId={userId}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    onVote={handleVoteComment}
                    userVote={userCommentVotesMap[comment.id] || null}
                    voteCounts={commentVotesMap[comment.id] || { upvotes: 0, downvotes: 0, total: 0 }}
                    onReply={handleReply}
                    onEditReply={handleEditReply}
                    onDeleteReply={handleDeleteReply}
                    onVoteReply={handleVoteReply}
                    replyVotes={replyVotesMap}
                    userReplyVotes={userReplyVotesMap}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FiMessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No comments yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {userId ? 'Be the first to start this conversation!' : 'Sign in to start the conversation'}
                </p>
              </div>
            )}
            
            {commentsError && (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <p className="text-red-600 dark:text-red-400">Failed to load comments. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
