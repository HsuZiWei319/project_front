import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 引入頁面
import LoginPage from './pages/Login/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ModelPage from './pages/Model/ModelPage';
import WardrobePage from './pages/Wardrobe/WardrobePage';
import UploadClothesPage from './pages/UploadClothes/UploadClothesPage';
import ClothesInfoPage from './pages/ClothesInfo/ClothesInfoPage';

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

        {/* 模特兒選擇頁面 */}
        <Route path="/model" element={<ModelPage />} />

        {/* 衣櫃頁面 */}
        <Route path="/wardrobe" element={<WardrobePage />} />

        {/* 上傳衣服頁面 */}
        <Route path="/upload-clothes" element={<UploadClothesPage />} />

        {/* 衣服詳細信息頁面 */}
        <Route path="/clothes/:clothesId" element={<ClothesInfoPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;