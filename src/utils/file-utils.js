/**
 * File utilities for managing files with language filesystem capabilities
 * Uses File API, FileReader, and Blob for data export/import
 */

/**
 * Export banks data to JSON file
 * @param {Array} banks - Array of bank objects
 * @param {string} filename - Name of the file to save
 */
export const exportBanksToJSON = (banks, filename = 'banks-data.json') => {
  try {
    // Create JSON data
    const jsonData = JSON.stringify(banks, null, 2);
    
    // Create Blob with JSON data
    const blob = new Blob([jsonData], { 
      type: 'application/json;charset=utf-8' 
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Successfully exported ${banks.length} banks to ${filename}`);
    return true;
  } catch (error) {
    console.error('Error exporting banks to JSON:', error);
    throw new Error('Failed to export banks data');
  }
};

/**
 * Export banks data to CSV file
 * @param {Array} banks - Array of bank objects
 * @param {string} filename - Name of the file to save
 */
export const exportBanksToCSV = (banks, filename = 'banks-data.csv') => {
  try {
    if (banks.length === 0) {
      throw new Error('No banks data to export');
    }

    // Define CSV headers
    const headers = ['Bank Name', 'Interest Rate (%)', 'Maximum Loan ($)', 'Minimum Down Payment ($)', 'Loan Term (years)'];
    
    // Convert banks data to CSV rows
    const csvRows = [
      headers.join(','),
      ...banks.map(bank => [
        `"${bank.BankName}"`,
        bank.InterestRate,
        bank.MaximumLoan,
        bank.MinimumDownPayment,
        bank.LoanTerm
      ].join(','))
    ];
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create Blob with CSV data
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8' 
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Successfully exported ${banks.length} banks to ${filename}`);
    return true;
  } catch (error) {
    console.error('Error exporting banks to CSV:', error);
    throw new Error('Failed to export banks data');
  }
};

/**
 * Import banks data from JSON file
 * @param {File} file - File object to read
 * @returns {Promise<Array>} Promise that resolves to array of banks
 */
export const importBanksFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      reject(new Error('Please select a valid JSON file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const banks = JSON.parse(content);
        
        // Validate banks data structure
        if (!Array.isArray(banks)) {
          throw new Error('Invalid JSON format: expected array of banks');
        }
        
        // Validate each bank object
        const validatedBanks = banks.map((bank, index) => {
          if (!bank.BankName || typeof bank.BankName !== 'string') {
            throw new Error(`Bank ${index + 1}: Invalid or missing BankName`);
          }
          if (!bank.InterestRate || isNaN(bank.InterestRate)) {
            throw new Error(`Bank ${index + 1}: Invalid or missing InterestRate`);
          }
          if (!bank.MaximumLoan || isNaN(bank.MaximumLoan)) {
            throw new Error(`Bank ${index + 1}: Invalid or missing MaximumLoan`);
          }
          if (!bank.MinimumDownPayment || isNaN(bank.MinimumDownPayment)) {
            throw new Error(`Bank ${index + 1}: Invalid or missing MinimumDownPayment`);
          }
          if (!bank.LoanTerm || isNaN(bank.LoanTerm)) {
            throw new Error(`Bank ${index + 1}: Invalid or missing LoanTerm`);
          }
          
          return {
            BankName: bank.BankName.trim(),
            InterestRate: parseFloat(bank.InterestRate),
            MaximumLoan: parseFloat(bank.MaximumLoan),
            MinimumDownPayment: parseFloat(bank.MinimumDownPayment),
            LoanTerm: parseInt(bank.LoanTerm)
          };
        });
        
        console.log(`Successfully imported ${validatedBanks.length} banks from ${file.name}`);
        resolve(validatedBanks);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        reject(new Error(`Failed to parse JSON file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Import banks data from CSV file
 * @param {File} file - File object to read
 * @returns {Promise<Array>} Promise that resolves to array of banks
 */
export const importBanksFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'text/csv') {
      reject(new Error('Please select a valid CSV file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain at least header and one data row');
        }
        
        // Parse CSV header
        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = ['Bank Name', 'Interest Rate (%)', 'Maximum Loan ($)', 'Minimum Down Payment ($)', 'Loan Term (years)'];
        
        if (headers.length !== expectedHeaders.length) {
          throw new Error('Invalid CSV format: incorrect number of columns');
        }
        
        // Parse data rows
        const banks = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          
          if (values.length !== expectedHeaders.length) {
            throw new Error(`Row ${i + 1}: Invalid number of columns`);
          }
          
          const bank = {
            BankName: values[0],
            InterestRate: parseFloat(values[1]),
            MaximumLoan: parseFloat(values[2]),
            MinimumDownPayment: parseFloat(values[3]),
            LoanTerm: parseInt(values[4])
          };
          
          // Validate bank data
          if (!bank.BankName || bank.BankName === '') {
            throw new Error(`Row ${i + 1}: Invalid or missing Bank Name`);
          }
          if (isNaN(bank.InterestRate) || bank.InterestRate < 0) {
            throw new Error(`Row ${i + 1}: Invalid Interest Rate`);
          }
          if (isNaN(bank.MaximumLoan) || bank.MaximumLoan < 0) {
            throw new Error(`Row ${i + 1}: Invalid Maximum Loan`);
          }
          if (isNaN(bank.MinimumDownPayment) || bank.MinimumDownPayment < 0) {
            throw new Error(`Row ${i + 1}: Invalid Minimum Down Payment`);
          }
          if (isNaN(bank.LoanTerm) || bank.LoanTerm < 1) {
            throw new Error(`Row ${i + 1}: Invalid Loan Term`);
          }
          
          banks.push(bank);
        }
        
        console.log(`Successfully imported ${banks.length} banks from ${file.name}`);
        resolve(banks);
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Create a file input element for file selection
 * @param {string} accept - File types to accept
 * @param {Function} onChange - Callback function when file is selected
 * @returns {HTMLInputElement} File input element
 */
export const createFileInput = (accept, onChange) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.style.display = 'none';
  
  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      onChange(file);
    }
    // Reset input to allow selecting the same file again
    input.value = '';
  });
  
  return input;
};

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension (without dot)
 */
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Validate file size
 * @param {File} file - File object to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {boolean} True if file size is valid
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Create a preview of file content (for text files)
 * @param {File} file - File object to preview
 * @param {number} maxLength - Maximum characters to show
 * @returns {Promise<string>} Promise that resolves to preview text
 */
export const createFilePreview = (file, maxLength = 500) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('text/')) {
      reject(new Error('File preview only available for text files'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target.result;
      const preview = content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;
      resolve(preview);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file for preview'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Convert file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  exportBanksToJSON,
  exportBanksToCSV,
  importBanksFromJSON,
  importBanksFromCSV,
  createFileInput,
  getFileExtension,
  validateFileSize,
  createFilePreview,
  formatFileSize
};
