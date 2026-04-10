import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './ModelPage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { uploadModelPhoto } from '../../services/imageService';

const ModelPage = () => {
    const navigate = useNavigate();
    // 模擬模特兒數據
    const [models, setModels] = useState([
        { id: 1, name: '預設模特' },
        // 你可以在這裡隨意新增更多物件來測試滾動
    ]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);
    const nextIdRef = useRef(2);
    const { handleFileSelectedWithRedirect } = useImageUpload();

    const handleFileSelected = (file, onComplete) => {
        handleFileSelectedWithRedirect(file, '/home', onComplete);
    };

    // 處理 plus_square 點擊事件
    const handlePlusSquareClick = () => {
        if (isLoading) return; // 禁止在上傳中時重複點擊
        fileInputRef.current?.click();
    };

    // 處理文件選擇
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setUploadError(null);

        try {
            // 調用 API 上傳模特照片
            const response = await uploadModelPhoto(file);

            console.log("API 回應:", response);

            // 建立新模型，使用 API 返回的去背圖片 URL
            const newModel = {
                id: nextIdRef.current,
                name: `模特 ${nextIdRef.current}`,
                imageUrl: response.photo?.removed_bg_url || response.photo?.original_url,
                photoId: response.photo?.id,
                status: response.photo?.status
            };

            nextIdRef.current++;
            setModels([...models, newModel]);

            console.log("模特照片已成功上傳:", newModel);
        } catch (error) {
            console.error("上傳失敗:", error);
            setUploadError(error.message || '上傳失敗，請重試');
        } finally {
            setIsLoading(false);
            // 清除文件輸入的值，讓同一個文件也能再次被選擇
            event.target.value = '';
        }
    };

    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <div className="title-bar">
                <div className="pagetitle-label">模特選擇</div>
            </div>

            {/* 顯示錯誤信息 */}
            {uploadError && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '12px 16px',
                    margin: '12px 16px',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    ❌ {uploadError}
                </div>
            )}

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
                <div 
                    className="plus_square-container" 
                    onClick={handlePlusSquareClick}
                    style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                    <img 
                        src={Images.plus_square} 
                        alt="plus_square"
                        className="plus_square-button" 
                        style={{ filter: isLoading ? 'opacity(0.6)' : 'none' }}
                    />
                    {isLoading && <span style={{ position: 'absolute', color: '#666' }}>上傳中...</span>}
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
