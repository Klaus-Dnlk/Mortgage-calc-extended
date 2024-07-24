import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import Banks from './index';

// Mock the Redux operations
jest.mock('../../redux/banks/banks-operations', () => ({
  fetchBanks: jest.fn(() => ({ type: 'banks/fetchBanks/pending' })),
  deleteBank: jest.fn(() => ({ type: 'banks/deleteBank/pending' }))
}));

const mockStore = configureMockStore([]);

const mockBanks = [
  {
    id: '1',
    BankName: 'Test Bank 1',
    InterestRate: 5.5,
    MaximumLoan: 500000,
    MinimumDownPayment: 50000,
    LoanTerm: 20
  },
  {
    id: '2',
    BankName: 'Test Bank 2',
    InterestRate: 4.8,
    MaximumLoan: 750000,
    MinimumDownPayment: 75000,
    LoanTerm: 30
  }
];

const initialState = {
  banks: {
    items: mockBanks,
    loading: false,
    error: null
  }
};

const renderWithProviders = (ui, { reduxState } = {}) => {
  const store = mockStore(reduxState || initialState);
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('Banks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Banks />);
    expect(screen.getByText(/Banks Management/i)).toBeInTheDocument();
  });

  it('displays loading state when banks are loading', () => {
    const loadingState = {
      banks: {
        ...initialState.banks,
        loading: true
      }
    };
    
    renderWithProviders(<Banks />, { reduxState: loadingState });
    expect(screen.getByText(/Loading banks/i)).toBeInTheDocument();
  });

  it('displays error state when banks fail to load', () => {
    const errorState = {
      banks: {
        ...initialState.banks,
        error: 'Failed to fetch banks'
      }
    };
    
    renderWithProviders(<Banks />, { reduxState: errorState });
    expect(screen.getByText(/Failed to load banks/i)).toBeInTheDocument();
  });

  it('displays empty state when no banks are available', () => {
    const emptyState = {
      banks: {
        items: [],
        loading: false,
        error: null
      }
    };
    
    renderWithProviders(<Banks />, { reduxState: emptyState });
    expect(screen.getByText(/No banks found/i)).toBeInTheDocument();
  });

  it('renders bank table with correct headers', () => {
    renderWithProviders(<Banks />);
    
    expect(screen.getByText('Bank Name')).toBeInTheDocument();
    expect(screen.getByText('Interest Rate (%)')).toBeInTheDocument();
    expect(screen.getByText('Maximum Loan ($)')).toBeInTheDocument();
    expect(screen.getByText('Minimum Down Payment ($)')).toBeInTheDocument();
    expect(screen.getByText('Loan Term (years)')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays all banks in the table', () => {
    renderWithProviders(<Banks />);
    
    expect(screen.getByText('Test Bank 1')).toBeInTheDocument();
    expect(screen.getByText('Test Bank 2')).toBeInTheDocument();
    expect(screen.getByText('5.5%')).toBeInTheDocument();
    expect(screen.getByText('4.8%')).toBeInTheDocument();
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('$750,000')).toBeInTheDocument();
  });

  it('shows Add New Bank button', () => {
    renderWithProviders(<Banks />);
    expect(screen.getByRole('button', { name: /Add New Bank/i })).toBeInTheDocument();
  });

  it('opens modal when Add New Bank button is clicked', () => {
    renderWithProviders(<Banks />);
    
    const addButton = screen.getByRole('button', { name: /Add New Bank/i });
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add New Bank')).toBeInTheDocument();
  });

  it('shows delete confirmation when delete button is clicked', () => {
    renderWithProviders(<Banks />);
    
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this bank?');
  });

  it('formats currency values correctly', () => {
    renderWithProviders(<Banks />);
    
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('$750,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$75,000')).toBeInTheDocument();
  });

  it('formats interest rates with percentage symbol', () => {
    renderWithProviders(<Banks />);
    
    expect(screen.getByText('5.5%')).toBeInTheDocument();
    expect(screen.getByText('4.8%')).toBeInTheDocument();
  });

  it('formats loan terms with years suffix', () => {
    renderWithProviders(<Banks />);
    
    expect(screen.getByText('20 years')).toBeInTheDocument();
    expect(screen.getByText('30 years')).toBeInTheDocument();
  });
}); 