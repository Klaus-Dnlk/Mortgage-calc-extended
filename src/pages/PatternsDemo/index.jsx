import React, { useState } from 'react';
import Portal from '../../components/Portal';
import DataFetcher from '../../components/DataFetcher';
import withAuth from '../../components/withAuth';
import useFormValidation from '../../hooks/useFormValidation';
import RefDemo from '../../components/RefDemo';
import IframeEmbed from '../../components/IframeDemo';
import './style.css';

/**
 * Demo Component - Showcases React Patterns
 * 
 * This page demonstrates various React patterns for code reusability:
 * - Portals (Modal rendering outside DOM hierarchy)
 * - ErrorBoundary (Error handling)
 * - Render Props (DataFetcher component)
 * - Higher-Order Components (withAuth HOC)
 * - Custom Hooks (useFormValidation)
 * - Memoization (React.memo, useMemo, useCallback)
 */

// Sample data for demonstration
const sampleBanks = [
  {
    id: 1,
    BankName: "Demo Bank A",
    InterestRate: 3.5,
    MaximumLoan: 500000,
    MinimumDownPayment: 50000,
    LoanTerm: 30
  },
  {
    id: 2,
    BankName: "Demo Bank B", 
    InterestRate: 4.2,
    MaximumLoan: 750000,
    MinimumDownPayment: 75000,
    LoanTerm: 25
  }
];

// Mock async function for DataFetcher
const mockFetchBanks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleBanks);
    }, 1000);
  });
};

// Component that will be wrapped with HOC
const ProtectedContent = ({ isAuthenticated, logout }) => (
  <div style={{ padding: '1rem', backgroundColor: '#4caf50', borderRadius: '4px', marginBottom: '1rem' }}>
    <h6 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>
      🔐 Protected Content (HOC Demo)
    </h6>
    <p style={{ color: 'white', margin: '0 0 0.5rem 0' }}>
      This content is only visible when authenticated
    </p>
    <button 
      style={{ 
        padding: '0.5rem 1rem', 
        backgroundColor: 'white', 
        color: '#4caf50', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer' 
      }} 
      onClick={logout}
    >
      Logout
    </button>
  </div>
);

// Apply authentication wrapper
const ProtectedComponent = withAuth(ProtectedContent);

// Define form validation schema
const validationRules = {
  email: {
    required: 'Email is required',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Please enter a valid email address'
  },
  password: {
    required: 'Password is required',
    minLength: 6,
    minLengthMessage: 'Password must be at least 6 characters'
  },
  confirmPassword: {
    required: 'Please confirm your password',
    custom: (value, values) => {
      if (value !== values.password) {
        return 'Passwords do not match';
      }
      return null;
    }
  }
};

