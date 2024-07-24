// Import testing utilities and components
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import Calc from './index';

// Mock the Redux operations
jest.mock('../../redux/banks/banks-operations', () => ({
  fetchBanks: jest.fn(() => ({ type: 'banks/fetchBanks/pending' }))
}));

const mockStore = configureMockStore([]);

const initialState = {
  banks: {
    items: [
      { 
        id: '1', 
        BankName: 'Test Bank', 
        MaximumLoan: 500000, 
        MinimumDownPayment: 50000, 
        LoanTerm: 20, 
        InterestRate: 5 
      }
    ],
    loading: false,
    error: null
  }
};

const renderWithProviders = (ui, { reduxState } = {}) => {
  const store = mockStore(reduxState || initialState);
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('Calc Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Calc />);
    expect(screen.getByText(/Mortgage Calculator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bank name/i)).toBeInTheDocument();
  });

  it('displays loading state when banks are loading', () => {
    const loadingState = {
      banks: {
        ...initialState.banks,
        loading: true
      }
    };
    
    renderWithProviders(<Calc />, { reduxState: loadingState });
    expect(screen.getByText(/Loading banks/i)).toBeInTheDocument();
  });

  it('displays error state when banks fail to load', () => {
    const errorState = {
      banks: {
        ...initialState.banks,
        error: 'Failed to fetch banks'
      }
    };
    
    renderWithProviders(<Calc />, { reduxState: errorState });
    expect(screen.getByText(/Failed to load banks/i)).toBeInTheDocument();
  });

  it('populates form fields when bank is selected from dropdown', () => {
    renderWithProviders(<Calc />);
    
    const bankSelect = screen.getByLabelText(/Bank name/i);
    fireEvent.mouseDown(bankSelect);
    fireEvent.click(screen.getByText(/Test Bank/i));
    
    expect(screen.getByLabelText(/Initial Loan/i).value).toBe('500000');
    expect(screen.getByLabelText(/Down Payment/i).value).toBe('50000');
    expect(screen.getByLabelText(/Loan Term/i).value).toBe('20');
    expect(screen.getByLabelText(/APR/i).value).toBe('5');
  });

  it('updates form fields when user types', () => {
    renderWithProviders(<Calc />);
    
    const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
    const downPaymentInput = screen.getByLabelText(/Down Payment/i);
    
    fireEvent.change(initialLoanInput, { target: { value: '300000' } });
    fireEvent.change(downPaymentInput, { target: { value: '60000' } });
    
    expect(initialLoanInput.value).toBe('300000');
    expect(downPaymentInput.value).toBe('60000');
  });

  it('shows validation error for missing required fields', () => {
    renderWithProviders(<Calc />);
    
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateButton);
    
    expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid interest rate', () => {
    renderWithProviders(<Calc />);
    
    const aprInput = screen.getByLabelText(/APR/i);
    fireEvent.change(aprInput, { target: { value: '105' } });
    
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateButton);
    
    expect(screen.getByText(/Interest rate must be between 0 and 100%/i)).toBeInTheDocument();
  });

  it('shows validation error for negative initial loan', () => {
    renderWithProviders(<Calc />);
    
    const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
    fireEvent.change(initialLoanInput, { target: { value: '-100000' } });
    
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateButton);
    
    expect(screen.getByText(/Initial loan must be greater than 0/i)).toBeInTheDocument();
  });

  it('shows warning for high interest rate', () => {
    renderWithProviders(<Calc />);
    
    // Fill all required fields
    const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
    const downPaymentInput = screen.getByLabelText(/Down Payment/i);
    const loanTermInput = screen.getByLabelText(/Loan Term/i);
    const aprInput = screen.getByLabelText(/APR/i);
    
    fireEvent.change(initialLoanInput, { target: { value: '300000' } });
    fireEvent.change(downPaymentInput, { target: { value: '60000' } });
    fireEvent.change(loanTermInput, { target: { value: '30' } });
    fireEvent.change(aprInput, { target: { value: '16' } });
    
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateButton);
    
    expect(screen.getByText(/Consider negotiating for a better rate/i)).toBeInTheDocument();
  });

  it('calculates monthly payment correctly', () => {
    renderWithProviders(<Calc />);
    
    // Fill form with test data
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
    
    const monthlyPaymentElement = screen.getByTestId('monthly-payment');
    expect(monthlyPaymentElement).toBeInTheDocument();
    expect(monthlyPaymentElement.textContent).toMatch(/\$\d/);
  });

  it('resets form when reset button is clicked', () => {
    renderWithProviders(<Calc />);
    
    // Fill some fields first
    const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
    const downPaymentInput = screen.getByLabelText(/Down Payment/i);
    
    fireEvent.change(initialLoanInput, { target: { value: '300000' } });
    fireEvent.change(downPaymentInput, { target: { value: '60000' } });
    
    // Click reset button
    const resetButton = screen.getByTestId('reset');
    fireEvent.click(resetButton);
    
    // Check that fields are cleared
    expect(initialLoanInput.value).toBe('');
    expect(downPaymentInput.value).toBe('');
  });

  it('displays total payments when monthly payment is calculated', () => {
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
    
    expect(screen.getByText(/Total payments/i)).toBeInTheDocument();
  });
});
  
  