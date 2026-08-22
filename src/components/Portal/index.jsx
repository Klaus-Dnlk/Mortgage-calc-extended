/**
 * C: Uses design patterns to create new structures —
 * Portal (structural) renders UI outside the parent DOM hierarchy (modals).
 */
import React from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, container = document.body }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, container) : null;
};

export default Portal; 