import React, { useState, useEffect, useRef } from 'react';
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
import { getModelPhoto } from '../../services/imageService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const { handleFileSelectedForModelUpload, resultImage, error: hookError, isLoading: hookIsLoading } = useImageUpload();

  useEffect(() => {
    // 從 localStorage 獲取使用者資訊
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    setUsername(storedUsername || 'User');
    setEmail(storedEmail || 'example@example.com');
  }, []);

  // 加載用戶上傳的模特照片
  useEffect(() => {
    const loadModelPhoto = async () => {
      try {
        const result = await getModelPhoto();
        if (result.success && result.photo?.user_image_url) {
          setUserPhotoUrl(result.photo.user_image_url);
          console.log('✅ 已加載用戶上傳的模特照片:', result.photo.user_image_url);
        }
      } catch (err) {
        console.error('⚠️ 獲取模特照片失敗:', err);
      }
    };

    loadModelPhoto();
  }, []);

  // 監聽 hook 的 resultImage，當上傳成功時更新 userPhotoUrl
  useEffect(() => {
    if (resultImage) {
      setUserPhotoUrl(resultImage);
      setUploadError(null);
    }
  }, [resultImage]);

  // 監聽 hook 的 error
  useEffect(() => {
    if (hookError) {
      setUploadError(hookError);
    }
  }, [hookError]);

  // 監聽 hook 的 isLoading
  useEffect(() => {
    setIsLoading(hookIsLoading);
  }, [hookIsLoading]);

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

  // 處理模特點擊事件
  const handlePhotoClick = () => {
    if (hookIsLoading) return;
    setUploadError(null);
    fileInputRef.current?.click();
  };

  // 處理文件選擇
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      await handleFileSelectedForModelUpload(file, () => {
        // 上傳完成後，重置文件輸入
        event.target.value = '';
      });
    } catch (error) {
      console.error('上傳錯誤:', error);
      setUploadError(error.message || '上傳失敗，請重試');
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
        {/* 個人資訊卡片 */}
        <div className="profile-info">
          {/* 模特圖片 */}
          <div 
            className="profile-picture"
            onClick={handlePhotoClick}
            style={{ 
              opacity: hookIsLoading ? 0.6 : 1, 
              cursor: hookIsLoading ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            <img 
              src={userPhotoUrl || Images.model} 
              alt="模特照片" 
              className="profile-pic-image" 
            />
            {/* 提示文字 */}
            <div className="model-upload-hint">點擊上傳</div>
            {hookIsLoading && (
              <span style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#999',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}>
                上傳中...
              </span>
            )}
          </div>

          {/* 上傳錯誤提示 */}
          {uploadError && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '8px 12px',
              margin: '12px auto',
              borderRadius: '4px',
              fontSize: '12px',
              maxWidth: '80%',
              textAlign: 'center'
            }}>
              ❌ {uploadError}
            </div>
          )}

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

      {/* 隱藏文件輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfilePage;
