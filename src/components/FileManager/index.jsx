import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  FileUpload as UploadIcon,
  Description as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  exportBanksToJSON,
  exportBanksToCSV,
  importBanksFromJSON,
  importBanksFromCSV,
  createFileInput,
  validateFileSize,
  formatFileSize,
  createFilePreview
} from '../../utils/file-utils';

/**
 * FileManager Component
 * 
 * Provides file export/import functionality using File API, FileReader, and Blob
 * Demonstrates "Manages files with language filesystem capabilities"
 */
const FileManager = ({ 
  banks, 
  onImportBanks, 
  isOpen, 
  onClose,
  title = "File Manager"
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedBanks, setImportedBanks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle file selection
  const handleFileSelect = async (file) => {
    setError('');
    setSuccess('');
    setSelectedFile(file);
    setImportedBanks([]);

    try {
      // Validate file size (max 10MB)
      if (!validateFileSize(file, 10)) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Create file preview
      try {
        const preview = await createFilePreview(file, 200);
        setFilePreview(preview);
      } catch (previewError) {
        setFilePreview('Preview not available for this file type');
      }

    } catch (error) {
      setError(error.message);
      setSelectedFile(null);
    }
  };

  // Handle file import
  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsImporting(true);
    setError('');
    setSuccess('');

    try {
      let banks;
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

      if (fileExtension === 'json') {
        banks = await importBanksFromJSON(selectedFile);
      } else if (fileExtension === 'csv') {
        banks = await importBanksFromCSV(selectedFile);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.');
      }

      setImportedBanks(banks);
      setSuccess(`Successfully imported ${banks.length} banks from ${selectedFile.name}`);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle applying imported banks
  const handleApplyImport = () => {
    if (importedBanks.length > 0 && onImportBanks) {
      onImportBanks(importedBanks);
      setSuccess('Banks data applied successfully!');
      setImportedBanks([]);
      setSelectedFile(null);
      setFilePreview('');
    }
  };

  // Handle file export
  const handleExport = async (format) => {
    if (banks.length === 0) {
      setError('No banks data to export');
      return;
    }

    setIsExporting(true);
    setError('');
    setSuccess('');

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'json') {
        await exportBanksToJSON(banks, `banks-data-${timestamp}.json`);
        setSuccess(`Successfully exported ${banks.length} banks to JSON file`);
      } else if (format === 'csv') {
        await exportBanksToCSV(banks, `banks-data-${timestamp}.csv`);
        setSuccess(`Successfully exported ${banks.length} banks to CSV file`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Create file input for selection
  const openFileSelector = () => {
    const input = createFileInput('.json,.csv', handleFileSelect);
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  // Reset state
  const handleClose = () => {
    setError('');
    setSuccess('');
    setSelectedFile(null);
    setImportedBanks([]);
    setFilePreview('');
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FileIcon />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Export Banks Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export your banks data to JSON or CSV format for backup or sharing.
          </Typography>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('json')}
              disabled={isExporting || banks.length === 0}
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
              disabled={isExporting || banks.length === 0}
            >
              Export CSV
            </Button>
            {isExporting && <CircularProgress size={24} />}
          </Box>

          {banks.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Available banks: {banks.length}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Import Banks Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import banks data from JSON or CSV files. Supported formats: JSON, CSV (max 10MB).
          </Typography>

          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={openFileSelector}
            disabled={isImporting}
            sx={{ mb: 2 }}
          >
            Select File
          </Button>

          {selectedFile && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected File:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={selectedFile.name}
                    secondary={`Size: ${formatFileSize(selectedFile.size)} | Type: ${selectedFile.type}`}
                  />
                </ListItem>
              </List>

              {filePreview && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    File Preview:
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      maxHeight: 100,
                      overflow: 'auto'
                    }}
                  >
                    {filePreview}
                  </Box>
                </Box>
              )}

              <Button
                variant="outlined"
                onClick={handleImport}
                disabled={isImporting}
                sx={{ mt: 2 }}
              >
                {isImporting ? <CircularProgress size={20} /> : 'Import Data'}
              </Button>
            </Box>
          )}

          {importedBanks.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f8ff', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Imported Banks ({importedBanks.length}):
              </Typography>
              <List dense>
                {importedBanks.slice(0, 5).map((bank, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SuccessIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={bank.BankName}
                      secondary={`${bank.InterestRate}% | $${bank.MaximumLoan.toLocaleString()}`}
                    />
                  </ListItem>
                ))}
                {importedBanks.length > 5 && (
                  <ListItem>
                    <ListItemText
                      secondary={`... and ${importedBanks.length - 5} more banks`}
                    />
                  </ListItem>
                )}
              </List>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyImport}
                sx={{ mt: 1 }}
              >
                Apply Imported Data
              </Button>
            </Box>
          )}
        </Box>

        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <ErrorIcon />
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <SuccessIcon />
            {success}
          </Alert>
        )}

        {/* File Format Information */}
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Supported File Formats
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip label="JSON" size="small" color="primary" />
            <Chip label="CSV" size="small" color="primary" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Maximum file size: 10MB | CSV must include headers: Bank Name, Interest Rate (%), Maximum Loan ($), Minimum Down Payment ($), Loan Term (years)
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileManager;
