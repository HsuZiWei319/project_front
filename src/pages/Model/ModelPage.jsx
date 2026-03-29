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
                <div className="model-label">模特選擇</div>
            </div>

            {/* 中間滾動內容 */}
            <div className="scroll-area">
                <div className="model-grid">
                {/* 渲染現有的模特兒 */}
                {models.map((model) => (
                    <div key={model.id} className="model-item">
                    <img 
                        src={Images.model} 
                        alt={model.name} 
                        className="model-image-placeholder" 
                    />
                    <span className="model-name">{model.name}</span>
                    </div>
                ))}

                {/* 藍色加號：它會自動出現在 Grid 的下一個位置 */}
                <div className="model-item">
                    <img 
                        src={Images.plus_square} 
                        alt="plus_square"
                        className="plus_square-placeholder" 
                    />
                </div>
                </div>
                
                {/* 底部緩衝區：防止內容被 Footer 擋住 */}
                <div style={{ height: '150px' }}></div>
            </div>

            <BottomNavigation onFileSelected={handleFileSelected} />
        </div>
    );
}

export default ModelPage;
