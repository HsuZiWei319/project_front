import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // 我們可以直接共用登入頁的 CSS，風格一致
import './App.css';
import * as Images from './assets';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    // 這裡未來可以加入後端註冊 API
    // 目前直接跳轉到「註冊成功頁」
    navigate('/register-success');
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

        <div className="login-form">
            {/* 欄位標籤 + 輸入框 1 */}
            <div className="input-group-register">
            <label>電子郵件地址</label>
            <input type="email" />
            </div>

            {/* 欄位標籤 + 輸入框 2 */}
            <div className="input-group-register">
            <label>使用者名稱</label>
            <input type="text" />
            </div>

            {/* 欄位標籤 + 輸入框 3 */}
            <div className="input-group-register">
            <label>密碼</label>
            <input type="password" />
            </div>

            {/* 欄位標籤 + 輸入框 4 */}
            <div className="input-group-register">
            <label>確認密碼</label>
            <input type="password" />
            </div>

            {/* 建立帳戶按鈕 */}
            <button className="login-btn" onClick={handleRegister} style={{ marginTop: '20px' }}>
            建立帳戶
            </button>
        </div>

        <div className="shared-nav bottom-nav"></div>
    </div>
  );
};

export default RegisterPage;