import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 引入頁面
import LoginPage from './pages/Login/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 設定路徑規則 */}
        
        {/* 首頁 */}
        <Route path="/" element={<LoginPage />} />

        {/* 主畫面 */}
        <Route path="/home" element={<MainPage />} />
        
        {/* 個人檔案頁面 */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* 註冊頁面 */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 如果亂打網址，通通導回登入頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;