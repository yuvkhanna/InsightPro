import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { 
  FiUploadCloud, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiInfo, 
  FiFileText, 
  FiDownload,
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Sample CSV data for download
const SAMPLE_CSV = `date,revenue,product
2023-01-15,1200.50,Product A
2023-01-17,850.75,Product B
2023-01-20,1500.25,Product A
2023-01-22,950.00,Product C
2023-01-25,2100.50,Product B`;

const UploadBox = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const hiddenFileInputRef = useRef(null);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    
    const validExtensions = ['csv', 'xlsx', 'xls'];
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    
    if (validExtensions.includes(fileExt)) {
      setFile(selectedFile);
      setError('');
      setPreview(null); // Reset preview when new file is selected
      setMessages([]);
      setUploadSuccess(false);
    } else {
      setError(`Please upload a valid file (${validExtensions.join(', ')})`);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    processFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  // Handle file selection from the hidden input
  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  // Open file dialog by clicking the hidden input
  const handleBrowseClick = () => {
    hiddenFileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setMessages([]);
    setUploadSuccess(false);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      
      // Check for success status
      if (data.status === 'success') {
        setPreview(data.preview);
        setMessages(data.messages || []);
        setUploadSuccess(true);
        
        if (data.metrics) {
          // Small delay for animation to be visible
          setTimeout(() => {
            onUploadSuccess(data);
          }, 1000);
        }
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      // Handle error response from backend
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Error uploading file');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display in the preview table
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '';
    return typeof value === 'number' 
      ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : value;
  };

  // Handle sample CSV download
  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_sales_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset the file selection
  const handleReset = () => {
    setFile(null);
    setError('');
    setPreview(null);
    setMessages([]);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center w-full pt-6 pb-12">
      {/* Hidden file input for browse button */}
      <input 
        type="file"
        ref={hiddenFileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".csv,.xlsx,.xls"
      />
      
      <div className="w-full max-w-3xl mx-auto">
        <motion.div 
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white">
              Sales Data Upload
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your sales file to get insights and visualizations
            </p>
          </div>
          
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md mb-6 flex items-start"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiAlertCircle className="mt-0.5 mr-3 flex-shrink-0 h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">Error</div>
                  <div>{error}</div>
                </div>
                <button 
                  onClick={() => setError('')} 
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Success Message */}
          <AnimatePresence>
            {uploadSuccess && (
              <motion.div 
                className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-md mb-6 flex items-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mr-3 flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20,
                      delay: 0.2 
                    }}
                  >
                    <FiCheckCircle className="h-5 w-5" />
                  </motion.div>
                </div>
                <div>File uploaded successfully! Generating your dashboard...</div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Processing Messages */}
          <AnimatePresence>
            {messages.length > 0 && (
              <motion.div 
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-4 rounded-md mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-2">
                  <FiInfo className="mr-2 flex-shrink-0" />
                  <span className="font-semibold">Processing Information</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {messages.map((message, index) => {
                    if (message.includes("Date format detected:")) {
                      return (
                        <motion.li 
                          key={index} 
                          className="font-semibold text-primary-600 dark:text-primary-400"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {message}
                        </motion.li>
                      );
                    }
                    return (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {message}
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Upload Form */}
          <form onSubmit={handleSubmit}>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                dropzone relative mb-6 p-8 sm:p-10
                ${isDragActive ? 'dropzone-active' : ''}
                ${file ? 'border-primary-500 dark:border-primary-500' : ''}
                hover:border-primary-400 dark:hover:border-primary-400
                group cursor-pointer
              `}
              onClick={() => !file && hiddenFileInputRef.current.click()}
            >
              <input {...getInputProps()} ref={fileInputRef} />
              
              <motion.div 
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Upload Icon with Animation */}
                <motion.div
                  className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-4 text-primary-500 dark:text-primary-400"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {file ? (
                    <FiFileText className="h-12 w-12" />
                  ) : (
                    <FiUploadCloud className="h-12 w-12" />
                  )}
                </motion.div>
                
                {/* File Details or Drag Instructions */}
                {file ? (
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-medium">
                      <span className="text-primary-600 dark:text-primary-400">{file.name}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="mt-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium flex items-center"
                    >
                      <FiX className="mr-1" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      or
                    </p>
                    
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="px-4 py-2 mb-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-medium transition-colors"
                    >
                      Browse Files
                    </button>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto space-y-1">
                      <p className="font-medium">Requirements:</p>
                      <p>• Accepted formats: CSV, XLSX, XLS</p>
                      <p>• Required columns: date, revenue, product</p>
                      <p>• Preferred date format: YYYY-MM-DD</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Sample File Download Link */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center group"
              >
                <FiDownload className="mr-1.5 group-hover:animate-bounce" />
                Download sample CSV file
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!file || loading}
              whileHover={{ scale: !file || loading ? 1 : 1.02 }}
              whileTap={{ scale: !file || loading ? 1 : 0.98 }}
              className={`
                btn btn-primary w-full py-3 font-medium flex justify-center items-center
                ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}
                shadow-md hover:shadow-lg transition-all
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Upload & Generate Dashboard'}
            </motion.button>
          </form>
          
          {/* File Preview */}
          <AnimatePresence>
            {preview && (
              <motion.div 
                className="mt-10 sm:mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center mb-4">
                  <FiCheckCircle className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Data Preview</h3>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        {Object.keys(preview[0] || {}).map(key => (
                          <th 
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {preview.map((row, i) => (
                        <motion.tr 
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                        >
                          {Object.entries(row).map(([key, value], j) => (
                            <td 
                              key={j}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                            >
                              {key.toLowerCase() === 'date' ? formatDate(value) :
                              key.toLowerCase() === 'revenue' ? formatCurrency(value) : 
                              String(value)}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic text-center">
                  Showing the first {preview.length} rows of your data
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadBox; 