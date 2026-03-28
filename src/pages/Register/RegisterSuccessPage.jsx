import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import AppHeader from '../../components/Header/AppHeader';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import PrimaryButton from '../../components/Button/PrimaryButton';

const RegisterSuccessPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    // 按下登入，直接前往主頁面
    navigate('/home');
  };

  return (
    <div className="container">
        <Navigation position="register" />
        {/* 左上角返回箭頭 */}
        <BackButton />

        <AppHeader />

        {/* 成功訊息 */}
        <div style={{ margin: '40px 0', textAlign: 'center' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold' }}>帳號建立成功！</h2>
        </div>

        {/* 登入按鈕 */}
        <div className="login-form">
            <PrimaryButton onClick={handleGoHome}>
            登入
            </PrimaryButton>
        </div>

        <Navigation position="bottom" />
    </div>
  );
};

export default RegisterSuccessPage;