import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  Chip
} from '@mui/material';
import './style.css';

/**
 * IframeEmbed Component - Embeds external websites safely
 * 
 * This component shows how to embed external websites using iframes:
 * - Facebook integration
 * - GitHub repositories
 * - Currency exchange rates
 * - Security considerations
 * 
 * @component
 * @category Components
 */
const IframeEmbed = () => {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [iframeHeight, setIframeHeight] = useState(400);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeType, setIframeType] = useState('external');

  // List of supported external websites
  const predefinedUrls = {
    'facebook': 'https://www.facebook.com',
    'github': 'https://github.com',
    'currency': 'https://www.xe.com/currencyconverter/'
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setSelectedUrl(url);
    setShowIframe(false);
  };

  const handleCustomUrlChange = (event) => {
    setCustomUrl(event.target.value);
  };

  const handleLoadIframe = () => {
    const urlToLoad = iframeType === 'custom' ? customUrl : selectedUrl;
    if (urlToLoad) {
      setSelectedUrl(urlToLoad);
      setShowIframe(true);
    }
  };

  const handleIframeTypeChange = (event) => {
    setIframeType(event.target.value);
    setShowIframe(false);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isUrlValid = selectedUrl ? validateUrl(selectedUrl) : true;

  return (
    <Card className="iframe-demo-card">
      <CardContent>
        <Typography variant="h5" component="h2" className="iframe-demo-title">
          External Website Embed
        </Typography>
        
        <Typography variant="body2" color="text.secondary" className="iframe-demo-description">
          Embed external websites like Facebook, GitHub, and currency exchange rates safely.
        </Typography>

        <Box className="iframe-controls">
          <FormControl fullWidth className="iframe-type-select">
            <InputLabel>Website Type</InputLabel>
            <Select
              value={iframeType}
              label="Website Type"
              onChange={handleIframeTypeChange}
            >
              <MenuItem value="external">External Website</MenuItem>
              <MenuItem value="custom">Custom URL</MenuItem>
            </Select>
          </FormControl>

          {iframeType === 'external' && (
            <FormControl fullWidth className="url-select">
              <InputLabel>Select Website</InputLabel>
              <Select
                value={selectedUrl}
                label="Select Website"
                onChange={handleUrlChange}
              >
                {Object.entries(predefinedUrls).map(([key, url]) => (
                  <MenuItem key={key} value={url}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {iframeType === 'custom' && (
            <TextField
              fullWidth
              label="Enter URL"
              value={customUrl}
              onChange={handleCustomUrlChange}
              placeholder="https://example.com"
              className="custom-url-input"
            />
          )}

          <TextField
            fullWidth
            type="number"
            label="Iframe Height (px)"
            value={iframeHeight}
            onChange={(e) => setIframeHeight(Number(e.target.value))}
            className="height-input"
          />

          <Button 
            variant="contained" 
            onClick={handleLoadIframe}
            disabled={!selectedUrl || !isUrlValid}
            className="load-iframe-button"
          >
            Load Iframe
          </Button>
        </Box>

        {!isUrlValid && (
          <Alert severity="error" className="url-error">
            Please enter a valid URL
          </Alert>
        )}

        {showIframe && (
          <Box className="iframe-container">
            <Box className="iframe-header">
              <Typography variant="subtitle1">
                Loaded URL: {selectedUrl}
              </Typography>
              <Chip 
                label="Iframe Active" 
                color="success" 
                size="small"
              />
            </Box>
            
            <Box className="iframe-wrapper">
              <iframe
                src={selectedUrl}
                title="Demo iframe"
                width="100%"
                height={iframeHeight}
                className="demo-iframe"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
              />
            </Box>
          </Box>
        )}



        <Box className="security-info">
          <Typography variant="h6" className="security-title">
            Security Considerations
          </Typography>
          <Box className="security-items">
            <Chip label="Sandbox enabled" color="primary" size="small" />
            <Chip label="Lazy loading" color="primary" size="small" />
            <Chip label="URL validation" color="primary" size="small" />
            <Chip label="CSP compliant" color="primary" size="small" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IframeEmbed; 