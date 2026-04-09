import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { aiAPI, dataAPI } from '../services/api'
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Brain,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

const InsightsPage = () => {
  const [insights, setInsights] = useState([])
  const [datasets, setDatasets] = useState([])
  const [selectedDataset, setSelectedDataset] = useState('')
  const [insightType, setInsightType] = useState('trend')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedInsight, setExpandedInsight] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch existing insights
      const insightsResponse = await aiAPI.getInsights()
      if (insightsResponse.success) {
        setInsights(insightsResponse.data)
      }

      // Fetch datasets
      const datasetsResponse = await dataAPI.getDatasets()
      if (datasetsResponse.success) {
        setDatasets(datasetsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Failed to load insights data')
    }
  }

  const generateInsights = async () => {
    if (!selectedDataset) {
      toast.error('Please select a dataset')
      return
    }

    setGenerating(true)
    try {
      // Mock data for insights generation
      const mockData = [
        { product: 'Product A', revenue: 15000, region: 'North', date: '2024-01-01' },
        { product: 'Product B', revenue: 12000, region: 'South', date: '2024-01-02' },
        { product: 'Product C', revenue: 18000, region: 'East', date: '2024-01-03' },
        { product: 'Product D', revenue: 9000, region: 'West', date: '2024-01-04' },
        { product: 'Product E', revenue: 22000, region: 'North', date: '2024-01-05' }
      ]

      const response = await aiAPI.generateInsights({
        datasetId: parseInt(selectedDataset),
        insightType,
        data: mockData
      })

      if (response.success) {
        setInsights(response.data.concat(insights))
        toast.success('Insights generated successfully!')
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate insights')
    } finally {
      setGenerating(false)
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'prediction':
        return <Target className="w-5 h-5 text-blue-500" />
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-purple-500" />
      default:
        return <Brain className="w-5 h-5 text-gray-500" />
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'trend':
        return 'from-green-500 to-green-600'
      case 'anomaly':
        return 'from-yellow-500 to-yellow-600'
      case 'prediction':
        return 'from-blue-500 to-blue-600'
      case 'recommendation':
        return 'from-purple-500 to-purple-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
  }

  const filteredInsights = insights.filter(insight =>
    insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insight.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            AI Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Get intelligent insights powered by machine learning
          </p>
        </div>
      </motion.div>

      {/* Generate Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Generate New Insights</h2>
            <p className="text-primary-100">
              Select a dataset and insight type to generate AI-powered analysis
            </p>
          </div>
          <Brain className="w-12 h-12 text-primary-200" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-100 mb-2">
              Dataset
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="" className="text-gray-900">Choose dataset...</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id} className="text-gray-900">
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-100 mb-2">
              Insight Type
            </label>
            <select
              value={insightType}
              onChange={(e) => setInsightType(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="trend" className="text-gray-900">Trend Analysis</option>
              <option value="anomaly" className="text-gray-900">Anomaly Detection</option>
              <option value="prediction" className="text-gray-900">Predictions</option>
              <option value="recommendation" className="text-gray-900">Recommendations</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateInsights}
              disabled={!selectedDataset || generating}
              className="w-full bg-white text-primary-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {generating ? (
                <>
                  <div className="spinner w-4 h-4 border-2 border-primary-600 border-t-transparent"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Generate Insights</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </motion.div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getInsightColor(insight.type)} rounded-lg flex items-center justify-center`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize">
                      {insight.type}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(insight.confidence)}`}>
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {insight.content}
              </p>

              {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <button
                    onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Details</span>
                    {expandedInsight === insight.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedInsight === insight.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Additional Context
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(insight.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-500 capitalize">{key}:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500">AI Generated</span>
              </div>
              
              <button className="text-xs text-primary-600 hover:text-primary-700 transition-colors">
                Save Insight
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No insights yet
          </h3>
          <p className="text-gray-500 mb-6">
            Generate your first AI-powered insights by selecting a dataset above
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default InsightsPage
