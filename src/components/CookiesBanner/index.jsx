import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Link,
  Alert
} from '@mui/material';
import { useIntl } from 'react-intl';
import { useCookies } from '../../hooks/useCookies';

const CookiesBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const intl = useIntl();
  const { cookiesAccepted, acceptAll, acceptNecessary, rejectAll } = useCookies();

  // Verify user's cookie preferences
  useEffect(() => {
    if (!cookiesAccepted) {
      setShowBanner(true);
    }
  }, [cookiesAccepted]);

  // Process accept all cookies action
  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  // Process accept necessary cookies only
  const handleAcceptNecessary = () => {
    acceptNecessary();
    setShowBanner(false);
  };

  // Process reject all cookies action
  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        p: 3,
        backgroundColor: 'background.paper',
        borderTop: 2,
        borderColor: 'primary.main'
      }}
    >
      <Box maxWidth="lg" mx="auto">
        <Typography variant="h6" gutterBottom>
          {intl.formatMessage({ id: 'cookies.title' })}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {intl.formatMessage({ id: 'cookies.description' })}
        </Typography>

        {showDetails && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{intl.formatMessage({ id: 'cookies.necessary.title' })}</strong>
              <br />
              {intl.formatMessage({ id: 'cookies.necessary.description' })}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{intl.formatMessage({ id: 'cookies.analytics.title' })}</strong>
              <br />
              {intl.formatMessage({ id: 'cookies.analytics.description' })}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{intl.formatMessage({ id: 'cookies.marketing.title' })}</strong>
              <br />
              {intl.formatMessage({ id: 'cookies.marketing.description' })}
            </Typography>
          </Alert>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            flex={1}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleAcceptAll}
              size="small"
            >
              {intl.formatMessage({ id: 'cookies.acceptAll' })}
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAcceptNecessary}
              size="small"
            >
              {intl.formatMessage({ id: 'cookies.acceptNecessary' })}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleRejectAll}
              size="small"
            >
              {intl.formatMessage({ id: 'cookies.rejectAll' })}
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Button
              variant="text"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails 
                ? intl.formatMessage({ id: 'cookies.hideDetails' })
                : intl.formatMessage({ id: 'cookies.showDetails' })
              }
            </Button>
            
            <Link
              href="/privacy-policy"
              variant="body2"
              color="primary"
              underline="hover"
            >
              {intl.formatMessage({ id: 'cookies.privacyPolicy' })}
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CookiesBanner; 