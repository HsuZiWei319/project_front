import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
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
  const [isVirtualTrying, setIsVirtualTrying] = useState(false);
  const [virtualTryingClothes, setVirtualTryingClothes] = useState('');
  const [virtualTryOnImage, setVirtualTryOnImage] = useState(null);
  const isVirtualTryingRef = useRef(false);

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

  // 在組件首次掛載時清除虛擬試穿的臨時數據
  useEffect(() => {
    setIsVirtualTrying(false);
    isVirtualTryingRef.current = false;
    setVirtualTryingClothes('');
    setVirtualTryOnImage(null);
    
    localStorage.removeItem('virtualTryOnResult');
    localStorage.removeItem('virtualTryOnError');
    
    if (location.state?.startedVirtualTryOn) {
      console.log('🧹 檢測到殘留的虛擬試穿狀態，清除路由信息');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    console.log('🧹 頁面加載：已清除所有虛擬試穿狀態');
  }, []);

  // 監控虛擬試穿的啟動
  useEffect(() => {
    if (location.state?.startedVirtualTryOn) {
      const clothesNames = location.state.clothesInfo?.names || '選中的衣服';
      setIsVirtualTrying(true);
      isVirtualTryingRef.current = true;
      setVirtualTryingClothes(clothesNames);
      console.log('🔍 接收到虛擬試穿請求，衣服:', clothesNames);
    } else {
      setIsVirtualTrying(false);
      isVirtualTryingRef.current = false;
      setVirtualTryingClothes('');
      setVirtualTryOnImage(null);
      localStorage.removeItem('virtualTryOnResult');
      localStorage.removeItem('virtualTryOnError');
    }
  }, [location.state?.startedVirtualTryOn, location.pathname]);

  // 監控虛擬試穿完成事件
  useEffect(() => {
    const handleVirtualTryOnComplete = () => {
      if (!isVirtualTryingRef.current) {
        console.log('⏭️ 虛擬試穿已取消，忽略 API 結果');
        return;
      }

      console.log('📥 收到虛擬試穿完成事件');
      
      try {
        const resultData = localStorage.getItem('virtualTryOnResult');
        if (resultData) {
          const { imageUrl } = JSON.parse(resultData);
          console.log('✅ 更新模特照片 (via SWR mutate):', imageUrl);
          setVirtualTryOnImage(imageUrl);
          
          // 使用 SWR mutate 更新緩存
          mutate('modelPhoto', imageUrl, false);
          
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

  return (
    <div className="container">
      <Navigation position="top" />

      <div className="main-content">
        <img 
          src={Images.wardrobe} 
          alt="wardrobe" 
          className="wardrobe-card"
          onClick={() => navigate('/wardrobe')}
          style={{ cursor: 'pointer' }}
          title="我的衣櫃"
        />

        <img 
          src={Images.chat} 
          alt="chat" 
          className="chat-card"
          onClick={() => navigate('/ai-chat')}
          title="AI 穿搭助手"
          style={{ cursor: 'pointer' }}
        />
        
        <div className={`avatar-wrapper`}>
          {isLoadingModel ? (
            <div className="model-loading">
              <div className="loading-spinner"></div>
              <span>加載中...</span>
            </div>
          ) : (
            <>
              <img 
                src={virtualTryOnImage || userPhotoUrl || Images.model} 
                alt="model" 
                className={`model-img ${isVirtualTrying ? 'trying-opacity' : ''} `}
                onClick={() => navigate('/virtual-tryon')}
                style={{ cursor: 'pointer' }}
              />
              <div className="model-hint">點擊試穿</div>
            </>
          )}
        </div>
        
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