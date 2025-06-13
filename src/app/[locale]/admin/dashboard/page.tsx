'use client'
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Eye
} from 'lucide-react';

import {
  getDashboardStats,
  getUsersMonthlyStats,
  getToursMonthlyStats,
  getRevenueMonthlyStats,
  getLocationsByCategory,
  getRecentActivities,
  type DashboardStats,
  type MonthlyData,
  type LocationCategory,
  type RecentActivity
} from '@/api/dashboard'; // 👉 adjust the path as needed

/**
 * AdminDashboard – full component using real API calls instead of mock data.
 * TailwindCSS, Recharts, and Lucide‑react are used for styling and charts.
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usersData, setUsersData] = useState<MonthlyData[]>([]);
  const [toursData, setToursData] = useState<MonthlyData[]>([]);
  const [revenueData, setRevenueData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<LocationCategory[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Colors for pie slices (and other accents)
  const COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63', '#083344'];

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  /**
   * Fetches all dashboard data in parallel.
   */
  const loadDashboardData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [statsRes, usersRes, toursRes, revenueRes, categoryRes, activitiesRes] =
        await Promise.all([
          getDashboardStats(),
          getUsersMonthlyStats(selectedYear),
          getToursMonthlyStats(selectedYear),
          getRevenueMonthlyStats(selectedYear),
          getLocationsByCategory(),
          getRecentActivities(10)
        ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (usersRes.success && usersRes.data) setUsersData(usersRes.data);
      if (toursRes.success && toursRes.data) setToursData(toursRes.data);
      if (revenueRes.success && revenueRes.data) setRevenueData(revenueRes.data);
      if (categoryRes.success && categoryRes.data) setCategoryData(categoryRes.data);
      if (activitiesRes.success && activitiesRes.data) setActivities(activitiesRes.data);
    } catch (error) {
      // Ideally use a toast/notification system in production
      // eslint-disable-next-line no-console
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * STAT CARD COMPONENT
   */
  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    trendValue?: number;
    color?: string;
  }> = ({ title, value, icon: Icon, trend, trendValue, color = 'cyan' }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${color}-400`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value.toLocaleString()}</p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
            >
              <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span>{trendValue}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  /**
   * INDIVIDUAL ACTIVITY LIST ITEM
   */
  const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
    const getIcon = (type: RecentActivity['type']) => {
      switch (type) {
        case 'user_registration':
          return <Users className="w-4 h-4" />;
        case 'tour_booking':
          return <Calendar className="w-4 h-4" />;
        case 'blog_post':
          return <Eye className="w-4 h-4" />;
        case 'tour_creation':
          return <MapPin className="w-4 h-4" />;
        default:
          return <Activity className="w-4 h-4" />;
      }
    };

    const getColor = (type: RecentActivity['type']) => {
      switch (type) {
        case 'user_registration':
          return 'bg-blue-100 text-blue-600';
        case 'tour_booking':
          return 'bg-green-100 text-green-600';
        case 'blog_post':
          return 'bg-purple-100 text-purple-600';
        case 'tour_creation':
          return 'bg-cyan-100 text-cyan-600';
        default:
          return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-full ${getColor(activity.type)}`}>{getIcon(activity.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(activity.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  /**
   * RENDER LOADING STATE
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /**
   * MAIN COMPONENT RENDER
   */
  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>

          {/* Year Selector */}
          <div className="mt-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              trend="up"
              trendValue={12}
              color="cyan"
            />
            <StatCard
              title="Total Tours"
              value={stats.totalTours}
              icon={MapPin}
              trend="up"
              trendValue={8}
              color="blue"
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={Calendar}
              trend="up"
              trendValue={15}
              color="green"
            />
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={DollarSign}
              trend="up"
              trendValue={23}
              color="purple"
            />
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-cyan-600">{stats.totalLocations}</p>
              <p className="text-sm text-gray-600">Locations</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalBlogs}</p>
              <p className="text-sm text-gray-600">Blog Posts</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              <p className="text-sm text-gray-600">Pending Bookings</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
              <p className="text-sm text-gray-600">Confirmed Bookings</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.activeAgencies}</p>
              <p className="text-sm text-gray-600">Active Agencies</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Users Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">User Growth ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="monthName" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tours Creation Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tours Created ({selectedYear})</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={toursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="monthName" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#0891b2" name="Tours Created" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Revenue Overview ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monthName" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${Number(value).toLocaleString()}`, 'Revenue']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 5 }}
                name="Monthly Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Locations by Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Locations by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Travel Vietnam Admin Dashboard. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
