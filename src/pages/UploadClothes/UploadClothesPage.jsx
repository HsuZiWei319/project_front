import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import '../Login/LoginPage.css';
import './UploadClothesPage.css';
import Navigation from '../../components/Navigation/Navigation';
import BackButton from '../../components/Header/BackButton';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { uploadClothesWithMeasurements } from '../../services/imageService';
import { API_URL } from '../../services/api';

const UploadClothesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 狀態管理
  const [uploadedImage, setUploadedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [sleeveLength, setSleeveLength] = useState('');
  const [pantLength, setPantLength] = useState('');
  const [shoulderWidth, setShoulderWidth] = useState('');
  const [waistCircumference, setWaistCircumference] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 從位置狀態中提取上傳的圖片
  useEffect(() => {
    if (location.state?.uploadedImage) {
      setUploadedImage(location.state.uploadedImage);
      console.log('✅ 已收到上傳的圖片:', location.state.uploadedImage);
    } else {
      console.warn('⚠️ 未找到上傳的圖片');
      // 如果沒有圖片，導航回上一頁
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    }
  }, [location.state, navigate]);

  // 轉換 URL 為完整的後端 URL（如果需要）
  const getFullImageUrl = (url) => {
    if (!url) return '';
    
    // 如果已經是完整的 URL（以 http:// 或 https:// 開頭）
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // 獲取當前頁面的域名和協議
      const currentHost = window.location.hostname;
      const currentProtocol = window.location.protocol;
      
      // 如果使用了 localhost 或局域網 IP，轉換為當前頁面的域名
      if (url.includes('localhost:9000') || url.includes('192.168.')) {
        // 將任何 http://localhost:9000 或 http://192.168.x.x:9000 轉換為當前頁面的域名
        return url.replace(/https?:\/\/(localhost|[\d.]+)(:9000)?/, `${currentProtocol}//${currentHost}:9000`);
      }
      return url;
    }
    
    // 如果是相對路徑，組合成完整的後端 URL
    if (url.startsWith('/')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  // 驗證輸入的數字
  const validateInputs = () => {
    const fields = {
      '袖長': sleeveLength,
      '褲長': pantLength,
      '肩寬': shoulderWidth,
      '腰圍': waistCircumference,
    };

    for (const [name, value] of Object.entries(fields)) {
      if (!value || value.toString().trim() === '') {
        setError(`請輸入${name}`);
        return false;
      }
      if (isNaN(value) || Number(value) < 0) {
        setError(`${name}必須是非負數`);
        return false;
      }
    }
    return true;
  };

  // 處理上傳衣服按鈕點擊
  const handleUploadClothes = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setStatusMessage('正在上傳衣服...');
    setError('');

    try {
      // 調用API上傳衣服和測量數據
      const measurements = {
        sleeve_length: parseFloat(sleeveLength),
        pant_length: parseFloat(pantLength),
        shoulder_width: parseFloat(shoulderWidth),
        waist_circumference: parseFloat(waistCircumference),
      };

      const result = await uploadClothesWithMeasurements(
        location.state?.file,
        measurements
      );

      console.log('✅ 衣服上傳成功:', result);
      setStatusMessage('');
      setError('');
      
      // 設置返回的衣服圖片，並將相對路徑轉換為完整 URL
      if (result.processed_url) {
        const fullUrl = getFullImageUrl(result.processed_url);
        console.log('📸 完整圖片 URL:', fullUrl);
        setResultImage(fullUrl);
      }
    } catch (err) {
      console.error('上傳失敗:', err);
      const errorMsg = err.message || '上傳失敗，請重試';
      setStatusMessage('');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 處理確定按鈕點擊
  const handleConfirm = () => {
    navigate('/wardrobe');
  };

  // 處理新的文件上傳（來自 BottomNavigation）
  const handleFileSelected = (file, onComplete) => {
    // 暫存文件，導航回到同一頁面重新開始流程
    const reader = new FileReader();
    reader.onload = (e) => {
      navigate('/upload-clothes', {
        state: {
          uploadedImage: e.target.result,
          file: file,
        },
      });
      onComplete();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container">
      <Navigation position="top" />
      <BackButton />

      {/* 主要內容區域 */}
      <div className="upload-clothes-content">
        {/* 如果有結果圖片，顯示結果並隱藏輸入表單 */}
        {resultImage ? (
          <>
            {/* 結果圖片區域 */}
            <div className="result-image-section">
              <img 
                src={resultImage} 
                alt="processed-clothes" 
                className="result-image"
                onLoad={() => console.log('✅ 圖片加載成功:', resultImage)}
                onError={() => console.error('❌ 圖片加載失敗:', resultImage)}
              />
            </div>

            {/* 狀態信息顯示 */}
            {statusMessage && (
              <div className="status-message">
                {statusMessage}
              </div>
            )}

            {/* 確定按鈕 */}
            <button
              className="login-btn confirm-btn"
              onClick={handleConfirm}
            >
              確定
            </button>
          </>
        ) : (
          <>
            {/* 已上傳的圖片 */}
            {uploadedImage && (
              <div className="uploaded-image-section">
                <img src={uploadedImage} alt="uploaded-clothes" className="uploaded-image" />
              </div>
            )}

            {/* 測量數據輸入區 */}
            <div className="measurements-section">
          {/* 袖長 */}
          <div className="measurement-input-group">
            <label>袖長(cm)</label>
            <input
              type="number"
              value={sleeveLength}
              onChange={(e) => setSleeveLength(e.target.value)}
              placeholder="輸入數字"
              disabled={isLoading}
            />
          </div>

          {/* 褲長 */}
          <div className="measurement-input-group">
            <label>褲長(cm)</label>
            <input
              type="number"
              value={pantLength}
              onChange={(e) => setPantLength(e.target.value)}
              placeholder="輸入數字"
              disabled={isLoading}
            />
          </div>

          {/* 肩寬 */}
          <div className="measurement-input-group">
            <label>肩寬(cm)</label>
            <input
              type="number"
              value={shoulderWidth}
              onChange={(e) => setShoulderWidth(e.target.value)}
              placeholder="輸入數字"
              disabled={isLoading}
            />
          </div>

          {/* 腰圍 */}
          <div className="measurement-input-group">
            <label>腰圍(cm)</label>
            <input
              type="number"
              value={waistCircumference}
              onChange={(e) => setWaistCircumference(e.target.value)}
              placeholder="輸入數字"
              disabled={isLoading}
            />
            </div>
          </div>

          {/* 錯誤信息顯示 */}
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {/* 狀態信息顯示 */}
          {statusMessage && (
            <div className="status-message">
              {statusMessage}
            </div>
          )}

          {/* 上傳衣服按鈕 */}
          <button
            className="login-btn upload-clothes-btn"
            onClick={handleUploadClothes}
            disabled={isLoading}
          >
            {isLoading ? '上傳中...' : '上傳衣服'}
          </button>
          </>
        )}
      </div>

      <BottomNavigation onFileSelected={handleFileSelected} />
    </div>
  );
};

export default UploadClothesPage;
