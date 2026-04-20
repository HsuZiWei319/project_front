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
  const [isVirtualTrying, setIsVirtualTrying] = useState(false);
  const [virtualTryingClothes, setVirtualTryingClothes] = useState('');
  const [virtualTryOnImage, setVirtualTryOnImage] = useState(null);
  const idleTimeoutRef = React.useRef(null);
  const isVirtualTryingRef = React.useRef(false);

  // 在組件首次掛載時清除虛擬試穿的臨時數據（最優先執行）
  useEffect(() => {
    // 強制清除虛擬試穿狀態
    setIsVirtualTrying(false);
    isVirtualTryingRef.current = false;
    setVirtualTryingClothes('');
    setVirtualTryOnImage(null);
    
    // 清除 localStorage
    localStorage.removeItem('virtualTryOnResult');
    localStorage.removeItem('virtualTryOnError');
    
    // 如果 location.state 中仍有虛擬試穿標誌，清除路由狀態
    if (location.state?.startedVirtualTryOn) {
      console.log('🧹 檢測到殘留的虛擬試穿狀態，清除路由信息');
      // 使用 replace 導航来清除 location.state，但不改變 URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    console.log('🧹 頁面加載：已清除所有虛擬試穿狀態');
  }, []);

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

  // 監控虛擬試穿的啟動 (來自 VirtualTryOn 頁面的導航狀態)
  useEffect(() => {
    if (location.state?.startedVirtualTryOn) {
      const clothesNames = location.state.clothesInfo?.names || '選中的衣服';
      setIsVirtualTrying(true);
      isVirtualTryingRef.current = true;
      setVirtualTryingClothes(clothesNames);
      console.log('🔍 接收到虛擬試穿請求，衣服:', clothesNames);
    } else {
      // 如果沒有虛擬試穿的標誌，清空狀態和 localStorage
      setIsVirtualTrying(false);
      isVirtualTryingRef.current = false;
      setVirtualTryingClothes('');
      setVirtualTryOnImage(null);
      localStorage.removeItem('virtualTryOnResult');
      localStorage.removeItem('virtualTryOnError');
      console.log('🔄 清除虛擬試穿狀態');
    }
  }, [location.state?.startedVirtualTryOn, location.pathname]);

  // 監控虛擬試穿完成事件
  useEffect(() => {
    const handleVirtualTryOnComplete = () => {
      // 只有當虛擬試穿仍在進行中時，才處理結果
      if (!isVirtualTryingRef.current) {
        console.log('⏭️ 虛擬試穿已取消，忽略 API 結果');
        return;
      }

      console.log('📥 收到虛擬試穿完成事件');
      
      try {
        const resultData = localStorage.getItem('virtualTryOnResult');
        if (resultData) {
          const { imageUrl } = JSON.parse(resultData);
          console.log('✅ 更新模特照片:', imageUrl);
          setVirtualTryOnImage(imageUrl);
          setUserPhotoUrl(imageUrl);
          
          // 立即清除虛擬試穿狀態（不再延遲）
          setIsVirtualTrying(false);
          isVirtualTryingRef.current = false;
          setVirtualTryingClothes('');
          setVirtualTryOnImage(null);
          localStorage.removeItem('virtualTryOnResult');
        }
      } catch (err) {
        console.error('❌ 處理虛擬試穿結果失敗:', err);
        setIsVirtualTrying(false);
        isVirtualTryingRef.current = false;
      }
    };

    const handleVirtualTryOnError = () => {
      // 只有當虛擬試穿仍在進行中時，才處理錯誤
      if (!isVirtualTryingRef.current) {
        console.log('⏭️ 虛擬試穿已取消，忽略錯誤');
        return;
      }

      console.log('❌ 收到虛擬試穿錯誤事件');
      
      try {
        const errorData = localStorage.getItem('virtualTryOnError');
        if (errorData) {
          const { error } = JSON.parse(errorData);
          alert('虛擬試穿失敗: ' + error);
          localStorage.removeItem('virtualTryOnError');
        }
      } catch (err) {
        console.error('❌ 處理虛擬試穿錯誤失敗:', err);
      }
      
      setIsVirtualTrying(false);
      isVirtualTryingRef.current = false;
      setVirtualTryingClothes('');
    };

    window.addEventListener('virtualTryOnComplete', handleVirtualTryOnComplete);
    window.addEventListener('virtualTryOnError', handleVirtualTryOnError);

    return () => {
      window.removeEventListener('virtualTryOnComplete', handleVirtualTryOnComplete);
      window.removeEventListener('virtualTryOnError', handleVirtualTryOnError);
    };
  }, []);

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
        <div className={`avatar-wrapper`}>
          
          {/* 模特圖 */}
          <img 
            src={virtualTryOnImage || userPhotoUrl || Images.model} 
            alt="model" 
            className={`model-img ${isVirtualTrying ? 'trying-opacity' : ''} `}
            onClick={() => navigate('/virtual-tryon')}
            style={{ cursor: 'pointer' }}
          />

          {/* 提示文字 */}
          <div className="model-hint">點擊試穿</div>

          {/* 模特info */}
          <img 
            src={Images.icon_info} 
            alt="icon_info" 
            className={`info-card ${isMouseIdle ? 'hidden' : ''}`}
            onClick={() => navigate('/model')}
            style={{ cursor: 'pointer' }}
          />

        </div>

        {/* 衣櫃圖標 - 放在 avatar-wrapper 外面，避免被 overflow: hidden 切掉 */}
        <img 
          src={Images.wardrobe} 
          alt="wardrobe" 
          className="wardrobe-card"
          onClick={() => navigate('/wardrobe')}
          style={{ cursor: 'pointer' }}
        />
        
        {/* --- 狀態文字顯示區 (絕對定位在中間) --- */}
        {isVirtualTrying && (
          <div className="virtual-tryon-status-overlay">
            <h2>試穿中...</h2>
          </div>
        )}
        
        {statusMessage && !isVirtualTrying && (
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