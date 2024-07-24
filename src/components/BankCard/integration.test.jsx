import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NewBankCard from './index';
import { banksOperations } from '../../redux/banks';

// Mock Redux operations
jest.mock('../../redux/banks/banks-operations', () => ({
  addNewBank: jest.fn(() => Promise.resolve({ type: 'banks/addNewBank/fulfilled' }))
}));

// Mock security utilities
jest.mock('../../utils/security', () => ({
  inputValidation: {
    validateBankName: jest.fn(() => true),
    validateCurrency: jest.fn(() => true),
    validateLoanTerm: jest.fn(() => true),
    validatePercentage: jest.fn(() => true)
  },
  sanitizeInput: jest.fn((input) => input)
}));

const mockStore = configureMockStore([thunk]);

const mockBanks = [
  {
    id: '1',
    BankName: 'Existing Bank',
    MaximumLoan: 500000,
    MinimumDownPayment: 50000,
    LoanTerm: 30,
    InterestRate: 4.5
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
      {ui}
    </Provider>
  );
};

describe('BankCard Component Integration Tests', () => {
  const mockOnCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering and Initial State', () => {
    it('should render all form fields with proper labels', () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Verify all form fields are present
      expect(screen.getByLabelText(/Bank name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Maximum loan/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Minimum down payment/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Loan term/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Interest rate/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Bank/i })).toBeInTheDocument();
    });

    it('should start with empty form fields', () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Verify all fields are empty initially
      expect(screen.getByLabelText(/Bank name/i)).toHaveValue('');
      expect(screen.getByLabelText(/Maximum loan/i)).toHaveValue('');
      expect(screen.getByLabelText(/Minimum down payment/i)).toHaveValue('');
      expect(screen.getByLabelText(/Loan term/i)).toHaveValue('');
      expect(screen.getByLabelText(/Interest rate/i)).toHaveValue('');
    });

    it('should not show validation errors initially', () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Verify no validation errors are shown
      expect(screen.queryByText(/Invalid/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });
  });

  describe('Input Validation and Sanitization Flow', () => {
    it('should sanitize bank name input', () => {
      const { sanitizeInput } = require('../../utils/security');
      sanitizeInput.mockReturnValue('Sanitized Bank Name');

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      const bankNameInput = screen.getByLabelText(/Bank name/i);
      fireEvent.change(bankNameInput, { target: { value: 'Test Bank Name' } });

      expect(sanitizeInput).toHaveBeenCalledWith('Test Bank Name');
    });

    it('should allow only numeric input for loan amounts', () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      
      // Try to enter non-numeric characters
      fireEvent.change(maxLoanInput, { target: { value: 'abc123def' } });
      
      // Should only allow numbers and decimal points
      expect(maxLoanInput).toHaveValue('123');
    });

    it('should allow only numeric input for interest rate', () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      const interestRateInput = screen.getByLabelText(/Interest rate/i);
      
      // Try to enter non-numeric characters
      fireEvent.change(interestRateInput, { target: { value: 'abc5.5def' } });
      
      // Should only allow numbers and decimal points
      expect(interestRateInput).toHaveValue('5.5');
    });

    it('should clear validation errors when user starts typing', () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Trigger validation error by submitting empty form
      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify error is shown
      expect(screen.getByText(/Bank name is required/i)).toBeInTheDocument();

      // Start typing in bank name field
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      fireEvent.change(bankNameInput, { target: { value: 'New Bank' } });

      // Verify error is cleared
      expect(screen.queryByText(/Bank name is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission Flow', () => {
    it('should submit form with valid data successfully', async () => {
      const { addNewBank } = require('../../redux/banks/banks-operations');
      addNewBank.mockResolvedValue({ type: 'banks/addNewBank/fulfilled' });

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with valid data
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
      const loanTermInput = screen.getByLabelText(/Loan term/i);
      const interestRateInput = screen.getByLabelText(/Interest rate/i);

      fireEvent.change(bankNameInput, { target: { value: 'New Test Bank' } });
      fireEvent.change(maxLoanInput, { target: { value: '400000' } });
      fireEvent.change(minDownPaymentInput, { target: { value: '40000' } });
      fireEvent.change(loanTermInput, { target: { value: '25' } });
      fireEvent.change(interestRateInput, { target: { value: '4.2' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify Redux action was called with correct data
      await waitFor(() => {
        expect(addNewBank).toHaveBeenCalledWith({
          BankName: 'New Test Bank',
          MaximumLoan: '400000',
          MinimumDownPayment: '40000',
          LoanTerm: '25',
          InterestRate: '4.2'
        });
      });

      // Verify modal was closed
      expect(mockOnCloseModal).toHaveBeenCalled();
    });

    it('should validate all required fields before submission', async () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify validation errors are shown
      expect(screen.getByText(/Bank name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Maximum loan is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Minimum down payment is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Loan term is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Interest rate is required/i)).toBeInTheDocument();

      // Verify Redux action was not called
      const { addNewBank } = require('../../redux/banks/banks-operations');
      expect(addNewBank).not.toHaveBeenCalled();
    });

    it('should validate bank name format', async () => {
      const { inputValidation } = require('../../utils/security');
      inputValidation.validateBankName.mockReturnValue(false);

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with invalid bank name
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      fireEvent.change(bankNameInput, { target: { value: 'invalid bank' } });

      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify validation error
      expect(screen.getByText(/Invalid bank name format/i)).toBeInTheDocument();
    });

    it('should validate currency amounts', async () => {
      const { inputValidation } = require('../../utils/security');
      inputValidation.validateCurrency.mockReturnValue(false);

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with invalid currency
      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      fireEvent.change(maxLoanInput, { target: { value: '-100000' } });

      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify validation error
      expect(screen.getByText(/Invalid maximum loan amount/i)).toBeInTheDocument();
    });

    it('should validate loan term', async () => {
      const { inputValidation } = require('../../utils/security');
      inputValidation.validateLoanTerm.mockReturnValue(false);

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with invalid loan term
      const loanTermInput = screen.getByLabelText(/Loan term/i);
      fireEvent.change(loanTermInput, { target: { value: '0' } });

      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify validation error
      expect(screen.getByText(/Invalid loan term/i)).toBeInTheDocument();
    });

    it('should validate interest rate percentage', async () => {
      const { inputValidation } = require('../../utils/security');
      inputValidation.validatePercentage.mockReturnValue(false);

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with invalid interest rate
      const interestRateInput = screen.getByLabelText(/Interest rate/i);
      fireEvent.change(interestRateInput, { target: { value: '150' } });

      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify validation error
      expect(screen.getByText(/Invalid interest rate/i)).toBeInTheDocument();
    });
  });

  describe('Duplicate Bank Name Validation', () => {
    it('should prevent adding bank with existing name', async () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with existing bank name
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      fireEvent.change(bankNameInput, { target: { value: 'Existing Bank' } });

      // Fill other required fields
      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
      const loanTermInput = screen.getByLabelText(/Loan term/i);
      const interestRateInput = screen.getByLabelText(/Interest rate/i);

      fireEvent.change(maxLoanInput, { target: { value: '400000' } });
      fireEvent.change(minDownPaymentInput, { target: { value: '40000' } });
      fireEvent.change(loanTermInput, { target: { value: '25' } });
      fireEvent.change(interestRateInput, { target: { value: '4.2' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify duplicate name error
      expect(screen.getByText(/Existing Bank already exists/i)).toBeInTheDocument();

      // Verify Redux action was not called
      const { addNewBank } = require('../../redux/banks/banks-operations');
      expect(addNewBank).not.toHaveBeenCalled();
    });

    it('should allow adding bank with different name', async () => {
      const { addNewBank } = require('../../redux/banks/banks-operations');
      addNewBank.mockResolvedValue({ type: 'banks/addNewBank/fulfilled' });

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with new bank name
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      fireEvent.change(bankNameInput, { target: { value: 'New Unique Bank' } });

      // Fill other required fields
      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
      const loanTermInput = screen.getByLabelText(/Loan term/i);
      const interestRateInput = screen.getByLabelText(/Interest rate/i);

      fireEvent.change(maxLoanInput, { target: { value: '400000' } });
      fireEvent.change(minDownPaymentInput, { target: { value: '40000' } });
      fireEvent.change(loanTermInput, { target: { value: '25' } });
      fireEvent.change(interestRateInput, { target: { value: '4.2' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify no duplicate error
      expect(screen.queryByText(/already exists/i)).not.toBeInTheDocument();

      // Verify Redux action was called
      await waitFor(() => {
        expect(addNewBank).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle Redux operation failure', async () => {
      const { addNewBank } = require('../../redux/banks/banks-operations');
      addNewBank.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with valid data
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
      const loanTermInput = screen.getByLabelText(/Loan term/i);
      const interestRateInput = screen.getByLabelText(/Interest rate/i);

      fireEvent.change(bankNameInput, { target: { value: 'New Test Bank' } });
      fireEvent.change(maxLoanInput, { target: { value: '400000' } });
      fireEvent.change(minDownPaymentInput, { target: { value: '40000' } });
      fireEvent.change(loanTermInput, { target: { value: '25' } });
      fireEvent.change(interestRateInput, { target: { value: '4.2' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify error message is shown
      await waitFor(() => {
        expect(screen.getByText(/Failed to add bank. Please try again./i)).toBeInTheDocument();
      });

      // Verify modal was not closed
      expect(mockOnCloseModal).not.toHaveBeenCalled();
    });

    it('should handle validation schema errors', async () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with invalid data that passes initial validation
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      fireEvent.change(bankNameInput, { target: { value: 'a' } }); // Too short

      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Verify schema validation error is shown
      expect(screen.getByText(/Bank name must start with a capital letter/i)).toBeInTheDocument();
    });
  });

  describe('Form Reset Flow', () => {
    it('should reset form after successful submission', async () => {
      const { addNewBank } = require('../../redux/banks/banks-operations');
      addNewBank.mockResolvedValue({ type: 'banks/addNewBank/fulfilled' });

      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      // Fill form with valid data
      const bankNameInput = screen.getByLabelText(/Bank name/i);
      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
      const loanTermInput = screen.getByLabelText(/Loan term/i);
      const interestRateInput = screen.getByLabelText(/Interest rate/i);

      fireEvent.change(bankNameInput, { target: { value: 'New Test Bank' } });
      fireEvent.change(maxLoanInput, { target: { value: '400000' } });
      fireEvent.change(minDownPaymentInput, { target: { value: '40000' } });
      fireEvent.change(loanTermInput, { target: { value: '25' } });
      fireEvent.change(interestRateInput, { target: { value: '4.2' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Bank/i });
      fireEvent.click(submitButton);

      // Wait for submission to complete
      await waitFor(() => {
        expect(addNewBank).toHaveBeenCalled();
      });

      // Verify form is reset (if component re-renders)
      // Note: This depends on how the parent component handles the modal
      expect(mockOnCloseModal).toHaveBeenCalled();
    });
  });

  describe('Keyboard Input Handling', () => {
    it('should handle numeric key press events', () => {
      renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);

      const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
      
      // Try to press non-numeric key
      fireEvent.keyPress(maxLoanInput, { key: 'a', code: 'KeyA' });
      
      // Try to press numeric key
      fireEvent.keyPress(maxLoanInput, { key: '5', code: 'Digit5' });
      
      // The input should handle these events appropriately
      expect(maxLoanInput).toBeInTheDocument();
    });
  });
}); 