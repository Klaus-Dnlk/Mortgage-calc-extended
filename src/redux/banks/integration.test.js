import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { banksReducer } from './banks-reducer';
import * as banksActions from './banks-actions';
import * as banksSelectors from './banks-selectors';
import * as banksOperations from './banks-operations';

// Mock API service
jest.mock('../../service', () => ({
  fetchBanks: jest.fn(),
  addBank: jest.fn(),
  deleteBank: jest.fn()
}));

const mockStore = configureMockStore([thunk]);

describe('Banks Redux Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      banks: {
        items: [],
        loading: false,
        error: null
      }
    });
    jest.clearAllMocks();
  });

  describe('Redux Store State Management Flow', () => {
    it('should handle complete fetch banks flow', async () => {
      const mockBanks = [
        {
          id: '1',
          BankName: 'Test Bank A',
          InterestRate: 4.5,
          MaximumLoan: 500000,
          MinimumDownPayment: 50000,
          LoanTerm: 30
        },
        {
          id: '2',
          BankName: 'Test Bank B',
          InterestRate: 3.8,
          MaximumLoan: 750000,
          MinimumDownPayment: 75000,
          LoanTerm: 25
        }
      ];

      // Test initial state
      let state = banksReducer(undefined, { type: 'INIT' });
      expect(state).toEqual({
        items: [],
        loading: false,
        error: null
      });

      // Test pending action
      state = banksReducer(state, banksActions.fetchBanksPending());
      expect(state).toEqual({
        items: [],
        loading: true,
        error: null
      });

      // Test fulfilled action
      state = banksReducer(state, banksActions.fetchBanksFulfilled(mockBanks));
      expect(state).toEqual({
        items: mockBanks,
        loading: false,
        error: null
      });

      // Test selectors
      expect(banksSelectors.getAllBanks({ banks: state })).toEqual(mockBanks);
      expect(banksSelectors.getLoading({ banks: state })).toBe(false);
      expect(banksSelectors.getError({ banks: state })).toBe(null);
    });

    it('should handle fetch banks error flow', () => {
      const errorMessage = 'Failed to fetch banks';

      let state = banksReducer(undefined, { type: 'INIT' });
      
      // Test pending action
      state = banksReducer(state, banksActions.fetchBanksPending());
      expect(state.loading).toBe(true);

      // Test rejected action
      state = banksReducer(state, banksActions.fetchBanksRejected(errorMessage));
      expect(state).toEqual({
        items: [],
        loading: false,
        error: errorMessage
      });

      // Test selectors
      expect(banksSelectors.getAllBanks({ banks: state })).toEqual([]);
      expect(banksSelectors.getLoading({ banks: state })).toBe(false);
      expect(banksSelectors.getError({ banks: state })).toBe(errorMessage);
    });

    it('should handle add bank flow', () => {
      const existingBanks = [
        {
          id: '1',
          BankName: 'Existing Bank',
          InterestRate: 4.5,
          MaximumLoan: 500000,
          MinimumDownPayment: 50000,
          LoanTerm: 30
        }
      ];

      const newBank = {
        id: '2',
        BankName: 'New Bank',
        InterestRate: 3.8,
        MaximumLoan: 750000,
        MinimumDownPayment: 75000,
        LoanTerm: 25
      };

      let state = banksReducer(undefined, banksActions.fetchBanksFulfilled(existingBanks));
      
      // Test add bank pending
      state = banksReducer(state, banksActions.addBankPending());
      expect(state.loading).toBe(true);

      // Test add bank fulfilled
      state = banksReducer(state, banksActions.addBankFulfilled(newBank));
      expect(state).toEqual({
        items: [...existingBanks, newBank],
        loading: false,
        error: null
      });

      // Test selectors
      expect(banksSelectors.getAllBanks({ banks: state })).toHaveLength(2);
      expect(banksSelectors.getAllBanks({ banks: state })).toContainEqual(newBank);
    });

    it('should handle delete bank flow', () => {
      const banks = [
        {
          id: '1',
          BankName: 'Bank A',
          InterestRate: 4.5,
          MaximumLoan: 500000,
          MinimumDownPayment: 50000,
          LoanTerm: 30
        },
        {
          id: '2',
          BankName: 'Bank B',
          InterestRate: 3.8,
          MaximumLoan: 750000,
          MinimumDownPayment: 75000,
          LoanTerm: 25
        }
      ];

      let state = banksReducer(undefined, banksActions.fetchBanksFulfilled(banks));
      
      // Test delete bank pending
      state = banksReducer(state, banksActions.deleteBankPending());
      expect(state.loading).toBe(true);

      // Test delete bank fulfilled
      state = banksReducer(state, banksActions.deleteBankFulfilled('1'));
      expect(state).toEqual({
        items: [banks[1]], // Only Bank B remains
        loading: false,
        error: null
      });

      // Test selectors
      expect(banksSelectors.getAllBanks({ banks: state })).toHaveLength(1);
      expect(banksSelectors.getAllBanks({ banks: state })[0].BankName).toBe('Bank B');
    });
  });

  describe('Selector Integration Flow', () => {
    it('should provide correct bank statistics', () => {
      const banks = [
        {
          id: '1',
          BankName: 'Bank A',
          InterestRate: 4.5,
          MaximumLoan: 500000,
          MinimumDownPayment: 50000,
          LoanTerm: 30
        },
        {
          id: '2',
          BankName: 'Bank B',
          InterestRate: 3.8,
          MaximumLoan: 750000,
          MinimumDownPayment: 75000,
          LoanTerm: 25
        },
        {
          id: '3',
          BankName: 'Bank C',
          InterestRate: 5.2,
          MaximumLoan: 300000,
          MinimumDownPayment: 30000,
          LoanTerm: 20
        }
      ];

      const state = banksReducer(undefined, banksActions.fetchBanksFulfilled(banks));

      // Test basic selectors
      expect(banksSelectors.getAllBanks({ banks: state })).toEqual(banks);
      expect(banksSelectors.getLoading({ banks: state })).toBe(false);
      expect(banksSelectors.getError({ banks: state })).toBe(null);

      // Test derived selectors
      expect(banksSelectors.getBanksCount({ banks: state })).toBe(3);
      expect(banksSelectors.getAverageInterestRate({ banks: state })).toBeCloseTo(4.5, 1);
      expect(banksSelectors.getTotalMaxLoan({ banks: state })).toBe(1550000);
    });

    it('should handle empty banks state', () => {
      const state = banksReducer(undefined, { type: 'INIT' });

      expect(banksSelectors.getAllBanks({ banks: state })).toEqual([]);
      expect(banksSelectors.getBanksCount({ banks: state })).toBe(0);
      expect(banksSelectors.getAverageInterestRate({ banks: state })).toBe(0);
      expect(banksSelectors.getTotalMaxLoan({ banks: state })).toBe(0);
    });

    it('should provide bank by ID selector', () => {
      const banks = [
        {
          id: '1',
          BankName: 'Bank A',
          InterestRate: 4.5,
          MaximumLoan: 500000,
          MinimumDownPayment: 50000,
          LoanTerm: 30
        },
        {
          id: '2',
          BankName: 'Bank B',
          InterestRate: 3.8,
          MaximumLoan: 750000,
          MinimumDownPayment: 75000,
          LoanTerm: 25
        }
      ];

      const state = banksReducer(undefined, banksActions.fetchBanksFulfilled(banks));

      expect(banksSelectors.getBankById({ banks: state }, '1')).toEqual(banks[0]);
      expect(banksSelectors.getBankById({ banks: state }, '2')).toEqual(banks[1]);
      expect(banksSelectors.getBankById({ banks: state }, '999')).toBeUndefined();
    });
  });

  describe('Async Operations Integration Flow', () => {
    it('should dispatch correct actions for fetch banks operation', async () => {
      const { fetchBanks } = require('../../service');
      fetchBanks.mockResolvedValue([
        { id: '1', BankName: 'Test Bank', InterestRate: 4.5, MaximumLoan: 500000, MinimumDownPayment: 50000, LoanTerm: 30 }
      ]);

      const expectedActions = [
        { type: 'banks/fetchBanks/pending' },
        { 
          type: 'banks/fetchBanks/fulfilled',
          payload: [{ id: '1', BankName: 'Test Bank', InterestRate: 4.5, MaximumLoan: 500000, MinimumDownPayment: 50000, LoanTerm: 30 }]
        }
      ];

      await store.dispatch(banksOperations.fetchBanks());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should dispatch correct actions for add bank operation', async () => {
      const { addBank } = require('../../service');
      const newBank = {
        BankName: 'New Bank',
        InterestRate: 3.8,
        MaximumLoan: 750000,
        MinimumDownPayment: 75000,
        LoanTerm: 25
      };
      
      const addedBank = { id: '2', ...newBank };
      addBank.mockResolvedValue(addedBank);

      const expectedActions = [
        { type: 'banks/addBank/pending' },
        { 
          type: 'banks/addBank/fulfilled',
          payload: addedBank
        }
      ];

      await store.dispatch(banksOperations.addNewBank(newBank));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should dispatch correct actions for delete bank operation', async () => {
      const { deleteBank } = require('../../service');
      deleteBank.mockResolvedValue({ success: true });

      const expectedActions = [
        { type: 'banks/deleteBank/pending' },
        { 
          type: 'banks/deleteBank/fulfilled',
          payload: '1'
        }
      ];

      await store.dispatch(banksOperations.deleteBank('1'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should handle operation errors correctly', async () => {
      const { fetchBanks } = require('../../service');
      const error = new Error('Network error');
      fetchBanks.mockRejectedValue(error);

      const expectedActions = [
        { type: 'banks/fetchBanks/pending' },
        { 
          type: 'banks/fetchBanks/rejected',
          payload: 'Network error'
        }
      ];

      await store.dispatch(banksOperations.fetchBanks());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('State Persistence Flow', () => {
    it('should maintain state consistency across multiple operations', () => {
      let state = banksReducer(undefined, { type: 'INIT' });

      // Add first bank
      const bank1 = { id: '1', BankName: 'Bank A', InterestRate: 4.5, MaximumLoan: 500000, MinimumDownPayment: 50000, LoanTerm: 30 };
      state = banksReducer(state, banksActions.addBankFulfilled(bank1));
      expect(state.items).toHaveLength(1);
      expect(banksSelectors.getBanksCount({ banks: state })).toBe(1);

      // Add second bank
      const bank2 = { id: '2', BankName: 'Bank B', InterestRate: 3.8, MaximumLoan: 750000, MinimumDownPayment: 75000, LoanTerm: 25 };
      state = banksReducer(state, banksActions.addBankFulfilled(bank2));
      expect(state.items).toHaveLength(2);
      expect(banksSelectors.getBanksCount({ banks: state })).toBe(2);

      // Delete first bank
      state = banksReducer(state, banksActions.deleteBankFulfilled('1'));
      expect(state.items).toHaveLength(1);
      expect(banksSelectors.getBanksCount({ banks: state })).toBe(1);
      expect(state.items[0].BankName).toBe('Bank B');

      // Verify state consistency
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle concurrent operations correctly', () => {
      let state = banksReducer(undefined, { type: 'INIT' });

      // Start fetch operation
      state = banksReducer(state, banksActions.fetchBanksPending());
      expect(state.loading).toBe(true);

      // Try to add bank while loading (should still work)
      const newBank = { id: '1', BankName: 'New Bank', InterestRate: 4.5, MaximumLoan: 500000, MinimumDownPayment: 50000, LoanTerm: 30 };
      state = banksReducer(state, banksActions.addBankFulfilled(newBank));
      expect(state.items).toHaveLength(1);
      expect(state.loading).toBe(true); // Still loading from fetch

      // Complete fetch operation
      const fetchedBanks = [
        { id: '2', BankName: 'Fetched Bank', InterestRate: 3.8, MaximumLoan: 750000, MinimumDownPayment: 75000, LoanTerm: 25 }
      ];
      state = banksReducer(state, banksActions.fetchBanksFulfilled(fetchedBanks));
      expect(state.items).toEqual(fetchedBanks); // Should replace with fetched data
      expect(state.loading).toBe(false);
    });
  });

  describe('Error Recovery Flow', () => {
    it('should recover from error state on successful operation', () => {
      let state = banksReducer(undefined, { type: 'INIT' });

      // Set error state
      state = banksReducer(state, banksActions.fetchBanksRejected('Network error'));
      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);

      // Successful operation should clear error
      const banks = [{ id: '1', BankName: 'Test Bank', InterestRate: 4.5, MaximumLoan: 500000, MinimumDownPayment: 50000, LoanTerm: 30 }];
      state = banksReducer(state, banksActions.fetchBanksFulfilled(banks));
      expect(state.error).toBe(null);
      expect(state.items).toEqual(banks);
    });

    it('should maintain error state during loading', () => {
      let state = banksReducer(undefined, { type: 'INIT' });

      // Set error state
      state = banksReducer(state, banksActions.fetchBanksRejected('Network error'));
      expect(state.error).toBe('Network error');

      // Start new operation
      state = banksReducer(state, banksActions.fetchBanksPending());
      expect(state.loading).toBe(true);
      expect(state.error).toBe('Network error'); // Error should persist during loading

      // Successful operation should clear error
      const banks = [{ id: '1', BankName: 'Test Bank', InterestRate: 4.5, MaximumLoan: 500000, MinimumDownPayment: 50000, LoanTerm: 30 }];
      state = banksReducer(state, banksActions.fetchBanksFulfilled(banks));
      expect(state.error).toBe(null);
      expect(state.loading).toBe(false);
    });
  });
}); 