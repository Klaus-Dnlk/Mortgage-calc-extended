import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Calc from './index';
import { banksOperations } from '../../redux/banks';

// Mock PDF utilities
jest.mock('../../utils/pdf-utils', () => ({
  generateMortgageReport: jest.fn(() => ({})),
  savePDF: jest.fn()
}));

// Mock Redux operations
jest.mock('../../redux/banks/banks-operations', () => ({
  fetchBanks: jest.fn(() => ({ type: 'banks/fetchBanks/pending' }))
}));

const mockStore = configureMockStore([thunk]);

const mockBanks = [
  {
    id: '1',
    BankName: 'Test Bank A',
    MaximumLoan: 500000,
    MinimumDownPayment: 50000,
    LoanTerm: 30,
    InterestRate: 4.5
  },
  {
    id: '2',
    BankName: 'Test Bank B',
    MaximumLoan: 750000,
    MinimumDownPayment: 75000,
    LoanTerm: 25,
    InterestRate: 3.8
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
      <IntlProvider locale="en" messages={{}}>
        {ui}
      </IntlProvider>
    </Provider>
  );
};

describe('Calc Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bank Selection Flow', () => {
    it('should populate form fields when bank is selected from dropdown', async () => {
      renderWithProviders(<Calc />);

      // Wait for banks to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Bank name/i)).toBeInTheDocument();
      });

      // Open bank selection dropdown
      const bankSelect = screen.getByLabelText(/Bank name/i);
      fireEvent.mouseDown(bankSelect);

      // Select first bank
      fireEvent.click(screen.getByText('Test Bank A'));

      // Verify form fields are populated with bank data
      expect(screen.getByLabelText(/Initial Loan/i)).toHaveValue(500000);
      expect(screen.getByLabelText(/Down Payment/i)).toHaveValue(50000);
      expect(screen.getByLabelText(/Loan Term/i)).toHaveValue(30);
      expect(screen.getByLabelText(/APR/i)).toHaveValue(4.5);
    });

    it('should allow manual input after bank selection', async () => {
      renderWithProviders(<Calc />);

      // Select a bank first
      const bankSelect = screen.getByLabelText(/Bank name/i);
      fireEvent.mouseDown(bankSelect);
      fireEvent.click(screen.getByText('Test Bank A'));

      // Modify the initial loan amount
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      fireEvent.change(initialLoanInput, { target: { value: '400000' } });

      expect(initialLoanInput).toHaveValue(400000);
    });
  });

  describe('Calculation Flow', () => {
    it('should calculate monthly payment with valid data', async () => {
      renderWithProviders(<Calc />);

      // Fill form with valid data
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      const downPaymentInput = screen.getByLabelText(/Down Payment/i);
      const loanTermInput = screen.getByLabelText(/Loan Term/i);
      const aprInput = screen.getByLabelText(/APR/i);

      fireEvent.change(initialLoanInput, { target: { value: '300000' } });
      fireEvent.change(downPaymentInput, { target: { value: '60000' } });
      fireEvent.change(loanTermInput, { target: { value: '30' } });
      fireEvent.change(aprInput, { target: { value: '5' } });

      // Click calculate button
      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      // Verify monthly payment is calculated and displayed
      await waitFor(() => {
        const monthlyPaymentElement = screen.getByTestId('monthly-payment');
        expect(monthlyPaymentElement).toBeInTheDocument();
        expect(monthlyPaymentElement.textContent).toMatch(/\$\d/);
      });

      // Verify total payments are shown
      expect(screen.getByText(/Total payments/i)).toBeInTheDocument();
    });

    it('should show warning for high interest rate', async () => {
      renderWithProviders(<Calc />);

      // Fill form with high interest rate
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      const downPaymentInput = screen.getByLabelText(/Down Payment/i);
      const loanTermInput = screen.getByLabelText(/Loan Term/i);
      const aprInput = screen.getByLabelText(/APR/i);

      fireEvent.change(initialLoanInput, { target: { value: '300000' } });
      fireEvent.change(downPaymentInput, { target: { value: '60000' } });
      fireEvent.change(loanTermInput, { target: { value: '30' } });
      fireEvent.change(aprInput, { target: { value: '16' } });

      // Click calculate button
      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      // Verify warning is displayed
      await waitFor(() => {
        expect(screen.getByText(/Consider negotiating for a better rate/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Flow', () => {
    it('should validate all required fields', async () => {
      renderWithProviders(<Calc />);

      // Try to calculate without filling any fields
      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      // Verify validation error
      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    });

    it('should validate interest rate range', async () => {
      renderWithProviders(<Calc />);

      // Fill form with invalid interest rate
      const aprInput = screen.getByLabelText(/APR/i);
      fireEvent.change(aprInput, { target: { value: '105' } });

      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      expect(screen.getByText(/Interest rate must be between 0 and 100%/i)).toBeInTheDocument();
    });

    it('should clear validation errors when user starts typing', async () => {
      renderWithProviders(<Calc />);

      // Trigger validation error
      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();

      // Start typing in a field
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      fireEvent.change(initialLoanInput, { target: { value: '300000' } });

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/All fields are required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('PDF Export Flow', () => {
    it('should enable PDF export after successful calculation', async () => {
      renderWithProviders(<Calc />);

      // Fill and calculate form
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      const downPaymentInput = screen.getByLabelText(/Down Payment/i);
      const loanTermInput = screen.getByLabelText(/Loan Term/i);
      const aprInput = screen.getByLabelText(/APR/i);

      fireEvent.change(initialLoanInput, { target: { value: '300000' } });
      fireEvent.change(downPaymentInput, { target: { value: '60000' } });
      fireEvent.change(loanTermInput, { target: { value: '30' } });
      fireEvent.change(aprInput, { target: { value: '5' } });

      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      // Wait for calculation to complete
      await waitFor(() => {
        expect(screen.getByTestId('monthly-payment')).toBeInTheDocument();
      });

      // Verify PDF export button is available
      const exportButton = screen.getByTestId('export-pdf');
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toBeEnabled();
    });

    it('should require bank selection for PDF export', async () => {
      renderWithProviders(<Calc />);

      // Fill and calculate form without selecting bank
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      const downPaymentInput = screen.getByLabelText(/Down Payment/i);
      const loanTermInput = screen.getByLabelText(/Loan Term/i);
      const aprInput = screen.getByLabelText(/APR/i);

      fireEvent.change(initialLoanInput, { target: { value: '300000' } });
      fireEvent.change(downPaymentInput, { target: { value: '60000' } });
      fireEvent.change(loanTermInput, { target: { value: '30' } });
      fireEvent.change(aprInput, { target: { value: '5' } });

      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId('monthly-payment')).toBeInTheDocument();
      });

      // Try to export PDF without selecting bank
      const exportButton = screen.getByTestId('export-pdf');
      fireEvent.click(exportButton);

      // Verify error message
      expect(screen.getByText(/Please select a bank first/i)).toBeInTheDocument();
    });
  });

  describe('Form Reset Flow', () => {
    it('should reset all form fields and calculations', async () => {
      renderWithProviders(<Calc />);

      // Fill form and calculate
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      const downPaymentInput = screen.getByLabelText(/Down Payment/i);
      const loanTermInput = screen.getByLabelText(/Loan Term/i);
      const aprInput = screen.getByLabelText(/APR/i);

      fireEvent.change(initialLoanInput, { target: { value: '300000' } });
      fireEvent.change(downPaymentInput, { target: { value: '60000' } });
      fireEvent.change(loanTermInput, { target: { value: '30' } });
      fireEvent.change(aprInput, { target: { value: '5' } });

      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId('monthly-payment')).toBeInTheDocument();
      });

      // Click reset button
      const resetButton = screen.getByTestId('reset');
      fireEvent.click(resetButton);

      // Verify all fields are cleared
      expect(initialLoanInput).toHaveValue('');
      expect(downPaymentInput).toHaveValue('');
      expect(loanTermInput).toHaveValue('');
      expect(aprInput).toHaveValue('');

      // Verify monthly payment is reset
      expect(screen.getByTestId('monthly-payment').textContent).toBe('$0.00');
    });
  });

  describe('Error Handling Flow', () => {
    it('should display loading state while fetching banks', () => {
      const loadingState = {
        banks: {
          items: [],
          loading: true,
          error: null
        }
      };

      renderWithProviders(<Calc />, { reduxState: loadingState });
      expect(screen.getByText(/Loading banks/i)).toBeInTheDocument();
    });

    it('should display error state when banks fail to load', () => {
      const errorState = {
        banks: {
          items: [],
          loading: false,
          error: 'Failed to fetch banks'
        }
      };

      renderWithProviders(<Calc />, { reduxState: errorState });
      expect(screen.getByText(/Failed to load banks/i)).toBeInTheDocument();
    });
  });
}); 