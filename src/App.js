import { AppBar, Toolbar, Button, Box } from '@mui/material'
import { Link, NavLink } from 'react-router-dom'
import { useIntl } from 'react-intl'
import AppRoutes from './routes'
import ErrorBoundary from './components/ErrorBoundary'
import LanguageSwitcher from './components/LanguageSwitcher'
import CookiesBanner from './components/CookiesBanner'
import './App.css'

function App() {
  const intl = useIntl();

  return (
    <ErrorBoundary>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static'>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button color='inherit' sx={{ mr: 2 }} component={Link} to='/'>
                {intl.formatMessage({ id: 'navigation.home' })}
              </Button>
              <Button color='inherit' component={NavLink} to='/banks'>
                {intl.formatMessage({ id: 'navigation.banks' })}
              </Button>
              <Button color='inherit' component={NavLink} to='/calc'>
                {intl.formatMessage({ id: 'navigation.calculator' })}
              </Button>
              <Button color='inherit' component={NavLink} to='/patterns'>
                {intl.formatMessage({ id: 'navigation.patterns' })}
              </Button>
            </Box>
            <LanguageSwitcher />
          </Toolbar>
        </AppBar>

        <AppRoutes />
        <CookiesBanner />
      </Box>
    </ErrorBoundary>
  )
}

export default App
