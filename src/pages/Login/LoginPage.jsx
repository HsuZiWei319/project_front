import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import * as Images from '../../assets';
import AppHeader from '../../components/Header/AppHeader';
import Navigation from '../../components/Navigation/Navigation';
import PrimaryButton from '../../components/Button/PrimaryButton';
import { login } from '../../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // 驗證表單
    if (!username.trim() || !password.trim()) {
      setError('請輸入帳號和密碼');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 呼叫登入 API
      const response = await login(username, password);
      
      // 保存 token
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username || username);
      }
      
      // 登入成功，導向首頁
      navigate('/home');
    } catch (err) {
      // 處理登入失敗
      console.error('登入錯誤:', err);
      setError(err.response?.data?.detail || '登入失敗，請檢查帳號密碼');
    } finally {
      setLoading(false);
    }
  };

  // 按 Enter 鍵登入
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="container">
      <Navigation position="top" />
      
      {/* 標題區 */}
      <AppHeader />

      {/* 表單區 */}
      <div className="login-form">
        
        {/* 錯誤提示 */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* 帳號輸入框 */}
        <div className="input-group">
          <img src={Images.icon_profile_login} alt="profile" className="input-icon" />
          <input 
            type="text" 
            placeholder="使用者名稱 / Gmail" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <img src={Images.icon_profile_login} alt="profile" className="input-icon-right" />
        </div>

        {/* 密碼輸入框 */}
        <div className="input-group">
          <img src={Images.icon_lock} alt="lock" className="input-icon" />
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="密碼" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <img 
            src={Images.icon_eye} 
            alt="eye" 
            className="input-icon-right"
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* 連結區 */}
        <div className="links-container">
          <span className="link-text" onClick={() => navigate('/register')}>
            註冊
          </span>
          
          <span className="link-text">忘記密碼?</span>
          <span className="link-text" onClick={() => navigate('/home')}>
            未登入狀態繼續
          </span>
        </div>

        {/* 登入按鈕 */}
        <PrimaryButton onClick={handleLogin} disabled={loading}>
          {loading ? '登入中...' : '登入'}
        </PrimaryButton>
        
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

      <Navigation position="bottom" />
    </div>
  );
};

export default LoginPage;