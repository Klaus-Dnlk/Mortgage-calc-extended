import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, TextField } from '@mui/material';

/**
 * RefDemo Component - Demonstrates Refs for Component-to-HTML Communication
 * 
 * Refs provide a way to access DOM nodes or React elements created in the render method
 * This component shows various use cases for refs:
 * - Focus management
 * - DOM measurements
 * - Direct DOM manipulation
 * - Integration with third-party DOM libraries
 * 
 * Usage:
 * - Focus input fields programmatically
 * - Measure element dimensions
 * - Scroll to specific elements
 * - Integrate with non-React libraries
 */
const RefDemo = () => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTargetRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle input focus using refs
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Select all text in the input
      inputRef.current.select();
    }
  };

  // Measure DOM element dimensions
  const measureElement = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    }
  };

  // Scroll to specific element
  const scrollToTarget = () => {
    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Track scroll position changes
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  };

  // Measure element on mount and window resize
  useEffect(() => {
    measureElement();
    
    const handleResize = () => {
      measureElement();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Paper sx={{ p: 3, maxHeight: 600, overflow: 'auto' }} ref={containerRef} onScroll={handleScroll}>
      <Typography variant="h6" gutterBottom>
        🔗 Refs Demo - Component-to-HTML Communication
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Refs allow direct access to DOM elements for focus, measurements, and manipulation.
        </Typography>
        
        {/* Focus Management */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Focus Management:
          </Typography>
          <TextField
            ref={inputRef}
            label="Click button to focus this input"
            fullWidth
            sx={{ mb: 1 }}
          />
          <Button variant="contained" onClick={focusInput}>
            Focus Input
          </Button>
        </Box>

        {/* DOM Measurements */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            DOM Measurements:
          </Typography>
          <Button variant="outlined" onClick={measureElement} sx={{ mb: 1 }}>
            Measure Container
          </Button>
          <Typography variant="body2">
            Container dimensions: {dimensions.width}px × {dimensions.height}px
          </Typography>
          <Typography variant="body2">
            Scroll position: {scrollPosition}px
          </Typography>
        </Box>

        {/* Scroll to Element */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Scroll to Element:
          </Typography>
          <Button variant="outlined" onClick={scrollToTarget}>
            Scroll to Target
          </Button>
        </Box>
      </Box>

      {/* Scrollable content to demonstrate scroll functionality */}
      <Box sx={{ height: 200, bgcolor: 'grey.100', p: 2, mb: 2 }}>
        <Typography variant="body2">
          Scrollable content area. Use the scroll button above to jump to the target element below.
        </Typography>
        {Array.from({ length: 10 }, (_, i) => (
          <Typography key={i} variant="body2" sx={{ mb: 1 }}>
            Line {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Typography>
        ))}
      </Box>

      {/* Target element for scroll demonstration */}
      <Box 
        ref={scrollTargetRef}
        sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 1,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6">
          🎯 Scroll Target
        </Typography>
        <Typography variant="body2">
          This is the target element that the scroll button will focus on.
        </Typography>
      </Box>

      {/* Additional content to demonstrate scrolling */}
      <Box sx={{ height: 200, bgcolor: 'grey.100', p: 2, mt: 2 }}>
        <Typography variant="body2">
          More content below the target element.
        </Typography>
        {Array.from({ length: 8 }, (_, i) => (
          <Typography key={i} variant="body2" sx={{ mb: 1 }}>
            Bottom line {i + 1}: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};

export default RefDemo; 