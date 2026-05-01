import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 引入頁面
import LoginPage from './pages/Login/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import UserInfoPage from './pages/Profile/UserInfoPage';
import ModelPage from './pages/Model/ModelPage';
import WardrobePage from './pages/Wardrobe/WardrobePage';
import UploadClothesPage from './pages/UploadClothes/UploadClothesPage';
import ClothesInfoPage from './pages/ClothesInfo/ClothesInfoPage';
import VirtualTryOn from './pages/VirtualTryOn/VirtualTryOn';
import AIChatPage from './pages/AIChat/AIChatPage';
import FavoritesPage from './pages/Favorites/FavoritesPage';
import OutfitPage from './pages/Outfit/OutfitPage';

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

        {/* 變更身體數據頁面 */}
        <Route path="/user-info" element={<UserInfoPage />} />

        {/* 註冊頁面 */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 模特兒選擇頁面 */}
        <Route path="/model" element={<ModelPage />} />

        {/* 衣櫃頁面 */}
        <Route path="/wardrobe" element={<WardrobePage />} />

        {/* 穿搭詳情頁面 */}
        <Route path="/outfit/:modelId" element={<OutfitPage />} />

        {/* 上傳衣服頁面 */}
        <Route path="/upload-clothes" element={<UploadClothesPage />} />

        {/* 衣服詳細信息頁面 */}
        <Route path="/clothes/:clothesId" element={<ClothesInfoPage />} />

        {/* 收藏頁面 */}
        <Route path="/favorites" element={<FavoritesPage />} />

        {/* 虛擬試穿頁面 */}
        <Route path="/virtual-tryon" element={<VirtualTryOn />} />

        {/* AI 穿搭助手頁面 */}
        <Route path="/ai-chat" element={<AIChatPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;