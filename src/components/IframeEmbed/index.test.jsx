import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IframeEmbed from './index';

// Mock Material-UI components if needed
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Select: ({ children, value, onChange, label }) => (
    <select value={value} onChange={onChange} aria-label={label}>
      {children}
    </select>
  ),
  MenuItem: ({ children, value }) => (
    <option value={value}>{children}</option>
  ),
}));

describe('IframeEmbed Component', () => {
  beforeEach(() => {
    render(<IframeEmbed />);
  });

  test('renders component title', () => {
    expect(screen.getByText('External Website Embed')).toBeInTheDocument();
  });

  test('renders component description', () => {
    expect(screen.getByText(/Embed external websites like Facebook/)).toBeInTheDocument();
  });

  test('renders website type selector', () => {
    expect(screen.getByLabelText('Website Type')).toBeInTheDocument();
  });

  test('renders height input field', () => {
    expect(screen.getByLabelText('Iframe Height (px)')).toBeInTheDocument();
  });

  test('renders load iframe button', () => {
    expect(screen.getByText('Load Iframe')).toBeInTheDocument();
  });

  test('load iframe button is disabled initially', () => {
    const loadButton = screen.getByText('Load Iframe');
    expect(loadButton).toBeDisabled();
  });

  test('shows external website selector when external type is selected', () => {
    const typeSelector = screen.getByLabelText('Website Type');
    fireEvent.change(typeSelector, { target: { value: 'external' } });
    
    expect(screen.getByLabelText('Select Website')).toBeInTheDocument();
  });

  test('shows custom URL input when custom type is selected', () => {
    const typeSelector = screen.getByLabelText('Website Type');
    fireEvent.change(typeSelector, { target: { value: 'custom' } });
    
    expect(screen.getByLabelText('Enter URL')).toBeInTheDocument();
  });



  test('enables load button when URL is selected', () => {
    const typeSelector = screen.getByLabelText('Website Type');
    fireEvent.change(typeSelector, { target: { value: 'external' } });
    
    const urlSelector = screen.getByLabelText('Select Website');
    fireEvent.change(urlSelector, { target: { value: 'https://www.facebook.com' } });
    
    const loadButton = screen.getByText('Load Iframe');
    expect(loadButton).not.toBeDisabled();
  });

  test('shows error for invalid URL', () => {
    const typeSelector = screen.getByLabelText('Iframe Type');
    fireEvent.change(typeSelector, { target: { value: 'custom' } });
    
    const urlInput = screen.getByLabelText('Enter URL');
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    
    expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
  });

  test('loads iframe when valid URL is provided', async () => {
    const typeSelector = screen.getByLabelText('Website Type');
    fireEvent.change(typeSelector, { target: { value: 'external' } });
    
    const urlSelector = screen.getByLabelText('Select Website');
    fireEvent.change(urlSelector, { target: { value: 'https://www.facebook.com' } });
    
    const loadButton = screen.getByText('Load Iframe');
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText('Iframe Active')).toBeInTheDocument();
    });
  });

  test('displays security information', () => {
    expect(screen.getByText('Security Considerations')).toBeInTheDocument();
    expect(screen.getByText('Sandbox enabled')).toBeInTheDocument();
    expect(screen.getByText('Lazy loading')).toBeInTheDocument();
    expect(screen.getByText('URL validation')).toBeInTheDocument();
    expect(screen.getByText('CSP compliant')).toBeInTheDocument();
  });

  test('changes iframe height when height input is modified', () => {
    const heightInput = screen.getByLabelText('Iframe Height (px)');
    fireEvent.change(heightInput, { target: { value: '600' } });
    
    expect(heightInput.value).toBe('600');
  });
}); 