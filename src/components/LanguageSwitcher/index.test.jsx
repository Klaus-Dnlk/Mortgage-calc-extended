import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import LanguageSwitcher from './index';
import enMessages from '../../locales/en.json';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: { reload: jest.fn() },
  writable: true
});

const renderWithIntl = (component) => {
  return render(
    <IntlProvider messages={enMessages} locale="en" defaultLocale="en">
      {component}
    </IntlProvider>
  );
};

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('en');
  });

  it('renders language switcher button', () => {
    renderWithIntl(<LanguageSwitcher />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('opens menu when button is clicked', () => {
    renderWithIntl(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('🇺🇦')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Українська')).toBeInTheDocument();
  });

  it('closes menu when clicking outside', () => {
    renderWithIntl(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Menu should be open
    expect(screen.getByText('Українська')).toBeInTheDocument();
    
    // Click outside to close
    fireEvent.click(document.body);
    
    // Menu should be closed
    expect(screen.queryByText('Українська')).not.toBeInTheDocument();
  });

  it('changes language when menu item is clicked', () => {
    renderWithIntl(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const ukrainianOption = screen.getByText('Українська');
    fireEvent.click(ukrainianOption);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'uk');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('shows current language as selected', () => {
    renderWithIntl(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // English should be marked as selected
    const englishOption = screen.getByText('English').closest('li');
    expect(englishOption).toHaveAttribute('aria-selected', 'true');
  });

  it('displays tooltip on hover', () => {
    renderWithIntl(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    
    // Tooltip should appear
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('handles responsive design for small screens', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });

    renderWithIntl(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Language name should be hidden on small screens
    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });
}); 