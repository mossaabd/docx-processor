import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface FileStatus {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  file?: File;
}

function App() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => ({
      name: file.name,
      status: 'pending',
      file: file
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const formData = new FormData();
    files.forEach((fileStatus) => {
      if (fileStatus.file) {
        formData.append('files', fileStatus.file);
      }
    });

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed_files.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
      } else {
        setFiles(prev => prev.map(f => ({
          ...f,
          status: 'error',
          error: 'Processing failed'
        })));
      }
    } catch (error) {
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'error',
        error: 'Network error'
      })));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DOCX Processor</h1>
          <p className="text-lg text-gray-600">
            Upload your DOCX files to process them with custom formatting
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-colors
            ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            {isDragActive ? 'Drop your DOCX files here' : 'Drag & drop DOCX files here'}
          </p>
          <p className="text-sm text-gray-500">or click to select files</p>
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Files ({files.length})</h2>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileUp className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{file.name}</span>
                  </div>
                  <div>
                    {file.status === 'processing' && (
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={processFiles}
              disabled={isProcessing}
              className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-medium
                ${isProcessing
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </span>
              ) : (
                'Process Files'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;