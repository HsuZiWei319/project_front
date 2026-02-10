import React from 'react';

const PrimaryButton = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    className={`login-btn ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export default PrimaryButton;
