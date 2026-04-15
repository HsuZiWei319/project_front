import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import './MainPage.css';
import * as Images from '../../assets';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { useImageUpload } from '../../hooks/useImageUpload';
import { getModelPhoto } from '../../services/imageService';

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { statusMessage, resultImage, handleFileSelectedForClothesUpload } = useImageUpload();
  const [isMouseIdle, setIsMouseIdle] = useState(false);
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const idleTimeoutRef = React.useRef(null);

  // 監控 resultImage 的變化
  useEffect(() => {
    console.log("🔍 resultImage 狀態已更新:", resultImage);
    if (resultImage) {
      console.log("✅ 圖片 URL 已設定");
    }
  }, [resultImage]);

  // 在組件掛載時，獲取之前上傳的模特照片
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
        // 如果獲取失敗，使用預設的模特圖
      }
    };

    loadModelPhoto();
  }, [location.pathname]);

  // 鼠標空閒檢測
  useEffect(() => {
    const handleMouseMove = () => {
      // 鼠標移動時，設定為非空閒狀態
      setIsMouseIdle(false);

      // 清除之前的計時器
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      // 設定新的計時器：3秒後如果沒有移動就設定為空閒
      idleTimeoutRef.current = setTimeout(() => {
        setIsMouseIdle(true);
      }, 3000);
    };

    // 添加鼠標移動事件監聽器
    window.addEventListener('mousemove', handleMouseMove);

    // 初始化：設定第一個計時器
    idleTimeoutRef.current = setTimeout(() => {
      setIsMouseIdle(true);
    }, 3000);

    // 清理函數
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="container">
      <Navigation position="top" />

      {/* 中間主要區塊 (Avatar 與 訊息顯示區) */}
      <div className="main-content">
        {/* 這裡放 3D 人偶圖 */}

        {/* 新增一個 wrapper (容器) 來包住所有圖 */}
        <div className="avatar-wrapper">
          
          {/* 模特圖 */}
          <img src={userPhotoUrl || Images.model} alt="model" className="model-img" />

          {/* 模特info */}
          <img 
            src={Images.icon_info} 
            alt="icon_info" 
            className={`info-card ${isMouseIdle ? 'hidden' : ''}`}
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