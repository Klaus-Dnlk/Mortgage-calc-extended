import { List, Map, fromJS } from 'immutable';
import { isEmpty, isNumber, round, sumBy, filter, sortBy, groupBy } from 'lodash';

export const toImmutableList = (array) => {
  return List(array);
};

export const toImmutableMap = (object) => {
  return Map(object);
};

export const toImmutable = (data) => {
  return fromJS(data);
};

export const findBankById = (banks, bankId) => {
  const banksList = List.isList(banks) ? banks : List(banks);
  return banksList.find(bank => bank.id === bankId);
};

export const findBanksByCriteria = (banks, criteria) => {
  const banksList = List.isList(banks) ? banks : List(banks);
  
  return banksList.filter(bank => {
    return Object.keys(criteria).every(key => {
      const value = criteria[key];
      if (typeof value === 'string') {
        return bank[key] && bank[key].toLowerCase().includes(value.toLowerCase());
      }
      return bank[key] === value;
    });
  });
};

export const sortBanks = (banks, sortBy, sortOrder = 'asc') => {
  const banksList = List.isList(banks) ? banks : List(banks);
  
  return banksList.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const groupBanksBy = (banks, groupBy) => {
  const banksList = List.isList(banks) ? banks : List(banks);
  
  return banksList.groupBy(bank => bank[groupBy]);
};

export const calculateBanksStatistics = (banks) => {
  const banksList = List.isList(banks) ? banks : List(banks);
  
  if (isEmpty(banksList.toJS())) {
    return {
      totalBanks: 0,
      averageInterestRate: 0,
      averageLoanTerm: 0,
      averageMaxLoan: 0,
      averageMinDownPayment: 0
    };
  }
  
  const banksArray = banksList.toJS();
  const totalBanks = banksArray.length;
  
  const averageInterestRate = sumBy(banksArray, bank => parseFloat(bank.InterestRate) || 0) / totalBanks;
  const averageLoanTerm = sumBy(banksArray, bank => parseFloat(bank.LoanTerm) || 0) / totalBanks;
  const averageMaxLoan = sumBy(banksArray, bank => parseFloat(bank.MaximumLoan) || 0) / totalBanks;
  const averageMinDownPayment = sumBy(banksArray, bank => parseFloat(bank.MinimumDownPayment) || 0) / totalBanks;
  
  return {
    totalBanks,
    averageInterestRate: round(averageInterestRate, 2),
    averageLoanTerm: round(averageLoanTerm, 2),
    averageMaxLoan: round(averageMaxLoan),
    averageMinDownPayment: round(averageMinDownPayment)
  };
}; 