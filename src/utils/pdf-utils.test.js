import { 
  generateMortgageReport, 
  generateBanksComparison, 
  generateLoanAnalysis,
  savePDF,
  printPDF
} from './pdf-utils';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    output: jest.fn().mockReturnValue('mock-pdf-blob'),
    internal: {
      getNumberOfPages: jest.fn().mockReturnValue(1)
    }
  }));
});

describe('PDF Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMortgageReport', () => {
    it('should generate mortgage report PDF', () => {
      const calculationData = {
        loanAmount: 300000,
        downPayment: 60000,
        downPaymentPercentage: 20,
        monthlyPayment: 1200,
        totalPayment: 432000,
        totalInterest: 132000
      };

      const bankData = {
        name: 'Test Bank',
        interestRate: 4.5,
        maxLoan: 500000,
        minDownPayment: 50000,
        loanTerm: 30
      };

      const doc = generateMortgageReport(calculationData, bankData);

      expect(doc).toBeDefined();
      expect(doc.setFontSize).toHaveBeenCalled();
      expect(doc.setFont).toHaveBeenCalled();
      expect(doc.text).toHaveBeenCalled();
    });
  });

  describe('generateBanksComparison', () => {
    it('should generate banks comparison PDF', () => {
      const banks = [
        {
          BankName: 'Bank A',
          InterestRate: 4.5,
          MaximumLoan: 500000,
          MinimumDownPayment: 50000,
          LoanTerm: 30
        },
        {
          BankName: 'Bank B',
          InterestRate: 4.2,
          MaximumLoan: 600000,
          MinimumDownPayment: 60000,
          LoanTerm: 30
        }
      ];

      const doc = generateBanksComparison(banks);

      expect(doc).toBeDefined();
      expect(doc.setFontSize).toHaveBeenCalled();
      expect(doc.setFont).toHaveBeenCalled();
      expect(doc.text).toHaveBeenCalled();
    });

    it('should handle empty banks array', () => {
      const banks = [];
      const doc = generateBanksComparison(banks);

      expect(doc).toBeDefined();
    });
  });

  describe('generateLoanAnalysis', () => {
    it('should generate loan analysis PDF', () => {
      const loanData = {
        principal: 300000,
        interestRate: 4.5,
        term: 30,
        monthlyPayment: 1200,
        totalPayments: 432000,
        totalInterest: 132000,
        amortizationSchedule: [
          {
            payment: 1200,
            principal: 100,
            interest: 1100,
            balance: 299900
          }
        ]
      };

      const doc = generateLoanAnalysis(loanData);

      expect(doc).toBeDefined();
      expect(doc.setFontSize).toHaveBeenCalled();
      expect(doc.setFont).toHaveBeenCalled();
      expect(doc.text).toHaveBeenCalled();
    });

    it('should handle loan data without amortization schedule', () => {
      const loanData = {
        principal: 300000,
        interestRate: 4.5,
        term: 30,
        monthlyPayment: 1200,
        totalPayments: 432000,
        totalInterest: 132000
      };

      const doc = generateLoanAnalysis(loanData);

      expect(doc).toBeDefined();
    });
  });

  describe('savePDF', () => {
    it('should call save method on document', () => {
      const mockDoc = {
        save: jest.fn()
      };

      savePDF(mockDoc, 'test.pdf');

      expect(mockDoc.save).toHaveBeenCalledWith('test.pdf');
    });
  });

  describe('printPDF', () => {
    it('should create blob and open print window', () => {
      const mockDoc = {
        output: jest.fn().mockReturnValue('mock-blob')
      };

      // Mock URL.createObjectURL and window.open
      const mockCreateObjectURL = jest.fn().mockReturnValue('mock-url');
      const mockOpen = jest.fn().mockReturnValue({
        onload: jest.fn()
      });

      global.URL.createObjectURL = mockCreateObjectURL;
      global.window.open = mockOpen;

      printPDF(mockDoc);

      expect(mockDoc.output).toHaveBeenCalledWith('blob');
      expect(mockCreateObjectURL).toHaveBeenCalledWith('mock-blob');
      expect(mockOpen).toHaveBeenCalledWith('mock-url');
    });
  });
}); 