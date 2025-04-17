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
