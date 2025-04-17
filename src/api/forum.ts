import axiosInstance from "./axiosInstance";

// Blog Types
export interface BlogVoteType {
  type: 'UP' | 'DOWN';
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  _count?: {
    comments: number;
    votes: number;
  };
  votes?: { type: 'UP' | 'DOWN' }[];
  locations?: any[];
  comments?: any[];
}

export interface CreateBlogDto {
  title: string;
  content: string;
  category: string;
  image?: string;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  category?: string;
  image?: string;
  locationIds?: string[];
}

// Comment Types
export interface CommentVoteType {
  type: 'UP' | 'DOWN';
}

export interface BlogComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  replies?: Reply[];
  votes?: { type: 'UP' | 'DOWN' }[];
  _count?: {
    votes: number;
  };
}

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  votes?: { type: 'UP' | 'DOWN' }[];
  _count?: {
    votes: number;
  };
}

export interface CreateCommentDto {
  content: string;
  blogId: string;
}

export interface UpdateCommentDto {
  content: string;
}

// Reply Types
export interface ReplyVoteType {
  type: 'UP' | 'DOWN';
}

export interface CreateReplyDto {
  content: string;
  commentId: string;
}

export interface UpdateReplyDto {
  content: string;
}

// Blog API Functions
export const getAllBlogs = async () => {
  try {
    const response = await axiosInstance.get(`blogs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

export const getBlogById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    throw error;
  }
};

export const createBlog = async (userId: string, blogData: CreateBlogDto) => {
  console.log('Creating blog with data:', blogData);
  try {
    const response = await axiosInstance.post(`blogs/${userId}`, blogData);
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

export const updateBlog = async (id: string, userId: string, blogData: UpdateBlogDto) => {
  try {
    const response = await axiosInstance.put(`blogs/${id}/${userId}`, blogData);
    return response.data;
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw error;
  }
};

export const deleteBlog = async (id: string, userId: string) => {
  try {
    const response = await axiosInstance.delete(`blogs/${id}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    throw error;
  }
};

export const voteBlog = async (blogId: string, userId: string, voteData: BlogVoteType) => {
  try {
    const response = await axiosInstance.post(`blogs/${blogId}/vote/${userId}`, voteData);
    return response.data;
  } catch (error) {
    console.error(`Error voting on blog with ID ${blogId}:`, error);
    throw error;
  }
};

export const getBlogVoteSummary = async (blogId: string) => {
  try {
    const response = await axiosInstance.get(`blogs/${blogId}/votes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vote summary for blog with ID ${blogId}:`, error);
    throw error;
  }
};

export const getUserVoteOnBlog = async (blogId: string, userId: string) => {
  try {
    const response = await axiosInstance.get(`blogs/${blogId}/vote/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user vote for blog with ID ${blogId}:`, error);
    throw error;
  }
};

// Blog Comment API Functions
export const getBlogComments = async (blogId: string) => {
  try {
    const response = await axiosInstance.get(`blog-comments/blog/${blogId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for blog ${blogId}:`, error);
    throw error;
  }
};

export const createBlogComment = async (userId: string, commentData: CreateCommentDto) => {
  try {
    const response = await axiosInstance.post(`blog-comments/${userId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const updateBlogComment = async (commentId: string, userId: string, commentData: UpdateCommentDto) => {
  try {
    const response = await axiosInstance.put(`blog-comments/${commentId}/${userId}`, commentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment with ID ${commentId}:`, error);
    throw error;
  }
};

export const deleteBlogComment = async (commentId: string, userId: string) => {
  try {
    const response = await axiosInstance.delete(`blog-comments/${commentId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment with ID ${commentId}:`, error);
    throw error;
  }
};

export const voteComment = async (commentId: string, userId: string, voteData: CommentVoteType) => {
  try {
    const response = await axiosInstance.post(`blog-comments/${commentId}/vote/${userId}`, voteData);
    return response.data;
  } catch (error) {
    console.error(`Error voting on comment with ID ${commentId}:`, error);
    throw error;
  }
};

export const getCommentVoteSummary = async (commentId: string) => {
  try {
    const response = await axiosInstance.get(`blog-comments/${commentId}/votes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vote summary for comment with ID ${commentId}:`, error);
    throw error;
  }
};

export const getUserVoteOnComment = async (commentId: string, userId: string) => {
  try {
    const response = await axiosInstance.get(`blog-comments/${commentId}/vote/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user vote for comment with ID ${commentId}:`, error);
    throw error;
  }
};

// Reply API Functions
export const createReply = async (userId: string, replyData: CreateReplyDto) => {
  try {
    const response = await axiosInstance.post(`replies/${userId}`, replyData);
    return response.data;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

export const updateReply = async (replyId: string, userId: string, replyData: UpdateReplyDto) => {
  try {
    const response = await axiosInstance.put(`replies/${replyId}/${userId}`, replyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating reply with ID ${replyId}:`, error);
    throw error;
  }
};

export const deleteReply = async (replyId: string, userId: string) => {
  try {
    const response = await axiosInstance.delete(`replies/${replyId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting reply with ID ${replyId}:`, error);
    throw error;
  }
};

export const voteReply = async (replyId: string, userId: string, voteData: ReplyVoteType) => {
  try {
    const response = await axiosInstance.post(`replies/${replyId}/vote/${userId}`, voteData);
    return response.data;
  } catch (error) {
    console.error(`Error voting on reply with ID ${replyId}:`, error);
    throw error;
  }
};

export const getReplyVoteSummary = async (replyId: string) => {
  try {
    const response = await axiosInstance.get(`replies/${replyId}/votes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vote summary for reply with ID ${replyId}:`, error);
    throw error;
  }
};

export const getUserVoteOnReply = async (replyId: string, userId: string) => {
  try {
    const response = await axiosInstance.get(`replies/${replyId}/vote/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user vote for reply with ID ${replyId}:`, error);
    throw error;
  }
};
