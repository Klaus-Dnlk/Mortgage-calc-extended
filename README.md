# Simple Mortgage Calculator

A React-based mortgage calculator application that allows users to manage banks and calculate mortgage payments.

## Features

- **Bank Management**: Add, view, and delete banks with their loan terms
- **Bank Details Modal**: Detailed view of bank information using React Portal
- **Mortgage Calculator**: Calculate monthly mortgage payments based on loan parameters
- **Real-time Validation**: Form validation with user-friendly error messages
- **Responsive Design**: Modern UI built with Material-UI
- **Error Handling**: Comprehensive error boundaries and error states
- **Redux State Management**: Centralized state management with Redux Toolkit

## Tech Stack

- **Frontend**: React 18, Material-UI (MUI)
- **State Management**: Redux Toolkit, React Redux
- **Form Validation**: Yup, React Hook Form
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library
- **Build Tool**: Create React App
- **Deployment**: GitHub Pages

## Project Structure

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/Simple-mortgage-calc.git
cd Simple-mortgage-calc
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint

## API Integration

The application uses a mock API endpoint for demonstration purposes:

- Base URL: `https://625314acc534af46cb93846b.mockapi.io/api/`
- Endpoints:
  - `GET /banks` - Fetch all banks
  - `POST /banks` - Add new bank
  - `DELETE /banks/:id` - Delete bank

## State Management

The application uses Redux Toolkit for state management with the following structure:

```javascript
{
  banks: {
    items: [],        // Array of bank objects
    loading: false,   // Loading state
    error: null,      // Error state
    filter: ''        // Search filter
  }
}
```

### Redux Actions

- `fetchBanks` - Fetch banks from API
- `addNewBank` - Add new bank
- `deleteBank` - Delete bank
- `changeFilter` - Update search filter

## Components

### BankCard Component

Form component for adding new banks with validation:

- Bank name validation (must start with capital letter)
- Numeric field validation
- Duplicate bank name checking
- Real-time error display

### Calc Component

Mortgage calculator with the following features:

- Bank selection dropdown
- Loan parameter inputs
- Real-time calculation
- Validation and warnings
- Form reset functionality

### Banks Component

Bank management interface:

- Table display of banks
- Add new bank functionality
- Delete bank with confirmation
- Loading and error states

### ErrorBoundary Component

Global error handling:

- Catches JavaScript errors
- Displays user-friendly error messages
- Provides recovery options
- Development mode error details

## Testing

The application includes comprehensive tests for all components:

### Running Tests

```bash
npm test
```

### Test Coverage

- Component rendering
- User interactions
- Form validation
- Redux state management
- Error handling
- API integration

### Test Structure

- Unit tests for individual components
- Integration tests for Redux actions
- User interaction tests
- Error boundary tests

## Validation Rules

### Bank Form Validation

- **Bank Name**: Required, must start with capital letter
- **Maximum Loan**: Required, positive number
- **Minimum Down Payment**: Required, positive number
- **Loan Term**: Required, positive number
- **Interest Rate**: Required, positive number, max 100%

### Calculator Validation

- **All Fields**: Required
- **Interest Rate**: Between 0-100%
- **Loan Amount**: Greater than 0
- **Down Payment**: Non-negative
- **Loan Term**: Greater than 0

## Error Handling

The application implements comprehensive error handling:

1. **Form Validation Errors**: Real-time validation with user-friendly messages
2. **API Errors**: Network and server error handling
3. **JavaScript Errors**: Error boundaries for unexpected errors
4. **Loading States**: User feedback during async operations

## Deployment

The application is configured for deployment on GitHub Pages:

1. Build the application:

```bash
npm run build
```

2. Deploy to GitHub Pages:

```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## React Patterns Used

### Portal Pattern

The application demonstrates the use of React Portal for modal rendering:

- **BankDetailsModal**: Renders outside the normal DOM hierarchy
- **Benefits**:
  - Avoids CSS z-index issues
  - Better accessibility
  - Cleaner component structure
  - Proper event bubbling

### Custom Hooks

- **useFormValidation**: Reusable form validation logic
- **useAuth**: Authentication state management

### Error Boundaries

- Global error handling for unexpected JavaScript errors
- Graceful degradation with user-friendly error messages

## Security Features

### XSS Protection

- **Input Sanitization**: All user inputs are sanitized before processing
- **HTML Sanitization**: DOMPurify integration for safe HTML rendering
- **SafeHTML Component**: Secure component for rendering HTML content

### CSRF Protection

- **CSRF Token Generation**: Cryptographically secure token generation
- **Token Validation**: Server-side token validation for sensitive operations

### Input Validation

- **Type-specific Validation**: Different validation rules for different input types
- **Range Validation**: Numeric inputs are validated within safe ranges
- **Format Validation**: Email, URL, and other formats are validated

### API Security

- **Security Headers**: Automatic addition of security headers to requests
- **Response Validation**: API responses are validated and sanitized
- **Rate Limiting**: Client-side rate limiting to prevent abuse

### Secure Storage

- **Encrypted Storage**: Sensitive data is encrypted before storage
- **Session Storage**: Sensitive data stored in session storage (cleared on tab close)
- **Secure Retrieval**: Safe data retrieval with error handling

### Content Security Policy

- **CSP Headers**: Configurable Content Security Policy
- **Resource Restrictions**: Limits external resource loading
- **Frame Protection**: Prevents clickjacking attacks

### Environment Variables

- **Secure Configuration**: API keys and secrets stored in environment variables
- **Example Configuration**: `env.example` file shows required configuration
- **No Hardcoded Secrets**: No sensitive data in source code

## Future Enhancements

- [ ] User authentication
- [ ] Save calculation history
- [ ] Export calculations to PDF
- [ ] Advanced loan comparison features
- [ ] Mobile app version
- [ ] Real-time interest rate updates
