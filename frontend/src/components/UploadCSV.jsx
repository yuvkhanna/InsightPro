import React, { useState, useCallback } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const UploadCSV = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid CSV file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onUploadSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="upload-card">
      <Card.Body>
        <Card.Title className="text-center mb-4">Upload Sales Data</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} mb-3`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p>Selected file: {file.name}</p>
            ) : (
              <p>Drag & drop a CSV file here, or click to select one</p>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={!file || loading}
            className="w-100"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UploadCSV; 