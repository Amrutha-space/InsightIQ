import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { dataAPI } from '../services/api'
import {
  Upload,
  FileText,
  Database,
  Trash2,
  Edit,
  Eye,
  Download,
  Search,
  Filter,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const DataPage = () => {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewData, setPreviewData] = useState(null)

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    try {
      const response = await dataAPI.getDatasets()
      if (response.success) {
        setDatasets(response.data)
      }
    } catch (error) {
      console.error('Error fetching datasets:', error)
      toast.error('Failed to load datasets')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        await handleFileUpload(file)
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleFileUpload = async (file) => {
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name.split('.')[0])
    formData.append('description', `Uploaded on ${new Date().toLocaleDateString()}`)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await dataAPI.uploadDataset(formData)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.success) {
        toast.success('Dataset uploaded successfully!')
        setShowUploadModal(false)
        fetchDatasets()
        setPreviewData(response.data.sampleData)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleDeleteDataset = async (datasetId) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return

    try {
      const response = await dataAPI.deleteDataset(datasetId)
      if (response.success) {
        toast.success('Dataset deleted successfully')
        fetchDatasets()
        if (selectedDataset?.id === datasetId) {
          setSelectedDataset(null)
          setPreviewData(null)
        }
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete dataset')
    }
  }

  const handlePreviewDataset = async (dataset) => {
    try {
      const response = await dataAPI.getDataset(dataset.id)
      if (response.success) {
        setSelectedDataset(response.data)
        setPreviewData(response.data.sampleData)
      }
    } catch (error) {
      console.error('Preview error:', error)
      toast.error('Failed to load dataset preview')
    }
  }

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case '.csv':
        return <FileText className="w-5 h-5 text-green-500" />
      case '.xlsx':
      case '.xls':
        return <Database className="w-5 h-5 text-blue-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-4 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading datasets...</p>
        </div>
      </div>
    )
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
            Data Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage your business datasets
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Dataset</span>
        </motion.button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search datasets..."
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

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map((dataset, index) => (
          <motion.div
            key={dataset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(dataset.fileType)}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {dataset.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {dataset.fileName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePreviewDataset(dataset)}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDataset(dataset.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {dataset.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatFileSize(dataset.fileSize)}</span>
                <span>{dataset.rowCount?.toLocaleString() || 0} rows</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{dataset.columnsInfo?.length || 0} columns</span>
                <span>{new Date(dataset.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-1">
                {dataset.columnsInfo?.slice(0, 3).map((column, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    {column.name}
                  </span>
                ))}
                {dataset.columnsInfo?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    +{dataset.columnsInfo.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="modal-content"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upload Dataset
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!uploading ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-gray-600 dark:text-gray-400">
                      Drop the file here...
                    </p>
                  ) : (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Drag & drop a dataset here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports CSV, Excel files (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="spinner w-8 h-8 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Uploading dataset...
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Data Preview Modal */}
      {selectedDataset && previewData && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="modal-content max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedDataset.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Preview (first 5 rows)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDataset(null)
                    setPreviewData(null)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, idx) => (
                          <td
                            key={idx}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default DataPage
