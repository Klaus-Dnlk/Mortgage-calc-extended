import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import { Link, NavLink } from 'react-router-dom'
import { useIntl } from 'react-intl'
import AppRoutes from './routes'
import ErrorBoundary from './components/ErrorBoundary'
import LanguageSwitcher from './components/LanguageSwitcher'
import CookiesBanner from './components/CookiesBanner'
import useAuth from './hooks/useAuth'
import './App.css'

function App() {
  const intl = useIntl()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, loading, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navItems = [
    { to: '/', labelId: 'navigation.home', end: true },
    { to: '/banks', labelId: 'navigation.banks' },
    { to: '/calc', labelId: 'navigation.calculator' },
    { to: '/patterns', labelId: 'navigation.patterns' },
  ]

  const authItems = user
    ? [
        { to: '/profile', label: user.displayName || user.email || intl.formatMessage({ id: 'navigation.profile' }) },
      ]
    : [
        { to: '/login', labelId: 'navigation.login' },
        { to: '/register', labelId: 'navigation.register' },
      ]

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <ErrorBoundary>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'space-between', gap: 1 }}>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  edge="start"
                  aria-label="open navigation"
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : null}
                  <LanguageSwitcher />
                </Box>
                <Drawer anchor="left" open={drawerOpen} onClose={closeDrawer}>
                  <Box sx={{ width: 260 }} role="presentation">
                    <List>
                      {navItems.map((item) => (
                        <ListItemButton
                          key={item.to}
                          component={NavLink}
                          to={item.to}
                          end={item.end}
                          onClick={closeDrawer}
                        >
                          <ListItemText primary={intl.formatMessage({ id: item.labelId })} />
                        </ListItemButton>
                      ))}
                    </List>
                    <Divider />
                    <List>
                      {loading ? null : user ? (
                        <>
                          <ListItemButton component={NavLink} to="/profile" onClick={closeDrawer}>
                            <ListItemText
                              primary={
                                user.displayName ||
                                user.email ||
                                intl.formatMessage({ id: 'navigation.profile' })
                              }
                            />
                          </ListItemButton>
                          <ListItemButton
                            onClick={() => {
                              closeDrawer()
                              logout()
                            }}
                          >
                            <ListItemText primary={intl.formatMessage({ id: 'navigation.logout' })} />
                          </ListItemButton>
                        </>
                      ) : (
                        authItems.map((item) => (
                          <ListItemButton
                            key={item.to}
                            component={NavLink}
                            to={item.to}
                            onClick={closeDrawer}
                          >
                            <ListItemText primary={intl.formatMessage({ id: item.labelId })} />
                          </ListItemButton>
                        ))
                      )}
                    </List>
                  </Box>
                </Drawer>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.to}
                      color="inherit"
                      sx={{ mr: 1 }}
                      component={item.to === '/' ? Link : NavLink}
                      to={item.to}
                    >
                      {intl.formatMessage({ id: item.labelId })}
                    </Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : user ? (
                    <>
                      <Button color="inherit" component={NavLink} to="/profile">
                        {user.displayName || user.email || intl.formatMessage({ id: 'navigation.profile' })}
                      </Button>
                      <Button color="inherit" onClick={() => logout()}>
                        {intl.formatMessage({ id: 'navigation.logout' })}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button color="inherit" component={NavLink} to="/login">
                        {intl.formatMessage({ id: 'navigation.login' })}
                      </Button>
                      <Button color="inherit" component={NavLink} to="/register">
                        {intl.formatMessage({ id: 'navigation.register' })}
                      </Button>
                    </>
                  )}
                  <LanguageSwitcher />
                </Box>
              </>
            )}
          </Toolbar>
        </AppBar>

        <AppRoutes />
        <CookiesBanner />
      </Box>
    </ErrorBoundary>
  )
}

export default App
