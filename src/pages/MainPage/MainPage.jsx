import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import LottieComponent from 'lottie-react';
const Lottie = LottieComponent.default || LottieComponent;
import '../../App.css';
import './MainPage.css';
import * as Images from '../../assets';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { useImageUpload } from '../../hooks/useImageUpload';
import { getModelPhoto, detectVirtualTryOnFileType } from '../../services/imageService';
import { debugVirtualTryOn } from '../../utils/debugVirtualTryOn';
import ModelViewer from '../../components/3D/ModelViewer';

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { statusMessage, resultImage, handleFileSelectedForClothesUpload } = useImageUpload();
  const [isVirtualTrying, setIsVirtualTrying] = useState(false);
  const [virtualTryingClothes, setVirtualTryingClothes] = useState('');
  const [virtualTryOnImage, setVirtualTryOnImage] = useState(null);
  const [virtualTryOnModel, setVirtualTryOnModel] = useState(null); // GLB 模型 URL
  const [show3DModel, setShow3DModel] = useState(false);
  const [virtualTryOnMode, setVirtualTryOnMode] = useState('2d'); // '2d', '3d', '2d+3d'
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [result2D, setResult2D] = useState(null); // 2D 試穿結果
  const [result3D, setResult3D] = useState(null); // 3D 試穿結果
  const [currentResultView, setCurrentResultView] = useState('auto'); // 'auto', '2d', '3d'
  const [hasBothResults, setHasBothResults] = useState(false); // 是否有 2D+3D 兩個結果
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

  // 從 localStorage 讀取虛擬試穿模式（持久化）
  useEffect(() => {
    const savedMode = localStorage.getItem('virtualTryOnMode');
    if (savedMode) {
      setVirtualTryOnMode(savedMode);
    }
  }, []);

  // 在組件首次掛載時清除虛擬試穿的臨時數據
  useEffect(() => {
    setIsVirtualTrying(false);
    isVirtualTryingRef.current = false;
    setVirtualTryingClothes('');
    setVirtualTryOnImage(null);
    setVirtualTryOnModel(null);
    setResult2D(null);
    setResult3D(null);
    setHasBothResults(false);
    setCurrentResultView('auto');
    
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
      setVirtualTryOnModel(null);
      setResult2D(null);
      setResult3D(null);
      setHasBothResults(false);
      setCurrentResultView('auto');
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
          const parsedData = JSON.parse(resultData);
          const { url, fileType, hasBothResults, result2D: res2D, result3D: res3D, currentView } = parsedData;
          
          console.log('✅ 虛擬試穿結果:', { url, fileType, hasBothResults, timestamp: new Date().toISOString() });

          // 🔍 記錄到歷史，用於調試
          const history = JSON.parse(sessionStorage.getItem('virtualTryOnHistory') || '[]');
          history.push({
            timestamp: new Date().toISOString(),
            url: url,
            fileType: fileType,
            hasBothResults: hasBothResults
          });
          sessionStorage.setItem('virtualTryOnHistory', JSON.stringify(history));
          console.log('📋 試穿歷史已更新，總數:', history.length);

          // 檢查是否有兩個結果
          if (hasBothResults && res2D && res3D) {
            console.log('🔄 檢測到 2D+3D 雙結果');
            setResult2D(res2D);
            setResult3D(res3D);
            setHasBothResults(true);
            setCurrentResultView(currentView || '3d'); // 預設顯示 3D

            // 根據 currentView 決定初始顯示
            if (currentView === '2d') {
              console.log('🖼️ 初始顯示 2D 結果');
              setVirtualTryOnImage(res2D.url);
              setVirtualTryOnModel(null);
              setShow3DModel(false);
              mutate('modelPhoto', res2D.url, false);
            } else {
              console.log('🎭 初始顯示 3D 結果');
              setVirtualTryOnModel(null);
              setVirtualTryOnImage(null);
              setShow3DModel(false);
              setTimeout(() => {
                setVirtualTryOnModel(res3D.url);
                setShow3DModel(true);
              }, 100);
            }
          } else {
            // 單個結果
            setResult2D(null);
            setResult3D(null);
            setHasBothResults(false);
            setCurrentResultView('auto');

            // 根據文件類型處理結果
            if (fileType === 'glb') {
              console.log('🎭 檢測到 GLB 模型，使用 3D 渲染');
              // 先清除舊的模型，強制重新加載
              setVirtualTryOnModel(null);
              setVirtualTryOnImage(null);
              setShow3DModel(false);
              // 異步設置新模型，確保舊模型已清除
              setTimeout(() => {
                setVirtualTryOnModel(url);
                setShow3DModel(true);
              }, 100);
            } else {
              console.log('🖼️ 檢測到 PNG 圖片，使用 2D 渲染');
              setVirtualTryOnModel(null);
              setVirtualTryOnImage(url);
              setShow3DModel(false);
              // 使用 SWR mutate 更新緩存
              mutate('modelPhoto', url, false);
            }
          }
          
          setIsVirtualTrying(false);
          isVirtualTryingRef.current = false;
          setVirtualTryingClothes('');
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
      setResult2D(null);
      setResult3D(null);
      setHasBothResults(false);
      setCurrentResultView('auto');
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
        
        {show3DModel ? (
          <div className="model-3d-container">
            {virtualTryOnModel ? (
              <ModelViewer
                modelPath={virtualTryOnModel}
                onClose={() => {
                  setShow3DModel(false);
                  setVirtualTryOnModel(null);
                }}
              />
            ) : (
              <ModelViewer
                modelPath="/3D/model3d_f532a1cf.glb"
                onClose={() => setShow3DModel(false)}
              />
            )}
          </div>
        ) : (
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
                  onClick={() => navigate('/virtual-tryon', { state: { virtualTryOnMode } })}
                  style={{ cursor: 'pointer' }}
                />
                <div className="model-hint">點擊試穿</div>
                
              </>
            )}
          </div>
        )}

        <button
          onClick={() => {
            // 如果有试穿结果，则切换试穿结果；否则切换 2D/3D 模型
            if (hasBothResults && result2D && result3D) {
              if (currentResultView === '3d') {
                setCurrentResultView('2d');
                setVirtualTryOnImage(result2D.url);
                setVirtualTryOnModel(null);
                setShow3DModel(false);
                mutate('modelPhoto', result2D.url, false);
              } else {
                setCurrentResultView('3d');
                setVirtualTryOnModel(null);
                setVirtualTryOnImage(null);
                setShow3DModel(false);
                setTimeout(() => {
                  setVirtualTryOnModel(result3D.url);
                  setShow3DModel(true);
                }, 100);
              }
            } else {
              setShow3DModel(!show3DModel);
            }
          }}
          className={`unified-view-button ${hasBothResults ? 'result-mode' : 'model-mode'}`}
          title={hasBothResults ? 
            (currentResultView === '3d' ? '切換到 2D 結果' : '切換到 3D 結果') : 
            (show3DModel ? '查看 2D 模型' : '查看 3D 模型')
          }
        >
          {hasBothResults ? (
            <>
              <span className="view-icon">🔄</span>
              <span className="view-label">{currentResultView === '3d' ? '看2D' : '看3D'}</span>
            </>
          ) : (
            <>
              <span className="view-icon">📦</span>
              <span className="view-label">{show3DModel ? '2D' : '3D'}</span>
            </>
          )}
        </button>

        {/* 虛擬試穿模式選擇器 */}
        <div className="virtual-tryon-mode-selector">
          <button
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className="mode-selector-button"
            title="選擇虛擬試穿模式"
          >
            <span className="mode-icon">🎨</span>
            <span className="mode-label">{virtualTryOnMode === '2d' ? '2D' : virtualTryOnMode === '3d' ? '3D' : '2D+3D'}</span>
          </button>

          {showModeDropdown && (
            <div className="mode-dropdown">
              <button
                className={`mode-option ${virtualTryOnMode === '2d' ? 'active' : ''}`}
                onClick={() => {
                  setVirtualTryOnMode('2d');
                  localStorage.setItem('virtualTryOnMode', '2d');
                  setShowModeDropdown(false);
                }}
              >
                試穿2D
              </button>
              <button
                className={`mode-option ${virtualTryOnMode === '3d' ? 'active' : ''}`}
                onClick={() => {
                  setVirtualTryOnMode('3d');
                  localStorage.setItem('virtualTryOnMode', '3d');
                  setShowModeDropdown(false);
                }}
              >
                試穿3D
              </button>
              <button
                className={`mode-option ${virtualTryOnMode === '2d+3d' ? 'active' : ''}`}
                onClick={() => {
                  setVirtualTryOnMode('2d+3d');
                  localStorage.setItem('virtualTryOnMode', '2d+3d');
                  setShowModeDropdown(false);
                }}
              >
                試穿2D+3D
              </button>
            </div>
          )}
        </div>

        {isVirtualTrying && (
          <div className="virtual-tryon-status-overlay">
            <div className="lottie-container">
              <Lottie 
                animationData={Images.tryon_loading} 
                loop={true} 
              />
            </div>
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