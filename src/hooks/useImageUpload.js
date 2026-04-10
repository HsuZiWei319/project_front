import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImageForProcessing } from '../services/imageService';

/**
 * 自定義 Hook 用於統一處理圖片上傳邏輯
 * @param {Object} options - 配置選項
 * @param {string} options.redirectPath - 上傳完成後的跳轉路徑 (預設: '/home')
 * @param {boolean} options.redirectImmediate - 是否立即跳轉 (預設: false)
 * @returns {Object} - 包含上傳狀態和處理函數
 */
export const useImageUpload = (options = {}) => {
  const { redirectPath = '/home', redirectImmediate = false } = options;
  const navigate = useNavigate();

  const [statusMessage, setStatusMessage] = useState('');
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 處理文件上傳
   * @param {File} file - 要上傳的文件
   * @param {Function} onComplete - 上傳完成的回調函數
   */
  const handleFileSelected = async (file, onComplete = () => {}) => {
    if (!file) {
      onComplete();
      return;
    }

    setIsLoading(true);
    setStatusMessage('正在去背處理中...');
    setError('');

    try {
      const imageUrl = await uploadImageForProcessing(file);
      setStatusMessage(''); // 成功後清空狀態訊息
      setResultImage(imageUrl);
      setError('');

      console.log('✅ 圖片上傳成功:', imageUrl);

      // 如果配置為立即跳轉，則導航到指定路徑
      if (redirectImmediate && redirectPath) {
        setTimeout(() => {
          navigate(redirectPath);
        }, 500);
      }
    } catch (err) {
      console.error('上傳失敗:', err);
      const errorMsg = '去背失敗，請檢查後端連線';
      setStatusMessage(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      onComplete();
    }
  };

  /**
   * 導航並傳遞文件給目標頁面進行上傳
   * 用於無需在當前頁面處理上傳邏輯的頁面
   * @param {File} file - 要上傳的文件
   * @param {string} targetPath - 目標路徑
   * @param {Function} onComplete - 完成回調
   */
  const handleFileSelectedWithRedirect = (
    file,
    targetPath = redirectPath,
    onComplete = () => {}
  ) => {
    if (!file) {
      onComplete();
      return;
    }

    navigate(targetPath, { state: { fileToUpload: file } });
    onComplete();
  };

  /**
   * 清空上傳的圖片和狀態
   */
  const clearImage = () => {
    setResultImage(null);
    setStatusMessage('');
    setError('');
  };

  return {
    // 狀態
    statusMessage,
    resultImage,
    isLoading,
    error,

    // 方法
    handleFileSelected,
    handleFileSelectedWithRedirect,
    clearImage,
    setResultImage,
    setStatusMessage,
  };
};
