import React from 'react';

const Navigation = ({ position = 'top' }) => (
  <div className={`shared-nav ${position}-nav`}></div>
);

export default Navigation;
