import React, { useState, useEffect } from 'react';
import { BlogComment, CommentVoteType, ReplyVoteType, Reply, CreateReplyDto } from '@/api/forum';
import { FiThumbsUp, FiThumbsDown, FiEdit2, FiTrash2, FiUser, FiCornerDownRight, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import ReplyItem from './ReplyItem';

interface CommentItemProps {
  comment: BlogComment;
  currentUserId?: string;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onVote: (commentId: string, voteType: CommentVoteType) => Promise<void>;
  userVote: 'UP' | 'DOWN' | null;
  voteCounts: { upvotes: number; downvotes: number; total: number };
  
  // New reply props
  onReply: (userId: string, replyData: CreateReplyDto) => Promise<void>;
  onEditReply: (replyId: string, userId: string, content: string) => Promise<void>;
  onDeleteReply: (replyId: string, userId: string) => Promise<void>;
  onVoteReply: (replyId: string, userId: string, voteType: ReplyVoteType) => Promise<void>;
  replyVotes: Record<string, { upvotes: number; downvotes: number; total: number }>;
  userReplyVotes: Record<string, 'UP' | 'DOWN' | null>;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onVote,
  userVote,
  voteCounts,
  onReply,
  onEditReply,
  onDeleteReply,
  onVoteReply,
  replyVotes,
  userReplyVotes
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  
  const isAuthor = currentUserId === comment.user.id;
  const replies = comment.replies || [];
  
  const formattedDate = comment.createdAt 
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : 'recently';

  const handleEdit = async () => {
    if (editContent.trim() === '') return;
    
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setIsDeleting(false);
    }
  };

  const handleVote = async (voteType: 'UP' | 'DOWN') => {
    if (!currentUserId) {
      alert('Please sign in to vote');
      return;
    }
    
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(comment.id, { type: voteType });
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleReplySubmit = async () => {
    if (!currentUserId || !replyContent.trim()) return;
    
    setIsSubmittingReply(true);
    try {
      await onReply(currentUserId, {
        commentId: comment.id,
        content: replyContent.trim()
      });
      setReplyContent('');
      setShowReplyForm(false);
      setShowReplies(true); // Show replies after adding a new one
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="bg-gradient-to-br from-blue-400 to-teal-400 p-0.5 rounded-full">
          {comment.user?.image ? (
            <img
              src={comment.user.image}
              alt={comment.user.name || 'User'}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
              <FiUser className="text-gray-500" />
            </div>
          )}
        </div>
        
        {/* Comment content */}
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">
              {comment.user?.name || 'Anonymous User'}
            </h4>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {formattedDate}
            </span>
          </div>
          
          {isEditing ? (
            <div className="mt-2">
              <textarea
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                value={editContent}
                rows={3}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  onClick={handleEdit}
                >
                  Save
                </button>
                <button 
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm dark:bg-gray-600 dark:text-gray-200"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
          )}
          
          {/* Comment actions */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote('UP')}
                disabled={isVoting}
                className={`flex items-center px-2 py-1 rounded-full transition-all text-xs ${
                  userVote === 'UP'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Upvote comment"
              >
                <FiThumbsUp className={`mr-1 ${userVote === 'UP' ? 'fill-green-600 dark:fill-green-300' : ''}`} />
                <span>{voteCounts.upvotes}</span>
              </button>
              
              <button
                onClick={() => handleVote('DOWN')}
                disabled={isVoting}
                className={`flex items-center px-2 py-1 rounded-full transition-all text-xs ${
                  userVote === 'DOWN'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Downvote comment"
              >
                <FiThumbsDown className={`mr-1 ${userVote === 'DOWN' ? 'fill-red-600 dark:fill-red-300' : ''}`} />
                <span>{voteCounts.downvotes}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {currentUserId && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-xs"
                >
                  <FiCornerDownRight className="mr-1" />
                  Reply
                </button>
              )}
              
              {replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-xs"
                >
                  <FiMessageSquare className="mr-1" />
                  {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
            
            {isAuthor && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  disabled={isDeleting}
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  disabled={isDeleting}
                >
                  {isDeleting ? 
                    <div className="w-4 h-4 border-t-2 border-red-500 rounded-full animate-spin"></div> :
                    <FiTrash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            )}
          </div>
          
          {/* Reply Form */}
          {showReplyForm && currentUserId && (
            <div className="mt-3 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
              <textarea
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 text-sm"
                placeholder="Write a reply..."
                value={replyContent}
                rows={2}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button 
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs dark:bg-gray-600 dark:text-gray-200"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                  onClick={handleReplySubmit}
                  disabled={isSubmittingReply || !replyContent.trim()}
                >
                  {isSubmittingReply ? 
                    <div className="w-3 h-3 border-t-2 border-white rounded-full animate-spin mx-1"></div> :
                    'Reply'
                  }
                </button>
              </div>
            </div>
          )}
          
          {/* Replies List */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map(reply => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onEdit={(replyId, content) => onEditReply(replyId, currentUserId || '', content)}
                  onDelete={(replyId) => onDeleteReply(replyId, currentUserId || '')}
                  onVote={(replyId, voteType) => onVoteReply(replyId, currentUserId || '', voteType)}
                  userVote={userReplyVotes[reply.id] || null}
                  voteCounts={replyVotes[reply.id] || { upvotes: 0, downvotes: 0, total: 0 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
