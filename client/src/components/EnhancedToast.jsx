import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
    titleColor: 'text-green-900 dark:text-green-100',
    messageColor: 'text-green-700 dark:text-green-300'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    titleColor: 'text-red-900 dark:text-red-100',
    messageColor: 'text-red-700 dark:text-red-300'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-900 dark:text-yellow-100',
    messageColor: 'text-yellow-700 dark:text-yellow-300'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-900 dark:text-blue-100',
    messageColor: 'text-blue-700 dark:text-blue-300'
  }
}

const EnhancedToast = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  action,
  persistent = false 
}) => {
  const config = toastTypes[type] || toastTypes.info
  const Icon = config.icon
  const [isVisible, setIsVisible] = React.useState(true)
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    if (!persistent && duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100))
          if (newProgress <= 0) {
            clearInterval(interval)
            handleClose()
            return 0
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [duration, persistent])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            max-w-md w-full mx-4 mb-4
            ${config.bgColor} ${config.borderColor}
            border rounded-lg shadow-lg backdrop-blur-sm
            overflow-hidden
          `}
        >
          <div className="p-4">
            <div className="flex items-start">
              {/* Icon */}
              <div className="flex-shrink-0">
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
              </div>

              {/* Content */}
              <div className="ml-3 flex-1">
                {title && (
                  <h3 className={`text-sm font-medium ${config.titleColor}`}>
                    {title}
                  </h3>
                )}
                {message && (
                  <p className={`text-sm ${title ? 'mt-1' : ''} ${config.messageColor}`}>
                    {message}
                  </p>
                )}
                
                {/* Action Button */}
                {action && (
                  <div className="mt-3">
                    <button
                      onClick={action.onClick}
                      className={`
                        text-sm font-medium ${config.titleColor}
                        hover:underline transition-colors duration-200
                      `}
                    >
                      {action.label}
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleClose}
                  className={`
                    inline-flex text-gray-400 hover:text-gray-600
                    dark:hover:text-gray-300 transition-colors duration-200
                  `}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {!persistent && duration > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <motion.div
                    className="h-1 rounded-full bg-current opacity-30"
                    style={{ color: 'inherit' }}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast Container Component
export const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <EnhancedToast
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Custom Hook for Toast Management
export const useToast = () => {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((config) => {
    const id = Date.now().toString()
    const newToast = { id, ...config }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto-remove after duration if not persistent
    if (!config.persistent && config.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, config.duration || 5000)
    }
    
    return id
  }, [])

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearAllToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = React.useCallback((title, message, options = {}) => {
    return addToast({ type: 'success', title, message, ...options })
  }, [addToast])

  const error = React.useCallback((title, message, options = {}) => {
    return addToast({ type: 'error', title, message, duration: 0, ...options }) // Errors are persistent by default
  }, [addToast])

  const warning = React.useCallback((title, message, options = {}) => {
    return addToast({ type: 'warning', title, message, ...options })
  }, [addToast])

  const info = React.useCallback((title, message, options = {}) => {
    return addToast({ type: 'info', title, message, ...options })
  }, [addToast])

  const promise = React.useCallback((promise, options = {}) => {
    const id = addToast({
      type: 'info',
      title: options.loadingTitle || 'Loading...',
      message: options.loadingMessage || 'Please wait...',
      persistent: true,
      ...options
    })

    promise
      .then((result) => {
        removeToast(id)
        success(
          options.successTitle || 'Success',
          options.successMessage || 'Operation completed successfully',
          options.successOptions
        )
        return result
      })
      .catch((error) => {
        removeToast(id)
        error(
          options.errorTitle || 'Error',
          options.errorMessage || error.message || 'Something went wrong',
          options.errorOptions
        )
        throw error
      })

    return promise
  }, [addToast, removeToast, success, error])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    promise
  }
}

export default EnhancedToast
