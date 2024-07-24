import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BankDetailsModal from './index';

// Mock Portal component
jest.mock('../Portal', () => {
  return function MockPortal({ children }) {
    return <div data-testid="portal">{children}</div>;
  };
});

const mockBank = {
  id: 1,
  BankName: 'Test Bank',
  InterestRate: 3.5,
  MaximumLoan: 500000,
  MinimumDownPayment: 50000,
  LoanTerm: 30
};

const defaultProps = {
  bank: mockBank,
  isOpen: true,
  onClose: jest.fn()
};

describe('BankDetailsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<BankDetailsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('portal')).not.toBeInTheDocument();
  });

  it('renders nothing when bank is null', () => {
    render(<BankDetailsModal {...defaultProps} bank={null} />);
    expect(screen.queryByTestId('portal')).not.toBeInTheDocument();
  });

  it('renders modal with bank information when isOpen is true and bank exists', () => {
    render(<BankDetailsModal {...defaultProps} />);
    
    expect(screen.getByTestId('portal')).toBeInTheDocument();
    expect(screen.getByText('🏦 Test Bank')).toBeInTheDocument();
    expect(screen.getByText('Interest Rate: 3.5%')).toBeInTheDocument();
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('30 Years')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<BankDetailsModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<BankDetailsModal {...defaultProps} />);
    
    const backdrop = screen.getByTestId('portal').firstChild;
    fireEvent.click(backdrop);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    render(<BankDetailsModal {...defaultProps} />);
    
    const modalContent = screen.getByText('🏦 Test Bank');
    fireEvent.click(modalContent);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('displays calculated loan analysis', () => {
    render(<BankDetailsModal {...defaultProps} />);
    
    // Down payment percentage should be 10% (50000/500000 * 100)
    expect(screen.getByText('10.0%')).toBeInTheDocument();
    
    // Monthly payment should be calculated and displayed
    expect(screen.getByText(/Monthly Payment/)).toBeInTheDocument();
  });

  it('shows alert when Select Bank button is clicked', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<BankDetailsModal {...defaultProps} />);
    
    const selectButton = screen.getByRole('button', { name: /select bank/i });
    fireEvent.click(selectButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Selected Test Bank for mortgage calculation');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    
    alertSpy.mockRestore();
  });

  it('formats currency correctly', () => {
    const bankWithLargeNumbers = {
      ...mockBank,
      MaximumLoan: 1234567,
      MinimumDownPayment: 123456
    };
    
    render(<BankDetailsModal {...defaultProps} bank={bankWithLargeNumbers} />);
    
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    expect(screen.getByText('$123,456')).toBeInTheDocument();
  });
}); 