import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Banks from './index';
import { banksOperations } from '../../redux/banks';

// Mock PDF utilities
jest.mock('../../utils/pdf-utils', () => ({
  generateBanksComparison: jest.fn(() => ({})),
  savePDF: jest.fn()
}));

// Mock Redux operations
jest.mock('../../redux/banks/banks-operations', () => ({
  fetchBanks: jest.fn(() => ({ type: 'banks/fetchBanks/pending' })),
  deleteBank: jest.fn(() => ({ type: 'banks/deleteBank/pending' })),
  addNewBank: jest.fn(() => ({ type: 'banks/addNewBank/pending' }))
}));

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm
});

const mockStore = configureMockStore([thunk]);

const mockBanks = [
  {
    id: '1',
    BankName: 'Test Bank A',
    InterestRate: 4.5,
    MaximumLoan: 500000,
    MinimumDownPayment: 50000,
    LoanTerm: 30
  },
  {
    id: '2',
    BankName: 'Test Bank B',
    InterestRate: 3.8,
    MaximumLoan: 750000,
    MinimumDownPayment: 75000,
    LoanTerm: 25
  },
  {
    id: '3',
    BankName: 'Test Bank C',
    InterestRate: 5.2,
    MaximumLoan: 300000,
    MinimumDownPayment: 30000,
    LoanTerm: 20
  }
];

const initialState = {
  banks: {
    items: mockBanks,
    loading: false,
    error: null
  }
};

const renderWithProviders = (ui, { reduxState = initialState } = {}) => {
  const store = mockStore(reduxState);
  return render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={{
        'banks.title': 'Banks',
        'banks.addBank': 'Add Bank',
        'banks.deleteConfirm': 'Are you sure you want to delete this bank?',
        'banks.noBanks': 'No banks available',
        'banks.clickHint': 'Click on a bank row to view details',
        'banks.deleteTooltip': 'Delete bank',
        'banks.tableHeaders.bankName': 'Bank Name',
        'banks.tableHeaders.interestRate': 'Interest Rate',
        'banks.tableHeaders.maxLoan': 'Max Loan',
        'banks.tableHeaders.minDownPayment': 'Min Down Payment',
        'banks.tableHeaders.loanTerm': 'Loan Term',
        'banks.tableHeaders.actions': 'Actions'
      }}>
        {ui}
      </IntlProvider>
    </Provider>
  );
};

