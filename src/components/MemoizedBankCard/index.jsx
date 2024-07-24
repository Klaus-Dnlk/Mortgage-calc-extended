import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import './style.css';

// MemoizedBankCard Component - Performance Optimization Demo
// This component demonstrates various React memoization techniques to improve performance
// by preventing unnecessary re-renders and optimizing expensive calculations
//
// Key optimizations:
// - React.memo prevents re-renders when props haven't changed
// - useMemo caches expensive calculations
// - useCallback stabilizes event handlers
// - Overall performance improvement through smart caching
//

const MemoizedBankCard = React.memo(({ bank, onSelect, isSelected }) => {
  // Cache expensive mortgage calculations
  const calculatedValues = useMemo(() => {
    const { InterestRate, MaximumLoan, MinimumDownPayment, LoanTerm } = bank;
    
    // Perform mortgage payment calculations
    const monthlyPayment = (MaximumLoan - MinimumDownPayment) * 
      (InterestRate / 100 / 12) * 
      Math.pow(1 + InterestRate / 100 / 12, LoanTerm * 12) / 
      (Math.pow(1 + InterestRate / 100 / 12, LoanTerm * 12) - 1);
    
    const totalInterest = (monthlyPayment * LoanTerm * 12) - (MaximumLoan - MinimumDownPayment);
    const downPaymentPercentage = (MinimumDownPayment / MaximumLoan) * 100;
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      downPaymentPercentage: Math.round(downPaymentPercentage)
    };
  }, [bank.InterestRate, bank.MaximumLoan, bank.MinimumDownPayment, bank.LoanTerm]);

  // Stabilize event handler to prevent unnecessary re-renders
  const handleSelect = useCallback(() => {
    onSelect(bank.id);
  }, [onSelect, bank.id]);

  // Memoize complex JSX content
  const cardContent = useMemo(() => (
    <CardContent>
      <Typography variant="h6" component="h2" className="bank-name">
        {bank.BankName}
      </Typography>
      
      <Box className="bank-details">
        <Typography variant="body2" color="text.secondary" className="bank-detail-item">
          Interest Rate: <strong>{bank.InterestRate}%</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" className="bank-detail-item">
          Max Loan: <strong>${bank.MaximumLoan.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" className="bank-detail-item">
          Min Down Payment: <strong>${bank.MinimumDownPayment.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" className="bank-detail-item">
          Loan Term: <strong>{bank.LoanTerm} years</strong>
        </Typography>
      </Box>

      <Box className="calculated-values">
        <Typography variant="subtitle2" color="primary" className="calculated-values-title">
          Calculated Values:
        </Typography>
        <Typography variant="body2" color="text.secondary" className="calculated-value-item">
          Monthly Payment: <strong>${calculatedValues.monthlyPayment.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" className="calculated-value-item">
          Total Interest: <strong>${calculatedValues.totalInterest.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" className="calculated-value-item">
          Down Payment %: <strong>{calculatedValues.downPaymentPercentage}%</strong>
        </Typography>
      </Box>

      <Chip 
        label={isSelected ? "Selected" : "Select Bank"} 
        color={isSelected ? "primary" : "default"}
        variant={isSelected ? "filled" : "outlined"}
        onClick={handleSelect}
        className="select-chip"
      />
    </CardContent>
  ), [bank.BankName, bank.InterestRate, bank.MaximumLoan, bank.MinimumDownPayment, bank.LoanTerm, calculatedValues, isSelected, handleSelect]);

  return (
    <Card 
      className={`memoized-bank-card ${isSelected ? 'selected' : ''}`}
      onClick={handleSelect}
    >
      {cardContent}
    </Card>
  );
});

// Set component display name for debugging
MemoizedBankCard.displayName = 'MemoizedBankCard';

export default MemoizedBankCard; 