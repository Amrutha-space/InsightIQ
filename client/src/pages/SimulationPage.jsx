import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { aiAPI, dataAPI } from '../services/api'
import {
  PlayCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Settings,
  Save,
  History,
  BarChart3,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const SimulationPage = () => {
  const [datasets, setDatasets] = useState([])
  const [simulations, setSimulations] = useState([])
  const [selectedDataset, setSelectedDataset] = useState('')
  const [selectedScenario, setSelectedScenario] = useState('price_change')
  const [simulationParameters, setSimulationParameters] = useState({})
  const [simulationResults, setSimulationResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [runningSimulation, setRunningSimulation] = useState(false)

  const scenarios = {
    price_change: {
      name: 'Price Change Impact',
      description: 'Analyze how changing prices affects revenue and demand',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      parameters: [
        { name: 'priceChange', label: 'Price Change (%)', type: 'number', default: 10, min: -50, max: 100 },
        { name: 'currentRevenue', label: 'Current Revenue ($)', type: 'number', default: 100000, min: 0 },
        { name: 'priceElasticity', label: 'Price Elasticity', type: 'number', default: -1.5, min: -5, max: 0, step: 0.1 }
      ]
    },
    market_expansion: {
      name: 'Market Expansion',
      description: 'Predict outcomes when entering new markets',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      parameters: [
        { name: 'newMarkets', label: 'Number of New Markets', type: 'number', default: 2, min: 1, max: 10 },
        { name: 'marketSize', label: 'Average Market Size', type: 'number', default: 50000, min: 1000 },
        { name: 'penetrationRate', label: 'Expected Penetration Rate (%)', type: 'number', default: 10, min: 1, max: 50 },
        { name: 'avgOrderValue', label: 'Average Order Value ($)', type: 'number', default: 100, min: 1 }
      ]
    },
    customer_growth: {
      name: 'Customer Growth',
      description: 'Model customer acquisition and retention scenarios',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      parameters: [
        { name: 'acquisitionRate', label: 'Monthly Acquisition Rate (%)', type: 'number', default: 15, min: 0, max: 100 },
        { name: 'churnRate', label: 'Monthly Churn Rate (%)', type: 'number', default: 5, min: 0, max: 50 },
        { name: 'currentCustomers', label: 'Current Customers', type: 'number', default: 1000, min: 0 },
        { name: 'months', label: 'Simulation Period (months)', type: 'number', default: 12, min: 1, max: 36 }
      ]
    }
  }

  useEffect(() => {
    fetchInitialData()
    initializeParameters()
  }, [selectedScenario])

  const fetchInitialData = async () => {
    try {
      // Fetch datasets
      const datasetsResponse = await dataAPI.getDatasets()
      if (datasetsResponse.success) {
        setDatasets(datasetsResponse.data)
      }

      // Fetch simulation history
      const simulationsResponse = await aiAPI.getSimulations()
      if (simulationsResponse.success) {
        setSimulations(simulationsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Failed to load simulation data')
    }
  }

  const initializeParameters = () => {
    const scenario = scenarios[selectedScenario]
    const params = {}
    scenario.parameters.forEach(param => {
      params[param.name] = param.default
    })
    setSimulationParameters(params)
  }

  const handleParameterChange = (paramName, value) => {
    setSimulationParameters(prev => ({
      ...prev,
      [paramName]: parseFloat(value)
    }))
  }

  const runSimulation = async () => {
    if (!selectedDataset) {
      toast.error('Please select a dataset')
      return
    }

    setRunningSimulation(true)
    try {
      const response = await aiAPI.runSimulation({
        datasetId: parseInt(selectedDataset),
        parameters: simulationParameters,
        scenario: selectedScenario
      })

      if (response.success) {
        setSimulationResults(response.data)
        toast.success('Simulation completed successfully!')
        // Refresh simulation history
        const simulationsResponse = await aiAPI.getSimulations()
        if (simulationsResponse.success) {
          setSimulations(simulationsResponse.data)
        }
      }
    } catch (error) {
      console.error('Simulation error:', error)
      toast.error('Failed to run simulation')
    } finally {
      setRunningSimulation(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number)
  }

  const getChangeIcon = (value) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getChangeColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
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
            What-If Simulations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test different business scenarios and predict outcomes
          </p>
        </div>
      </motion.div>

      {/* Scenario Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {Object.entries(scenarios).map(([key, scenario]) => {
          const Icon = scenario.icon
          return (
            <motion.div
              key={key}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedScenario(key)}
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 ${
                selectedScenario === key
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${scenario.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {scenario.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scenario.description}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Simulation Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Simulation Configuration
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>Adjust parameters to model different scenarios</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dataset
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="input-field"
            >
              <option value="">Choose dataset...</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios[selectedScenario].parameters.map((param) => (
            <div key={param.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {param.label}
              </label>
              <input
                type={param.type}
                value={simulationParameters[param.name] || ''}
                onChange={(e) => handleParameterChange(param.name, e.target.value)}
                min={param.min}
                max={param.max}
                step={param.step || 1}
                className="input-field"
              />
              {param.min !== undefined && param.max !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  Range: {param.min} to {param.max}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={runSimulation}
            disabled={!selectedDataset || runningSimulation}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {runningSimulation ? (
              <>
                <div className="spinner w-4 h-4 border-2 border-white border-t-transparent"></div>
                <span>Running Simulation...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Simulation Results */}
      {simulationResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Simulation Results
            </h2>
            <span className="text-sm text-gray-500">
              {new Date(simulationResults.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.entries(simulationResults.results.predictions).map(([key, value]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {key.includes('revenue') || key.includes('Revenue') ? formatCurrency(value) : formatNumber(value)}
                </p>
                {key.includes('Change') && (
                  <div className="flex items-center mt-2">
                    {getChangeIcon(value)}
                    <span className={`text-sm font-medium ml-1 ${getChangeColor(value)}`}>
                      {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recommendations
            </h3>
            <div className="space-y-3">
              {simulationResults.results.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Simulation History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Simulation History
            </h3>
            <History className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {simulations.map((simulation) => (
              <div
                key={simulation.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => {
                  setSimulationResults(simulation)
                  setSelectedDataset(simulation.parameters.datasetId || '')
                }}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {simulation.scenarioName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(simulation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {simulations.length === 0 && (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No simulation history yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default SimulationPage
