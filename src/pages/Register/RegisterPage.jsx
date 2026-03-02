import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import AppHeader from '../../components/Header/AppHeader';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import PrimaryButton from '../../components/Button/PrimaryButton';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = () => {
    // 這裡未來可以加入後端註冊 API
    // 目前顯示註冊成功頁
    setIsSuccess(true);
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="container">
        <Navigation position="top" />

        {/* 左上角返回箭頭 */}
        <BackButton />

        <AppHeader />

        {isSuccess ? (
          /* 成功訊息 */
          <div style={{ margin: '40px 0', textAlign: 'center' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold' }}>帳號建立成功！</h2>
          </div>
        ) : null}

        <div className="login-form">
          {isSuccess ? (
            /* 登入按鈕 */
            <PrimaryButton onClick={handleGoHome}>
              登入
            </PrimaryButton>
          ) : (
            /* 註冊表單 */
            <>
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
              <PrimaryButton onClick={handleRegister}>
              建立帳戶
              </PrimaryButton>
            </>
          )}
        </div>

        <Navigation position="bottom" />
    </div>
    );
};

export default RegisterPage;