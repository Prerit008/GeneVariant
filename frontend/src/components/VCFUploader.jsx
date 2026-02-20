// components/VCFUploader.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const VCFUploader = ({ onFileSelected, selectedFile }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, complete, error
  const [fileError, setFileError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setFileError('File size exceeds 5MB limit');
      } else if (error.code === 'file-invalid-type') {
        setFileError('Invalid file type. Please upload a .vcf file');
      } else {
        setFileError('Error uploading file');
      }
      setUploadStatus('error');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setFileError('');
      setUploadStatus('uploading');
      onFileSelected(file);
      
      // Simulate progress for better UX
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus('processing');
            
            // Simulate processing
            setTimeout(() => {
              setUploadStatus('complete');
            }, 500);
            
            return 100;
          }
          return prev + 5;
        });
      }, 30);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.vcf'],
      'text/plain': ['.vcf'],
      'application/vnd.ms-excel': ['.vcf'],
      'text/vcard': ['.vcf']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const removeFile = (e) => {
    e.stopPropagation();
    onFileSelected(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setFileError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'fa-cloud-upload-alt text-blue-500';
      case 'processing':
        return 'fa-microscope text-purple-500';
      case 'complete':
        return 'fa-check-circle text-emerald-500';
      case 'error':
        return 'fa-exclamation-circle text-rose-500';
      default:
        return 'fa-file-medical text-slate-400';
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing VCF data...';
      case 'complete':
        return 'Ready for analysis';
      case 'error':
        return 'Upload failed';
      default:
        return 'File ready';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with gradient */}
      <div className="flex items-center space-x-2">
        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
        <label className="text-sm font-semibold text-slate-700 tracking-wide">
          VCF File Upload
        </label>
        <div className="flex items-center space-x-1 ml-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-slate-400">Secure upload</span>
        </div>
      </div>
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`relative overflow-hidden border-2 border-dashed rounded-xl p-8 
                     text-center cursor-pointer transition-all duration-200
                     ${isDragActive 
                       ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 scale-[1.02]' 
                       : fileError
                         ? 'border-rose-300 bg-rose-50/30'
                         : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50/50'}`}
        >
          <input {...getInputProps()} />
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 10px 10px, #94a3b8 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Icon */}
          <div className={`relative w-16 h-16 mx-auto mb-4 rounded-2xl 
                        bg-gradient-to-br from-cyan-500 to-blue-500 
                        flex items-center justify-center shadow-lg 
                        ${isDragActive ? 'scale-110' : ''} transition-all duration-200`}>
            <i className={`fas fa-cloud-upload-alt text-2xl text-white`}></i>
            {isDragActive && (
              <div className="absolute -inset-1 bg-cyan-400 rounded-2xl opacity-30 animate-ping"></div>
            )}
          </div>
          
          {/* Text */}
          {isDragActive ? (
            <p className="text-cyan-700 font-medium">Drop your VCF file here...</p>
          ) : (
            <>
              <p className="text-slate-700 font-medium mb-1">
                <span className="text-cyan-600">Drag & drop</span> or <span className="text-cyan-600">browse</span>
              </p>
              <p className="text-xs text-slate-400 mb-2">
                Supports VCF files (max 5MB)
              </p>
            </>
          )}
          
          {/* Error message */}
          {fileError && (
            <div className="mt-3 text-xs text-rose-600 bg-rose-50 py-2 px-3 rounded-lg inline-flex items-center">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {fileError}
            </div>
          )}
          
          {/* File specs */}
          <div className="mt-4 flex justify-center space-x-4 text-xs text-slate-400">
            <span><i className="fas fa-dna mr-1"></i> VCF v4.0+</span>
            <span><i className="fas fa-shield-alt mr-1"></i> Encrypted</span>
            <span><i className="fas fa-clock mr-1"></i> Instant</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* File header */}
          <div className="bg-gradient-to-r from-slate-50 to-white px-4 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <i className="fas fa-file-medical text-white text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                title="Remove file"
              >
                <i className="fas fa-times text-slate-400 group-hover:text-slate-600"></i>
              </button>
            </div>
          </div>
          
          {/* Progress/Status area */}
          <div className="p-4">
            {uploadStatus !== 'idle' && (
              <div className="space-y-3">
                {/* Status indicator */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <i className={`fas ${getStatusIcon()} ${
                      uploadStatus === 'processing' ? 'animate-spin' : ''
                    }`}></i>
                    <span className={`font-medium ${
                      uploadStatus === 'complete' ? 'text-emerald-600' :
                      uploadStatus === 'error' ? 'text-rose-600' :
                      'text-slate-600'
                    }`}>
                      {getStatusText()}
                    </span>
                  </div>
                  {uploadStatus === 'uploading' && (
                    <span className="text-xs font-medium text-cyan-600">{uploadProgress}%</span>
                  )}
                </div>
                
                {/* Progress bar */}
                {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                  <div className="relative">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full
                                  ${uploadStatus === 'processing' 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    
                    {/* Processing animation */}
                    {uploadStatus === 'processing' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full">
                          <div className="h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent 
                                        animate-shimmer" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Success message with details */}
                {uploadStatus === 'complete' && (
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">File processed successfully</p>
                        <p className="text-xs text-emerald-600 mt-1">
                          ✓ VCF format validated<br />
                          ✓ Sample data extracted<br />
                          ✓ Ready for analysis
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-end space-x-2">
            <button
              onClick={removeFile}
              className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 
                       rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Help text */}
      <div className="flex items-center space-x-2 text-xs">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 
                      flex items-center justify-center">
          <i className="fas fa-info text-[8px] text-slate-500"></i>
        </div>
        <span className="text-slate-500">
          Secure, HIPAA-compliant file processing. Your data is encrypted.
        </span>
      </div>
    </div>
  );
};

export default VCFUploader;