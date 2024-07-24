import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiSecurity, rateLimiting } from '../../utils/security'

// Configure axios with security settings
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://625314acc534af46cb93846b.mockapi.io/api/'

// Add security headers to all requests
axios.interceptors.request.use(
  (config) => {
    // Add security headers
    config = apiSecurity.addSecurityHeaders(config);
    
    // Rate limiting check
    const clientId = 'default'; // In real app, use user ID or session ID
    if (!rateLimiting.isAllowed(clientId)) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Validate and sanitize responses
axios.interceptors.response.use(
  (response) => {
    // Validate response
    response = apiSecurity.validateResponse(response);
    
    // Sanitize response data
    if (response.data) {
      response.data = apiSecurity.sanitizeData(response.data);
    }
    
    return response;
  },
  (error) => {
    // Log security-related errors
    if (error.response?.status === 403) {
      console.warn('Access forbidden - possible security issue');
    }
    return Promise.reject(error);
  }
);

export const fetchBanks = createAsyncThunk(
  'banks/fetchBanks',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/banks')
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const addNewBank = createAsyncThunk(
  'banks/addNewBank',
  async (
    { BankName, MaximumLoan, MinimumDownPayment, LoanTerm, InterestRate },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post('/banks', {
        BankName,
        MaximumLoan,
        MinimumDownPayment,
        LoanTerm,
        InterestRate,
      })
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteBank = createAsyncThunk(
  'banks/deleteBank',
  async (bankId, { rejectWithValue }) => {
    try {
      await axios.delete(`/banks/${bankId}`)
      return bankId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export default {
  fetchBanks,
  addNewBank,
  deleteBank,
}
