import axiosInstance from './axiosInstance'; // Assuming you have axios configured

export interface DashboardStats {
  totalUsers: number;
  totalTours: number;
  totalBookings: number;
  totalRevenue: number;
  totalLocations: number;
  totalBlogs: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeAgencies: number;
}

export interface MonthlyData {
  month: number;
  monthName: string;
  count?: number;
  revenue?: number;
}

export interface LocationCategory {
  category: string;
  count: number;
}

export interface TopLocation {
  id: string;
  name: string;
  province: string;
  category: string;
  totalEngagement: number;
  _count: {
    favorites: number;
    trips: number;
    tours: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'tour_booking' | 'blog_post' | 'tour_creation';
  title: string;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  try {
    const response = await axiosInstance.get('/dashboard/stats');
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch dashboard stats'
    };
  }
};

// Get monthly user statistics
export const getUsersMonthlyStats = async (year?: number): Promise<ApiResponse<MonthlyData[]>> => {
  try {
    const params = year ? { year: year.toString() } : {};
    const response = await axiosInstance.get('/dashboard/users/monthly', { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching users monthly stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch users monthly stats'
    };
  }
};

// Get monthly tour statistics
export const getToursMonthlyStats = async (year?: number): Promise<ApiResponse<MonthlyData[]>> => {
  try {
    const params = year ? { year: year.toString() } : {};
    const response = await axiosInstance.get('/dashboard/tours/monthly', { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching tours monthly stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch tours monthly stats'
    };
  }
};

// Get monthly booking statistics
export const getBookingsMonthlyStats = async (year?: number): Promise<ApiResponse<MonthlyData[]>> => {
  try {
    const params = year ? { year: year.toString() } : {};
    const response = await axiosInstance.get('/dashboard/bookings/monthly', { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching bookings monthly stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch bookings monthly stats'
    };
  }
};

// Get monthly revenue statistics
export const getRevenueMonthlyStats = async (year?: number): Promise<ApiResponse<MonthlyData[]>> => {
  try {
    const params = year ? { year: year.toString() } : {};
    const response = await axiosInstance.get('/dashboard/revenue/monthly', { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching revenue monthly stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch revenue monthly stats'
    };
  }
};

// Get locations by category
export const getLocationsByCategory = async (): Promise<ApiResponse<LocationCategory[]>> => {
  try {
    const response = await axiosInstance.get('/dashboard/locations/by-category');
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching locations by category:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch locations by category'
    };
  }
};

// Get top locations
export const getTopLocations = async (limit: number = 10): Promise<ApiResponse<TopLocation[]>> => {
  try {
    const response = await axiosInstance.get('/dashboard/top-locations', {
      params: { limit: limit.toString() }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching top locations:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch top locations'
    };
  }
};

// Get recent activities
export const getRecentActivities = async (limit: number = 20): Promise<ApiResponse<RecentActivity[]>> => {
  try {
    const response = await axiosInstance.get('/dashboard/recent-activities', {
      params: { limit: limit.toString() }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching recent activities:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch recent activities'
    };
  }
};