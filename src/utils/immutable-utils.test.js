import { calculateBanksStatistics, findBanksByCriteria, sortBanks, groupBanksBy } from './immutable-utils';

const mockBanks = [
  {
    id: 1,
    BankName: 'Bank A',
    InterestRate: '5.5',
    LoanTerm: '30',
    MaximumLoan: '500000',
    MinimumDownPayment: '50000'
  },
  {
    id: 2,
    BankName: 'Bank B',
    InterestRate: '4.8',
    LoanTerm: '25',
    MaximumLoan: '750000',
    MinimumDownPayment: '75000'
  },
  {
    id: 3,
    BankName: 'Bank C',
    InterestRate: '6.2',
    LoanTerm: '20',
    MaximumLoan: '300000',
    MinimumDownPayment: '30000'
  }
];

describe('Immutable Utils', () => {
  describe('calculateBanksStatistics', () => {
    it('should calculate correct statistics for banks', () => {
      const stats = calculateBanksStatistics(mockBanks);
      
      expect(stats.totalBanks).toBe(3);
      expect(stats.averageInterestRate).toBe(5.5); // (5.5 + 4.8 + 6.2) / 3
      expect(stats.averageLoanTerm).toBe(25); // (30 + 25 + 20) / 3
      expect(stats.averageMaxLoan).toBe(516667); // (500000 + 750000 + 300000) / 3
      expect(stats.averageMinDownPayment).toBe(51667); // (50000 + 75000 + 30000) / 3
    });

    it('should return zero statistics for empty array', () => {
      const stats = calculateBanksStatistics([]);
      
      expect(stats.totalBanks).toBe(0);
      expect(stats.averageInterestRate).toBe(0);
      expect(stats.averageLoanTerm).toBe(0);
      expect(stats.averageMaxLoan).toBe(0);
      expect(stats.averageMinDownPayment).toBe(0);
    });
  });

  describe('findBanksByCriteria', () => {
    it('should find banks by name criteria', () => {
      const result = findBanksByCriteria(mockBanks, { BankName: 'Bank A' });
      
      expect(result.size).toBe(1);
      expect(result.first().BankName).toBe('Bank A');
    });

    it('should find banks by partial name match', () => {
      const result = findBanksByCriteria(mockBanks, { BankName: 'Bank' });
      
      expect(result.size).toBe(3);
    });

    it('should return empty list for non-matching criteria', () => {
      const result = findBanksByCriteria(mockBanks, { BankName: 'NonExistentBank' });
      
      expect(result.size).toBe(0);
    });
  });

  describe('sortBanks', () => {
    it('should sort banks by interest rate in ascending order', () => {
      const result = sortBanks(mockBanks, 'InterestRate', 'asc');
      
      expect(result.first().BankName).toBe('Bank B'); // 4.8%
      expect(result.last().BankName).toBe('Bank C'); // 6.2%
    });

    it('should sort banks by interest rate in descending order', () => {
      const result = sortBanks(mockBanks, 'InterestRate', 'desc');
      
      expect(result.first().BankName).toBe('Bank C'); // 6.2%
      expect(result.last().BankName).toBe('Bank B'); // 4.8%
    });
  });

  describe('groupBanksBy', () => {
    it('should group banks by loan term', () => {
      const result = groupBanksBy(mockBanks, 'LoanTerm');
      
      expect(result.size).toBe(3); // 3 different loan terms
      expect(result.get('30').size).toBe(1); // 1 bank with 30 year term
      expect(result.get('25').size).toBe(1); // 1 bank with 25 year term
      expect(result.get('20').size).toBe(1); // 1 bank with 20 year term
    });
  });
}); 