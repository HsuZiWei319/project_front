import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './ProfilePage.css';
import '../../components/Dialog/Dialog.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';
import { logout, deleteUser } from '../../services/authService';
import { useImageUpload } from '../../hooks/useImageUpload';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 從 localStorage 獲取使用者資訊
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    setUsername(storedUsername || 'User');
    setEmail(storedEmail || 'example@example.com');
  }, []);

  // 處理登出
  const handleLogout = async () => {
    setIsLoading(true);
    setError('');
    try {
      await logout();
      // 清除 localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      // 導向登入頁面
      navigate('/');
    } catch (err) {
      console.error('登出失敗:', err);
      // 即使登出API失敗，也清除本地存儲並返回登入頁面
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      navigate('/');
    } finally {
      setIsLoading(false);
      setShowLogoutDialog(false);
    }
  };

  // 處理刪除帳號
  const handleDeleteAccount = async (password) => {
    setIsLoading(true);
    setError('');
    try {
      await deleteUser(password);
      // 清除 localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      // 導向登入頁面
      navigate('/');
    } catch (err) {
      console.error('刪除帳號失敗:', err);
      const errorMessage = err.response?.data?.password?.[0] 
        || err.response?.data?.detail 
        || '刪除帳號失敗，請檢查密碼';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

    const { handleFileSelectedForClothesUpload } = useImageUpload();

    const handleFileSelected = (file, onComplete) => {
        handleFileSelectedForClothesUpload(file, onComplete);
    };

  return (
    <div className="container">
      <Navigation position="top" />

      {/* 左上角返回箭頭 */}
      <BackButton />

      {/* 主內容區域 */}
      <div className="profile-page">
        {/* 個人檔案頭部 */}
        <div className="profile-header">
          <img src={Images.icon_profile} alt="個人檔案" className="profile-avatar" />
        </div>

        {/* 個人資訊卡片 */}
        <div className="profile-info">
          {/* 個人檔案圖片 */}
          <div className="profile-picture">
            <img src={Images.default_profile_pic} alt="個人檔案圖片" className="profile-pic-image" />
          </div>

          {/* 暱稱 */}
          <div className="profile-row">
            <div className="profile-label">暱稱</div>
            <div className="profile-value">{username}</div>
          </div>

          {/* 電子郵件 */}
          <div className="profile-row">
            <div className="profile-label">電子郵件</div>
            <div className="profile-value">{email}</div>
          </div>

          {/* 電話 */}
          {/*<div className="profile-row">
            <div className="profile-label">電話</div>
            <div className="profile-value">新增電話</div>
          </div> */}

          {/* 變更密碼 */}
          <div className="profile-row profile-clickable">
            <div className="profile-label">變更密碼</div>
            <div className="profile-arrow">&gt;</div>
          </div>

          {/* 變更身體數據 */}
          <div 
            className="profile-row profile-clickable"
            onClick={() => navigate('/user-info')}
          >
            <div className="profile-label">變更身體數據</div>
            <div className="profile-arrow">&gt;</div>
          </div>

          {/* 登出按鈕 */}
          <div 
            className="profile-row profile-action logout-row"
            onClick={() => setShowLogoutDialog(true)}
          >
            <div className="profile-label logout-text">登出</div>
          </div>

          {/* 刪除帳號按鈕 */}
          <div 
            className="profile-row profile-action delete-row"
            onClick={() => setShowDeleteDialog(true)}
          >
            <div className="profile-label delete-text">刪除帳號</div>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="error-message profile-error-message">
            {error}
          </div>
        )}
      </div>

      {/* 登出確認對話框 */}
      {showLogoutDialog && (
        <ConfirmDialog
          title="登出你的帳號？"
          message=""
          confirmText="登出"
          cancelText="取消"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutDialog(false)}
          isLoading={isLoading}
          confirmButtonColor="#FF4444"
        />
      )}

      {/* 刪除帳號確認對話框 */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="永久刪除你的帳號？"
          message=""
          confirmText="刪除"
          cancelText="取消"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={isLoading}
          requirePassword={true}
          confirmButtonColor="#FF4444"
        />
      )}

      <BottomNavigation onFileSelected={handleFileSelected} />
    </div>
  );
};

export default ProfilePage;
