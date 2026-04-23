import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../../App.css';
import '../Login/LoginPage.css';
import './ClothesInfoPage.css';
import Navigation from '../../components/Navigation/Navigation';
import BackButton from '../../components/Header/BackButton';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { getClothesDetail, updateClothesWithImage, deleteClothes, toggleClothesLike } from '../../services/imageService';
import { API_URL } from '../../services/api';
import * as Images from '../../assets';

const ClothesInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clothesId } = useParams();

  // 狀態管理
  const [clothesData, setClothesData] = useState(null);
  const [originalClothesData, setOriginalClothesData] = useState(null);
  const [isDevImage, setIsDevImage] = useState(false);
  const [sleeveLength, setSleeveLength] = useState('');
  const [pantLength, setPantLength] = useState('');
  const [shoulderWidth, setShoulderWidth] = useState('');
  const [waistCircumference, setWaistCircumference] = useState('');
  const [clothesType, setClothesType] = useState('');
  const [clothesStyles, setClothesStyles] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // 在組件掛載時調用 API 獲取衣服詳細信息
  useEffect(() => {
    fetchClothesDetail();
  }, [clothesId]);

  // 檢查是否有變動
  useEffect(() => {
    if (!clothesData || !originalClothesData) return;

    const hasDataChanges = 
      parseFloat(sleeveLength) !== (originalClothesData.clothes_arm_length || 0) ||
      parseFloat(pantLength) !== (originalClothesData.clothes_leg_length || 0) ||
      parseFloat(shoulderWidth) !== (originalClothesData.clothes_shoulder_width || 0) ||
      parseFloat(waistCircumference) !== (originalClothesData.clothes_waistline || 0);

    setHasChanges(hasDataChanges);
  }, [sleeveLength, pantLength, shoulderWidth, waistCircumference, clothesData, originalClothesData]);

  // 調用 API 獲取衣服詳細信息
  const fetchClothesDetail = async () => {
    try {
      console.log('📍 開始載入衣服詳細信息，clothesId:', clothesId);
      setIsLoading(true);
      setError('');

      // 檢查是否是開發衣服
      if (location.state?.isDevImage) {
        console.log('📌 這是開發圖片，使用虛擬數據');
        setIsDevImage(true);
        
        const devData = {
          clothes_uid: clothesId,
          clothes_image_url: Images.test_clothes,
          clothes_category: '開發',
          clothes_arm_length: 0,
          clothes_leg_length: 0,
          clothes_shoulder_width: 0,
          clothes_waistline: 0,
          clothes_favorite: false,
          is_dev_clothes: true,
          styles: [{ style_name: '開發' }],
        };
        
        setClothesData(devData);
        setOriginalClothesData(devData);
        setSleeveLength(devData.clothes_arm_length || 0);
        setPantLength(devData.clothes_leg_length || 0);
        setShoulderWidth(devData.clothes_shoulder_width || 0);
        setWaistCircumference(devData.clothes_waistline || 0);
        setClothesType(devData.clothes_category || '');
        setClothesStyles(devData.styles || []);
        setIsFavorite(devData.clothes_favorite || false);
        setIsLoading(false);
        return;
      }

      if (!clothesId) {
        throw new Error('缺少衣服ID (clothesId)');
      }

      const data = await getClothesDetail(clothesId);
      console.log('✅ 獲取衣服詳細信息成功:', data);

      setClothesData(data);
      setOriginalClothesData(data);
      
      // 初始化表單
      setSleeveLength(data.clothes_arm_length || 0);
      setPantLength(data.clothes_leg_length || 0);
      setShoulderWidth(data.clothes_shoulder_width || 0);
      setWaistCircumference(data.clothes_waistline || 0);
      setClothesType(data.clothes_category || '');
      setClothesStyles(data.styles || []);
      setIsFavorite(data.clothes_favorite || false);
    } catch (err) {
      console.error('❌ 獲取衣服詳細信息失敗:', err);
      const errorMsg = err.message || '無法載入衣服信息';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 轉換 URL 為完整的後端 URL
  const getFullImageUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const currentHost = window.location.hostname;
      const currentProtocol = window.location.protocol;
      
      if (url.includes('localhost:9000') || url.includes('192.168.')) {
        return url.replace(/https?:\/\/(localhost|[\d.]+)(:9000)?/, `${currentProtocol}//${currentHost}:9000`);
      }
      return url;
    }
    
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
      if (value === '' || value === null || value === undefined) {
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

  // 處理切換喜歡狀態
  const handleToggleLike = async () => {
    // 開發衣服只在本地切換
    if (isDevImage) {
      console.log('📌 開發衣服 - 本地切換喜歡狀態');
      setIsFavorite(!isFavorite);
      return;
    }

    setIsTogglingLike(true);
    setError('');

    try {
      const result = await toggleClothesLike(clothesId);
      console.log('✅ 切換喜歡狀態成功:', result);

      // 更新本地狀態
      const newFavoriteStatus = result.clothes_favorite !== undefined 
        ? result.clothes_favorite 
        : !isFavorite;
      setIsFavorite(newFavoriteStatus);

      // 也更新 clothesData 中的狀態
      setClothesData({
        ...clothesData,
        clothes_favorite: newFavoriteStatus
      });
    } catch (err) {
      console.error('切換喜歡狀態失敗:', err);
      const errorMsg = err.message || '切換喜歡狀態失敗';
      setError(errorMsg);
    } finally {
      setIsTogglingLike(false);
    }
  };
  const handleUpdateClothes = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsUpdating(true);
    setStatusMessage('正在更新衣服...');
    setError('');

    try {
      // 如果是開發衣服，只更新本地狀態
      if (isDevImage) {
        console.log('📌 開發衣服 - 跳過後端更新');
        setStatusMessage('開發衣服已更新（本地測試）');
        
        setTimeout(() => {
          navigate('/wardrobe');
        }, 2000);
        return;
      }

      const measurements = {
        sleeve_length: parseFloat(sleeveLength),
        pant_length: parseFloat(pantLength),
        shoulder_width: parseFloat(shoulderWidth),
        waist_circumference: parseFloat(waistCircumference),
      };

      const result = await updateClothesWithImage(
        clothesId,
        null,
        measurements
      );

      console.log('✅ 衣服更新成功:', result);
      setStatusMessage('衣服已更新');
      setError('');
      
      // 更新衣服數據
      if (result) {
        setClothesData(result);
        setOriginalClothesData(result);
      }

      // 2秒後返回衣櫃
      setTimeout(() => {
        navigate('/wardrobe');
      }, 2000);
    } catch (err) {
      console.error('更新失敗:', err);
      const errorMsg = err.message || '更新失敗，請重試';
      setStatusMessage('');
      setError(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // 處理刪除衣服按鈕點擊
  const handleDeleteClothes = async () => {
    if (!window.confirm('確定要刪除此衣服嗎？此操作無法撤銷')) {
      return;
    }

    setIsDeleting(true);
    setStatusMessage('正在刪除衣服...');
    setError('');

    try {
      // 如果是開發衣服，只返回衣櫃
      if (isDevImage) {
        console.log('📌 開發衣服 - 跳過後端刪除');
        setStatusMessage('開發衣服已刪除（本地測試）');
        
        setTimeout(() => {
          navigate('/wardrobe');
        }, 2000);
        return;
      }

      const result = await deleteClothes(clothesId);

      console.log('✅ 衣服刪除成功:', result);
      setStatusMessage('衣服已刪除');
      setError('');

      // 2秒後返回衣櫃
      setTimeout(() => {
        navigate('/wardrobe');
      }, 2000);
    } catch (err) {
      console.error('刪除失敗:', err);
      const errorMsg = err.message || '刪除失敗，請重試';
      setStatusMessage('');
      setError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // 處理取消按鈕點擊
  const handleCancel = () => {
    if (hasChanges) {
      if (!window.confirm('您有未保存的更改，確定要放棄嗎？')) {
        return;
      }
    }
    navigate('/wardrobe');
  };

  // 處理新的文件上傳（來自 BottomNavigation）
  const handleFileSelected = (file, onComplete) => {
    if (!file) {
      onComplete();
      return;
    }

    // 導航回衣櫃頁面，傳遞文件讓衣櫃進行上傳處理
    navigate('/wardrobe', { state: { fileToUpload: file } });
    onComplete();
  };

  // 如果還在加載，顯示加載狀態
  if (isLoading) {
    return (
      <div className="container">
        <Navigation position="top" />
        <BackButton />
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p>正在載入衣服信息...</p>
        </div>
        <BottomNavigation onFileSelected={handleFileSelected} />
      </div>
    );
  }

  // 如果發生錯誤，顯示錯誤信息（但保留 BottomNavigation）
  if (error && !clothesData) {
    console.error('❌ ClothesInfoPage 錯誤 - clothesId:', clothesId, 'error:', error);
    return (
      <div className="container">
        <Navigation position="top" />
        <BackButton />
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px 16px',
          margin: '12px 16px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
        <button
          className="login-btn"
          onClick={() => navigate('/wardrobe')}
          style={{ marginTop: '200px', marginLeft: '60px' }}
        >
          返回衣櫃
        </button>

        <BottomNavigation onFileSelected={handleFileSelected} />
      </div>
    );
  }

  return (
    <div className="container">
      <Navigation position="top" />
      <BackButton />

      {/* 主要內容區域 */}
      <div className="clothes-info-content">
        {/* 開發衣服提示 */}
        {isDevImage && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '12px 16px',
            margin: '12px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🔧 這是開發衣服（本地測試模式）
          </div>
        )}

        {/* 衣服圖片區域 */}
        {clothesData && (
          <div 
            className="clothes-image-section"
          >
            <img
              src={isDevImage ? clothesData.clothes_image_url : getFullImageUrl(clothesData.clothes_image_url)}
              alt="clothes-image"
              className="clothes-image"
            />
            {/* 喜歡按鈕 */}
            <button
              className={`clothes-like-btn ${isFavorite ? 'liked' : ''}`}
              onClick={handleToggleLike}
              disabled={isTogglingLike || isUpdating || isDeleting}
              title={isFavorite ? '取消喜歡' : '加入喜歡'}
              aria-label={isFavorite ? '取消喜歡' : '加入喜歡'}
            >
              <span className="heart-icon">♡</span>
            </button>
          </div>
        )}

        {/* 衣服類型和風格顯示區 */}
        <div className="clothes-info-section">
          {/* 類型顯示 */}
          <div className="clothes-info-group">
            <label>衣服類型</label>
            <div className="clothes-info-value">{clothesType}</div>
          </div>

          {/* 風格顯示 */}
          <div className="clothes-info-group">
            <label>風格</label>
            <div className="clothes-info-value">
              {clothesStyles && clothesStyles.length > 0 
                ? clothesStyles.map(style => style.style_name).join('、')
                : '未設定'
              }
            </div>
          </div>
        </div>

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
              disabled={isUpdating || isDeleting}
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
              disabled={isUpdating || isDeleting}
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
              disabled={isUpdating || isDeleting}
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
              disabled={isUpdating || isDeleting}
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

        {/* 按鈕組 */}
        <div className="button-group">
          {/* 更新衣服按鈕 */}
          <button
            className="update-btn"
            onClick={handleUpdateClothes}
            disabled={isUpdating || isDeleting || !hasChanges}
          >
            {isUpdating ? '更新中...' : '更新衣服'}
          </button>

          {/* 刪除衣服按鈕 */}
          <button
            className="delete-btn"
            onClick={handleDeleteClothes}
            disabled={isUpdating || isDeleting}
          >
            {isDeleting ? '刪除中...' : '刪除衣服'}
          </button>

          {/* 取消按鈕 */}
          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={isUpdating || isDeleting}
          >
            取消
          </button>
        </div>
      </div>

      <BottomNavigation onFileSelected={handleFileSelected} />
    </div>
  );
};

export default ClothesInfoPage;
