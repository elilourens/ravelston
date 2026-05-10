'use client';

import { useState } from 'react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

export default function FileDropzone({ onFileSelected, isProcessing }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelected(file);
      } else {
        alert('Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).');
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelected(file);
      } else {
        alert('Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).');
      }
    }
  };

  const isValidFile = (file: File): boolean => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const filename = file.name.toLowerCase();
    return validExtensions.some((ext) => filename.endsWith(ext));
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragging ? '2px dashed var(--emerald)' : '2px dashed var(--forest)',
        background: isDragging ? 'rgba(16,185,129,.05)' : 'var(--cream-2)',
        padding: '40px',
        textAlign: 'center',
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      <div className="display" style={{ fontSize: 20, color: 'var(--forest)', marginBottom: 8 }}>
        Import Portfolio
      </div>
      <p style={{ fontSize: 14, color: 'var(--forest-ink)', marginBottom: 20, lineHeight: 1.6 }}>
        Drop a CSV or Excel file here to import multiple properties at once
      </p>

      {isProcessing ? (
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: 14, color: 'var(--forest)', marginBottom: 8 }}>
            Analyzing file with AI...
          </div>
          <div style={{ fontSize: 12, color: 'var(--forest-ink)' }}>
            Detecting columns and parsing properties
          </div>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            id="file-upload-import"
          />
          <label
            htmlFor="file-upload-import"
            className="smallcaps"
            style={{
              display: 'inline-block',
              padding: '10px 18px',
              background: 'var(--forest)',
              color: 'var(--cream)',
              fontSize: 11,
              letterSpacing: '.18em',
              cursor: 'pointer',
              boxShadow: '3px 3px 0 var(--emerald)',
            }}
          >
            Choose File
          </label>
          <div style={{ fontSize: 11, color: 'var(--forest-ink)', marginTop: 12 }}>
            Supports: CSV (.csv), Excel (.xlsx, .xls) · Max 500 properties
          </div>
        </>
      )}
    </div>
  );
}
