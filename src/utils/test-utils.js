import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const initialState = {
  banks: {
    items: [],
    loading: false,
    error: null
  }
};

export const renderWithProviders = (
  ui,
  {
    reduxState = initialState,
    store = mockStore(reduxState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
  };
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export const createMockBank = (overrides = {}) => ({
  id: '1',
  BankName: 'Test Bank',
  InterestRate: 5.5,
  MaximumLoan: 500000,
  MinimumDownPayment: 50000,
  LoanTerm: 20,
  ...overrides
});

export const createMockBanksState = (banks = [], overrides = {}) => ({
  banks: {
    items: banks,
    loading: false,
    error: null,
    ...overrides
  }
}); 