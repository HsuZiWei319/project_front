import React, { useState, useRef, useEffect } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  // 2. 建立一個 Ref：用來抓取那個「隱藏的 input」
  const fileInputRef = useRef(null);
  
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
      handleProfilePageFileUpload(location.state.fileToUpload);
      // 清除 state 避免重複處理
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 3. 遙控器函式：當按下黑色按鈕時，觸發這個函式
  const handleBlackButtonClick = () => {
    // 檢查目前是否正在處理中，如果是就不要讓使用者重複按
    if (isProcessing) return; 
    
    // 透過 Ref 去點擊那個隱藏的 input
    fileInputRef.current.click();
  };

  // 導航到個人檔案頁面
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // 當使用者真的選了檔案後，會執行這個函式
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
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
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  // 處理來自 ProfilePage 的文件上傳
  const handleProfilePageFileUpload = async (file) => {
    if (!file) return;

    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  return (
    <div className="container">
      {/* --- 這一塊是隱藏的 Input --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} // 讓它消失在畫面上
        onChange={handleFileChange}
        accept="image/*" // 限制只能選圖片
      />

      <Navigation position="top" />

      {/* 中間主要區塊 (Avatar 與 訊息顯示區) */}
      <div className="main-content">
        {/* 這裡放 3D 人偶圖 */}

        {/* 新增一個 wrapper (容器) 來包住兩張圖 */}
        <div className="avatar-wrapper">
          
          {/* 1. 底層：原本的 3D 人偶 (永遠顯示) */}
          {/*<img src="" alt="" className="avatar-img" />*/}

          {/* 2. 上層：去背後的衣服 (如果有拿到 resultImage 才顯示) */}
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

      <BottomNavigation onAddButtonClick={handleBlackButtonClick} />
    </div>
  );
};

export default MainPage;