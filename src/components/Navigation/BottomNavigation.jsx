import React, { useRef, useState } from 'react';
import * as Images from '../../assets';

const BottomNavigation = ({ onFileSelected }) => {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddButtonClick = () => {
    // 檢查是否正在處理，如果在處理就不能按
    if (isProcessing) return;
    
    // 透過Ref去觸發隱藏input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // 调用父组件传来的回调函数，让父组件处理文件上传逻辑
    if (onFileSelected) {
      onFileSelected(file, () => {
        // 上传完成后的回调函数
        setIsProcessing(false);
        // 清除 input 值，允许再次选择同一个文件
        event.target.value = '';
      });
    }
  };

  return (
    <>
      <div className="shared-nav bottom-nav">
        <div className="home-card"> 
          <img src={Images.icon_home} alt="主畫面" className="home-icon"/>
          <div className="home-text">主畫面</div>
        </div>
        
        <div className="add-button-container" onClick={handleAddButtonClick}>
          <img src={Images.button_plus} alt="新增" className="plus-icon"/>
        </div>

        <div className="notification-card"> 
          <img src={Images.icon_notification} alt="通知" className="notification-icon"/>
          <div className="notification-text">通知</div>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
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
