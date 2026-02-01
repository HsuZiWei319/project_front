import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css'; 
import * as Images from './assets'; // 從 assets/index.js 匯入所有圖片

const MainPage = () => {
  // 讀取環境變數 (Vite 專用寫法)
  // 如果 .env 沒設定，就預設用 localhost 防止報錯

  const API_URL = import.meta.env.VITE_API_URL || "http://192.168.233.128:30000";

  // 1. 定義狀態：用來顯示中間的文字 (處理中 / 成功 / 失敗)
  const [statusMessage, setStatusMessage] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. 建立一個 Ref：用來抓取那個「隱藏的 input」
  const fileInputRef = useRef(null);

  // 3. 遙控器函式：當按下黑色按鈕時，觸發這個函式
  const handleBlackButtonClick = () => {
    // 檢查目前是否正在處理中，如果是就不要讓使用者重複按
    if (isProcessing) return; 
    
    // 透過 Ref 去點擊那個隱藏的 input
    fileInputRef.current.click();
  };

  // 4. 當使用者真的選了檔案後，會執行這個函式
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage("正在去背處理中..."); 
    
    // --- 修改重點 1: 建立 FormData 物件 ---
    const formData = new FormData();
    formData.append('image_data', file);      // 後端預期的檔案欄位
    formData.append('filename', file.name);   // 原始檔案名稱

    console.log("即將上傳 FormData 資料，檔案:", file.name);

    try {
      // 使用變數組出完整的網址
      const uploadUrl = `${API_URL}/api/upload-image`;

      console.log("正在連線至:", uploadUrl); // Debug 用
      
      // --- 修改重點 2: 改成 multipart/form-data 格式 ---
      const response = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, 
      });

      console.log("回傳結果:", response.data);
      
      // --- 修改重點 3: 接收正確的回傳欄位 ---
      // 根據規格表 Output 欄位
      if (response.data.processed_url) {
        setStatusMessage("去背成功！");
        // 如果有設一個 state 存結果圖，這裡可以更新
        setResultImage(response.data.processed_url); 
      } else {
        setStatusMessage("處理完成，但沒有回傳圖片連結");
      }
      
    } catch (error) {
      console.error("上傳失敗:", error);
      setStatusMessage("去背失敗，請檢查後端連線");
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const [resultImage, setResultImage] = useState(null);

  return (
    <div className="container">
      {/* --- 這一塊是隱藏的 Input --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} // 讓它消失在畫面上
        onChange={handleFileChange}
        accept="image/*" // 限制只能選圖片
      />

      {/* 頂部導覽列 ( header) */}
      <div className="shared-nav top-nav">
        <div className="profile-card"> 
          <img src={Images.icon_profile} alt="個人檔案" className="profile-icon"/>
          <div className="profile-text">
            個人檔案
          </div>
        </div>

        <img src={Images.line} alt="" className="divider-line" />

        <div className="like-card"> 
          <img src={Images.icon_like} alt="喜歡" className="like-icon" />
          <div className="like-text">
            喜歡
          </div>
        </div>

        <img src={Images.line} alt="" className="divider-line" />

        <div className="mode-card"> 
          <img src={Images.icon_mode} alt="模式" className="mode-icon" />
          <div className="mode-text">
            模式
          </div>
        </div>

        <img src={Images.line} alt="" className="divider-line" />
        
        <div className="setting-card"> 
          <img src={Images.icon_setting} alt="設定" className="setting-icon" />
          <div className="setting-text">
            設定
          </div>
        </div>

      </div>

      {/* 中間主要區塊 (Avatar 與 訊息顯示區) */}
      <div className="main-content">
        {/* 這裡放 3D 人偶圖 */}

        {/* 新增一個 wrapper (容器) 來包住兩張圖 */}
        <div className="avatar-wrapper">
          
          {/* 1. 底層：原本的 3D 人偶 (永遠顯示) */}
          <img src="/avatar-placeholder.png" alt="" className="avatar-img" />

          {/* 2. 上層：去背後的衣服 (如果有拿到 resultImage 才顯示) */}
          {resultImage && (
            <img src={resultImage} alt="Try-On" className="overlay-img" />
          )}

        </div>
        
        {/* --- 狀態文字顯示區 (絕對定位在中間) --- */}
        {statusMessage && (
          <div className="status-overlay">
            <h2>{statusMessage}</h2>
          </div>
        )}
      </div>

      {/* 底部導覽列 (Bottom Nav) */}
      <div className="shared-nav bottom-nav">
        <div className="home-card"> 
          <img src={Images.icon_home} alt="主畫面" className="home-icon"/>
          <div className="home-text">
            主畫面
          </div>
        </div>
        
        {/* --- 按鈕 --- */}
        <div className="add-button-container" onClick={handleBlackButtonClick}>
          <img src={Images.button_plus} alt="新增" className="plus-icon"/>
        </div>
        {/* --------------------- */}

        <div className="notification-card"> 
          <img src={Images.icon_notification} alt="通知" className="notification-icon"/>
          <div className="notification-text">
            通知
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;