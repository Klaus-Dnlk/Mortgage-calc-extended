import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const withAuth = (WrappedComponent, options = {}) => {
  const {
    requireAuth = true,
    redirectTo = '/login',
    fallbackComponent = null
  } = options;

  // Create the authentication wrapper component
  const WithAuthComponent = (props) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!requireAuth) {
      return <WrappedComponent {...props} isAuthenticated={isAuthenticated} />;
    }

    if (!isAuthenticated) {
      if (fallbackComponent) {
        return fallbackComponent;
      }

      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          p: 3
        }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            You need to be authenticated to access this page.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              localStorage.setItem('isAuthenticated', 'true');
              window.location.reload();
            }}
          >
            Login
          </Button>
        </Box>
      );
    }

    return (
      <WrappedComponent 
        {...props} 
        isAuthenticated={isAuthenticated}
        logout={() => {
          localStorage.removeItem('isAuthenticated');
          window.location.reload();
        }}
      />
    );
  };

  // Set component display name for debugging
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
};

export default withAuth; 