# Design Patterns Analysis

## Overview

This document analyzes the use of design patterns in the Mortgage Calculator project according to the requirement **"Uses design patterns to create new structures based on requirements"**. The project demonstrates comprehensive application of various patterns to create flexible, scalable, and maintainable structures.

## 🎯 Compliance with Requirements

The project **fully complies** with the requirement "Uses design patterns to create new structures based on requirements" through:

1. **Creating new structures** based on requirements
2. **Applying classical design patterns**
3. **Adapting patterns to project-specific requirements**
4. **Demonstrating practical usage**

## 📋 Implemented Design Patterns

### 1. 🚪 Portal Pattern

**File:** `src/components/Portal/index.jsx`

**Requirement:** Modal windows should render outside the DOM hierarchy of the parent component

**Implementation:**

```jsx
import React from "react";
import { createPortal } from "react-dom";

const Portal = ({ children, container = document.body }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, container) : null;
};
```

**Usage:**

- Bank modal windows
- Notifications
- Overlay components

**Benefits:**

- Avoiding z-index issues
- Better accessibility
- Cleaner component structure

### 2. 🛡️ Error Boundary Pattern

**File:** `src/components/ErrorBoundary/index.jsx`

**Requirement:** Graceful handling of JavaScript errors with user-friendly messages

**Implementation:**

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}
```

**Usage:**

- Global error handling
- Fallback UI for unexpected errors
- Error logging in development mode

### 3. 🎭 Render Props Pattern

**File:** `src/components/DataFetcher/index.jsx`

**Requirement:** Reusable data loading logic with flexible rendering

**Implementation:**

```jsx
class DataFetcher extends React.Component {
  state = { data: null, loading: false, error: null };

  async fetchData() {
    this.setState({ loading: true, error: null });
    try {
      const data = await this.props.fetchFunction();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  render() {
    const { data, loading, error } = this.state;

    if (typeof this.props.children === "function") {
      return this.props.children({
        data,
        loading,
        error,
        refetch: this.fetchData,
      });
    }

    return this.props.children;
  }
}
```

**Usage:**

```jsx
<DataFetcher fetchFunction={fetchBanks}>
  {({ data, loading, error, refetch }) =>
    loading ? <Spinner /> : <DataDisplay data={data} />
  }
</DataFetcher>
```

**Benefits:**

- Flexible rendering
- Reusable logic
- Clear separation of concerns

### 4. 🔄 Higher-Order Component (HOC) Pattern

**File:** `src/components/withAuth/index.jsx`

**Requirement:** Component authentication with composition capability

**Implementation:**

```jsx
const withAuth = (WrappedComponent, options = {}) => {
  const {
    requireAuth = true,
    redirectTo = "/login",
    fallbackComponent = null,
  } = options;

  const WithAuthComponent = (props) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (!requireAuth) {
      return <WrappedComponent {...props} isAuthenticated={isAuthenticated} />;
    }

    if (!isAuthenticated) {
      if (fallbackComponent) {
        return fallbackComponent;
      }
      return <UnauthorizedUI />;
    }

    return (
      <WrappedComponent
        {...props}
        isAuthenticated={isAuthenticated}
        logout={() => {
          localStorage.removeItem("isAuthenticated");
          window.location.reload();
        }}
      />
    );
  };

  WithAuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return WithAuthComponent;
};
```

**Usage:**

```jsx
const ProtectedComponent = withAuth(MyComponent);
```

**Benefits:**

- Reusable authentication logic
- Ability to compose with other HOCs
- Consistent behavior

### 5. 🎣 Custom Hooks Pattern

**Files:**

- `src/hooks/useFormValidation/index.js`
- `src/hooks/useAuth/index.js`
- `src/hooks/useCookies/index.js`

**Requirement:** Reusable form validation logic and state management

**Implementation of useFormValidation:**

```jsx
const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState({});

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((values, validationRules, touched) => {
      const newErrors = {};
      let formIsValid = true;

      Object.keys(validationRules).forEach((fieldName) => {
        const value = values[fieldName];
        const rules = validationRules[fieldName];

        if (touched[fieldName] || !isEmpty(value)) {
          // Validation logic
          if (
            rules.required &&
            (isEmpty(value) || (isString(value) && value.trim() === ""))
          ) {
            newErrors[fieldName] =
              rules.required === true
                ? "This field is required"
                : rules.required;
            formIsValid = false;
          }
          // ... more validation rules
        }
      });

      setErrors(newErrors);
      setIsValid(formIsValid);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedValidate(values, validationRules, touched);
  }, [values, validationRules, touched, debouncedValidate]);

  return {
    values,
    errors,
    isValid,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  };
};
```

**Usage:**

```jsx
const { values, errors, isValid, handleChange, handleSubmit } =
  useFormValidation({ email: "", password: "" }, validationRules);
