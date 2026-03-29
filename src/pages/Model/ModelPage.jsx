import React, { useState, useRef } from 'react';
import '../../App.css';
import './ModelPage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';

const ModelPage = () => {
    // 模擬模特兒數據
    const [models, setModels] = useState([
        { id: 1, name: '預設模特' },
        // 你可以在這裡隨意新增更多物件來測試滾動
    ]);
    
    const fileInputRef = useRef(null);
    const nextIdRef = useRef(2);

    // 簡單的文件選擇回調 (暫時不做任何操作)
    const handleFileSelected = (file, onComplete) => {
        console.log("文件已選擇:", file);
        // 你可以在這裡添加具體的處理邏輯
        onComplete();
    };

    // 處理 plus_square 點擊事件
    const handlePlusSquareClick = () => {
        fileInputRef.current?.click();
    };

    // 處理文件選擇
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 創建圖片 URL
        const imageUrl = URL.createObjectURL(file);

        // 創建新模型
        const newModel = {
            id: nextIdRef.current,
            name: `模特 ${nextIdRef.current}`,
            imageUrl: imageUrl
        };

        nextIdRef.current++;
        setModels([...models, newModel]);

        // 清除文件輸入的值，讓同一個文件也能再次被選擇
        event.target.value = '';
    };

    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <div className="title-bar">
                <div className="model-label">模特選擇</div>
            </div>

            {/* 中間滾動內容 */}
            <div className="scroll-area">
                <div className="model-grid">
                {/* 渲染現有的模特兒 */}
                {models.map((model) => (
                    <div key={model.id} className="model-item">
                    <img 
                        src={model.imageUrl || Images.model} 
                        alt={model.name} 
                        className="model-image-placeholder" 
                    />
                    <span className="model-name">{model.name}</span>
                    </div>
                ))}

                {/* 藍色加號：它會自動出現在 Grid 的下一個位置 */}
                <div className="plus_square-container" onClick={handlePlusSquareClick}>
                    <img 
                        src={Images.plus_square} 
                        alt="plus_square"
                        className="plus_square-button" 
                    />
                </div>
                </div>
                
                {/* 底部緩衝區：防止內容被 Footer 擋住 */}
                <div style={{ height: '150px' }}></div>
            </div>

            <BottomNavigation onFileSelected={handleFileSelected} />

            {/* 隱藏文件輸入 */}
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
            />
        </div>
    );
}

export default ModelPage;
