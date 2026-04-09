const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const csv = require('csv-parser');
const xlsx = require('xlsx');
const authMiddleware = require('../middleware/auth');
const Dataset = require('../models/Dataset');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// Upload dataset
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { name, description } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const fileType = path.extname(fileName).toLowerCase();

    // Parse file to get column info and row count
    let columnsInfo = [];
    let rowCount = 0;
    let sampleData = [];

    if (fileType === '.csv') {
      // Parse CSV
      const results = [];
      await new Promise((resolve, reject) => {
        require('fs').createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      if (results.length > 0) {
        columnsInfo = Object.keys(results[0]).map(key => ({
          name: key,
          type: inferDataType(results[0][key])
        }));
        rowCount = results.length;
        sampleData = results.slice(0, 5);
      }
    } else if (fileType === '.xlsx' || fileType === '.xls') {
      // Parse Excel
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length > 0) {
        columnsInfo = Object.keys(data[0]).map(key => ({
          name: key,
          type: inferDataType(data[0][key])
        }));
        rowCount = data.length;
        sampleData = data.slice(0, 5);
      }
    }

    // Create dataset record
    const dataset = await Dataset.create({
      userId: req.user.id,
      name: name || `Dataset_${Date.now()}`,
      description: description || '',
      fileName,
      filePath,
      fileSize,
      fileType,
      columnsInfo: JSON.stringify(columnsInfo),
      rowCount
    });

    // Store sample data for preview (optional - could be stored separately)
    const sampleDataPath = filePath.replace(path.extname(filePath), '_sample.json');
    await fs.writeFile(sampleDataPath, JSON.stringify(sampleData));

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          description: dataset.description,
          fileName: dataset.file_name,
          fileSize: dataset.file_size,
          fileType: dataset.file_type,
          rowCount: dataset.row_count,
          columnsInfo: JSON.parse(dataset.columns_info),
          uploadedAt: dataset.uploaded_at
        },
        sampleData
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file'
    });
  }
});

// Get all datasets for user
router.get('/datasets', authMiddleware, async (req, res) => {
  try {
    const datasets = await Dataset.findByUserId(req.user.id);
    
    const formattedDatasets = datasets.map(dataset => ({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      fileName: dataset.file_name,
      fileSize: dataset.file_size,
      fileType: dataset.file_type,
      rowCount: dataset.row_count,
      columnsInfo: JSON.parse(dataset.columns_info || '[]'),
      uploadedAt: dataset.uploaded_at
    }));

    res.json({
      success: true,
      data: formattedDatasets
    });
  } catch (error) {
    console.error('Get datasets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving datasets'
    });
  }
});

// Get dataset by ID
router.get('/datasets/:id', authMiddleware, async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    if (dataset.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get sample data if available
    let sampleData = [];
    try {
      const sampleDataPath = dataset.file_path.replace(path.extname(dataset.file_path), '_sample.json');
      const sampleDataContent = await fs.readFile(sampleDataPath, 'utf8');
      sampleData = JSON.parse(sampleDataContent);
    } catch (error) {
      // Sample data file might not exist, that's okay
    }

    res.json({
      success: true,
      data: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        fileName: dataset.file_name,
        fileSize: dataset.file_size,
        fileType: dataset.file_type,
        rowCount: dataset.row_count,
        columnsInfo: JSON.parse(dataset.columns_info || '[]'),
        uploadedAt: dataset.uploaded_at,
        sampleData
      }
    });
  } catch (error) {
    console.error('Get dataset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dataset'
    });
  }
});

// Update dataset
router.put('/datasets/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const dataset = await Dataset.findById(req.params.id);
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    if (dataset.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedDataset = await Dataset.update(req.params.id, { name, description });

    res.json({
      success: true,
      message: 'Dataset updated successfully',
      data: {
        id: updatedDataset.id,
        name: updatedDataset.name,
        description: updatedDataset.description,
        updatedAt: updatedDataset.updated_at
      }
    });
  } catch (error) {
    console.error('Update dataset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating dataset'
    });
  }
});

// Delete dataset
router.delete('/datasets/:id', authMiddleware, async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    if (dataset.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete files
    try {
      await fs.unlink(dataset.file_path);
      const sampleDataPath = dataset.file_path.replace(path.extname(dataset.file_path), '_sample.json');
      await fs.unlink(sampleDataPath);
    } catch (error) {
      console.error('Error deleting files:', error);
    }

    await Dataset.delete(req.params.id);

    res.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('Delete dataset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting dataset'
    });
  }
});

// Helper function to infer data type
function inferDataType(value) {
  if (value === null || value === undefined || value === '') {
    return 'text';
  }

  // Check if it's a number
  if (!isNaN(value) && !isNaN(parseFloat(value))) {
    return 'number';
  }

  // Check if it's a date
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    return 'date';
  }

  // Check if it's a boolean
  if (typeof value === 'boolean' || ['true', 'false', 'yes', 'no'].includes(value.toLowerCase())) {
    return 'boolean';
  }

  return 'text';
}

module.exports = router;
