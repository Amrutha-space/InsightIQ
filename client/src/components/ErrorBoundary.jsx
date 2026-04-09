import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { ErrorDisplay } from './ErrorHandler'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Use our enhanced ErrorDisplay component
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <ErrorDisplay
            error={this.state.error}
            onRetry={this.handleReset}
            onHome={() => window.location.href = '/'}
            showDetails={true}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
