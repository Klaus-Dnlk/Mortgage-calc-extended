import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip
} from '@mui/material';
import { useIntl } from 'react-intl';
import { useLocale } from '../../locales';

const LanguageSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentLocale, localeName, localeFlag, setLocale, locales } = useLocale();
  const intl = useIntl();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (localeCode) => {
    setLocale(localeCode);
    handleClose();
  };

  return (
    <Box>
      <Tooltip title={intl.formatMessage({ id: 'common.language' })}>
        <Button
          onClick={handleClick}
          variant="outlined"
          size="small"
          sx={{
            minWidth: 'auto',
            px: 2,
            py: 1,
            borderRadius: 2,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.light',
              color: 'primary.dark'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span">
              {localeFlag}
            </Typography>
            <Typography variant="body2" component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {localeName}
            </Typography>
          </Box>
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: 3,
            borderRadius: 2,
          }
        }}
      >
        {locales.map((locale) => (
          <MenuItem
            key={locale.code}
            onClick={() => handleLanguageChange(locale.code)}
            selected={locale.code === currentLocale}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Typography variant="h6">
                {locale.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={locale.name}
              primaryTypographyProps={{
                variant: 'body1',
                fontWeight: locale.code === currentLocale ? 'bold' : 'normal'
              }}
            />
            {locale.code === currentLocale && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                ✓
              </Typography>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher; 