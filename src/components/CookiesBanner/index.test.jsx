import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CookiesBanner from './index';
import enMessages from '../../locales/en.json';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <IntlProvider messages={enMessages} locale="en">
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </IntlProvider>
  );
};

describe('CookiesBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders banner when cookies not accepted', () => {
    const { get } = require('js-cookie');
    get.mockReturnValue(undefined);

    renderWithProviders(<CookiesBanner />);
    
    expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
    expect(screen.getByText('Accept All')).toBeInTheDocument();
    expect(screen.getByText('Accept Necessary')).toBeInTheDocument();
    expect(screen.getByText('Reject All')).toBeInTheDocument();
  });

  test('does not render banner when cookies already accepted', () => {
    const { get } = require('js-cookie');
    get.mockReturnValue('all');

    renderWithProviders(<CookiesBanner />);
    
    expect(screen.queryByText('Cookie Settings')).not.toBeInTheDocument();
  });

  test('handles accept all cookies', () => {
    const { get, set } = require('js-cookie');
    get.mockReturnValue(undefined);

    renderWithProviders(<CookiesBanner />);
    
    const acceptAllButton = screen.getByText('Accept All');
    fireEvent.click(acceptAllButton);

    expect(set).toHaveBeenCalledWith('cookies-accepted', 'all', { expires: 365 });
    expect(set).toHaveBeenCalledWith('analytics-cookies', 'true', { expires: 365 });
    expect(set).toHaveBeenCalledWith('marketing-cookies', 'true', { expires: 365 });
  });

  test('handles accept necessary cookies', () => {
    const { get, set } = require('js-cookie');
    get.mockReturnValue(undefined);

    renderWithProviders(<CookiesBanner />);
    
    const acceptNecessaryButton = screen.getByText('Accept Necessary');
    fireEvent.click(acceptNecessaryButton);

    expect(set).toHaveBeenCalledWith('cookies-accepted', 'necessary', { expires: 365 });
    expect(set).toHaveBeenCalledWith('analytics-cookies', 'false', { expires: 365 });
    expect(set).toHaveBeenCalledWith('marketing-cookies', 'false', { expires: 365 });
  });

  test('handles reject all cookies', () => {
    const { get, set } = require('js-cookie');
    get.mockReturnValue(undefined);

    renderWithProviders(<CookiesBanner />);
    
    const rejectAllButton = screen.getByText('Reject All');
    fireEvent.click(rejectAllButton);

    expect(set).toHaveBeenCalledWith('cookies-accepted', 'none', { expires: 365 });
    expect(set).toHaveBeenCalledWith('analytics-cookies', 'false', { expires: 365 });
    expect(set).toHaveBeenCalledWith('marketing-cookies', 'false', { expires: 365 });
  });

  test('toggles details visibility', () => {
    const { get } = require('js-cookie');
    get.mockReturnValue(undefined);

    renderWithProviders(<CookiesBanner />);
    
    const showDetailsButton = screen.getByText('Show Details');
    fireEvent.click(showDetailsButton);

    expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
    expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
    expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();

    const hideDetailsButton = screen.getByText('Hide Details');
    fireEvent.click(hideDetailsButton);

    expect(screen.queryByText('Necessary Cookies')).not.toBeInTheDocument();
  });
}); 