import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { isEmpty, isNumber, round } from 'lodash';

import { banksOperations, banksSelectors } from '../../redux/banks';
import { useSelector, useDispatch } from 'react-redux';
import numeral from 'numeral';
import { generateMortgageReport, savePDF } from '../../utils/pdf-utils';
import './style.css';

const calculateMonthlyPayment = (principal, annualRate, years) => {
  if (!isNumber(principal) || !isNumber(annualRate) || !isNumber(years)) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return round(payment, 2);
};

function Calc() {  
  const banks = useSelector(banksSelectors.getAllBanks);
  const isLoading = useSelector(banksSelectors.getLoading);
  const error = useSelector(banksSelectors.getError);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    initialLoan: '',
    downPayment: '',
    loanTerm: '',
    loanApr: ''
  });
  const [monthPayment, setMonthPayment] = useState(0);
  const [bankValue, setBankValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    dispatch(banksOperations.fetchBanks());
  }, [dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationError('');
    setWarning('');
  };

  const handleBankChange = (e) => {
    const selectedBankName = e.target.value;
    setBankValue(selectedBankName);
    
    const selectedBank = banks.find(bank => bank.BankName === selectedBankName);
    if (selectedBank) {
      setFormData({
        initialLoan: selectedBank.MaximumLoan.toString(),
        downPayment: selectedBank.MinimumDownPayment.toString(),
        loanTerm: selectedBank.LoanTerm.toString(),
        loanApr: selectedBank.InterestRate.toString()
      });
    }
  };

  const validateForm = () => {
    const { loanApr, initialLoan, downPayment, loanTerm } = formData;
    
    if (isEmpty(initialLoan) || isEmpty(downPayment) || isEmpty(loanTerm) || isEmpty(loanApr)) {
      setValidationError('All fields are required');
      return false;
    }
    
    const apr = parseFloat(loanApr);
    const loan = parseFloat(initialLoan);
    const down = parseFloat(downPayment);
    const term = parseFloat(loanTerm);
    
    if (!isNumber(apr) || apr > 100 || apr < 0) {
      setValidationError('Interest rate must be between 0 and 100%');
      return false;
    }
    
    if (!isNumber(loan) || loan <= 0) {
      setValidationError('Initial loan must be greater than 0');
      return false;
    }
    
    if (!isNumber(down) || down < 0) {
      setValidationError('Down payment cannot be negative');
      return false;
    }
    
    if (!isNumber(term) || term <= 0) {
      setValidationError('Loan term must be greater than 0');
      return false;
    }
    
    if (apr > 15) {
      setWarning('Consider negotiating for a better rate');
    }
    
    return true;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { initialLoan, loanApr, loanTerm } = formData;
    const payment = calculateMonthlyPayment(
      parseFloat(initialLoan),
      parseFloat(loanApr),
      parseFloat(loanTerm)
    );
    
    setMonthPayment(payment);
  };

  const handleReset = () => {    
    setFormData({
      initialLoan: '',
      downPayment: '',
      loanTerm: '',
      loanApr: ''
    });
    setMonthPayment(0);
    setBankValue('');
    setValidationError('');
    setWarning('');
  };

  // Generate PDF report with calculation results
  const handleExportPDF = () => {
    if (monthPayment <= 0) {
      setValidationError('Please calculate a payment first');
      return;
    }

    const selectedBank = banks.find(bank => bank.BankName === bankValue);
    if (!selectedBank) {
      setValidationError('Please select a bank first');
      return;
    }

    const calculationData = {
      loanAmount: parseFloat(formData.initialLoan),
      downPayment: parseFloat(formData.downPayment),
      downPaymentPercentage: (parseFloat(formData.downPayment) / parseFloat(formData.initialLoan)) * 100,
      monthlyPayment: monthPayment,
      totalPayment: monthPayment * parseFloat(formData.loanTerm) * 12,
      totalInterest: (monthPayment * parseFloat(formData.loanTerm) * 12) - parseFloat(formData.initialLoan)
    };

    const bankData = {
      name: selectedBank.BankName,
      interestRate: selectedBank.InterestRate,
      maxLoan: selectedBank.MaximumLoan,
      minDownPayment: selectedBank.MinimumDownPayment,
      loanTerm: selectedBank.LoanTerm
    };

    const doc = generateMortgageReport(calculationData, bankData);
    savePDF(doc, `mortgage-calculation-${new Date().toISOString().split('T')[0]}.pdf`);
  };  

  if (isLoading) {
    return (
      <div className="calc-container">
        <div className="calc-content">
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <p>Loading banks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calc-container">
        <div className="calc-content">
          <div className="calc-alert error">
            Failed to load banks: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calc-container">
      <div className="calc-content">
        <div className="calc-header">
          <h1 className="calc-title">Mortgage Calculator</h1>
        </div>
        
        <div className="calc-form-section">
          <div className="calc-bank-select">
            <FormControl fullWidth>
              <InputLabel id="selectBank">Bank name</InputLabel>
              <Select
                labelId="selectBank"
                value={bankValue}
                label="Bank name"
                onChange={handleBankChange}
              >
                {banks.map(({ id, BankName }) => (
                  <MenuItem key={id} value={BankName}>{BankName}</MenuItem>  
                ))}
              </Select>
            </FormControl>
          </div>
          
          {validationError && (
            <div className="calc-alert error">
              {validationError}
            </div>
          )}
          
          {warning && (
            <div className="calc-alert warning">
              {warning}
            </div>
          )}
          
          <div className="calc-form-grid">
            <div className="calc-form-field">
              <label>Initial Loan ($)</label>
              <input 
                value={formData.initialLoan}
                onChange={(e) => handleInputChange('initialLoan', e.target.value)}
                type="number"
                placeholder="Enter loan amount"
              />
            </div>

            <div className="calc-form-field">
              <label>Down Payment ($)</label>
              <input 
                value={formData.downPayment}
                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                type="number"
                placeholder="Enter down payment"
              />
            </div>

            <div className="calc-form-field">
              <label>Loan Term (years)</label>
              <input 
                value={formData.loanTerm}
                onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                type="number"
                placeholder="Enter loan term"
              />
            </div>

            <div className="calc-form-field">
              <label>APR (%)</label>
              <input 
                value={formData.loanApr}
                onChange={(e) => handleInputChange('loanApr', e.target.value)}
                type="number"
                placeholder="Enter interest rate"
              />
            </div>
          </div>
          
          <div className="calc-buttons">
            <button 
              className="calc-button calc-button-primary"
              onClick={handleCalculate}
            >
              Calculate
            </button>
            <button 
              className="calc-icon-button delete"
              onClick={handleReset} 
              data-testid="reset"
              title="Clear form"
            >
              <DeleteIcon />
            </button>
            {monthPayment > 0 && (
              <button 
                className="calc-icon-button export"
                onClick={handleExportPDF}
                data-testid="export-pdf"
                title="Export to PDF"
              >
                <PictureAsPdfIcon />
              </button>
            )}
          </div>
        </div>
        
        <div className="calc-result-section">
          <h2 className="calc-result-title">Monthly Payment</h2>
          <div 
            className="calc-result-amount"
            data-testid="monthly-payment"
          >
            {numeral(monthPayment).format('$0,0.00')}
          </div>
          {monthPayment > 0 && (
            <p className="calc-result-details">
              Total payments: {numeral(monthPayment * parseFloat(formData.loanTerm || 0) * 12).format('$0,0.00')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calc