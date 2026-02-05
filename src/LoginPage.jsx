// src/LoginPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // 引入導航鉤子
import './LoginPage.css';
import './App.css'; // 如果有共用樣式，可以引入
import * as Images from './assets'; // 從 assets/index.js 匯入所有圖片

const LoginPage = () => {
  const navigate = useNavigate(); // 取得導航功能

  const handleLogin = () => {
    // 這裡之後可以加後端驗證邏輯
    // 目前先直接跳轉到主頁面
    navigate('/home'); 
  };

  return (
    <div className="container">
        <div className="shared-nav top-nav"></div>
      
        {/* 標題區 */}
        <div className="login-header">
            <h1 className="app-title">APP名稱</h1>
            <p className="app-subtitle">你的專屬AI穿搭助理</p>
        </div>

        {/* 表單區 */}
        <div className="login-form">
            
            {/* 帳號輸入框 */}
            <div className="input-group">
                <img src={Images.icon_profile_login} alt="profile" className="input-icon" /> {/* 左邊圖示 */}
                <input type="text" placeholder="使用者名稱 / Gmail" />
                <img src={Images.icon_profile_login} alt="profile" className="input-icon-right" /> {/* 右邊圖示 */}
            </div>

            {/* 密碼輸入框 */}
            <div className="input-group">
            <img src={Images.icon_lock} alt="lock" className="input-icon" />
            <input type="password" placeholder="密碼" />
            <img src={Images.icon_eye} alt="eye" className="input-icon-right" />
            </div>

            {/* 連結區 */}
            <div className="links-container">
            <span className="link-text" onClick={() => navigate('/register')}>
                註冊
            </span>
            
            <span className="link-text">忘記密碼?</span>
            <span className="link-text">未登入狀態繼續</span>
            </div>

            {/* 登入按鈕 */}
            <button className="login-btn" onClick={handleLogin}>
            登入
            </button>
            
            {/* 社群登入 */}
            <div className="social-login">
            {/* 
            <p>或用社群帳號註冊</p>
            <div className="social-icons">
                <img src={Images.icon_google} alt="Google login" className="social-icon" />
                <img src={Images.icon_facebook} alt="Facebook login" className="social-icon" />
            </div>
            */}
            </div>
        </div>

        <div className="shared-nav bottom-nav"></div>
    </div>
  );
};

export default LoginPage;