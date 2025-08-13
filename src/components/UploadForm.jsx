import React, { useState } from 'react';

const mandates = ["ACFR", "SBC", "MBRS"];

// Define submission types for each mandate
const submissionTypes = {
  MBRS: ["FS-MFRS", "FS-MPERS"],
  ACFR: [],
  SBC: []
};

// File validation constants
const ALLOWED_FILE_TYPES = ['application/pdf'];

function UploadForm({ onUpload }) {
  const [details, setDetails] = useState({ 
    mandate: '', 
    typeOfSubmission: '', 
    companyName: '', 
    description: '' 
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    // Clear success message when form changes
    setSuccessMessage('');
    setDetails(prev => ({ 
      ...prev, 
      [name]: value,
      // Reset typeOfSubmission when mandate changes
      ...(name === 'mandate' && { typeOfSubmission: '' }),
      // Reset company name and description when mandate or type of submission changes
      ...((name === 'mandate' || name === 'typeOfSubmission') && { 
        companyName: '', 
        description: '' 
      })
    }));
  };

  const validateFile = (file) => {
    // Check if file exists
    if (!file) {
      return 'Please select a file.';
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only PDF files are allowed.';
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      return 'File must have a .pdf extension.';
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'File cannot be empty.';
    }

    return '';
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    const error = validateFile(selectedFile);
    
    // Clear success message when file changes
    setSuccessMessage('');
    setFileError(error);
    setFile(error ? null : selectedFile);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate file again before submission
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }
    }

    if (!file) {
      setFileError('Please select a PDF file.');
      return;
    }
    
    if (!details.mandate) {
      alert('Please select a mandate.');
      return;
    }
    
    if (details.mandate === 'MBRS' && !details.typeOfSubmission) {
      alert('Please select a type of submission.');
      return;
    }

    setSubmitting(true);
    setFileError('');
    
    try {
      console.log('Starting upload with details:', details);
      console.log('File info:', { name: file.name, size: file.size, type: file.type });
      
      await onUpload(details, file);
      
      console.log('Upload completed successfully');
      setSuccessMessage('File uploaded successfully!');
      setDetails({ mandate: '', typeOfSubmission: '', companyName: '', description: '' });
      setFile(null);
      setFileError('');
      // Clear the file input safely
      const fileInput = document.getElementById('fileInput');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error details:', { message: error.message, stack: error.stack });
      alert('Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if type of submission should be shown
  const shouldShowTypeOfSubmission = details.mandate && submissionTypes[details.mandate].length > 0;

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <h2>File a PDF</h2>
      <label htmlFor="mandate">Mandate:</label>
      <select
        id="mandate"
        name="mandate"
        className="mandate-dropdown"
        value={details.mandate}
        onChange={handleChange}
        required
        style={{ marginBottom: 10 }}
      >
        <option value="">Select Mandate</option>
        {mandates.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      
      {shouldShowTypeOfSubmission && (
        <>
          <label htmlFor="typeOfSubmission">Type of Submission:</label>
          <select
            id="typeOfSubmission"
            name="typeOfSubmission"
            className="submission-type-dropdown"
            value={details.typeOfSubmission}
            onChange={handleChange}
            required
            style={{ marginBottom: 10 }}
          >
            <option value="">Select Type of Submission</option>
            {submissionTypes[details.mandate].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </>
      )}
      
      <input name="companyName" placeholder="Company Name" value={details.companyName} onChange={handleChange} required />
      <input name="description" placeholder="Description (Optional)" value={details.description} onChange={handleChange} />
      
      <div className="file-input-container">
        <label htmlFor="fileInput">Select PDF File:</label>
        <input 
          id="fileInput"
          type="file" 
          accept=".pdf,application/pdf" 
          onChange={handleFileChange} 
          required 
          className={fileError ? 'file-input-error' : ''}
        />
        {file && (
          <div className="file-info">
            <span className="file-name">✓ {file.name}</span>
            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        )}
        {fileError && (
          <div className="file-error">
            ❌ {fileError}
          </div>
        )}
        {successMessage && (
          <div className="file-success">
            ✅ {successMessage}
          </div>
        )}
      </div>
      
      <button type="submit" disabled={submitting || !!fileError}>
        {submitting ? 'Uploading...' : 'Submit'}
      </button>
    </form>
  );
}

export default UploadForm;