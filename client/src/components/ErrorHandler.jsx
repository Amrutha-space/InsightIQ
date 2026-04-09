import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Error types classification
export const ErrorTypes = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CLIENT: 'client',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
}

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// Error configuration
const errorConfig = {
  [ErrorTypes.NETWORK]: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    actions: ['retry', 'home']
  },
  [ErrorTypes.VALIDATION]: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    actions: ['retry']
  },
  [ErrorTypes.AUTHENTICATION]: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    title: 'Authentication Error',
    message: 'Please log in to continue.',
    actions: ['login', 'home']
  },
  [ErrorTypes.AUTHORIZATION]: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    actions: ['home']
  },
  [ErrorTypes.NOT_FOUND]: {
    icon: AlertTriangle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    title: 'Not Found',
    message: 'The requested resource was not found.',
    actions: ['home', 'back']
  },
  [ErrorTypes.SERVER]: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    actions: ['retry', 'home']
  },
  [ErrorTypes.TIMEOUT]: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    actions: ['retry']
  },
  [ErrorTypes.UNKNOWN]: {
    icon: AlertTriangle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    actions: ['retry', 'home']
  }
}

// Error classification utility
export const classifyError = (error) => {
  if (!error) return ErrorTypes.UNKNOWN

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
    return ErrorTypes.NETWORK
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ErrorTypes.TIMEOUT
  }

  // HTTP status errors
  if (error.response) {
    const status = error.response.status
    if (status === 401) return ErrorTypes.AUTHENTICATION
    if (status === 403) return ErrorTypes.AUTHORIZATION
    if (status === 404) return ErrorTypes.NOT_FOUND
    if (status === 422) return ErrorTypes.VALIDATION
    if (status >= 500) return ErrorTypes.SERVER
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.message?.includes('validation')) {
    return ErrorTypes.VALIDATION
  }

  // Client errors
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return ErrorTypes.CLIENT
  }

  return ErrorTypes.UNKNOWN
}

// Error severity assessment
export const assessErrorSeverity = (error) => {
  const type = classifyError(error)
  
  switch (type) {
    case ErrorTypes.SERVER:
    case ErrorTypes.CRITICAL:
      return ErrorSeverity.HIGH
    case ErrorTypes.AUTHENTICATION:
    case ErrorTypes.AUTHORIZATION:
      return ErrorSeverity.MEDIUM
    case ErrorTypes.NETWORK:
    case ErrorTypes.TIMEOUT:
      return ErrorSeverity.MEDIUM
    case ErrorTypes.VALIDATION:
    case ErrorTypes.NOT_FOUND:
      return ErrorSeverity.LOW
    default:
      return ErrorSeverity.MEDIUM
  }
}

// Error logging utility
export const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    type: classifyError(error),
    severity: assessErrorSeverity(error),
    message: error.message || 'Unknown error',
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${errorInfo.type.toUpperCase()} ERROR`)
    console.error('Error:', error)
    console.log('Error Info:', errorInfo)
    console.groupEnd()
  }

  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: errorInfo })
  }

  return errorInfo
}

// Error display component
export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onHome, 
  onBack, 
  onLogin,
  className = '',
  showDetails = false 
}) => {
  const navigate = useNavigate()
  const [detailsVisible, setDetailsVisible] = React.useState(showDetails)
  
  const errorType = classifyError(error)
  const config = errorConfig[errorType] || errorConfig[ErrorTypes.UNKNOWN]
  const Icon = config.icon

  const handleAction = (action) => {
    switch (action) {
      case 'retry':
        onRetry?.()
        break
      case 'home':
        onHome?.() || navigate('/')
        break
      case 'back':
        onBack?.() || navigate(-1)
        break
      case 'login':
        onLogin?.() || navigate('/login')
        break
      default:
        break
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`
        max-w-md w-full mx-auto p-6 rounded-xl shadow-lg
        ${config.bgColor} ${config.borderColor}
        border ${className}
      `}
    >
      {/* Icon and Title */}
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 ${config.color}`} />
        <h2 className={`text-lg font-semibold ${config.color}`}>
          {config.title}
        </h2>
      </div>

      {/* Message */}
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        {error.message || config.message}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {config.actions?.map((action) => (
          <motion.button
            key={action}
            onClick={() => handleAction(action)}
            className="px-4 py-2 text-sm font-medium rounded-lg
              bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-600
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action === 'retry' && <RefreshCw className="w-4 h-4 mr-2 inline" />}
            {action === 'home' && <Home className="w-4 h-4 mr-2 inline" />}
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Error Details (Development) */}
      {(process.env.NODE_ENV === 'development' || detailsVisible) && (
        <details className="mt-4">
          <summary 
            className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            onClick={(e) => {
              e.preventDefault()
              setDetailsVisible(!detailsVisible)
            }}
          >
            <div className="flex items-center space-x-2">
              <Bug className="w-4 h-4" />
              <span>Error Details</span>
            </div>
          </summary>
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
            <div className="text-red-600 font-bold mb-2">Error:</div>
            <div className="mb-3">{error.toString()}</div>
            
            {error.stack && (
              <>
                <div className="text-red-600 font-bold mb-2">Stack Trace:</div>
                <div className="whitespace-pre-wrap">{error.stack}</div>
              </>
            )}
            
            {error.response && (
              <>
                <div className="text-red-600 font-bold mb-2">Response:</div>
                <div className="whitespace-pre-wrap">{JSON.stringify(error.response, null, 2)}</div>
              </>
            )}
          </div>
        </details>
      )}
    </motion.div>
  )
}

// Error boundary fallback component
export const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <ErrorDisplay
        error={error}
        onRetry={resetError}
        onHome={() => window.location.href = '/'}
        showDetails={true}
      />
    </div>
  )
}

// Error hook for handling errors in components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleError = React.useCallback((error, context = {}) => {
    const errorInfo = logError(error, context)
    setError(error)
    return errorInfo
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const executeWithErrorHandling = React.useCallback(async (fn, context = {}) => {
    setIsLoading(true)
    clearError()
    
    try {
      const result = await fn()
      setIsLoading(false)
      return result
    } catch (error) {
      handleError(error, context)
      setIsLoading(false)
      throw error
    }
  }, [handleError, clearError])

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  }
}

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { type: 'unhandled_promise_rejection' })
    event.preventDefault()
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error, { 
      type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
}

export default ErrorDisplay
