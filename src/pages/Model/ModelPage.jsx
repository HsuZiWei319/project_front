import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './ModelPage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { getModelPhoto } from '../../services/imageService';
import { useImageUpload } from '../../hooks/useImageUpload';

const ModelPage = () => {
    const navigate = useNavigate();
    // 模擬模特兒數據
    const [models, setModels] = useState([
        { id: 1, name: '預設模特' },
        // 你可以在這裡隨意新增更多物件來測試滾動
    ]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [userPhotoUrl, setUserPhotoUrl] = useState(null); // 用戶上傳的模特照片
    const fileInputRef = useRef(null);
    const nextIdRef = useRef(2);
    const { handleFileSelectedForModelUpload, resultImage, error, isLoading: hookIsLoading } = useImageUpload();

    // 在組件掛載時，獲取之前上傳的模特照片
    useEffect(() => {
        const loadPreviousPhoto = async () => {
            try {
                const result = await getModelPhoto();
                if (result.success && result.photo?.user_image_url) {
                    setUserPhotoUrl(result.photo.user_image_url);
                    console.log('✅ 已加載之前上傳的模特照片:', result.photo.user_image_url);
                }
            } catch (err) {
                console.error('⚠️ 獲取模特照片失敗:', err);
                // 如果獲取失敗，不影響頁面正常功能
            }
        };

        loadPreviousPhoto();
    }, []); // 只在組件掛載時執行一次

    // 監聽 hook 的 resultImage，當上傳成功時更新 userPhotoUrl
    useEffect(() => {
        if (resultImage) {
            setUserPhotoUrl(resultImage);
        }
    }, [resultImage]);

    // 監聽 hook 的 error，當上傳失敗時更新 uploadError
    useEffect(() => {
        if (error) {
            setUploadError(error);
        }
    }, [error]);

    // 監聽 hook 的 isLoading
    useEffect(() => {
        setIsLoading(hookIsLoading);
    }, [hookIsLoading]);

    const handleFileSelected = (file, onComplete) => {
        handleFileSelectedForModelUpload(file, onComplete);
    };

    // 處理 plus_square 點擊事件
    const handlePlusSquareClick = () => {
        if (isLoading) return; // 禁止在上傳中時重複點擊
        setUploadError(null); // 清除之前的錯誤
        fileInputRef.current?.click();
    };

    // 處理已上傳照片點擊（再次上傳）
    const handlePhotoClick = () => {
        if (isLoading) return;
        setUploadError(null); // 清除之前的錯誤
        fileInputRef.current?.click();
    };

    // 處理文件選擇
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);

        try {
            await handleFileSelected(file, () => {
                // 上傳完成後，重置文件輸入
                event.target.value = '';
            });
        } catch (error) {
            console.error('上傳錯誤:', error);
            setUploadError(error.message || '上傳失敗，請重試');
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

                {/* 顯示用戶上傳的模特照片或藍色加號 */}
                {userPhotoUrl ? (
                    // 已上傳照片：顯示用戶上傳的照片，可點擊重新上傳
                    <div 
                        className="model-item" 
                        onClick={handlePhotoClick}
                        style={{ 
                            opacity: isLoading ? 0.6 : 1, 
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            position: 'relative'
                        }}
                    >
                        <img 
                            src={userPhotoUrl} 
                            alt="用戶上傳的模特照片" 
                            className="model-image-placeholder" 
                        />
                        <span className="model-name">我的模特</span>
                        {isLoading && (
                            <span style={{ 
                                position: 'absolute', 
                                top: '50%', 
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: '#999',
                                fontSize: '12px',
                                whiteSpace: 'nowrap'
                            }}>
                                更新中...
                            </span>
                        )}
                    </div>
                ) : (
                    // 未上傳照片：顯示藍色加號
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
                )}
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
