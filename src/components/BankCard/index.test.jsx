import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import NewBankCard from './index';

// Mock the Redux operations
jest.mock('../../redux/banks/banks-operations', () => ({
  addNewBank: jest.fn(() => ({ type: 'banks/addNewBank/pending' }))
}));

const mockStore = configureStore([]);

const mockOnCloseModal = jest.fn();

const initialState = {
  banks: {
    items: [
      { id: '1', BankName: 'Test Bank', MaximumLoan: 500000, MinimumDownPayment: 50000, LoanTerm: 20, InterestRate: 5 }
    ],
    loading: false,
    error: null
  }
};

const renderWithProviders = (ui, { reduxState } = {}) => {
  const store = mockStore(reduxState || initialState);
  return render(
    <Provider store={store}>
      {ui}
    </Provider>
  );
};

describe('NewBankCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    expect(screen.getByLabelText(/Bank name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maximum loan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Minimum down payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Loan term/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Interest rate/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Bank/i })).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    const bankNameInput = screen.getByLabelText(/Bank name/i);
    const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
    
    fireEvent.change(bankNameInput, { target: { value: 'New Bank' } });
    fireEvent.change(maxLoanInput, { target: { value: '1000000' } });
    
    expect(bankNameInput.value).toBe('New Bank');
    expect(maxLoanInput.value).toBe('1000000');
  });

  it('shows validation error for bank name starting with lowercase', async () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    const bankNameInput = screen.getByLabelText(/Bank name/i);
    const addButton = screen.getByRole('button', { name: /Add Bank/i });
    
    fireEvent.change(bankNameInput, { target: { value: 'test bank' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Bank name must start with a capital letter/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for duplicate bank name', async () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    const bankNameInput = screen.getByLabelText(/Bank name/i);
    const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
    const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
    const loanTermInput = screen.getByLabelText(/Loan term/i);
    const interestRateInput = screen.getByLabelText(/Interest rate/i);
    const addButton = screen.getByRole('button', { name: /Add Bank/i });
    
    // Fill form with existing bank name
    fireEvent.change(bankNameInput, { target: { value: 'Test Bank' } });
    fireEvent.change(maxLoanInput, { target: { value: '500000' } });
    fireEvent.change(minDownPaymentInput, { target: { value: '50000' } });
    fireEvent.change(loanTermInput, { target: { value: '20' } });
    fireEvent.change(interestRateInput, { target: { value: '5' } });
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Bank already exists/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid interest rate', async () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    const bankNameInput = screen.getByLabelText(/Bank name/i);
    const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
    const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
    const loanTermInput = screen.getByLabelText(/Loan term/i);
    const interestRateInput = screen.getByLabelText(/Interest rate/i);
    const addButton = screen.getByRole('button', { name: /Add Bank/i });
    
    // Fill form with invalid interest rate
    fireEvent.change(bankNameInput, { target: { value: 'New Bank' } });
    fireEvent.change(maxLoanInput, { target: { value: '500000' } });
    fireEvent.change(minDownPaymentInput, { target: { value: '50000' } });
    fireEvent.change(loanTermInput, { target: { value: '20' } });
    fireEvent.change(interestRateInput, { target: { value: '150' } });
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Interest rate cannot exceed 100%/i)).toBeInTheDocument();
    });
  });

  it('clears validation error when user starts typing', async () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    const bankNameInput = screen.getByLabelText(/Bank name/i);
    const addButton = screen.getByRole('button', { name: /Add Bank/i });
    
    // Trigger validation error
    fireEvent.change(bankNameInput, { target: { value: 'test' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Bank name must start with a capital letter/i)).toBeInTheDocument();
    });
    
    // Clear error by typing valid input
    fireEvent.change(bankNameInput, { target: { value: 'Valid Bank' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/Bank name must start with a capital letter/i)).not.toBeInTheDocument();
    });
  });

  it('validates form data correctly', () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    const bankNameInput = screen.getByLabelText(/Bank name/i);
    const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
    const minDownPaymentInput = screen.getByLabelText(/Minimum down payment/i);
    const loanTermInput = screen.getByLabelText(/Loan term/i);
    const interestRateInput = screen.getByLabelText(/Interest rate/i);
    
    // Fill form with valid data
    fireEvent.change(bankNameInput, { target: { value: 'New Bank' } });
    fireEvent.change(maxLoanInput, { target: { value: '500000' } });
    fireEvent.change(minDownPaymentInput, { target: { value: '50000' } });
    fireEvent.change(loanTermInput, { target: { value: '20' } });
    fireEvent.change(interestRateInput, { target: { value: '5' } });
    
    // Check that all fields have correct values
    expect(bankNameInput.value).toBe('New Bank');
    expect(maxLoanInput.value).toBe('500000');
    expect(minDownPaymentInput.value).toBe('50000');
    expect(loanTermInput.value).toBe('20');
    expect(interestRateInput.value).toBe('5');
  });

  it('resets form after successful submission', async () => {
    renderWithProviders(<NewBankCard onCloseModal={mockOnCloseModal} />);
    
    const bankNameInput = screen.getByLabelText(/Bank name/i);
    const maxLoanInput = screen.getByLabelText(/Maximum loan/i);
    
    // Fill form
    fireEvent.change(bankNameInput, { target: { value: 'New Bank' } });
    fireEvent.change(maxLoanInput, { target: { value: '500000' } });
    
    // Submit form
    const addButton = screen.getByRole('button', { name: /Add Bank/i });
    fireEvent.click(addButton);
    
    // Check that form is reset
    await waitFor(() => {
      expect(bankNameInput.value).toBe('');
    });
    
    await waitFor(() => {
      expect(maxLoanInput.value).toBe('');
    });
  });
});
