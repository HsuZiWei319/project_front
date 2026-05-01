import React from 'react';

const AppHeader = ({ className = '' }) => (
  <div className={`login-header ${className}`}>
    <h1 className="app-title">APP名稱</h1>
    <p className="app-subtitle">你的專屬AI穿搭助理</p>
  </div>
);

export default AppHeader;
