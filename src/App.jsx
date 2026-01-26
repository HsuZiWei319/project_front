import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css'; 

const App = () => {
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
      {/* --- 這一塊是隱藏的 Input，這行最重要，不要刪掉 --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} // 讓它消失在畫面上
        onChange={handleFileChange}
        accept="image/*" // 限制只能選圖片
      />
      {/* ----------------------------------------------- */}

      {/* 頂部導覽列 ( header) */}
      <div className="header">
        {/* ...圖示 icons... */}
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
      <div className="bottom-nav">
        <div className="nav-icon">🏠<br/>主畫面</div>
        
        {/* --- 按鈕 --- */}
        <div className="add-button-container" onClick={handleBlackButtonClick}>
          <div className="black-circle">
            <span className="plus-sign">+</span>
          </div>
        </div>
        {/* --------------------- */}

        <div className="nav-icon">🔔<br/>通知</div>
      </div>
    </div>
  );
};

export default App;