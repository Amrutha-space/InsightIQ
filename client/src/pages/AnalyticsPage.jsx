import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { analyticsAPI } from '../services/api'
import {
  Play,
  Save,
  History,
  Search,
  Filter,
  Code2,
  Database,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const AnalyticsPage = () => {
  const [datasets, setDatasets] = useState([])
  const [predefinedQueries, setPredefinedQueries] = useState([])
  const [queryHistory, setQueryHistory] = useState([])
  const [selectedDataset, setSelectedDataset] = useState('')
  const [queryText, setQueryText] = useState('')
  const [queryResults, setQueryResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [executingQuery, setExecutingQuery] = useState(false)
  const [activeTab, setActiveTab] = useState('custom')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch predefined queries
      const queriesResponse = await analyticsAPI.getPredefinedQueries()
      if (queriesResponse.success) {
        setPredefinedQueries(queriesResponse.data)
      }

      // Fetch query history
      const historyResponse = await analyticsAPI.getQueryHistory()
      if (historyResponse.success) {
        setQueryHistory(historyResponse.data)
      }

      // Fetch datasets (mock data for now)
      setDatasets([
        { id: 1, name: 'Sales Data Q4 2023', rowCount: 15000 },
        { id: 2, name: 'Customer Demographics', rowCount: 8500 },
        { id: 3, name: 'Product Inventory', rowCount: 3200 }
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Failed to load analytics data')
    }
  }

  const executeQuery = async () => {
    if (!selectedDataset || !queryText.trim()) {
      toast.error('Please select a dataset and enter a query')
      return
    }

    setExecutingQuery(true)
    try {
      const response = await analyticsAPI.executeQuery({
        query: queryText,
        datasetId: parseInt(selectedDataset)
      })

      if (response.success) {
        setQueryResults(response.data)
        toast.success('Query executed successfully')
        // Refresh query history
        const historyResponse = await analyticsAPI.getQueryHistory()
        if (historyResponse.success) {
          setQueryHistory(historyResponse.data)
        }
      }
    } catch (error) {
      console.error('Query execution error:', error)
      toast.error(error.response?.data?.message || 'Query execution failed')
    } finally {
      setExecutingQuery(false)
    }
  }

  const usePredefinedQuery = (query) => {
    setQueryText(query.query)
    setActiveTab('custom')
  }

  const formatExecutionTime = (time) => {
    return `${time}ms`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Run SQL queries and analyze your data
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-gray-200 dark:border-gray-700"
      >
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'custom'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Custom Query
          </button>
          <button
            onClick={() => setActiveTab('predefined')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'predefined'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Predefined Queries
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Query History
          </button>
        </nav>
      </motion.div>

      {/* Custom Query Tab */}
      {activeTab === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Query Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Dataset
                </label>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="input-field"
                >
                  <option value="">Choose a dataset...</option>
                  {datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.rowCount.toLocaleString()} rows)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={executeQuery}
                  disabled={!selectedDataset || !queryText.trim() || executingQuery}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {executingQuery ? (
                    <>
                      <div className="spinner w-4 h-4 border-2 border-white border-t-transparent"></div>
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Execute Query</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SQL Query
              </label>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="input-field h-32 font-mono text-sm"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Query Results */}
          {queryResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Query Results
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Database className="w-4 h-4" />
                    <span>{queryResults.rowCount} rows</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatExecutionTime(queryResults.executionTime)}</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {queryResults.columns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {queryResults.results.map((row, index) => (
                      <tr key={index}>
                        {queryResults.columns.map((column) => (
                          <td
                            key={column}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                          >
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Predefined Queries Tab */}
      {activeTab === 'predefined' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {predefinedQueries.map((query, index) => (
            <motion.div
              key={query.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-primary-600" />
                  <span className="text-xs font-medium text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-300 px-2 py-1 rounded">
                    {query.category}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {query.name}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {query.description}
              </p>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {query.query}
                </pre>
              </div>

              <button
                onClick={() => usePredefinedQuery(query)}
                className="w-full btn-primary text-sm"
              >
                Use This Query
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Query History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Queries
            </h3>
            
            <div className="space-y-3">
              {queryHistory.map((query, index) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => {
                    setQueryText(query.query_text)
                    setSelectedDataset(query.dataset_id)
                    setActiveTab('custom')
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <History className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {query.query_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {query.dataset_name} • {new Date(query.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      query.query_type === 'predefined'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {query.query_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AnalyticsPage
