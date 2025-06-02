'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, MapPin, Calendar, BookOpen, Plane, TrendingUp, Activity, Globe } from 'lucide-react';

// Import your actual API functions
import { getAllLocations } from '@/api/location';
import { getAllEvents } from '@/api/event';
import { getAllTrips } from '@/api/trip';
import { getAllUsers } from '@/api/user';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    users: [],
    locations: [],
    events: [],
    trips: [],
    loading: true
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLocations: 0,
    totalEvents: 0,
    totalTrips: 0,
    userGrowth: [],
    locationsByCategory: [],
    locationsByProvince: [],
    monthlyActivity: []
  });

  // Function to fetch all paginated data
  const fetchAllPaginatedData = async (fetchFunction, params = {}) => {
    let allData = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await fetchFunction({ ...params, page: currentPage, limit: 100 });
        
        if (response && response.data) {
          allData = [...allData, ...response.data];
          
          // Check if there's more data
          if (response.pagination) {
            hasMore = response.pagination.hasNextPage;
            currentPage++;
          } else {
            // If no pagination info, assume we got all data
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error fetching paginated data:', error);
        hasMore = false;
      }
    }

    return allData;
  };

  // Function to fetch all trips (different structure)
  const fetchAllTrips = async () => {
    try {
      // Try to get a large number first
      const trips = await getAllTrips({ take: 10000 });
      return trips || [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true }));
        
        // Fetch all data with proper pagination handling
        const [usersRes, locations, events, trips] = await Promise.all([
          getAllUsers(),
          fetchAllPaginatedData(getAllLocations),
          fetchAllPaginatedData(getAllEvents),
          fetchAllTrips()
        ]);

        // Handle your API response structures
        const users = usersRes.success ? usersRes.data : [];

        console.log('Dashboard data fetched:', {
          usersCount: users.length,
          locationsCount: locations.length,
          eventsCount: events.length,
          tripsCount: trips.length
        });

        setDashboardData({
          users,
          locations,
          events,
          trips,
          loading: false
        });

        // Process data for charts
        processChartData(users, locations, events, trips);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const processChartData = (users, locations, events, trips) => {
    console.log('Processing chart data:', { users: users.length, locations: locations.length, events: events.length, trips: trips.length });

    // User growth over months
    const userGrowthData = {};
    users.forEach(user => {
      try {
        const date = new Date(user.createdAt);
        if (!isNaN(date.getTime())) {
          const month = date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
          userGrowthData[month] = (userGrowthData[month] || 0) + 1;
        }
      } catch (error) {
        console.error('Error processing user date:', error);
      }
    });

    const userGrowth = Object.entries(userGrowthData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({ month, users: count }));

    // Locations by category
    const categoryData = {};
    locations.forEach(location => {
      try {
        const category = location.category || 'Other';
        categoryData[category] = (categoryData[category] || 0) + 1;
      } catch (error) {
        console.error('Error processing location category:', error);
      }
    });

    const locationsByCategory = Object.entries(categoryData).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count
    }));

    // Locations by province
    const provinceData = {};
    locations.forEach(location => {
      try {
        const province = location.province || 'Unknown';
        provinceData[province] = (provinceData[province] || 0) + 1;
      } catch (error) {
        console.error('Error processing location province:', error);
      }
    });

    const locationsByProvince = Object.entries(provinceData).map(([province, count]) => ({
      province,
      count
    }));

    // Monthly activity (combining all entities)
    const monthlyData = {};
    
    // Process each type separately with error handling
    const processItems = (items, type) => {
      items.forEach(item => {
        try {
          const date = new Date(item.createdAt);
          if (!isNaN(date.getTime())) {
            const month = date.toLocaleDateString('en', { month: 'short' });
            if (!monthlyData[month]) {
              monthlyData[month] = { month, users: 0, locations: 0, events: 0, trips: 0 };
            }
            monthlyData[month][type]++;
          }
        } catch (error) {
          console.error(`Error processing ${type} date:`, error);
        }
      });
    };

    processItems(users, 'users');
    processItems(locations, 'locations');
    processItems(events, 'events');
    processItems(trips, 'trips');

    const monthlyActivity = Object.values(monthlyData)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    const newStats = {
      totalUsers: users.length,
      totalLocations: locations.length,
      totalEvents: events.length,
      totalTrips: trips.length,
      userGrowth,
      locationsByCategory,
      locationsByProvince,
      monthlyActivity
    };

    console.log('Processed stats:', newStats);
    setStats(newStats);
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">+{change}% this month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
          <Icon className="h-8 w-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="text-xl font-semibold text-gray-700">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your platform statistics and metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            change={12}
            color="#3B82F6"
          />
          <StatCard
            icon={MapPin}
            title="Total Locations"
            value={stats.totalLocations}
            change={8}
            color="#10B981"
          />
          <StatCard
            icon={Calendar}
            title="Total Events"
            value={stats.totalEvents}
            change={15}
            color="#F59E0B"
          />
          <StatCard
            icon={Plane}
            title="Total Trips"
            value={stats.totalTrips}
            change={5}
            color="#EF4444"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              User Growth Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Monthly Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3B82F6" />
                <Bar dataKey="locations" fill="#10B981" />
                <Bar dataKey="events" fill="#F59E0B" />
                <Bar dataKey="trips" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Locations by Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-yellow-600" />
              Locations by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.locationsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.locationsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Locations by Province */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-purple-600" />
              Locations by Province
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.locationsByProvince}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="province" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;