const PatternsDemo = () => {
  const [showPortal, setShowPortal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [triggerError, setTriggerError] = useState(false);

  // Initialize form validation hook
  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit
  } = useFormValidation(
    { email: '', password: '', confirmPassword: '' },
    validationRules
  );

  // Simulate error for testing ErrorBoundary
  if (triggerError) {
    throw new Error('This is a demo error triggered by the user!');
  }

  return (
    <div className="patterns-container">
      <div className="patterns-content">
        <div className="patterns-header">
          <h1 className="patterns-title">React Patterns Demo</h1>
          <p className="patterns-subtitle">
            This page demonstrates various React patterns for code reusability and maintainability.
          </p>
        </div>

        <div className="patterns-grid">
          {/* ErrorBoundary Demo */}
          <div className="patterns-card">
            <h2 className="patterns-card-title">🛡️ ErrorBoundary Demo</h2>
            <p className="patterns-card-description">
              ErrorBoundary catches JavaScript errors anywhere in the child component tree.
            </p>
            <div className="patterns-card-content">
              <button 
                className="patterns-button patterns-button-error"
                onClick={() => setTriggerError(true)}
              >
                Trigger Error
              </button>
            </div>
          </div>

          {/* Portal Demo */}
          <div className="patterns-card">
            <h2 className="patterns-card-title">🚪 Portal Demo</h2>
            <p className="patterns-card-description">
              Portals render content outside the normal DOM hierarchy.
            </p>
            <div className="patterns-card-content">
              <button 
                className="patterns-button patterns-button-primary"
                onClick={() => setShowPortal(true)}
              >
                Open Portal Modal
              </button>
            </div>
          </div>

          {/* HOC Demo */}
          <div className="patterns-card">
            <h2 className="patterns-card-title">🔄 Higher-Order Component Demo</h2>
            <p className="patterns-card-description">
              HOCs wrap components with additional functionality.
            </p>
            <div className="patterns-card-content">
              <ProtectedComponent />
            </div>
          </div>

          {/* Custom Hook Demo */}
          <div className="patterns-card">
            <h2 className="patterns-card-title">🎣 Custom Hook Demo</h2>
            <p className="patterns-card-description">
              Custom hooks encapsulate reusable logic.
            </p>
            <div className="patterns-card-content">
              <form className="patterns-form" onSubmit={handleSubmit((formData) => {
                alert('Form submitted: ' + JSON.stringify(formData, null, 2));
              })}>
                <div className={`patterns-form-field ${errors.email ? 'error' : ''}`}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="Enter your email"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className={`patterns-form-field ${errors.password ? 'error' : ''}`}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={values.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                  />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <div className={`patterns-form-field ${errors.confirmPassword ? 'error' : ''}`}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={values.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
                <button 
                  type="submit" 
                  className="patterns-button patterns-button-primary"
                  disabled={!isValid}
                >
                  Submit Form
                </button>
              </form>
            </div>
          </div>

          {/* Render Props Demo */}
          <div className="patterns-card patterns-full-width">
            <h2 className="patterns-card-title">🎭 Render Props Demo</h2>
            <p className="patterns-card-description">
              Render props pattern shares behavior through a prop that receives a function.
            </p>
            <div className="patterns-card-content">
              <DataFetcher fetchFunction={mockFetchBanks}>
                {({ data, loading, error, refetch }) => (
                  <div>
                    {loading && <p>Loading banks...</p>}
                    {error && <div className="patterns-alert error">{error}</div>}
                    {data && (
                      <div>
                        <p style={{ marginBottom: '1rem' }}>
                          Fetched {data.length} banks using render props pattern
                        </p>
                        <button className="patterns-button patterns-button-outline" onClick={refetch}>
                          Refetch Data
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </DataFetcher>
            </div>
          </div>

          {/* Memoization Demo */}
          <div className="patterns-card patterns-full-width">
            <h2 className="patterns-card-title">⚡ Memoization Demo</h2>
            <p className="patterns-card-description">
              Memoization prevents unnecessary re-renders and optimizes expensive calculations.
            </p>
            <div className="patterns-card-content">
              <div className="patterns-bank-grid">
                {sampleBanks.map(bank => (
                  <div 
                    key={bank.id}
                    className={`patterns-bank-card ${selectedBank === bank.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBank(bank.id)}
                  >
                    <div className="patterns-bank-name">{bank.BankName}</div>
                    <div className="patterns-bank-details">
                      Interest Rate: {bank.InterestRate}%<br/>
                      Max Loan: ${bank.MaximumLoan.toLocaleString()}<br/>
                      Min Down Payment: ${bank.MinimumDownPayment.toLocaleString()}<br/>
                      Loan Term: {bank.LoanTerm} years
                    </div>
                  </div>
                ))}
              </div>
              {selectedBank && (
                <div className="patterns-alert info" style={{ marginTop: '1rem' }}>
                  Selected bank ID: {selectedBank}
                </div>
              )}
            </div>
          </div>

          {/* External Website Embed */}
          <div className="patterns-card patterns-full-width">
            <h2 className="patterns-card-title">🌐 External Website Embed</h2>
            <p className="patterns-card-description">
              Embed external websites like Facebook, GitHub, and currency exchange rates safely.
            </p>
            <div className="patterns-card-content">
              <IframeEmbed />
            </div>
          </div>

          {/* Refs Demo */}
          <div className="patterns-card patterns-full-width">
            <RefDemo />
          </div>
        </div>

        {/* Portal Modal */}
        {showPortal && (
          <Portal>
            <div className="patterns-portal-modal" onClick={() => setShowPortal(false)}>
              <div className="patterns-portal-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="patterns-portal-title">Portal Modal</h3>
                <p className="patterns-portal-content">
                  This modal is rendered using React Portal, which renders content outside the normal DOM hierarchy.
                </p>
                <button 
                  className="patterns-button patterns-button-primary"
                  onClick={() => setShowPortal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
};

export default PatternsDemo; 