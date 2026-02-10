import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 引入我們剛剛做好的兩個頁面
import LoginPage from './pages/Login/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import RegisterPage from './pages/Register/RegisterPage';
import RegisterSuccessPage from './pages/Register/RegisterSuccessPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 設定路徑規則 */}
        
        {/* 首頁 */}
        <Route path="/" element={<LoginPage />} />

        {/* 主畫面 */}
        <Route path="/home" element={<MainPage />} />
        
        {/* 註冊頁面 */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-success" element={<RegisterSuccessPage />} />

        {/* 如果亂打網址，通通導回登入頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;