import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { analyticsAPI } from '../services/api'
import { useErrorHandler } from '../components/ErrorHandler'
import LoadingSkeleton, { PageSkeleton, CardGridSkeleton } from '../components/LoadingSkeleton'
import { AnimationWrapper, StaggerWrapper, AnimatedCounter, AnimatedProgressBar } from '../components/AnimationWrapper'
import {
  TrendingUp,
  Database,
  FileText,
  Brain,
  Activity,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const { error, handleError, executeWithErrorHandling } = useErrorHandler()

  // Sample data for charts (in real app, this would come from API)
  const revenueData = [
    { month: 'Jan', revenue: 4000, profit: 2400 },
    { month: 'Feb', revenue: 3000, profit: 1398 },
    { month: 'Mar', revenue: 2000, profit: 9800 },
    { month: 'Apr', revenue: 2780, profit: 3908 },
    { month: 'May', revenue: 1890, profit: 4800 },
    { month: 'Jun', revenue: 2390, profit: 3800 },
    { month: 'Jul', revenue: 3490, profit: 4300 }
  ]

  const productData = [
    { name: 'Product A', value: 400, color: '#3b82f6' },
    { name: 'Product B', value: 300, color: '#10b981' },
    { name: 'Product C', value: 300, color: '#f59e0b' },
    { name: 'Product D', value: 200, color: '#ef4444' },
    { name: 'Product E', value: 100, color: '#8b5cf6' }
  ]

  const regionData = [
    { region: 'North', sales: 4000, growth: 12 },
    { region: 'South', sales: 3000, growth: -5 },
    { region: 'East', sales: 2000, growth: 8 },
    { region: 'West', sales: 2780, growth: 15 }
  ]

  const userActivityData = [
    { time: '00:00', users: 120 },
    { time: '04:00', users: 80 },
    { time: '08:00', users: 200 },
    { time: '12:00', users: 350 },
    { time: '16:00', users: 280 },
    { time: '20:00', users: 180 },
    { time: '23:59', users: 140 }
  ]

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await executeWithErrorHandling(async () => {
        return await analyticsAPI.getDashboardStats()
      })
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      // Error is already handled by useErrorHandler
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Datasets',
      value: stats?.totalDatasets || 12,
      icon: Database,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Data Rows',
      value: stats?.totalRows?.toLocaleString() || '150K',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Storage Used',
      value: stats?.totalStorage ? `${(stats.totalStorage / 1024 / 1024).toFixed(1)}MB` : '2.5MB',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'AI Insights',
      value: stats?.totalInsights || 28,
      icon: Brain,
      color: 'from-orange-500 to-orange-600',
      change: '+15%',
      changeType: 'positive'
    }
  ]

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <StaggerWrapper className="space-y-6">
      {/* Header */}
      <AnimationWrapper animation="pageTransition" className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your analytics overview.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-40"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </AnimationWrapper>

      {/* Stats Grid */}
      <StaggerWrapper staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <AnimationWrapper key={index} animation="fadeInScale" delay={index * 0.1}>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      <AnimatedCounter 
                        value={typeof stat.value === 'number' ? stat.value : parseInt(stat.value.replace(/\D/g, '')) || 0}
                        suffix={typeof stat.value === 'string' && stat.value.includes('MB') ? 'MB' : ''}
                        prefix={typeof stat.value === 'string' && stat.value.includes('K') ? '' : ''}
                        duration={1.5}
                      />
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </AnimationWrapper>
          )
        })}
      </StaggerWrapper>

      {/* Charts Grid */}
      <StaggerWrapper staggerDelay={0.2} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <AnimationWrapper animation="fadeInScale" delay={0.4}>
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue & Profit Trends
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                View Details
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimationWrapper>

        {/* Product Distribution Pie Chart */}
        <AnimationWrapper animation="fadeInScale" delay={0.5}>
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Product Distribution
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                View Details
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnimationWrapper>

        {/* Regional Sales Bar Chart */}
        <AnimationWrapper animation="fadeInScale" delay={0.6}>
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Regional Sales Performance
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                View Details
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="region" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="growth" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimationWrapper>

        {/* User Activity Line Chart */}
        <AnimationWrapper animation="fadeInScale" delay={0.7}>
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Activity (24h)
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                View Details
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnimationWrapper>
      </StaggerWrapper>

      {/* Recent Activity */}
      <AnimationWrapper animation="fadeInScale" delay={0.8}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats?.recentActivity?.map((activity, index) => (
              <AnimationWrapper key={index} animation="listItem" delay={index * 0.1}>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'dataset' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.type === 'dataset' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </AnimationWrapper>
    </StaggerWrapper>
  )
}

export default DashboardPage
