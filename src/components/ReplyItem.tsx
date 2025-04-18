import React, { useState } from 'react';
import { Reply, ReplyVoteType } from '@/api/forum';
import { FiThumbsUp, FiThumbsDown, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface ReplyItemProps {
  reply: Reply;
  currentUserId?: string;
  onEdit: (replyId: string, newContent: string) => Promise<void>;
  onDelete: (replyId: string) => Promise<void>;
  onVote: (replyId: string, voteType: ReplyVoteType) => Promise<void>;
  userVote: 'UP' | 'DOWN' | null;
  voteCounts: { upvotes: number; downvotes: number; total: number };
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  currentUserId,
  onEdit,
  onDelete,
  onVote,
  userVote,
  voteCounts
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const isAuthor = currentUserId === reply.user.id;
  
  const formattedDate = reply.createdAt 
    ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })
    : 'recently';

  const handleEdit = async () => {
    if (editContent.trim() === '') return;
    
    try {
      await onEdit(reply.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update reply:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    setIsDeleting(true);
    try {
      await onDelete(reply.id);
    } catch (error) {
      console.error('Failed to delete reply:', error);
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
      await onVote(reply.id, { type: voteType });
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="py-3 pl-8 border-l-2 border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="bg-gradient-to-br from-gray-400 to-blue-400 p-0.5 rounded-full">
          {reply.user?.image ? (
            <img
              src={reply.user.image}
              alt={reply.user.name || 'User'}
              className="w-6 h-6 rounded-full border-2 border-white"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
              <FiUser className="text-gray-500 text-xs" />
            </div>
          )}
        </div>
        
        {/* Reply content */}
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
              {reply.user?.name || 'Anonymous User'}
            </h5>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {formattedDate}
            </span>
          </div>
          
          {isEditing ? (
            <div className="mt-2">
              <textarea
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                value={editContent}
                rows={2}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button 
                  className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                  onClick={handleEdit}
                >
                  Save
                </button>
                <button 
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs dark:bg-gray-600 dark:text-gray-200"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(reply.content);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-sm">{reply.content}</p>
          )}
          
          {/* Reply actions */}
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote('UP')}
                disabled={isVoting}
                className={`flex items-center px-1.5 py-0.5 rounded-full transition-all text-xs ${
                  userVote === 'UP'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Upvote reply"
              >
                <FiThumbsUp className={`mr-1 text-xs ${userVote === 'UP' ? 'fill-green-600 dark:fill-green-300' : ''}`} />
                <span className="text-xs">{voteCounts.upvotes}</span>
              </button>
              
              <button
                onClick={() => handleVote('DOWN')}
                disabled={isVoting}
                className={`flex items-center px-1.5 py-0.5 rounded-full transition-all text-xs ${
                  userVote === 'DOWN'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Downvote reply"
              >
                <FiThumbsDown className={`mr-1 text-xs ${userVote === 'DOWN' ? 'fill-red-600 dark:fill-red-300' : ''}`} />
                <span className="text-xs">{voteCounts.downvotes}</span>
              </button>
            </div>
            
            {isAuthor && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  disabled={isDeleting}
                >
                  <FiEdit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  disabled={isDeleting}
                >
                  {isDeleting ? 
                    <div className="w-3 h-3 border-t-2 border-red-500 rounded-full animate-spin"></div> :
                    <FiTrash2 className="w-3 h-3" />
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
