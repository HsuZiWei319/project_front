import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Images from '../../assets';
import PhotoSourceModal from '../Dialog/PhotoSourceModal';
import CameraCapture from '../Dialog/CameraCapture';
import ImageCropper from '../Dialog/ImageCropper';

const BottomNavigation = ({ onFileSelected }) => {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const navigate = useNavigate();

  const handleAddButtonClick = () => {
    // 檢查是否正在處理，如果在處理就不能按
    if (isProcessing) return;
    
    // 打開照片源選擇模態框
    setShowPhotoSourceModal(true);
  };

  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // 調用父組件傳入的回調函數，並提供一個完成後的回調來重置狀態
    if (onFileSelected) {
      onFileSelected(file, () => {
        // 上傳完成後重置狀態
        setIsProcessing(false);
        // 清除文件輸入的值，讓同一個文件也能再次被選擇
        event.target.value = '';
      });
    }
  };

  // 處理從照片庫選擇照片
  const handleSelectFromLibrary = () => {
    setShowPhotoSourceModal(false);
    fileInputRef.current?.click();
  };

  // 處理直接拍照
  const handleSelectCamera = () => {
    setShowPhotoSourceModal(false);
    setShowCamera(true);
  };

  // 處理相機拍照完成
  const handleCameraCapture = (file) => {
    setCapturedImage(file);
    setShowCamera(false);
    setShowCropper(true);
  };

  // 處理裁切完成
  const handleCropComplete = (file) => {
    setShowCropper(false);
    setCapturedImage(null);
    
    setIsProcessing(true);
    
    // 調用父組件傳入的回調函數
    if (onFileSelected) {
      onFileSelected(file, () => {
        // 上傳完成後重置狀態
        setIsProcessing(false);
      });
    }
  };

  return (
    <>
      <div className="shared-nav bottom-nav">
        <div className="home-card" onClick={handleHomeClick}> 
          <img src={Images.icon_home} alt="主畫面" className="home-icon"/>
          <div className="home-text">主畫面</div>
        </div>
        
        <div 
          className="add-button-container" 
          onClick={handleAddButtonClick}
          title="上傳衣服照片"
          data-tooltip="上傳衣服照片"
        >
          <img src={Images.button_plus} alt="新增" className="plus-icon"/>
        </div>

        <div className="notification-card" onClick={handleNotificationClick} style={{ cursor: 'pointer' }}> 
          <img src={Images.icon_notification} alt="通知" className="notification-icon"/>
          <div className="notification-text">通知</div>
        </div>
      </div>

      {/* 照片源選擇模態框 */}
      <PhotoSourceModal
        isOpen={showPhotoSourceModal}
        onClose={() => setShowPhotoSourceModal(false)}
        onSelectFromLibrary={handleSelectFromLibrary}
        onSelectCamera={handleSelectCamera}
      />

      {/* 相機拍照組件 */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />

      {/* 圖像裁切組件 */}
      <ImageCropper
        isOpen={showCropper}
        imageSrc={capturedImage}
        onClose={() => {
          setShowCropper(false);
          setCapturedImage(null);
        }}
        onCropComplete={handleCropComplete}
      />

      {/* 隱藏文件輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
      />
    </>
  );
};

export default BottomNavigation;
