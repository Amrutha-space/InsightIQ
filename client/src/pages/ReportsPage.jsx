import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { dataAPI, analyticsAPI } from '../services/api'
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  Filter,
  Search,
  Plus,
  FileDown,
  FileSpreadsheet,
  FileImage,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const ReportsPage = () => {
  const [reports, setReports] = useState([])
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch datasets
      const datasetsResponse = await dataAPI.getDatasets()
      if (datasetsResponse.success) {
        setDatasets(datasetsResponse.data)
      }

      // Mock reports data (in real app, this would come from API)
      setReports([
        {
          id: 1,
          name: 'Q4 2023 Sales Report',
          type: 'pdf',
          datasetName: 'Sales Data Q4 2023',
          generatedAt: '2024-01-15T10:30:00Z',
          size: '2.4 MB',
          status: 'completed'
        },
        {
          id: 2,
          name: 'Customer Analysis Summary',
          type: 'csv',
          datasetName: 'Customer Demographics',
          generatedAt: '2024-01-14T15:45:00Z',
          size: '856 KB',
          status: 'completed'
        },
        {
          id: 3,
          name: 'Revenue Trends Dashboard',
          type: 'pdf',
          datasetName: 'Sales Data Q4 2023',
          generatedAt: '2024-01-13T09:20:00Z',
          size: '1.8 MB',
          status: 'completed'
        }
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type, datasetId) => {
    setGeneratingReport(true)
    try {
      // In a real app, this would call the API to generate a report
      // For now, we'll simulate report generation
      
      const dataset = datasets.find(d => d.id === parseInt(datasetId))
      const reportName = `${dataset.name} Report - ${new Date().toLocaleDateString()}`
      
      if (type === 'pdf') {
        await generatePDFReport(dataset, reportName)
      } else if (type === 'csv') {
        await generateCSVReport(dataset, reportName)
      }

      toast.success(`${type.toUpperCase()} report generated successfully!`)
      
      // Refresh reports list
      const newReport = {
        id: reports.length + 1,
        name: reportName,
        type,
        datasetName: dataset.name,
        generatedAt: new Date().toISOString(),
        size: type === 'pdf' ? '1.2 MB' : '450 KB',
        status: 'completed'
      }
      setReports([newReport, ...reports])
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const generatePDFReport = async (dataset, reportName) => {
    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(20)
    pdf.text(reportName, 20, 30)
    
    // Add dataset info
    pdf.setFontSize(12)
    pdf.text(`Dataset: ${dataset.name}`, 20, 50)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 65)
    pdf.text(`Rows: ${dataset.rowCount?.toLocaleString() || 0}`, 20, 80)
    pdf.text(`Columns: ${dataset.columnsInfo?.length || 0}`, 20, 95)
    
    // Add sample data table
    pdf.setFontSize(14)
    pdf.text('Sample Data Preview', 20, 120)
    
    pdf.setFontSize(10)
    let yPosition = 140
    const sampleData = [
      { column: 'Product', value: 'Product A', type: 'text' },
      { column: 'Revenue', value: '$15,000', type: 'number' },
      { column: 'Region', value: 'North', type: 'text' },
      { column: 'Date', value: '2024-01-01', type: 'date' }
    ]
    
    sampleData.forEach(row => {
      pdf.text(`${row.column}: ${row.value} (${row.type})`, 20, yPosition)
      yPosition += 15
    })
    
    // Save the PDF
    pdf.save(`${reportName}.pdf`)
  }

  const generateCSVReport = async (dataset, reportName) => {
    // Create CSV content
    const headers = dataset.columnsInfo?.map(col => col.name) || ['Column1', 'Column2', 'Column3']
    const csvContent = [
      headers.join(','),
      // Sample data rows
      ['Product A', '15000', 'North'].join(','),
      ['Product B', '12000', 'South'].join(','),
      ['Product C', '18000', 'East'].join(','),
      ['Product D', '9000', 'West'].join(',')
    ].join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadReport = (report) => {
    // In a real app, this would download the actual file
    // For now, we'll simulate the download
    toast.success(`Downloading ${report.name}...`)
    
    setTimeout(() => {
      toast.success(`${report.name} downloaded successfully!`)
    }, 2000)
  }

  const deleteReport = (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    setReports(reports.filter(r => r.id !== reportId))
    toast.success('Report deleted successfully')
  }

  const getReportIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />
      case 'json':
        return <FileDown className="w-5 h-5 text-blue-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.datasetName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-4 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
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
            Reports & Exports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and download reports in various formats
          </p>
        </div>
      </motion.div>

      {/* Generate Report Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Generate New Report</h2>
            <p className="text-indigo-100">
              Create reports from your datasets in PDF or CSV format
            </p>
          </div>
          <FileText className="w-12 h-12 text-indigo-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-indigo-100 mb-2">
              Dataset
            </label>
            <select
              id="report-dataset"
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
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
            <label className="block text-sm font-medium text-indigo-100 mb-2">
              Report Type
            </label>
            <select
              id="report-type"
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="pdf" className="text-gray-900">PDF Report</option>
              <option value="csv" className="text-gray-900">CSV Export</option>
              <option value="json" className="text-gray-900">JSON Data</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                const datasetSelect = document.getElementById('report-dataset')
                const typeSelect = document.getElementById('report-type')
                if (datasetSelect.value && typeSelect.value) {
                  generateReport(typeSelect.value, datasetSelect.value)
                } else {
                  toast.error('Please select dataset and report type')
                }
              }}
              disabled={generatingReport}
              className="w-full bg-white text-indigo-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {generatingReport ? (
                <>
                  <div className="spinner w-4 h-4 border-2 border-indigo-600 border-t-transparent"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Generate Report</span>
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
            placeholder="Search reports..."
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

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getReportIcon(report.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {report.datasetName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSelectedReport(report)
                    setShowPreview(true)
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => downloadReport(report)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white uppercase">
                  {report.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Size:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {report.size}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Generated:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(report.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Ready to download</span>
                </div>
                
                <button
                  onClick={() => downloadReport(report)}
                  className="text-xs text-primary-600 hover:text-primary-700 transition-colors flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No reports yet
          </h3>
          <p className="text-gray-500 mb-6">
            Generate your first report by selecting a dataset above
          </p>
        </motion.div>
      )}

      {/* Report Preview Modal */}
      {showPreview && selectedReport && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="modal-content max-w-2xl w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedReport.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Report Preview
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setSelectedReport(null)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {getReportIcon(selectedReport.type)}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedReport.type.toUpperCase()} Report
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Dataset:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedReport.datasetName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Generated:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedReport.generatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedReport.size}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium text-green-600">
                        Ready to download
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This is a preview of the report content. The full report contains detailed analytics, charts, and insights based on your dataset data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setSelectedReport(null)
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    downloadReport(selectedReport)
                    setShowPreview(false)
                    setSelectedReport(null)
                  }}
                  className="btn-primary"
                >
                  Download Report
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