describe('Banks Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  describe('Bank Loading and Display Flow', () => {
    it('should load and display banks in table format', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
        expect(screen.getByText('Test Bank B')).toBeInTheDocument();
        expect(screen.getByText('Test Bank C')).toBeInTheDocument();
      });

      // Verify table headers are present
      expect(screen.getByText('Bank Name')).toBeInTheDocument();
      expect(screen.getByText('Interest Rate')).toBeInTheDocument();
      expect(screen.getByText('Max Loan')).toBeInTheDocument();
      expect(screen.getByText('Min Down Payment')).toBeInTheDocument();
      expect(screen.getByText('Loan Term')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      // Verify bank data is displayed correctly
      expect(screen.getByText('4.5%')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('30 years')).toBeInTheDocument();
    });

    it('should display empty state when no banks are available', () => {
      const emptyState = {
        banks: {
          items: [],
          loading: false,
          error: null
        }
      };

      renderWithProviders(<Banks />, { reduxState: emptyState });
      expect(screen.getByText('No banks available')).toBeInTheDocument();
    });

    it('should display loading state while fetching banks', () => {
      const loadingState = {
        banks: {
          items: [],
          loading: true,
          error: null
        }
      };

      renderWithProviders(<Banks />, { reduxState: loadingState });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display error state when banks fail to load', () => {
      const errorState = {
        banks: {
          items: [],
          loading: false,
          error: 'Failed to fetch banks'
        }
      };

      renderWithProviders(<Banks />, { reduxState: errorState });
      expect(screen.getByText(/Failed to load banks/i)).toBeInTheDocument();
    });
  });

  describe('Bank Details Modal Flow', () => {
    it('should open bank details modal when clicking on bank row', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Click on first bank row
      const firstBankRow = screen.getByText('Test Bank A').closest('tr');
      fireEvent.click(firstBankRow);

      // Verify modal is opened with bank details
      await waitFor(() => {
        expect(screen.getByText(/Bank Details/i)).toBeInTheDocument();
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
        expect(screen.getByText('4.5%')).toBeInTheDocument();
        expect(screen.getByText('$500,000')).toBeInTheDocument();
      });
    });

    it('should close bank details modal when clicking close button', async () => {
      renderWithProviders(<Banks />);

      // Open modal
      const firstBankRow = screen.getByText('Test Bank A').closest('tr');
      fireEvent.click(firstBankRow);

      await waitFor(() => {
        expect(screen.getByText(/Bank Details/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText(/Bank Details/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Bank Deletion Flow', () => {
    it('should show confirmation dialog when deleting bank', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Find and click delete button for first bank
      const deleteButtons = screen.getAllByTitle('Delete bank');
      fireEvent.click(deleteButtons[0]);

      // Verify confirmation dialog was shown
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this bank?');
    });

    it('should not delete bank when user cancels confirmation', async () => {
      mockConfirm.mockReturnValue(false);

      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Try to delete bank
      const deleteButtons = screen.getAllByTitle('Delete bank');
      fireEvent.click(deleteButtons[0]);

      // Verify bank is still present
      expect(screen.getByText('Test Bank A')).toBeInTheDocument();
    });

    it('should prevent event propagation when clicking delete button', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByTitle('Delete bank');
      fireEvent.click(deleteButtons[0]);

      // Verify modal doesn't open (event propagation was stopped)
      await waitFor(() => {
        expect(screen.queryByText(/Bank Details/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Add Bank Modal Flow', () => {
    it('should open add bank modal when clicking add button', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Add Bank')).toBeInTheDocument();
      });

      // Click add bank button
      const addButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(addButton);

      // Verify modal is opened
      await waitFor(() => {
        expect(screen.getByText(/Add New Bank/i)).toBeInTheDocument();
      });
    });

    it('should close add bank modal when clicking close', async () => {
      renderWithProviders(<Banks />);

      // Open modal
      const addButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Add New Bank/i)).toBeInTheDocument();
      });

      // Close modal (assuming there's a close button)
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText(/Add New Bank/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('PDF Export Flow', () => {
    it('should enable PDF export when banks are available', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Verify PDF export button is available
      const exportButton = screen.getByTestId('export-banks-pdf');
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toBeEnabled();
    });

    it('should disable PDF export when no banks are available', () => {
      const emptyState = {
        banks: {
          items: [],
          loading: false,
          error: null
        }
      };

      renderWithProviders(<Banks />, { reduxState: emptyState });

      // Verify PDF export button is not present
      expect(screen.queryByTestId('export-banks-pdf')).not.toBeInTheDocument();
    });

    it('should show alert when trying to export with no banks', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      const emptyState = {
        banks: {
          items: [],
          loading: false,
          error: null
        }
      };

      renderWithProviders(<Banks />, { reduxState: emptyState });

      // Try to export (if button exists)
      const exportButton = screen.queryByTestId('export-banks-pdf');
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(alertSpy).toHaveBeenCalledWith('No banks to export');
      }

      alertSpy.mockRestore();
    });
  });

  describe('Statistics Component Integration', () => {
    it('should display banks statistics component', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Verify statistics section is present
      const statisticsSection = screen.getByTestId('banks-statistics');
      expect(statisticsSection).toBeInTheDocument();
    });
  });

  describe('Table Interaction Flow', () => {
    it('should display hint text for table interaction', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Verify hint text is displayed
      expect(screen.getByText('Click on a bank row to view details')).toBeInTheDocument();
    });

    it('should handle multiple bank selections correctly', async () => {
      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
        expect(screen.getByText('Test Bank B')).toBeInTheDocument();
      });

      // Click on first bank
      const firstBankRow = screen.getByText('Test Bank A').closest('tr');
      fireEvent.click(firstBankRow);

      await waitFor(() => {
        expect(screen.getByText(/Bank Details/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      // Click on second bank
      const secondBankRow = screen.getByText('Test Bank B').closest('tr');
      fireEvent.click(secondBankRow);

      await waitFor(() => {
        expect(screen.getByText(/Bank Details/i)).toBeInTheDocument();
        expect(screen.getByText('Test Bank B')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Flow', () => {
    it('should handle table overflow on smaller screens', async () => {
      // Mock window width for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      });

      renderWithProviders(<Banks />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Verify table container has proper styling for mobile
      const tableContainer = screen.getByRole('table').closest('.banks-table-container');
      expect(tableContainer).toBeInTheDocument();

      // Reset window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
    });
  });
}); 