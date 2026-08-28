import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import useAuth from '../../hooks/useAuth'

function Login() {
  const { user, loading, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  if (!loading && user) {
    return <Navigate to="/profile" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/profile')
    } catch (err) {
      setFormError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setFormError('')
    setSubmitting(true)
    try {
      await loginWithGoogle()
      navigate('/profile')
    } catch (err) {
      setFormError(err.message || 'Google sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6, px: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }} elevation={2}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to save mortgage calculations to your account.
        </Typography>

        {formError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
            sx={{ mt: 2 }}
          >
            Sign in
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>or</Divider>

        <Button
          variant="outlined"
          fullWidth
          disabled={submitting}
          onClick={handleGoogle}
        >
          Continue with Google
        </Button>

        <Typography variant="body2" sx={{ mt: 3 }}>
          No account?{' '}
          <Link component={RouterLink} to="/register">
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}

export default Login
