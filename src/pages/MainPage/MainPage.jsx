import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import './MainPage.css';
import * as Images from '../../assets';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { uploadImageForProcessing } from '../../services/imageService';

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 定義狀態：用來顯示中間的文字 (處理中 / 成功 / 失敗)
  const [statusMessage, setStatusMessage] = useState(""); 
  const [resultImage, setResultImage] = useState(null);
  
  // 監控 resultImage 的變化，並檢查 localStorage 是否有來自 ProfilePage 的上傳圖片
  useEffect(() => {
    console.log("🔍 resultImage 狀態已更新:", resultImage);
    if (resultImage) {
      console.log("✅ 圖片 URL 已設定");
    }
    
    // 檢查是否從 ProfilePage 返回並有上傳的圖片
    const uploadedImageUrl = localStorage.getItem('uploadedImageUrl');
    if (uploadedImageUrl && !resultImage) {
      setResultImage(uploadedImageUrl);
      // 使用後清除 localStorage
      localStorage.removeItem('uploadedImageUrl');
      console.log("✅ 從 ProfilePage 返回，圖片已加載");
    }
  }, [resultImage]);

  // 監控是否從 ProfilePage 導航回來並帶著文件
  useEffect(() => {
    if (location.state?.fileToUpload) {
      console.log("📁 收到來自 ProfilePage 的文件");
      // 立即在本頁面處理這個文件
      handleFileSelected(location.state.fileToUpload, () => {});
      // 清除 state 避免重複處理
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 處理文件上傳 (從 BottomNavigation 接收文件)
  const handleFileSelected = async (file, onComplete) => {
    if (!file) return;

    setStatusMessage("正在去背處理中..."); 

    try {
      const imageUrl = await uploadImageForProcessing(file);
      setStatusMessage(""); // 成功後清空狀態訊息，直接顯示圖片
      setResultImage(imageUrl);
      console.log("✅ resultImage 已設定為:", imageUrl);
    } catch (error) {
      console.error("上傳失敗:", error);
      setStatusMessage("去背失敗，請檢查後端連線");
    } finally {
      // 呼叫完成回調，告訴 BottomNavigation 已完成處理
      onComplete();
    }
  };

  return (
    <div className="container">
      <Navigation position="top" />

      {/* 中間主要區塊 (Avatar 與 訊息顯示區) */}
      <div className="main-content">
        {/* 這裡放 3D 人偶圖 */}

        {/* 新增一個 wrapper (容器) 來包住所有圖 */}
        <div className="avatar-wrapper">
          
          {/* 原本的 3D 人偶 (永遠顯示) */}
          <img src={Images.model} alt="model" className="model-img" />

          <img src={Images.icon_info} alt="icon_info" className="info-card" />

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

      <BottomNavigation onFileSelected={handleFileSelected} />
    </div>
  );
};

export default MainPage;