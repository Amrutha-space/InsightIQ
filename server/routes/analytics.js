const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const authMiddleware = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const pool = require('../config/database');

const router = express.Router();

// Execute SQL query on dataset
router.post('/query', authMiddleware, validateRequest(schemas.dataQuery), async (req, res) => {
  try {
    const { query, datasetId } = req.body;

    // Verify dataset ownership
    const datasetResult = await pool.query(
      'SELECT * FROM datasets WHERE id = $1 AND user_id = $2',
      [datasetId, req.user.id]
    );

    if (datasetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or access denied'
      });
    }

    const dataset = datasetResult.rows[0];
    const filePath = dataset.file_path;

    // Read and parse the data file
    let data = [];
    const fileType = path.extname(filePath).toLowerCase();

    if (fileType === '.csv') {
      data = await parseCSV(filePath);
    } else if (fileType === '.xlsx' || fileType === '.xls') {
      data = await parseExcel(filePath);
    }

    // Execute the query (simplified SQL-like operations)
    const result = await executeQuery(data, query);

    // Save query to history
    await pool.query(
      'INSERT INTO data_queries (user_id, dataset_id, query_name, query_text, query_type) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, datasetId, `Query_${Date.now()}`, query, 'custom']
    );

    res.json({
      success: true,
      data: {
        results: result.data,
        rowCount: result.rowCount,
        executionTime: result.executionTime,
        columns: result.columns
      }
    });
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error executing query'
    });
  }
});

// Get predefined queries
router.get('/queries/predefined', authMiddleware, async (req, res) => {
  try {
    const predefinedQueries = [
      {
        id: 'top_products',
        name: 'Top Products by Revenue',
        description: 'Shows the highest revenue generating products',
        query: 'SELECT product_name, SUM(revenue) as total_revenue FROM data GROUP BY product_name ORDER BY total_revenue DESC LIMIT 10',
        category: 'Revenue Analysis'
      },
      {
        id: 'revenue_trends',
        name: 'Revenue Trends by Month',
        description: 'Monthly revenue trends over time',
        query: 'SELECT DATE_TRUNC("month", date) as month, SUM(revenue) as monthly_revenue FROM data GROUP BY month ORDER BY month',
        category: 'Revenue Analysis'
      },
      {
        id: 'regional_analysis',
        name: 'Regional Sales Analysis',
        description: 'Sales performance by region',
        query: 'SELECT region, COUNT(*) as total_sales, SUM(revenue) as total_revenue FROM data GROUP BY region ORDER BY total_revenue DESC',
        category: 'Geographic Analysis'
      },
      {
        id: 'customer_segments',
        name: 'Customer Segments',
        description: 'Customer segmentation by purchase behavior',
        query: 'SELECT customer_type, COUNT(*) as customer_count, AVG(revenue) as avg_revenue FROM data GROUP BY customer_type',
        category: 'Customer Analysis'
      },
      {
        id: 'product_performance',
        name: 'Product Performance',
        description: 'Product performance metrics',
        query: 'SELECT product_name, COUNT(*) as sales_count, AVG(price) as avg_price, SUM(revenue) as total_revenue FROM data GROUP BY product_name',
        category: 'Product Analysis'
      }
    ];

    res.json({
      success: true,
      data: predefinedQueries
    });
  } catch (error) {
    console.error('Get predefined queries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving predefined queries'
    });
  }
});

// Get query history
router.get('/queries/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dq.*, d.name as dataset_name 
       FROM data_queries dq 
       JOIN datasets d ON dq.dataset_id = d.id 
       WHERE dq.user_id = $1 
       ORDER BY dq.created_at DESC 
       LIMIT 20`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get query history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving query history'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    // Get user's datasets stats
    const datasetStats = await pool.query(
      `SELECT 
        COUNT(*) as total_datasets,
        SUM(row_count) as total_rows,
        SUM(file_size) as total_storage
       FROM datasets 
       WHERE user_id = $1`,
      [req.user.id]
    );

    // Get query stats
    const queryStats = await pool.query(
      'SELECT COUNT(*) as total_queries FROM data_queries WHERE user_id = $1',
      [req.user.id]
    );

    // Get insights stats
    const insightsStats = await pool.query(
      'SELECT COUNT(*) as total_insights FROM ai_insights WHERE user_id = $1',
      [req.user.id]
    );

    // Get recent activity
    const recentActivity = await pool.query(
      `SELECT 
        'dataset' as type, 
        name as title, 
        uploaded_at as created_at 
       FROM datasets 
       WHERE user_id = $1 
       UNION ALL
       SELECT 
        'query' as type, 
        query_name as title, 
        created_at 
       FROM data_queries 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        totalDatasets: parseInt(datasetStats.rows[0].total_datasets) || 0,
        totalRows: parseInt(datasetStats.rows[0].total_rows) || 0,
        totalStorage: parseInt(datasetStats.rows[0].total_storage) || 0,
        totalQueries: parseInt(queryStats.rows[0].total_queries) || 0,
        totalInsights: parseInt(insightsStats.rows[0].total_insights) || 0,
        recentActivity: recentActivity.rows
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics'
    });
  }
});

