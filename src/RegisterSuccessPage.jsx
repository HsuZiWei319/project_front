import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import './App.css';
import * as Images from './assets';

const RegisterSuccessPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    // 按下登入，直接前往主頁面
    navigate('/home');
  };

  return (
    <div className="container">
        <div className="shared-nav top-nav"></div>
        {/* 左上角返回箭頭 */}
        <img src={Images.icon_return} alt="return" className="back-arrow" onClick={() => navigate(-1)} />

        <div className="login-header">
            <h1 className="app-title">APP名稱</h1>
            <p className="app-subtitle">你的專屬AI穿搭助理</p>
        </div>

        {/* 成功訊息 */}
        <div style={{ margin: '40px 0', textAlign: 'center' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold' }}>帳號建立成功！</h2>
        </div>

        {/* 登入按鈕 */}
        <div className="login-form">
            <button className="login-btn" onClick={handleGoHome}>
            登入
            </button>
        </div>

        <div className="shared-nav bottom-nav"></div>
    </div>
  );
};

export default RegisterSuccessPage;