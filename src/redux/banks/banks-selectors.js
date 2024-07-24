import { List } from 'immutable';
import { isEmpty, debounce } from 'lodash';
import { calculateBanksStatistics, findBanksByCriteria, sortBanks } from '../../utils/immutable-utils';

export const getLoading = (state) => state.banks.loading

export const getFilter = (state) => state.banks.filter

export const getAllBanks = (state) => state.banks.items

export const getError = (state) => state.banks.error

export const getFilteredBanks = (state) => {
  const banks = getAllBanks(state)
  const filter = getFilter(state)
  
  if (isEmpty(filter)) return banks
  
  return List(banks)
    .filter(bank => 
      bank.BankName.toLowerCase().includes(filter.toLowerCase())
    )
    .toJS()
}

export const getBanksStatistics = (state) => {
  const banks = getAllBanks(state)
  return calculateBanksStatistics(banks)
}

export const getBanksByCriteria = (state, criteria) => {
  const banks = getAllBanks(state)
  return findBanksByCriteria(banks, criteria).toJS()
}

export const getSortedBanks = (state, sortBy, sortOrder = 'asc') => {
  const banks = getAllBanks(state)
  return sortBanks(banks, sortBy, sortOrder).toJS()
}

// Debounced селектор для пошуку (оптимізація продуктивності)
export const getDebouncedFilteredBanks = debounce((state) => {
  return getFilteredBanks(state)
}, 300)
