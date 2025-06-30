const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
const uploadDirs = {
  items: path.join(__dirname, '../uploads/items'),
  talent: path.join(__dirname, '../uploads/talent'),
  avatars: path.join(__dirname, '../uploads/avatars'),
  documents: path.join(__dirname, '../uploads/documents')
};

Object.values(uploadDirs).forEach(ensureDirectoryExists);

// Storage configuration for different types
const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension);
      const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
      
      cb(null, `${sanitizedBaseName}_${uniqueSuffix}${extension}`);
    }
  });
};

// File filter function
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

// Image file types
const imageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Document file types
const documentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
];

// All allowed file types for talent products
const talentFileTypes = [
  ...imageTypes,
  ...documentTypes,
  'video/mp4',
  'video/avi',
  'video/mov',
  'audio/mp3',
  'audio/wav',
  'audio/mpeg'
];

// Upload configurations
const uploadConfigs = {
  // For item images
  itemImages: multer({
    storage: createStorage(uploadDirs.items),
    fileFilter: createFileFilter(imageTypes),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 5 // Maximum 5 images per item
    }
  }),

  // For talent product files (images + documents)
  talentFiles: multer({
    storage: createStorage(uploadDirs.talent),
    fileFilter: createFileFilter(talentFileTypes),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10 // Maximum 10 files per talent product
    }
  }),

  // For user avatars
  avatar: multer({
    storage: createStorage(uploadDirs.avatars),
    fileFilter: createFileFilter(imageTypes),
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
      files: 1 // Only one avatar
    }
  }),

  // For documents (PDFs, etc.)
  documents: multer({
    storage: createStorage(uploadDirs.documents),
    fileFilter: createFileFilter(documentTypes),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5 // Maximum 5 documents
    }
  })
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size allowed is based on upload type.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Check the maximum file limit for this upload type.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please check the field name.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${error.message}`
        });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Helper function to get file URL
const getFileUrl = (req, filename, type = 'items') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to delete multiple files
const deleteFiles = (filePaths) => {
  const results = [];
  filePaths.forEach(filePath => {
    results.push(deleteFile(filePath));
  });
  return results;
};

// Middleware to process uploaded files and add URLs
const processUploadedFiles = (uploadType = 'items') => {
  return (req, res, next) => {
    if (req.files && req.files.length > 0) {
      req.uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: getFileUrl(req, file.filename, uploadType)
      }));
    }
    next();
  };
};

// Middleware to validate file requirements
const validateFileRequirements = (required = false, minFiles = 0, maxFiles = 10) => {
  return (req, res, next) => {
    const fileCount = req.files ? req.files.length : 0;
    
    if (required && fileCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one file is required'
      });
    }
    
    if (fileCount < minFiles) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${minFiles} file(s) required`
      });
    }
    
    if (fileCount > maxFiles) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxFiles} file(s) allowed`
      });
    }
    
    next();
  };
};

module.exports = {
  uploadConfigs,
  handleMulterError,
  getFileUrl,
  deleteFile,
  deleteFiles,
  processUploadedFiles,
  validateFileRequirements,
  uploadDirs
};
