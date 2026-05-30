import React from 'react';

const AppHeader = ({ className = '' }) => (
  <div className={`login-header ${className}`}>
    <h1 className="app-title">整合生程式AI之<br />智慧穿搭建議與虛擬試穿平台</h1>
    <p className="app-subtitle">你的專屬AI穿搭助理</p>
  </div>
);

export default AppHeader;
