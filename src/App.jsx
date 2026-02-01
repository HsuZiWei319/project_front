import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 引入我們剛剛做好的兩個頁面
import LoginPage from './LoginPage';
import MainPage from './MainPage';

// 如果有共用的 CSS (例如背景設定)，可以在這裡引入
import './App.css'; 

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 設定路徑規則 */}
        
        {/* 1. 首頁 (路徑為 / ) -> 顯示登入頁 */}
        <Route path="/" element={<LoginPage />} />

        {/* 2. 主畫面 (路徑為 /home) -> 顯示主要功能頁 */}
        <Route path="/home" element={<MainPage />} />

        {/* (選用) 3. 如果亂打網址，通通導回登入頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;