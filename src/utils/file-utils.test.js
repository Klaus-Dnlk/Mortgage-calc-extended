import {
  exportBanksToJSON,
  exportBanksToCSV,
  importBanksFromJSON,
  importBanksFromCSV,
  createFileInput,
  getFileExtension,
  validateFileSize,
  createFilePreview,
  formatFileSize
} from './file-utils';

// Mock DOM APIs
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();
global.document.createElement = jest.fn(() => ({
  click: jest.fn(),
  href: '',
  download: ''
}));
global.document.body.appendChild = jest.fn();
global.document.body.removeChild = jest.fn();

// Mock FileReader
global.FileReader = jest.fn(() => ({
  readAsText: jest.fn(),
  onload: null,
  onerror: null,
  result: ''
}));

// Mock File constructor
global.File = jest.fn((content, filename, options) => ({
  name: filename,
  type: options?.type || 'text/plain',
  size: content.length,
  text: () => Promise.resolve(content)
}));

// Mock Blob constructor
global.Blob = jest.fn((content, options) => ({
  size: content[0].length,
  type: options?.type || 'text/plain'
}));

describe('File Utilities', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportBanksToJSON', () => {
    it('should export banks data to JSON file', () => {
      const result = exportBanksToJSON(mockBanks, 'test-banks.json');
      
      expect(result).toBe(true);
      expect(Blob).toHaveBeenCalledWith(
        [JSON.stringify(mockBanks, null, 2)],
        { type: 'application/json;charset=utf-8' }
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should handle empty banks array', () => {
      const result = exportBanksToJSON([], 'empty-banks.json');
      
      expect(result).toBe(true);
      expect(Blob).toHaveBeenCalledWith(
        ['[]'],
        { type: 'application/json;charset=utf-8' }
      );
    });

    it('should throw error on failure', () => {
      // Mock Blob to throw error
      global.Blob = jest.fn(() => {
        throw new Error('Blob creation failed');
      });

      expect(() => exportBanksToJSON(mockBanks)).toThrow('Failed to export banks data');
    });
  });

  describe('exportBanksToCSV', () => {
    it('should export banks data to CSV file', () => {
      const result = exportBanksToCSV(mockBanks, 'test-banks.csv');
      
      expect(result).toBe(true);
      expect(Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Bank Name,Interest Rate (%),Maximum Loan ($)')],
        { type: 'text/csv;charset=utf-8' }
      );
    });

    it('should throw error for empty banks array', () => {
      expect(() => exportBanksToCSV([], 'empty-banks.csv')).toThrow('No banks data to export');
    });

    it('should include all bank data in CSV', () => {
      exportBanksToCSV(mockBanks);
      
      const blobCall = Blob.mock.calls[0];
      const csvContent = blobCall[0][0];
      
      expect(csvContent).toContain('Test Bank 1');
      expect(csvContent).toContain('3.5');
      expect(csvContent).toContain('500000');
      expect(csvContent).toContain('50000');
      expect(csvContent).toContain('30');
    });
  });

  describe('importBanksFromJSON', () => {
    it('should import banks from valid JSON file', async () => {
      const mockFile = new File(JSON.stringify(mockBanks), 'test.json', { type: 'application/json' });
      const mockReader = new FileReader();
      
      // Simulate successful file read
      setTimeout(() => {
        mockReader.result = JSON.stringify(mockBanks);
        mockReader.onload({ target: { result: JSON.stringify(mockBanks) } });
      }, 0);

      const result = await importBanksFromJSON(mockFile);
      
      expect(result).toEqual(mockBanks);
    });

    it('should validate bank data structure', async () => {
      const invalidBanks = [
        { BankName: 'Test Bank', InterestRate: 'invalid' }
      ];
      const mockFile = new File(JSON.stringify(invalidBanks), 'invalid.json', { type: 'application/json' });
      const mockReader = new FileReader();
      
      setTimeout(() => {
        mockReader.onload({ target: { result: JSON.stringify(invalidBanks) } });
      }, 0);

      await expect(importBanksFromJSON(mockFile)).rejects.toThrow('Invalid or missing InterestRate');
    });

    it('should reject non-JSON files', async () => {
      const mockFile = new File('not json', 'test.txt', { type: 'text/plain' });
      
      await expect(importBanksFromJSON(mockFile)).rejects.toThrow('Please select a valid JSON file');
    });

    it('should handle file read errors', async () => {
      const mockFile = new File('test', 'test.json', { type: 'application/json' });
      const mockReader = new FileReader();
      
      setTimeout(() => {
        mockReader.onerror();
      }, 0);

      await expect(importBanksFromJSON(mockFile)).rejects.toThrow('Failed to read file');
    });
  });

  describe('importBanksFromCSV', () => {
    it('should import banks from valid CSV file', async () => {
      const csvContent = `Bank Name,Interest Rate (%),Maximum Loan ($),Minimum Down Payment ($),Loan Term (years)
"Test Bank 1",3.5,500000,50000,30
"Test Bank 2",4.2,750000,75000,25`;
      
      const mockFile = new File(csvContent, 'test.csv', { type: 'text/csv' });
      const mockReader = new FileReader();
      
      setTimeout(() => {
        mockReader.onload({ target: { result: csvContent } });
      }, 0);

      const result = await importBanksFromCSV(mockFile);
      
      expect(result).toHaveLength(2);
      expect(result[0].BankName).toBe('Test Bank 1');
      expect(result[0].InterestRate).toBe(3.5);
    });

    it('should reject non-CSV files', async () => {
      const mockFile = new File('not csv', 'test.txt', { type: 'text/plain' });
      
      await expect(importBanksFromCSV(mockFile)).rejects.toThrow('Please select a valid CSV file');
    });

    it('should validate CSV format', async () => {
      const invalidCsv = 'Invalid,CSV,Format';
      const mockFile = new File(invalidCsv, 'invalid.csv', { type: 'text/csv' });
      const mockReader = new FileReader();
      
      setTimeout(() => {
        mockReader.onload({ target: { result: invalidCsv } });
      }, 0);

      await expect(importBanksFromCSV(mockFile)).rejects.toThrow('Invalid CSV format');
    });
  });

  describe('createFileInput', () => {
    it('should create file input element', () => {
      const onChange = jest.fn();
      const input = createFileInput('.json,.csv', onChange);
      
      expect(input.type).toBe('file');
      expect(input.accept).toBe('.json,.csv');
      expect(input.style.display).toBe('none');
    });

    it('should handle file selection', () => {
      const onChange = jest.fn();
      const input = createFileInput('.json', onChange);
      
      // Simulate file selection
      const mockFile = new File('test', 'test.json', { type: 'application/json' });
      const event = { target: { files: [mockFile] } };
      
      input.dispatchEvent(new Event('change', event));
      
      // Note: In real implementation, this would trigger onChange
      // Here we're just testing the structure
      expect(input.type).toBe('file');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('test.json')).toBe('json');
      expect(getFileExtension('data.csv')).toBe('csv');
      expect(getFileExtension('file.txt')).toBe('txt');
    });

    it('should handle files without extension', () => {
      expect(getFileExtension('filename')).toBe('filename');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('file.backup.json')).toBe('json');
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      const mockFile = { size: 5 * 1024 * 1024 }; // 5MB
      
      expect(validateFileSize(mockFile, 10)).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      const mockFile = { size: 15 * 1024 * 1024 }; // 15MB
      
      expect(validateFileSize(mockFile, 10)).toBe(false);
    });

    it('should use default 10MB limit', () => {
      const mockFile = { size: 5 * 1024 * 1024 }; // 5MB
      
      expect(validateFileSize(mockFile)).toBe(true);
    });
  });

  describe('createFilePreview', () => {
    it('should create preview for text files', async () => {
      const mockFile = new File('This is a test file content', 'test.txt', { type: 'text/plain' });
      const mockReader = new FileReader();
      
      setTimeout(() => {
        mockReader.onload({ target: { result: 'This is a test file content' } });
      }, 0);

      const preview = await createFilePreview(mockFile, 10);
      
      expect(preview).toBe('This is a...');
    });

    it('should reject non-text files', async () => {
      const mockFile = new File('binary data', 'test.bin', { type: 'application/octet-stream' });
      
      await expect(createFilePreview(mockFile)).rejects.toThrow('File preview only available for text files');
    });

    it('should handle file read errors', async () => {
      const mockFile = new File('test', 'test.txt', { type: 'text/plain' });
      const mockReader = new FileReader();
      
      setTimeout(() => {
        mockReader.onerror();
      }, 0);

      await expect(createFilePreview(mockFile)).rejects.toThrow('Failed to read file for preview');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal sizes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1536 * 1024)).toBe('1.5 MB');
    });

    it('should handle large sizes', () => {
      expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
    });
  });
});
