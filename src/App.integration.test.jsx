import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import App from './App';

// Mock PDF utilities
jest.mock('./utils/pdf-utils', () => ({
  generateMortgageReport: jest.fn(() => ({})),
  generateBanksComparison: jest.fn(() => ({})),
  savePDF: jest.fn()
}));

// Mock Redux operations
jest.mock('./redux/banks/banks-operations', () => ({
  fetchBanks: jest.fn(() => ({ type: 'banks/fetchBanks/pending' }))
}));

const mockStore = configureMockStore([thunk]);

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

const initialState = {
  banks: {
    items: mockBanks,
    loading: false,
    error: null
  }
};

const renderWithProviders = (ui, { reduxState = initialState } = {}) => {
  const store = mockStore(reduxState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <IntlProvider locale="en" messages={{
          'nav.home': 'Home',
          'nav.calculator': 'Calculator',
          'nav.banks': 'Banks',
          'nav.patterns': 'Patterns',
          'home.title': 'Welcome to',
          'home.subtitle': 'Mortgage Calculator',
          'calc.title': 'Mortgage Calculator',
          'banks.title': 'Banks',
          'patterns.title': 'React Patterns Demo'
        }}>
          {ui}
        </IntlProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation Flow', () => {
    it('should render home page by default', () => {
      renderWithProviders(<App />);

      // Verify home page content is displayed
      expect(screen.getByText('Welcome to')).toBeInTheDocument();
      expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      expect(screen.getByText(/This application is created for the mortgage calculating service/i)).toBeInTheDocument();
    });

    it('should navigate to calculator page', async () => {
      renderWithProviders(<App />);

      // Click on calculator navigation link
      const calculatorLink = screen.getByText('Calculator');
      fireEvent.click(calculatorLink);

      // Verify calculator page is displayed
      await waitFor(() => {
        expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      });

      // Verify calculator form elements are present
      expect(screen.getByLabelText(/Bank name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Initial Loan/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Down Payment/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Loan Term/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/APR/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Calculate/i })).toBeInTheDocument();
    });

    it('should navigate to banks page', async () => {
      renderWithProviders(<App />);

      // Click on banks navigation link
      const banksLink = screen.getByText('Banks');
      fireEvent.click(banksLink);

      // Verify banks page is displayed
      await waitFor(() => {
        expect(screen.getByText('Banks')).toBeInTheDocument();
      });

      // Verify banks table is present
      expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      expect(screen.getByText('Test Bank B')).toBeInTheDocument();
      expect(screen.getByText('4.5%')).toBeInTheDocument();
      expect(screen.getByText('3.8%')).toBeInTheDocument();
    });

    it('should navigate to patterns demo page', async () => {
      renderWithProviders(<App />);

      // Click on patterns navigation link
      const patternsLink = screen.getByText('Patterns');
      fireEvent.click(patternsLink);

      // Verify patterns demo page is displayed
      await waitFor(() => {
        expect(screen.getByText('React Patterns Demo')).toBeInTheDocument();
      });

      // Verify pattern components are present
      expect(screen.getByText(/Higher-Order Components/i)).toBeInTheDocument();
      expect(screen.getByText(/Render Props/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Hooks/i)).toBeInTheDocument();
    });

    it('should maintain navigation state across page changes', async () => {
      renderWithProviders(<App />);

      // Navigate to calculator
      const calculatorLink = screen.getByText('Calculator');
      fireEvent.click(calculatorLink);

      await waitFor(() => {
        expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      });

      // Navigate to banks
      const banksLink = screen.getByText('Banks');
      fireEvent.click(banksLink);

      await waitFor(() => {
        expect(screen.getByText('Banks')).toBeInTheDocument();
      });

      // Navigate back to home
      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
      });
    });
  });

  describe('Calculator Page Integration Flow', () => {
    it('should perform complete mortgage calculation flow', async () => {
      renderWithProviders(<App />);

      // Navigate to calculator
      const calculatorLink = screen.getByText('Calculator');
      fireEvent.click(calculatorLink);

      await waitFor(() => {
        expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      });

      // Select bank from dropdown
      const bankSelect = screen.getByLabelText(/Bank name/i);
      fireEvent.mouseDown(bankSelect);
      fireEvent.click(screen.getByText('Test Bank A'));

      // Verify form is populated with bank data
      expect(screen.getByLabelText(/Initial Loan/i)).toHaveValue(500000);
      expect(screen.getByLabelText(/Down Payment/i)).toHaveValue(50000);
      expect(screen.getByLabelText(/Loan Term/i)).toHaveValue(30);
      expect(screen.getByLabelText(/APR/i)).toHaveValue(4.5);

      // Modify loan amount
      const initialLoanInput = screen.getByLabelText(/Initial Loan/i);
      fireEvent.change(initialLoanInput, { target: { value: '400000' } });

      // Calculate mortgage
      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      // Verify monthly payment is calculated
      await waitFor(() => {
        const monthlyPaymentElement = screen.getByTestId('monthly-payment');
        expect(monthlyPaymentElement).toBeInTheDocument();
        expect(monthlyPaymentElement.textContent).toMatch(/\$\d/);
      });

      // Verify total payments are shown
      expect(screen.getByText(/Total payments/i)).toBeInTheDocument();
    });

    it('should handle form validation errors', async () => {
      renderWithProviders(<App />);

      // Navigate to calculator
      const calculatorLink = screen.getByText('Calculator');
      fireEvent.click(calculatorLink);

      await waitFor(() => {
        expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      });

      // Try to calculate without filling form
      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      // Verify validation error
      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    });

    it('should reset form after calculation', async () => {
      renderWithProviders(<App />);

      // Navigate to calculator
      const calculatorLink = screen.getByText('Calculator');
      fireEvent.click(calculatorLink);

      await waitFor(() => {
        expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      });

      // Fill and calculate form
      const bankSelect = screen.getByLabelText(/Bank name/i);
      fireEvent.mouseDown(bankSelect);
      fireEvent.click(screen.getByText('Test Bank A'));

      const calculateButton = screen.getByRole('button', { name: /Calculate/i });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId('monthly-payment')).toBeInTheDocument();
      });

      // Reset form
      const resetButton = screen.getByTestId('reset');
      fireEvent.click(resetButton);

      // Verify form is cleared
      expect(screen.getByLabelText(/Initial Loan/i)).toHaveValue('');
      expect(screen.getByLabelText(/Down Payment/i)).toHaveValue('');
      expect(screen.getByLabelText(/Loan Term/i)).toHaveValue('');
      expect(screen.getByLabelText(/APR/i)).toHaveValue('');
    });
  });

  describe('Banks Page Integration Flow', () => {
    it('should display banks table with data', async () => {
      renderWithProviders(<App />);

      // Navigate to banks
      const banksLink = screen.getByText('Banks');
      fireEvent.click(banksLink);

      await waitFor(() => {
        expect(screen.getByText('Banks')).toBeInTheDocument();
      });

      // Verify banks are displayed
      expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      expect(screen.getByText('Test Bank B')).toBeInTheDocument();
      expect(screen.getByText('4.5%')).toBeInTheDocument();
      expect(screen.getByText('3.8%')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('$750,000')).toBeInTheDocument();
    });

    it('should open bank details modal', async () => {
      renderWithProviders(<App />);

      // Navigate to banks
      const banksLink = screen.getByText('Banks');
      fireEvent.click(banksLink);

      await waitFor(() => {
        expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      });

      // Click on bank row to open details
      const bankRow = screen.getByText('Test Bank A').closest('tr');
      fireEvent.click(bankRow);

      // Verify modal is opened
      await waitFor(() => {
        expect(screen.getByText(/Bank Details/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Test Bank A')).toBeInTheDocument();
      expect(screen.getByText('4.5%')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
    });

    it('should handle empty banks state', async () => {
      const emptyState = {
        banks: {
          items: [],
          loading: false,
          error: null
        }
      };

      renderWithProviders(<App />, { reduxState: emptyState });

      // Navigate to banks
      const banksLink = screen.getByText('Banks');
      fireEvent.click(banksLink);

      await waitFor(() => {
        expect(screen.getByText('Banks')).toBeInTheDocument();
      });

      // Verify empty state message
      expect(screen.getByText(/No banks available/i)).toBeInTheDocument();
    });
  });

  describe('Patterns Demo Page Integration Flow', () => {
    it('should demonstrate HOC pattern', async () => {
      renderWithProviders(<App />);

      // Navigate to patterns
      const patternsLink = screen.getByText('Patterns');
      fireEvent.click(patternsLink);

      await waitFor(() => {
        expect(screen.getByText('React Patterns Demo')).toBeInTheDocument();
      });

      // Verify HOC section is present
      expect(screen.getByText(/Higher-Order Components/i)).toBeInTheDocument();
      expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
    });

    it('should demonstrate render props pattern', async () => {
      renderWithProviders(<App />);

      // Navigate to patterns
      const patternsLink = screen.getByText('Patterns');
      fireEvent.click(patternsLink);

      await waitFor(() => {
        expect(screen.getByText('React Patterns Demo')).toBeInTheDocument();
      });

      // Verify render props section is present
      expect(screen.getByText(/Render Props/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Fetcher/i)).toBeInTheDocument();
    });

    it('should demonstrate custom hooks pattern', async () => {
      renderWithProviders(<App />);

      // Navigate to patterns
      const patternsLink = screen.getByText('Patterns');
      fireEvent.click(patternsLink);

      await waitFor(() => {
        expect(screen.getByText('React Patterns Demo')).toBeInTheDocument();
      });

      // Verify custom hooks section is present
      expect(screen.getByText(/Custom Hooks/i)).toBeInTheDocument();
      expect(screen.getByText(/Form Validation/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle banks loading error', async () => {
      const errorState = {
        banks: {
          items: [],
          loading: false,
          error: 'Failed to fetch banks'
        }
      };

      renderWithProviders(<App />, { reduxState: errorState });

      // Navigate to banks
      const banksLink = screen.getByText('Banks');
      fireEvent.click(banksLink);

      await waitFor(() => {
        expect(screen.getByText('Banks')).toBeInTheDocument();
      });

      // Verify error message is displayed
      expect(screen.getByText(/Failed to load banks/i)).toBeInTheDocument();
    });

    it('should handle banks loading state', async () => {
      const loadingState = {
        banks: {
          items: [],
          loading: true,
          error: null
        }
      };

      renderWithProviders(<App />, { reduxState: loadingState });

      // Navigate to banks
      const banksLink = screen.getByText('Banks');
      fireEvent.click(banksLink);

      await waitFor(() => {
        expect(screen.getByText('Banks')).toBeInTheDocument();
      });

      // Verify loading message is displayed
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design Flow', () => {
    it('should handle mobile navigation', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      });

      renderWithProviders(<App />);

      // Verify navigation is accessible on mobile
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Calculator')).toBeInTheDocument();
      expect(screen.getByText('Banks')).toBeInTheDocument();
      expect(screen.getByText('Patterns')).toBeInTheDocument();

      // Reset viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
    });
  });

  describe('Internationalization Flow', () => {
    it('should display localized content', () => {
      renderWithProviders(<App />);

      // Verify localized content is displayed
      expect(screen.getByText('Welcome to')).toBeInTheDocument();
      expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Calculator')).toBeInTheDocument();
      expect(screen.getByText('Banks')).toBeInTheDocument();
      expect(screen.getByText('Patterns')).toBeInTheDocument();
    });
  });
}); 