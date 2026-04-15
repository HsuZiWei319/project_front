import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import '../ClothesInfo/ClothesInfoPage.css';
import Navigation from '../../components/Navigation/Navigation';
import BackButton from '../../components/Header/BackButton';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { updateUserInfo, getUserInfo } from '../../services/userService';

const UserInfoPage = () => {
  const navigate = useNavigate();

  // 狀態管理
  const [userHeight, setUserHeight] = useState('');
  const [userWeight, setUserWeight] = useState('');
  const [userArmLength, setUserArmLength] = useState('');
  const [userShoulderWidth, setUserShoulderWidth] = useState('');
  const [userWaistline, setUserWaistline] = useState('');
  const [userLegLength, setUserLegLength] = useState('');

  const [statusMessage, setStatusMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 在組件掛載時調用 API 獲取用戶身體數據
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log('📍 開始載入用戶身體數據');
        setIsLoading(true);
        setError('');

        const data = await getUserInfo();
        console.log('✅ 獲取用戶身體數據成功:', data);

        // 設定表單值
        setUserHeight(data.user_height || '');
        setUserWeight(data.user_weight || '');
        setUserArmLength(data.user_arm_length || '');
        setUserShoulderWidth(data.user_shoulder_width || '');
        setUserWaistline(data.user_waistline || '');
        setUserLegLength(data.user_leg_length || '');
      } catch (err) {
        console.error('❌ 獲取用戶身體數據失敗:', err);
        // 即使獲取失敗，也允許用戶輸入新數據
        setError('無法載入現有數據，您可以輸入新數據');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 驗證輸入的數字
  const validateInputs = () => {
    const fields = {
      '身高': userHeight,
      '體重': userWeight,
      '臂長': userArmLength,
      '肩寬': userShoulderWidth,
      '腰圍': userWaistline,
      '腿長': userLegLength,
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

  // 處理更新用戶身體數據按鈕點擊
  const handleUpdateUserInfo = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsUpdating(true);
    setStatusMessage('正在更新身體數據...');
    setError('');

    try {
      const userInfo = {
        user_height: parseFloat(userHeight),
        user_weight: parseFloat(userWeight),
        user_arm_length: parseFloat(userArmLength),
        user_shoulder_width: parseFloat(userShoulderWidth),
        user_waistline: parseFloat(userWaistline),
        user_leg_length: parseFloat(userLegLength),
      };

      const result = await updateUserInfo(userInfo);

      console.log('✅ 身體數據更新成功:', result);
      setStatusMessage('身體數據已更新');
      setError('');

      // 2秒後返回個人檔案頁面
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('更新失敗:', err);
      const errorMsg = err.response?.data?.detail || err.message || '更新失敗，請重試';
      setStatusMessage('');
      setError(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // 處理取消按鈕點擊
  const handleCancel = () => {
    navigate('/profile');
  };

  // 處理新的文件上傳（來自 BottomNavigation）
  const handleFileSelected = (file, onComplete) => {
    if (!file) {
      onComplete();
      return;
    }

    // 導航回個人檔案頁面
    navigate('/profile', { state: { fileToUpload: file } });
    onComplete();
  };

  return (
    <div className="container">
      <Navigation position="top" />
      <BackButton />

      {/* 主要內容區域 */}
      <div className="clothes-info-content">
        {/* 加載狀態 */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', marginTop: '100px' }}>
            <p>正在載入身體數據...</p>
          </div>
        )}

        {/* 正常內容 */}
        {!isLoading && (
          <>
            {/* 標題 */}
            <div style={{ marginBottom: '30px', textAlign: 'center', marginTop: '80px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>變更身體數據</h1>
            </div>

            {/* 測量數據輸入區 */}
            <div className="measurements-section">
              {/* 身高 */}
              <div className="measurement-input-group">
                <label>身高(cm)</label>
                <input
                  type="number"
                  value={userHeight}
                  onChange={(e) => setUserHeight(e.target.value)}
                  placeholder="輸入身高"
                  disabled={isUpdating}
                />
              </div>

              {/* 體重 */}
              <div className="measurement-input-group">
                <label>體重(kg)</label>
                <input
                  type="number"
                  value={userWeight}
                  onChange={(e) => setUserWeight(e.target.value)}
                  placeholder="輸入體重"
                  disabled={isUpdating}
                />
              </div>

              {/* 臂長 */}
              <div className="measurement-input-group">
                <label>臂長(cm)</label>
                <input
                  type="number"
                  value={userArmLength}
                  onChange={(e) => setUserArmLength(e.target.value)}
                  placeholder="輸入臂長"
                  disabled={isUpdating}
                />
              </div>

              {/* 肩寬 */}
              <div className="measurement-input-group">
                <label>肩寬(cm)</label>
                <input
                  type="number"
                  value={userShoulderWidth}
                  onChange={(e) => setUserShoulderWidth(e.target.value)}
                  placeholder="輸入肩寬"
                  disabled={isUpdating}
                />
              </div>

              {/* 腰圍 */}
              <div className="measurement-input-group">
                <label>腰圍(cm)</label>
                <input
                  type="number"
                  value={userWaistline}
                  onChange={(e) => setUserWaistline(e.target.value)}
                  placeholder="輸入腰圍"
                  disabled={isUpdating}
                />
              </div>

              {/* 腿長 */}
              <div className="measurement-input-group">
                <label>腿長(cm)</label>
                <input
                  type="number"
                  value={userLegLength}
                  onChange={(e) => setUserLegLength(e.target.value)}
                  placeholder="輸入腿長"
                  disabled={isUpdating}
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
              {/* 上傳按鈕 */}
              <button
                className="update-btn"
                onClick={handleUpdateUserInfo}
                disabled={isUpdating}
              >
                {isUpdating ? '上傳中...' : '上傳'}
              </button>

              {/* 取消按鈕 */}
              <button
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                取消
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNavigation onFileSelected={handleFileSelected} />
    </div>
  );
};

export default UserInfoPage;
