import * as React from 'react'
import Box from '@mui/material/Box';
import { FormControl, InputLabel, Input, Button, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import * as yup from "yup";
import { v4 as uuidv4 } from 'uuid';
import { getAllBanks } from '../../redux/banks/banks-selectors'
import banksOperations from '../../redux/banks/banks-operations';
import { inputValidation, sanitizeInput } from '../../utils/security';

const validationSchema = yup.object({
    BankName: yup.string()
      .matches(/^[A-Z]/, 'Bank name must start with a capital letter')
      .required('Bank name is required'),
    MaximumLoan: yup.number()
      .positive('Maximum loan must be a positive number')
      .required('Maximum loan is required'),
    MinimumDownPayment: yup.number()
      .positive('Minimum down payment must be a positive number')
      .required('Minimum down payment is required'),
    LoanTerm: yup.number()
      .positive('Loan term must be a positive number')
      .required('Loan term is required'),
    InterestRate: yup.number()
      .positive('Interest rate must be a positive number')
      .max(100, 'Interest rate cannot exceed 100%')
      .required('Interest rate is required'),
  });

function NewBankCard({ onCloseModal }) {
    const [formData, setFormData] = React.useState({
      BankName: '',
      MaximumLoan: '',
      MinimumDownPayment: '',
      LoanTerm: '',
      InterestRate: ''
    })
    const [validationError, setValidationError] = React.useState('')

    const banks = useSelector(getAllBanks)
    const dispatch = useDispatch()
    const bankId = uuidv4()

    const handleChange = e => {
        const { name, value } = e.target
        
        // Clean input based on field type
        let sanitizedValue = value;
        if (name === 'BankName') {
            sanitizedValue = sanitizeInput(value);
        } else if (['MaximumLoan', 'MinimumDownPayment', 'LoanTerm', 'InterestRate'].includes(name)) {
            // Allow only numbers and decimal points for numeric fields
            sanitizedValue = value.replace(/[^0-9.]/g, '');
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: sanitizedValue
        }))
        setValidationError('') // Reset error on input change
    }    

    const handleSubmit = async e => {
        e.preventDefault()
        setValidationError('')

        const repeatName = name => 
          banks.find(e => e.BankName.toLowerCase() === name.toLowerCase())

        try {
            // Perform input validation checks
            if (!inputValidation.validateBankName(formData.BankName)) {
                setValidationError('Invalid bank name format')
                return
            }
            
            if (!inputValidation.validateCurrency(formData.MaximumLoan)) {
                setValidationError('Invalid maximum loan amount')
                return
            }
            
            if (!inputValidation.validateCurrency(formData.MinimumDownPayment)) {
                setValidationError('Invalid minimum down payment amount')
                return
            }
            
            if (!inputValidation.validateLoanTerm(formData.LoanTerm)) {
                setValidationError('Invalid loan term')
                return
            }
            
            if (!inputValidation.validatePercentage(formData.InterestRate)) {
                setValidationError('Invalid interest rate')
                return
            }
            
            const validData = await validationSchema.validate(formData, { abortEarly: false })
            
            if(repeatName(formData.BankName)) {
                setValidationError(`${formData.BankName} already exists`)
                return
            }
            
            await dispatch(banksOperations.addNewBank(validData)).unwrap()
            onCloseModal()
            reset()
            
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                setValidationError(error.errors[0])
                return
            }
            setValidationError('Failed to add bank. Please try again.')
        }
    }

    const reset = () => {
        setFormData({
          BankName: '',
          MaximumLoan: '',
          MinimumDownPayment: '',
          LoanTerm: '',
          InterestRate: ''
        })
        setValidationError('')
    }

    const handleKeyPress = (event) => {
        const regex = /[0-9]/;
      
        if (!regex.test(event.key)) {
          event.preventDefault();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {validationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationError}
              </Alert>
            )}
            
            <FormControl sx={{ mt: 2 }}>
                <InputLabel htmlFor={bankId}>Bank name</InputLabel>
                <Input 
                type='text'
                name='BankName'
                value={formData.BankName}
                onChange={handleChange}
                id={bankId}
                />
            </FormControl>

            <FormControl sx={{ mt: 2 }}>
                <InputLabel htmlFor="maximum-loan">Maximum loan ($)</InputLabel>
                <Input 
                type='text'
                name='MaximumLoan'
                value={formData.MaximumLoan}
                onChange={handleChange} 
                onKeyPress={handleKeyPress}
                id="maximum-loan"
                />
            </FormControl>

            <FormControl sx={{ mt: 2 }}>
                <InputLabel htmlFor="minimum-down-payment">Minimum down payment ($)</InputLabel>
                <Input 
                type='text'
                name='MinimumDownPayment'
                value={formData.MinimumDownPayment}
                onChange={handleChange} 
                onKeyPress={handleKeyPress}
                id="minimum-down-payment"
                />
            </FormControl>

            <FormControl sx={{ mt: 2 }}>
                <InputLabel htmlFor="loan-term">Loan term (years)</InputLabel>
                <Input 
                type='text'
                name='LoanTerm'
                value={formData.LoanTerm}
                onChange={handleChange} 
                onKeyPress={handleKeyPress}
                id="loan-term"
                />
            </FormControl>

            <FormControl sx={{ mt: 2 }}>
                <InputLabel htmlFor="interest-rate">Interest rate (%)</InputLabel>
                <Input 
                type='text'
                name='InterestRate'
                value={formData.InterestRate}
                onChange={handleChange} 
                onKeyPress={handleKeyPress}
                id="interest-rate"
                />
            </FormControl>
            
            <Button 
                variant='contained'
                type="submit"
                sx={{ mt: 2, mx: 'auto', width: 300, height: 50 }}
                onClick={handleSubmit}
            >
             Add Bank
            </Button>
        </Box>
    )
}

export default NewBankCard