// Helper functions
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    require('fs').createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
}

async function executeQuery(data, query) {
  const startTime = Date.now();
  
  try {
    // This is a simplified query executor
    // In a real application, you would use a proper SQL parser
    // or an in-memory database like SQLite
    
    let result = [];
    
    // Handle basic SELECT operations
    if (query.toLowerCase().includes('select') && query.toLowerCase().includes('from data')) {
      // Extract columns
      const columnsMatch = query.match(/select\s+(.*?)\s+from/i);
      let columns = columnsMatch ? columnsMatch[1].split(',').map(col => col.trim()) : ['*'];
      
      // Handle GROUP BY
      if (query.toLowerCase().includes('group by')) {
        const groupByMatch = query.match(/group by\s+(.*?)(?:\s+order by|\s+limit|$)/i);
        const groupByColumn = groupByMatch ? groupByMatch[1].trim() : null;
        
        if (groupByColumn) {
          const grouped = {};
          data.forEach(row => {
            const key = row[groupByColumn];
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
          });
          
          result = Object.keys(grouped).map(key => {
            const group = grouped[key];
            const row = { [groupByColumn]: key };
            
            columns.forEach(col => {
              if (col.includes('COUNT(*)')) {
                row['count'] = group.length;
              } else if (col.includes('SUM(')) {
                const sumMatch = col.match(/SUM\((.*?)\)/i);
                const sumColumn = sumMatch ? sumMatch[1] : 'revenue';
                row['total'] = group.reduce((sum, item) => sum + (parseFloat(item[sumColumn]) || 0), 0);
              } else if (col.includes('AVG(')) {
                const avgMatch = col.match(/AVG\((.*?)\)/i);
                const avgColumn = avgMatch ? avgMatch[1] : 'revenue';
                row['average'] = group.reduce((sum, item) => sum + (parseFloat(item[avgColumn]) || 0), 0) / group.length;
              } else if (col !== '*') {
                row[col] = group[0][col];
              }
            });
            
            return row;
          });
        }
      } else {
        // Simple select without grouping
        result = data.map(row => {
          if (columns[0] === '*') return row;
          
          const filteredRow = {};
          columns.forEach(col => {
            filteredRow[col] = row[col];
          });
          return filteredRow;
        });
      }
      
      // Handle ORDER BY
      if (query.toLowerCase().includes('order by')) {
        const orderByMatch = query.match(/order by\s+(.*?)\s+(asc|desc)?/i);
        if (orderByMatch) {
          const orderByColumn = orderByMatch[1].trim();
          const direction = orderByMatch[2] ? orderByMatch[2].toLowerCase() : 'asc';
          
          result.sort((a, b) => {
            const aVal = a[orderByColumn];
            const bVal = b[orderByColumn];
            
            if (direction === 'desc') {
              return bVal > aVal ? 1 : -1;
            } else {
              return aVal > bVal ? 1 : -1;
            }
          });
        }
      }
      
      // Handle LIMIT
      if (query.toLowerCase().includes('limit')) {
        const limitMatch = query.match(/limit\s+(\d+)/i);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          result = result.slice(0, limit);
        }
      }
    }
    
    const executionTime = Date.now() - startTime;
    const columns = result.length > 0 ? Object.keys(result[0]) : [];
    
    return {
      data: result,
      rowCount: result.length,
      executionTime,
      columns
    };
  } catch (error) {
    throw new Error(`Query execution failed: ${error.message}`);
  }
}

module.exports = router;
