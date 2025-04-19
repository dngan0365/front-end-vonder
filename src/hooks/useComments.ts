import { useState, useCallback } from 'react';
import {
  BlogComment,
  CommentVoteType,
  ReplyVoteType,
  CreateCommentDto,
  UpdateCommentDto,
  CreateReplyDto,
  UpdateReplyDto,
  getBlogComments,
  createBlogComment,
  updateBlogComment,
  deleteBlogComment,
  voteComment,
  getCommentVoteSummary,
  getUserVoteOnComment,
  createReply,
  updateReply,
  deleteReply,
  voteReply,
  getReplyVoteSummary,
  getUserVoteOnReply
} from '@/api/forum';

interface UseCommentsReturn {
  comments: BlogComment[];
  isLoading: boolean;
  error: string | null;
  fetchComments: (blogId: string) => Promise<void>;
  addComment: (userId: string, commentData: CreateCommentDto) => Promise<BlogComment>;
  editComment: (commentId: string, userId: string, commentData: UpdateCommentDto) => Promise<void>;
  removeComment: (commentId: string, userId: string) => Promise<void>;
  voteOnComment: (commentId: string, userId: string, voteType: CommentVoteType) => Promise<void>;
  getCommentVotes: (commentId: string) => Promise<{ upvotes: number; downvotes: number; total: number }>;
  getUserCommentVote: (commentId: string, userId: string) => Promise<{ type: 'UP' | 'DOWN' | null }>;
  
  // New reply methods
  addReply: (userId: string, replyData: CreateReplyDto) => Promise<void>;
  editReply: (replyId: string, userId: string, replyData: UpdateReplyDto) => Promise<void>;
  removeReply: (replyId: string, userId: string) => Promise<void>;
  voteOnReply: (replyId: string, userId: string, voteType: ReplyVoteType) => Promise<void>;
  getReplyVotes: (replyId: string) => Promise<{ upvotes: number; downvotes: number; total: number }>;
  getUserReplyVote: (replyId: string, userId: string) => Promise<{ type: 'UP' | 'DOWN' | null }>;
}

export const useComments = (): UseCommentsReturn => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (blogId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBlogComments(blogId);
      setComments(data);
    } catch (err) {
      setError('Failed to fetch comments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(async (userId: string, commentData: CreateCommentDto): Promise<BlogComment> => {
    setIsLoading(true);
    setError(null);
    try {
      const newComment = await createBlogComment(userId, commentData);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      setError('Failed to create comment');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editComment = useCallback(async (commentId: string, userId: string, commentData: UpdateCommentDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedComment = await updateBlogComment(commentId, userId, commentData);
      setComments(prev => 
        prev.map(comment => comment.id === commentId ? updatedComment : comment)
      );
    } catch (err) {
      setError(`Failed to update comment with ID ${commentId}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComment = useCallback(async (commentId: string, userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteBlogComment(commentId, userId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError(`Failed to delete comment with ID ${commentId}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const voteOnComment = useCallback(async (commentId: string, userId: string, voteType: CommentVoteType) => {
    try {
      await voteComment(commentId, userId, voteType);
      // UI update will be handled in the component
    } catch (err) {
      setError(`Failed to vote on comment with ID ${commentId}`);
      console.error(err);
      throw err;
    }
  }, []);

  const getCommentVotes = useCallback(async (commentId: string) => {
    try {
      return await getCommentVoteSummary(commentId);
    } catch (err) {
      console.error(`Failed to get vote summary for comment with ID ${commentId}:`, err);
      return { upvotes: 0, downvotes: 0, total: 0 };
    }
  }, []);

  const getUserCommentVote = useCallback(async (commentId: string, userId: string) => {
    try {
      return await getUserVoteOnComment(commentId, userId);
    } catch (err) {
      console.error(`Failed to get user vote for comment with ID ${commentId}:`, err);
      return { type: null };
    }
  }, []);

  // Reply Methods
  const addReply = useCallback(async (userId: string, replyData: CreateReplyDto) => {
    try {
      const newReply = await createReply(userId, replyData);
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === replyData.commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        })
      );
    } catch (err) {
      setError('Failed to create reply');
      console.error(err);
      throw err;
    }
  }, []);

  const editReply = useCallback(async (replyId: string, userId: string, replyData: UpdateReplyDto) => {
    try {
      const updatedReply = await updateReply(replyId, userId, replyData);
      setComments(prev => 
        prev.map(comment => {
          if (comment.replies && comment.replies.some(r => r.id === replyId)) {
            return {
              ...comment,
              replies: comment.replies.map(r => 
                r.id === replyId ? updatedReply : r
              )
            };
          }
          return comment;
        })
      );
    } catch (err) {
      setError(`Failed to update reply with ID ${replyId}`);
      console.error(err);
      throw err;
    }
  }, []);

  const removeReply = useCallback(async (replyId: string, userId: string) => {
    try {
      await deleteReply(replyId, userId);
      setComments(prev => 
        prev.map(comment => {
          if (comment.replies && comment.replies.some(r => r.id === replyId)) {
            return {
              ...comment,
              replies: comment.replies.filter(r => r.id !== replyId)
            };
          }
          return comment;
        })
      );
    } catch (err) {
      setError(`Failed to delete reply with ID ${replyId}`);
      console.error(err);
      throw err;
    }
  }, []);

  const voteOnReply = useCallback(async (replyId: string, userId: string, voteType: ReplyVoteType) => {
    try {
      await voteReply(replyId, userId, voteType);
      // UI update will be handled in the component
    } catch (err) {
      setError(`Failed to vote on reply with ID ${replyId}`);
      console.error(err);
      throw err;
    }
  }, []);

  const getReplyVotes = useCallback(async (replyId: string) => {
    try {
      return await getReplyVoteSummary(replyId);
    } catch (err) {
      console.error(`Failed to get vote summary for reply with ID ${replyId}:`, err);
      return { upvotes: 0, downvotes: 0, total: 0 };
    }
  }, []);

  const getUserReplyVote = useCallback(async (replyId: string, userId: string) => {
    try {
      return await getUserVoteOnReply(replyId, userId);
    } catch (err) {
      console.error(`Failed to get user vote for reply with ID ${replyId}:`, err);
      return { type: null };
    }
  }, []);

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    addComment,
    editComment,
    removeComment,
    voteOnComment,
    getCommentVotes,
    getUserCommentVote,
    
    // New reply methods
    addReply,
    editReply,
    removeReply,
    voteOnReply,
    getReplyVotes,
    getUserReplyVote
  };
};
