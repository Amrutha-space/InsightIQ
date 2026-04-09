import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  Database,
  BarChart3,
  Lightbulb,
  PlayCircle,
  FileText,
  Settings,
  Home
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Data Management', href: '/data', icon: Database },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Insights', href: '/insights', icon: Lightbulb },
    { name: 'Simulation', href: '/simulation', icon: PlayCircle },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Navigation
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-3"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats Section */}
        <div className="mt-8 p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-700">
          <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-200 mb-3">
            Quick Tips
          </h3>
          <ul className="space-y-2 text-xs text-primary-700 dark:text-primary-300">
            <li className="flex items-start">
              <span className="w-1 h-1 bg-primary-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              Upload CSV/Excel files to get started
            </li>
            <li className="flex items-start">
              <span className="w-1 h-1 bg-primary-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              Use predefined queries for quick insights
            </li>
            <li className="flex items-start">
              <span className="w-1 h-1 bg-primary-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              Generate AI-powered insights automatically
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
