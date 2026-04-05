import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './WardrobePage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';

const WardrobePage = () => {
    const navigate = useNavigate();
    // 定義分類清單
    const categories = [
        '上衣',
        '褲子',
        '外套',
        '內衣',
        '裙子',
        '鞋子',
    ];

    const handleFileSelected = (file, onComplete) => {
    if (!file) {
      onComplete();
      return;
    }

    // 導航回主畫面，傳遞文件讓主畫面進行上傳處理
    // 這樣用戶能立即看到"正在去背處理中..."的提示
    navigate('/home', { state: { fileToUpload: file } });
    
    // 完成處理回調
    onComplete();
  };

    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <div className="title-bar">
                <div className="pagetitle-label">衣櫃</div>
            </div>

            {/* 主要內容區 */}
            <main className="wardrobe-content">
                {categories.map((cat) => (
                <section key={cat} className="category-group">
                    <h2 className="category-title">{cat}</h2>
                    {/* 這裡未來會放衣服圖片的 map */}
                    <div className="clothes-list">
                    {/* 目前暫時空著，或可以放個提示文字 */}
                    <p style={{color: '#888', fontSize: '14px'}}>尚無內容</p>
                    </div>
                </section>
                ))}
                
                {/* 底部留白防止遮擋 */}
                <div style={{ height: '80px' }}></div>
            </main>

            <BottomNavigation onFileSelected={handleFileSelected} />

        </div>
    );
};

export default WardrobePage;