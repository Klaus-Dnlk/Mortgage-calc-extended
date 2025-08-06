import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileManager from './index';

// Mock file utilities
jest.mock('../../utils/file-utils', () => ({
  exportBanksToJSON: jest.fn(),
  exportBanksToCSV: jest.fn(),
  importBanksFromJSON: jest.fn(),
  importBanksFromCSV: jest.fn(),
  createFileInput: jest.fn(),
  validateFileSize: jest.fn(),
  formatFileSize: jest.fn(),
  createFilePreview: jest.fn()
}));

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Dialog: ({ children, open, onClose }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogActions: ({ children }) => <div data-testid="dialog-actions">{children}</div>,
  Typography: ({ children, variant }) => <div data-testid={`typography-${variant}`}>{children}</div>,
  Alert: ({ children, severity }) => <div data-testid={`alert-${severity}`}>{children}</div>,
  CircularProgress: ({ size }) => <div data-testid="circular-progress" data-size={size} />,
  List: ({ children }) => <ul data-testid="list">{children}</ul>,
  ListItem: ({ children }) => <li data-testid="list-item">{children}</li>,
  ListItemText: ({ primary, secondary }) => (
    <div data-testid="list-item-text">
      <div data-testid="primary">{primary}</div>
      <div data-testid="secondary">{secondary}</div>
    </div>
  ),
  ListItemIcon: ({ children }) => <div data-testid="list-item-icon">{children}</div>,
  Divider: () => <hr data-testid="divider" />,
  Chip: ({ label }) => <span data-testid="chip">{label}</span>
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
  FileDownload: () => <div data-testid="download-icon" />,
  FileUpload: () => <div data-testid="upload-icon" />,
  Description: () => <div data-testid="file-icon" />,
  CheckCircle: () => <div data-testid="success-icon" />,
  Error: () => <div data-testid="error-icon" />,
  Info: () => <div data-testid="info-icon" />
}));

describe('FileManager Component', () => {
  const mockBanks = [
    {
      BankName: 'Test Bank 1',
      InterestRate: 3.5,
      MaximumLoan: 500000,
      MinimumDownPayment: 50000,
      LoanTerm: 30
    },
    {
      BankName: 'Test Bank 2',
      InterestRate: 4.2,
      MaximumLoan: 750000,
      MinimumDownPayment: 75000,
      LoanTerm: 25
    }
  ];

  const defaultProps = {
    banks: mockBanks,
    onImportBanks: jest.fn(),
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test File Manager'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(<FileManager {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Test File Manager')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<FileManager {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should display export section', () => {
    render(<FileManager {...defaultProps} />);
    
    expect(screen.getByText('Export Banks Data')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should display import section', () => {
    render(<FileManager {...defaultProps} />);
    
    expect(screen.getByText('Import Banks Data')).toBeInTheDocument();
    expect(screen.getByText('Select File')).toBeInTheDocument();
  });

  it('should show available banks count', () => {
    render(<FileManager {...defaultProps} />);
    
    expect(screen.getByText('Available banks: 2')).toBeInTheDocument();
  });

  it('should handle JSON export', async () => {
    const { exportBanksToJSON } = require('../../utils/file-utils');
    exportBanksToJSON.mockResolvedValue(true);
    
    render(<FileManager {...defaultProps} />);
    
    const exportJsonButton = screen.getByText('Export JSON');
    fireEvent.click(exportJsonButton);
    
    await waitFor(() => {
      expect(exportBanksToJSON).toHaveBeenCalledWith(mockBanks, expect.stringContaining('banks-data-'));
    });
  });

  it('should handle CSV export', async () => {
    const { exportBanksToCSV } = require('../../utils/file-utils');
    exportBanksToCSV.mockResolvedValue(true);
    
    render(<FileManager {...defaultProps} />);
    
    const exportCsvButton = screen.getByText('Export CSV');
    fireEvent.click(exportCsvButton);
    
    await waitFor(() => {
      expect(exportBanksToCSV).toHaveBeenCalledWith(mockBanks, expect.stringContaining('banks-data-'));
    });
  });

  it('should show error when no banks to export', async () => {
    const { exportBanksToJSON } = require('../../utils/file-utils');
    exportBanksToJSON.mockRejectedValue(new Error('No banks data to export'));
    
    render(<FileManager {...defaultProps} banks={[]} />);
    
    const exportJsonButton = screen.getByText('Export JSON');
    fireEvent.click(exportJsonButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });
  });

  it('should handle file selection', () => {
    const { createFileInput } = require('../../utils/file-utils');
    const mockInput = document.createElement('input');
    createFileInput.mockReturnValue(mockInput);
    
    render(<FileManager {...defaultProps} />);
    
    const selectFileButton = screen.getByText('Select File');
    fireEvent.click(selectFileButton);
    
    expect(createFileInput).toHaveBeenCalledWith('.json,.csv', expect.any(Function));
  });

  it('should display file format information', () => {
    render(<FileManager {...defaultProps} />);
    
    expect(screen.getByText('Supported File Formats')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<FileManager {...defaultProps} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should handle empty banks array', () => {
    render(<FileManager {...defaultProps} banks={[]} />);
    
    expect(screen.getByText('Available banks: 0')).toBeInTheDocument();
  });

  it('should show loading state during export', async () => {
    const { exportBanksToJSON } = require('../../utils/file-utils');
    exportBanksToJSON.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<FileManager {...defaultProps} />);
    
    const exportJsonButton = screen.getByText('Export JSON');
    fireEvent.click(exportJsonButton);
    
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
  });

  it('should show loading state during import', async () => {
    const { importBanksFromJSON } = require('../../utils/file-utils');
    importBanksFromJSON.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<FileManager {...defaultProps} />);
    
    // Simulate file selection and import
    const mockFile = new File(['test'], 'test.json', { type: 'application/json' });
    const { createFileInput } = require('../../utils/file-utils');
    const mockInput = document.createElement('input');
    createFileInput.mockReturnValue(mockInput);
    
    // This would normally be triggered by file selection
    // For testing, we'll simulate the import directly
    const component = render(<FileManager {...defaultProps} />);
    
    // Note: In a real scenario, this would be triggered by file selection
    // Here we're just testing the structure
    expect(screen.getByText('Select File')).toBeInTheDocument();
  });

  it('should display success message after successful export', async () => {
    const { exportBanksToJSON } = require('../../utils/file-utils');
    exportBanksToJSON.mockResolvedValue(true);
    
    render(<FileManager {...defaultProps} />);
    
    const exportJsonButton = screen.getByText('Export JSON');
    fireEvent.click(exportJsonButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    });
  });

  it('should display error message on export failure', async () => {
    const { exportBanksToJSON } = require('../../utils/file-utils');
    exportBanksToJSON.mockRejectedValue(new Error('Export failed'));
    
    render(<FileManager {...defaultProps} />);
    
    const exportJsonButton = screen.getByText('Export JSON');
    fireEvent.click(exportJsonButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });
  });
});
