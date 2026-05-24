import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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
import SettingPage from './pages/Setting/SettingPage';
import NotificationPage from './pages/Notification/NotificationPage';
import CrawlerPage from './pages/Crawler/CrawlerPage';
import Test3D from './components/3D/Test3D';

// 全局虛擬試穿事件處理組件
const VirtualTryOnEventHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const handleVirtualTryOnComplete = () => {
      console.log('🌍 [全局] 收到虛擬試穿完成事件');
      const isOnMainPage = location.pathname === '/home';
      
      if (!isOnMainPage) {
        console.log('📍 用戶不在 MainPage，顯示通知');
        try {
          const resultData = localStorage.getItem('virtualTryOnResult');
          if (resultData) {
            const parsed = JSON.parse(resultData);
            alert(`✅ 試穿完成！\n\n回到主頁查看結果`);
            // 保留結果在 localStorage，不刪除
          }
        } catch (e) {
          console.error('❌ 處理虛擬試穿完成通知失敗:', e);
        }
      }
      
      // ✅ 清除進行中標誌，讓 MainPage 知道試穿已完成
      console.log('✅ 清除試穿進行中標誌');
      sessionStorage.removeItem('virtualTryingStatus');
    };

    const handleVirtualTryOnError = () => {
      console.log('🌍 [全局] 收到虛擬試穿錯誤事件');
      const isOnMainPage = location.pathname === '/home';
      
      if (!isOnMainPage) {
        console.log('📍 用戶不在 MainPage，顯示錯誤通知');
        try {
          const errorData = localStorage.getItem('virtualTryOnError');
          if (errorData) {
            const { error } = JSON.parse(errorData);
            alert(`❌ 試穿失敗: ${error}`);
            // 不刪除錯誤，讓 MainPage 可以收到
          }
        } catch (e) {
          console.error('❌ 處理虛擬試穿錯誤通知失敗:', e);
        }
      }
      
      // ✅ 清除進行中標誌
      sessionStorage.removeItem('virtualTryingStatus');
    };

    window.addEventListener('virtualTryOnComplete', handleVirtualTryOnComplete);
    window.addEventListener('virtualTryOnError', handleVirtualTryOnError);

    return () => {
      window.removeEventListener('virtualTryOnComplete', handleVirtualTryOnComplete);
      window.removeEventListener('virtualTryOnError', handleVirtualTryOnError);
    };
  }, [location.pathname]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <VirtualTryOnEventHandler />
      <Routes>
        {/* 設定路徑規則 */}
        
        {/* 測試 3D 頁面 */}
        <Route path="/test3D" element={<Test3D />} />

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

        {/* AI 購物助手頁面 (Crawler) */}
        <Route path="/crawler" element={<CrawlerPage />} />

        {/* 設定頁面 */}
        <Route path="/settings" element={<SettingPage />} />

        {/* 通知頁面 */}
        <Route path="/notifications" element={<NotificationPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
