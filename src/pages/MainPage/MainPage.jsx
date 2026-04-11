import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import './MainPage.css';
import * as Images from '../../assets';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { useImageUpload } from '../../hooks/useImageUpload';

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { statusMessage, resultImage, handleFileSelectedForClothesUpload } = useImageUpload();

  // 監控 resultImage 的變化
  useEffect(() => {
    console.log("🔍 resultImage 狀態已更新:", resultImage);
    if (resultImage) {
      console.log("✅ 圖片 URL 已設定");
    }
  }, [resultImage]);

  return (
    <div className="container">
      <Navigation position="top" />

      {/* 中間主要區塊 (Avatar 與 訊息顯示區) */}
      <div className="main-content">
        {/* 這裡放 3D 人偶圖 */}

        {/* 新增一個 wrapper (容器) 來包住所有圖 */}
        <div className="avatar-wrapper">
          
          {/* 模特圖 */}
          <img src={Images.model} alt="model" className="model-img" />

          {/* 模特info */}
          <img 
            src={Images.icon_info} 
            alt="icon_info" 
            className="info-card"
            onClick={() => navigate('/model')}
            style={{ cursor: 'pointer' }}
          />

          {/* 衣櫃 */}
          <img 
            src={Images.wardrobe} 
            alt="wardrobe" 
            className="wardrobe-card"
            onClick={() => navigate('/wardrobe')}
            style={{ cursor: 'pointer' }}
          />

          {/* 去背後的衣服 (如果有拿到 resultImage 才顯示) */}
          {resultImage && (
            <img src={resultImage} alt="Try-On" className="overlay-img" />
          )}

        </div>
        
        {/* --- 狀態文字顯示區 (絕對定位在中間) --- */}
        {statusMessage && (
          <div className="status-overlay">
            <h2>{statusMessage}</h2>
          </div>
        )}
      </div>

      <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
    </div>
  );
};

export default MainPage;