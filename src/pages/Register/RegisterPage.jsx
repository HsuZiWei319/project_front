import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './RegisterPage.css';
import AppHeader from '../../components/Header/AppHeader';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import PrimaryButton from '../../components/Button/PrimaryButton';
import { register } from '../../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 表單狀態
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // 處理輸入框變化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // 清除錯誤訊息
  };

  // 驗證表單
  const validateForm = () => {
    if (!formData.email) {
      setError('請輸入電子郵件地址');
      return false;
    }
    if (!formData.username) {
      setError('請輸入使用者名稱');
      return false;
    }
    if (!formData.password) {
      setError('請輸入密碼');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密碼至少需要 6 個字元');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('密碼和確認密碼不相符');
      return false;
    }
    return true;
  };

  // 提交註冊
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(
        formData.email,
        formData.username,
        formData.password
      );
      console.log('註冊成功:', response);
      setIsSuccess(true);
    } catch (err) {
      // 處理詳細的錯誤信息
      let errorMessage = '註冊失敗，請重試';
      
      if (err.data) {
        // 後端驗證錯誤（返回欄位級別的錯誤）
        const errors = err.data;
        const errorMessages = [];
        
        // 收集所有欄位的錯誤信息
        Object.keys(errors).forEach(field => {
          if (Array.isArray(errors[field])) {
            errorMessages.push(...errors[field]);
          } else if (typeof errors[field] === 'string') {
            errorMessages.push(errors[field]);
          }
        });
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('註冊錯誤:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="container">
        <Navigation position="top_register" />

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
              {/* 錯誤訊息顯示 */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* 欄位標籤 + 輸入框 1 */}
              <div className="input-group-register">
              <label>電子郵件地址</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              </div>

              {/* 欄位標籤 + 輸入框 2 */}
              <div className="input-group-register">
              <label>使用者名稱</label>
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              </div>

              {/* 欄位標籤 + 輸入框 3 */}
              <div className="input-group-register">
              <label>密碼</label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              </div>

              {/* 欄位標籤 + 輸入框 4 */}
              <div className="input-group-register">
              <label>確認密碼</label>
              <input 
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              </div>

              {/* 建立帳戶按鈕 */}
              <PrimaryButton 
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? '註冊中...' : '建立帳戶'}
              </PrimaryButton>
            </>
          )}
        </div>

        <Navigation position="bottom" />
    </div>
    );
};

export default RegisterPage;