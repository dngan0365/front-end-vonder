import axiosInstance from "./axiosInstance";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const uploadImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('images', file);

    // Direct axios request with proper form data submission
    const response = await axiosInstance.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });


    // Ensure response structure matches what the TinyMCE editor expects
    if (response && response.data) {
      // Primary case: Server returns an array of string URLs
      if (Array.isArray(response.data) && response.data.length > 0 && typeof response.data[0] === 'string') {
        return {
          success: true,
          url: response.data[0]
        };
      }
      // If response.data contains a url property directly
      if (response.data.url) {
        return {
          success: true,
          url: response.data.url
        };
      } 
      // If server returns data in an array format
      else if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].url) {
        return {
          success: true,
          url: response.data[0].url
        };
      } 
      // If server wraps the response in a data property
      else if (response.data.data && response.data.data.url) {
        return {
          success: true,
          url: response.data.data.url
        };
      }
      // Additional check for nested data structures
      else if (response.data.images && Array.isArray(response.data.images) && response.data.images.length > 0) {
        if (typeof response.data.images[0] === 'string') {
          return {
            success: true,
            url: response.data.images[0]
          };
        } else if (response.data.images[0].url) {
          return {
            success: true, 
            url: response.data.images[0].url
          };
        }
      }
      
      // Instead of returning an error immediately, log the structure and return a more helpful error
      console.error('Unexpected response structure:', response.data);
      return {
        success: false,
        error: `Invalid response format from server. Expected a URL but received: ${JSON.stringify(response.data)}`,
        url: JSON.stringify(response.data) // For debugging
      };
    }

    return {
      success: false,
      error: 'No data returned from server'
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}