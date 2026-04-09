import React from 'react'
import { motion } from 'framer-motion'

const LoadingSkeleton = ({ 
  className = '', 
  variant = 'default',
  lines = 1,
  height = 'h-4',
  width = 'w-full',
  animate = true 
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 rounded-lg'
  const animationClasses = animate ? 'animate-pulse' : ''

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={`${baseClasses} ${height} ${animationClasses}`}
                style={{
                  width: index === lines - 1 ? '70%' : width
                }}
              />
            ))}
          </div>
        )

      case 'card':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
          >
            <div className="space-y-4">
              <div className={`${baseClasses} h-6 w-3/4 ${animationClasses}`} />
              <div className={`${baseClasses} h-4 w-full ${animationClasses}`} />
              <div className={`${baseClasses} h-4 w-5/6 ${animationClasses}`} />
              <div className="flex justify-between items-center pt-4">
                <div className={`${baseClasses} h-8 w-20 ${animationClasses}`} />
                <div className={`${baseClasses} h-8 w-24 ${animationClasses}`} />
              </div>
            </div>
          </motion.div>
        )

      case 'chart':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
          >
            <div className="space-y-4">
              <div className={`${baseClasses} h-6 w-1/3 ${animationClasses}`} />
              <div className={`${baseClasses} h-64 w-full ${animationClasses}`} />
            </div>
          </motion.div>
        )

      case 'table':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}
          >
            <div className="p-6">
              <div className={`${baseClasses} h-6 w-1/4 mb-4 ${animationClasses}`} />
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <th key={index} className="px-6 py-3">
                          <div className={`${baseClasses} h-4 w-20 ${animationClasses}`} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.from({ length: 4 }).map((_, colIndex) => (
                          <td key={colIndex} className="px-6 py-4">
                            <div className={`${baseClasses} h-4 ${animationClasses}`} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )

      case 'avatar':
        return (
          <div className={`${baseClasses} w-10 h-10 rounded-full ${animationClasses} ${className}`} />
        )

      case 'button':
        return (
          <div className={`${baseClasses} h-10 w-24 ${animationClasses} ${className}`} />
        )

      case 'input':
        return (
          <div className={`${baseClasses} h-10 w-full ${animationClasses} ${className}`} />
        )

      case 'stat':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className={`${baseClasses} h-4 w-32 ${animationClasses}`} />
                <div className={`${baseClasses} h-8 w-20 ${animationClasses}`} />
                <div className={`${baseClasses} h-4 w-24 ${animationClasses}`} />
              </div>
              <div className={`${baseClasses} w-12 h-12 rounded-lg ${animationClasses}`} />
            </div>
          </motion.div>
        )

      case 'sidebar':
        return (
          <div className={`w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 min-h-screen ${className}`}>
            <div className="p-4 space-y-4">
              <div className={`${baseClasses} h-8 w-32 ${animationClasses}`} />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3">
                    <div className={`${baseClasses} w-5 h-5 rounded ${animationClasses}`} />
                    <div className={`${baseClasses} h-4 w-24 ${animationClasses}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'navbar':
        return (
          <div className={`bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 h-16 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${baseClasses} w-8 h-8 rounded ${animationClasses}`} />
                <div className={`${baseClasses} h-6 w-24 ${animationClasses}`} />
              </div>
              <div className="flex items-center space-x-4">
                <div className={`${baseClasses} h-8 w-32 ${animationClasses}`} />
                <div className={`${baseClasses} w-10 h-10 rounded-full ${animationClasses}`} />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className={`${baseClasses} ${height} ${width} ${animationClasses} ${className}`} />
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderSkeleton()}
    </motion.div>
  )
}

// Skeleton wrapper for page loading
const PageSkeleton = () => (
  <div className="space-y-6">
    <LoadingSkeleton variant="navbar" className="mb-6" />
    <div className="flex">
      <LoadingSkeleton variant="sidebar" className="mr-6" />
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
          <LoadingSkeleton variant="stat" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton variant="chart" />
          <LoadingSkeleton variant="chart" />
        </div>
      </div>
    </div>
  </div>
)

// Card grid skeleton
const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <LoadingSkeleton key={index} variant="card" />
    ))}
  </div>
)

// Table skeleton
const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <LoadingSkeleton variant="table" />
)

// Form skeleton
const FormSkeleton = ({ fields = 4 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <LoadingSkeleton height="h-4" width="w-24" />
        <LoadingSkeleton variant="input" />
      </div>
    ))}
    <div className="flex justify-end pt-4">
      <LoadingSkeleton variant="button" />
    </div>
  </div>
)

export default LoadingSkeleton
export { PageSkeleton, CardGridSkeleton, TableSkeleton, FormSkeleton }
