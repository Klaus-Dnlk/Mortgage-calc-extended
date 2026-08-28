/**
 * HOC: wraps a component with Firebase auth gate.
 * Uses AuthContext (real accounts) instead of localStorage fake login.
 */
import React from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const withAuth = (WrappedComponent, options = {}) => {
  const { requireAuth = true, fallbackComponent = null } = options

  const WithAuthComponent = (props) => {
    const { user, loading, isAuthenticated, logout } = useAuth()

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Checking authentication" />
        </Box>
      )
    }

    if (!requireAuth) {
      return (
        <WrappedComponent
          {...props}
          user={user}
          isAuthenticated={isAuthenticated}
          logout={logout}
        />
      )
    }

    if (!isAuthenticated) {
      if (fallbackComponent) {
        return fallbackComponent
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            You need to be authenticated to access this page.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/login">
            Go to Login
          </Button>
        </Box>
      )
    }

    return (
      <WrappedComponent
        {...props}
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />
    )
  }

  WithAuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return WithAuthComponent
}

export default withAuth
