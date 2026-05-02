import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import '../../App.css';
import './ProfilePage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { logout, deleteUser } from '../../services/authService';
import { useImageUpload } from '../../hooks/useImageUpload';
import { getModelPhoto } from '../../services/imageService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const { handleFileSelectedForModelUpload, error: hookError, isLoading: hookIsLoading } = useImageUpload();

  // SWR fetcher for model photo
  const fetchModelPhoto = async () => {
    try {
      const result = await getModelPhoto();
      if (result.success && result.photo?.user_image_url) {
        return result.photo.user_image_url;
      }
      return Images.model;
    } catch (err) {
      console.error('⚠️ 獲取模特照片失敗:', err);
      return Images.model;
    }
  };

  // Use SWR to manage model photo data
  const { data: userPhotoUrl, isLoading: isLoadingModel } = useSWR('modelPhoto', fetchModelPhoto, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    setUsername(storedUsername || 'User');
    setEmail(storedEmail || 'example@example.com');
  }, []);

  useEffect(() => {
    setIsLoading(hookIsLoading);
  }, [hookIsLoading]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError('');
    try {
      await logout();
    } catch (err) {
      console.error('登出失敗:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      setIsLoading(false);
      setShowLogoutModal(false);
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('請輸入密碼以確認刪除');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await deleteUser(deletePassword);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      navigate('/');
    } catch (err) {
      console.error('刪除帳號失敗:', err);
      const errorMessage = err.response?.data?.password?.[0] 
        || err.response?.data?.detail 
        || '刪除帳號失敗，請檢查密碼';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handlePhotoClick = () => {
    if (hookIsLoading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await handleFileSelectedForModelUpload(file, () => {
        event.target.value = '';
        // 上傳成功後，通知 SWR 重新獲取數據
        mutate('modelPhoto');
      });
    } catch (error) {
      console.error('上傳錯誤:', error);
    }
  };

  const { handleFileSelectedForClothesUpload } = useImageUpload();

  return (
    <div className="container">
      <Navigation position="top" />
      <BackButton />

      <div className="profile-page">
        <div className="profile-header-scroll">
          <h1 className="pagetitle-label">個人檔案</h1>
        </div>

        {/* 模特圖片區域 */}
        <div className="profile-picture-container">
          <div className="profile-picture" onClick={handlePhotoClick}>
            {isLoadingModel || hookIsLoading ? (
              <div className="model-loading">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <>
                <img 
                  src={userPhotoUrl || Images.model} 
                  alt="模特照片" 
                  className="profile-pic-image" 
                />
                <div className="model-upload-hint">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 基本資料 Section */}
        <div className="profile-section">
          <h2 className="section-title">基本資料</h2>
          <div className="section-card">
            <div className="profile-item no-click">
              <div className="item-left">
                <div className="item-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="item-info">
                  <span className="item-title">暱稱</span>
                  <span className="item-value">{username}</span>
                </div>
              </div>
            </div>
            <div className="profile-item no-click">
              <div className="item-left">
                <div className="item-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="item-info">
                  <span className="item-title">電子郵件</span>
                  <span className="item-value">{email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 帳號管理 Section */}
        <div className="profile-section">
          <h2 className="section-title">帳號管理</h2>
          <div className="section-card">
            <div className="profile-item">
              <div className="item-left">
                <div className="item-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div className="item-info">
                  <span className="item-title">變更密碼</span>
                </div>
              </div>
              <div className="item-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="profile-item" onClick={() => navigate('/user-info')}>
              <div className="item-left">
                <div className="item-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div className="item-info">
                  <span className="item-title">變更身體數據</span>
                </div>
              </div>
              <div className="item-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 登出與刪除帳號 Section */}
        <div className="profile-section">
          <h2 className="section-title">危險區域</h2>
          <div className="section-card">
            <div className="profile-item danger" onClick={() => setShowLogoutModal(true)}>
              <div className="item-left">
                <div className="item-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </div>
                <div className="item-info">
                  <span className="item-title">登出帳號</span>
                </div>
              </div>
            </div>
            <div className="profile-item danger" onClick={() => setShowDeleteModal(true)}>
              <div className="item-left">
                <div className="item-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>
                <div className="item-info">
                  <span className="item-title">刪除帳號</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="profile-error-message">{error}</div>}
      </div>

      {/* Redesigned Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <h3 className="modal-title">登出帳號</h3>
            <p className="modal-message">確定要登出您的帳號嗎？您隨時可以再次登入來管理您的虛擬衣櫃。</p>
            <div className="modal-buttons">
              <button className="modal-btn confirm" onClick={handleLogout} disabled={isLoading}>
                {isLoading ? '處理中...' : '確認登出'}
              </button>
              <button className="modal-btn cancel" onClick={() => setShowLogoutModal(false)} disabled={isLoading}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 className="modal-title">永久刪除帳號</h3>
            <p className="modal-message">這項操作無法復原。您的所有資料、虛擬衣櫃及身體數據將被永久刪除。</p>
            <div className="password-input-wrapper">
              <label>請輸入密碼以確認</label>
              <input 
                type="password" 
                placeholder="您的密碼" 
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="modal-buttons">
              <button className="modal-btn confirm" onClick={handleDeleteAccount} disabled={isLoading}>
                {isLoading ? '處理中...' : '確定永久刪除'}
              </button>
              <button className="modal-btn cancel" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />

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
