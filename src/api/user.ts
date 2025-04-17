import axiosInstance from "./axiosInstance";

export interface UpdateUserProfileData {
  name?: string;
  image?: string;
}

export const updateUserProfile = async (userId: string, data: UpdateUserProfileData): Promise<{ 
  success: boolean; 
  data?: any; 
  error?: string 
}> => {
  try {
    const response = await axiosInstance.patch(`users/${userId}`, data);
    
    // Update user data in localStorage to reflect changes
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const updatedUser = { ...userData, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to update user in localStorage:", err);
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update profile'
    };
  }
};

export const getUserProfile = async (userId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const response = await axiosInstance.get(`users/${userId}`);
    console.log('User profile response:', response.data);
    
    // Update user data in localStorage with fresh data from server
    try {
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to update user in localStorage:", err);
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: 'Failed to get profile'
    };
  }
};
