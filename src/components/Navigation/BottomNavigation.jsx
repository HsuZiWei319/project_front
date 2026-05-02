import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Images from '../../assets';

const BottomNavigation = ({ onFileSelected }) => {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleAddButtonClick = () => {
    // 檢查是否正在處理，如果在處理就不能按
    if (isProcessing) return;
    
    // 透過Ref去觸發隱藏input
    fileInputRef.current?.click();
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
