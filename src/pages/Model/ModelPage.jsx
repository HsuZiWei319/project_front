import React from 'react';
import '../../App.css';
import './ModelPage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';

const ModelPage = () => {
    // 模擬模特兒數據
    const models = [
    { id: 1, name: '預設模特' },
    { id: 2, name: '模特1' },
    // 你可以在這裡隨意新增更多物件來測試滾動
    ];

    // 簡單的文件選擇回調 (暫時不做任何操作)
    const handleFileSelected = (file, onComplete) => {
        console.log("文件已選擇:", file);
        // 你可以在這裡添加具體的處理邏輯
        onComplete();
    };

    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <div className="title-bar">
                <ChevronLeft size={28} />
                <h1 style={{ fontSize: '24px' }}>模特選擇</h1>
                <Search size={28} />
            </div>

            {/* 中間內容區域 - 用來推動底部導航到底部 */}
            <div className="model-content">
            </div>

            <BottomNavigation onFileSelected={handleFileSelected} />
        </div>
    );
}

export default ModelPage;