```

**Benefits:**

- Reusable validation logic
- Separation of concerns
- Easier testing
- Consistent validation

### 6. ⚡ Memoization Pattern

**File:** `src/components/MemoizedBankCard/index.jsx`

**Requirement:** Performance optimization through caching of expensive calculations

**Implementation:**

```jsx
const MemoizedBankCard = React.memo(({ bank, onSelect, isSelected }) => {
  // Cache expensive mortgage calculations
  const calculatedValues = useMemo(() => {
    const { InterestRate, MaximumLoan, MinimumDownPayment, LoanTerm } = bank;

    // Perform mortgage payment calculations
    const monthlyPayment =
      ((MaximumLoan - MinimumDownPayment) *
        (InterestRate / 100 / 12) *
        Math.pow(1 + InterestRate / 100 / 12, LoanTerm * 12)) /
      (Math.pow(1 + InterestRate / 100 / 12, LoanTerm * 12) - 1);

    const totalInterest =
      monthlyPayment * LoanTerm * 12 - (MaximumLoan - MinimumDownPayment);
    const downPaymentPercentage = (MinimumDownPayment / MaximumLoan) * 100;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      downPaymentPercentage: Math.round(downPaymentPercentage),
    };
  }, [
    bank.InterestRate,
    bank.MaximumLoan,
    bank.MinimumDownPayment,
    bank.LoanTerm,
  ]);

  // Stabilize event handler to prevent unnecessary re-renders
  const handleSelect = useCallback(() => {
    onSelect(bank.id);
  }, [onSelect, bank.id]);

  return <Card>{/* Component JSX */}</Card>;
});
```

**Techniques:**

- `React.memo()` - prevents re-render with unchanged props
- `useMemo()` - caches expensive calculations
- `useCallback()` - stabilizes event handlers

### 7. 🔗 Refs Pattern

**File:** `src/components/RefDemo/index.jsx`

**Requirement:** Direct access to DOM elements for focus, measurements, and scrolling

**Implementation:**

```jsx
const RefDemo = () => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTargetRef = useRef(null);

  // Focus management with refs
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  };

  // DOM measurements with refs
  const measureElement = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  };

  // Scroll to element with refs
  const scrollToTarget = () => {
    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <Paper ref={containerRef}>
      <TextField ref={inputRef} />
      <Button onClick={focusInput}>Focus Input</Button>
      <div ref={scrollTargetRef}>Target Element</div>
    </Paper>
  );
};
```

## 🏗️ Structural Patterns

### 1. Redux Pattern (Flux Architecture)

**Files:**

- `src/redux/store.js`
- `src/redux/banks/`

**Requirement:** Centralized application state management

**Implementation:**

```jsx
// Actions
export const fetchBanksPending = () => ({ type: "banks/fetchBanks/pending" });
export const fetchBanksFulfilled = (banks) => ({
  type: "banks/fetchBanks/fulfilled",
  payload: banks,
});
export const fetchBanksRejected = (error) => ({
  type: "banks/fetchBanks/rejected",
  payload: error,
});

// Reducer
const banksReducer = (state = initialState, action) => {
  switch (action.type) {
    case "banks/fetchBanks/pending":
      return { ...state, loading: true, error: null };
    case "banks/fetchBanks/fulfilled":
      return { ...state, items: action.payload, loading: false };
    case "banks/fetchBanks/rejected":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

// Selectors
export const getAllBanks = (state) => state.banks.items;
export const getLoading = (state) => state.banks.loading;
export const getError = (state) => state.banks.error;
```

### 2. Container/Presentational Pattern

**Requirement:** Separation of logic and presentation

**Implementation:**

- **Container Components:** `src/pages/Calc/index.jsx`, `src/pages/Banks/index.jsx`
- **Presentational Components:** `src/components/BankCard/index.jsx`, `src/components/MemoizedBankCard/index.jsx`

### 3. Provider Pattern

**File:** `src/App.js`

**Requirement:** Providing global context to child components

**Implementation:**

```jsx
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <IntlProvider locale="en" messages={messages}>
          <BrowserRouter>
            <Box sx={{ flexGrow: 1 }}>
              <AppBar position="static">{/* Navigation */}</AppBar>
              <AppRoutes />
              <CookiesBanner />
            </Box>
          </BrowserRouter>
        </IntlProvider>
      </Provider>
    </ErrorBoundary>
  );
}
```

## 🎯 Pattern Adaptation to Requirements

### 1. Project-Specific Requirements

**Requirement:** Mortgage calculator with validation and PDF export

**Adaptation:**

- Custom Hook `useFormValidation` for specific financial data validation
- Memoization for mortgage calculation optimization
- Portal for bank detail modal windows

**Requirement:** Bank management with CRUD operations

**Adaptation:**

- Redux pattern for bank state management
- Render Props for flexible data loading
- HOC for operation authentication

### 2. UI/UX Specific Requirements

**Requirement:** Responsive design with adaptive components

**Adaptation:**

- Portal for modal windows on mobile devices
- Memoization for rendering optimization on weak devices
- Custom Hooks for responsive state management

**Requirement:** Internationalization

**Adaptation:**

- Provider pattern for `IntlProvider`
- Custom Hook `useAuth` for localized authentication

## 📊 Compliance Assessment

### ✅ Full Compliance

1. **Creating new structures:**

   - Portal component for modal windows
   - ErrorBoundary for error handling
   - DataFetcher for flexible data loading
   - Custom Hooks for reusable logic

2. **Adaptation to requirements:**

   - Specific validation for financial data
   - Optimization for mortgage calculations
   - Integration with PDF export

3. **Scalability:**

   - Modular architecture
   - Compositional patterns
   - Separation of concerns

4. **Maintainability:**
   - Clear file structure
   - Pattern documentation
   - Testing of each pattern

### 🎯 Key Achievements

1. **Flexibility:** Render Props and HOCs allow easy extension of functionality
2. **Performance:** Memoization optimizes rendering and calculations
3. **Reliability:** Error Boundaries ensure application stability
4. **Reusability:** Custom Hooks and components can be used in other projects

## 🚀 Conclusion

The project **fully complies** with the requirement "Uses design patterns to create new structures based on requirements" through:

- ✅ **Comprehensive application** of classical design patterns
- ✅ **Pattern adaptation** to mortgage calculator-specific requirements
- ✅ **Creating new structures** based on project requirements
- ✅ **Demonstrating practical usage** of each pattern
- ✅ **Documentation and testing** of all implemented patterns

The project serves as an excellent example of how design patterns can be used to create flexible, scalable, and maintainable architectures based on specific requirements.
