import React from 'react';
import '../../App.css';
import './NotificationPage.css';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import BackButton from '../../components/Header/BackButton';
import { useImageUpload } from '../../hooks/useImageUpload';

const NotificationPage = () => {
  const { handleFileSelectedForClothesUpload } = useImageUpload();

  return (
    <div className="container">
      <Navigation position="top" />
      
      {/* 左上角返回箭頭 */}
      <BackButton />

      <div className="notification-page-content">
        <div className="notification-header-scroll">
          <h1 className="pagetitle-label">通知</h1>
        </div>

        <div className="notification-list">
          <div className="notification-item">
            <div className="notification-icon-wrapper">
              🔔
            </div>
            <div className="notification-info">
              <div className="notification-message">開發版本 v0.0</div>
              <div className="notification-time">現在</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
    </div>
  );
};

export default NotificationPage;
