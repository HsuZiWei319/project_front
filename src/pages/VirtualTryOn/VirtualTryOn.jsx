import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './VirtualTryOn.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import apiClient, { API_URL } from '../../services/api';

const VirtualTryOn = () => {
    const navigate = useNavigate();
    const [groupedClothes, setGroupedClothes] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClothes, setSelectedClothes] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const isMountedRef = React.useRef(true);

    // 在組件掛載時調用 API
    useEffect(() => {
        fetchUserClothes();

        // 組件卸載時清空虛擬試穿的臨時狀態（如果沒有開始試穿）
        return () => {
            isMountedRef.current = false;
            // 只清空錯誤狀態，不清除已完成的結果
            // 這樣可以防止用戶按返回鍵時殘留的提示字
        };
    }, []);

    // 調用 /picture/clothes/my API 並分組
    const fetchUserClothes = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 調用 API 獲取用戶的所有衣服
            const response = await apiClient.get('/picture/clothes/my');
            
            console.log('API 返回數據:', response.data);

            // 根據 clothes_category 動態分組
            const grouped = {};
            response.data.results.forEach((item) => {
                const category = item.clothes_category;
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(item);
            });

            setGroupedClothes(grouped);
        } catch (err) {
            console.error('獲取衣服列表失敗:', err);
            setError(err.message || '無法載入衣服列表');
        } finally {
            setIsLoading(false);
        }
    };

    // 轉換衣服圖片 URL
    const getFullClothesImageUrl = (url) => {
        if (!url) return '';
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
            const currentHost = window.location.hostname;
            const currentProtocol = window.location.protocol;
            
            if (url.includes('localhost:9000') || url.includes('192.168.')) {
                return url.replace(/https?:\/\/(localhost|[\d.]+)(:9000)?/, `${currentProtocol}//${currentHost}:9000`);
            }
            return url;
        }
        
        if (url.startsWith('/')) {
            return `${API_URL}${url}`;
        }
        return url;
    };

    // 處理衣服選擇
    const handleClothesSelect = (clothes) => {
        setSelectedClothes(prevSelected => {
            // 檢查是否已選中
            const isAlreadySelected = prevSelected.some(item => item.clothes_uid === clothes.clothes_uid);
            
            if (isAlreadySelected) {
                // 取消選中
                return prevSelected.filter(item => item.clothes_uid !== clothes.clothes_uid);
            } else {
                // 新選擇，檢查是否已達到最大數量
                if (prevSelected.length < 2) {
                    return [...prevSelected, clothes];
                } else {
                    // 已達到最大數量，不進行操作
                    return prevSelected;
                }
            }
        });
    };

    // 檢查衣服是否已選中
    const isClothesSelected = (clothesUid) => {
        return selectedClothes.some(item => item.clothes_uid === clothesUid);
    };

    // 處理虛擬試穿
    const handleVirtualTryOn = async () => {
        if (selectedClothes.length !== 2) {
            alert('請選擇2件衣服');
            return;
        }

        setIsProcessing(true);
        
        // 準備請求數據
        const clothesIds = selectedClothes.map(clothes => clothes.clothes_uid);
        const clothesNames = selectedClothes.map(clothes => clothes.clothes_category).join(' + ');

        // 立即導航回 MainPage，傳遞衣服信息和開始試穿標誌
        navigate('/home', { 
            state: { 
                startedVirtualTryOn: true,
                clothesInfo: {
                    ids: clothesIds,
                    names: clothesNames
                }
            } 
        });

        try {
            const requestData = {
                clothes_ids: clothesIds
            };

            console.log('發送虛擬試穿請求:', requestData);

            // 後台等待虛擬試穿 API
            const response = await apiClient.post('/combine/user/virtual-try-on', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 120000,
            });

            console.log('虛擬試穿 API 回應:', response.data);

            // 提取結果圖片URL
            const resultImageUrl = response.data.model_data?.model_picture;
            
            if (!resultImageUrl) {
                throw new Error('後端未返回結果圖片');
            }

            // 使用 localStorage 通知 MainPage 更新照片
            localStorage.setItem('virtualTryOnResult', JSON.stringify({
                imageUrl: resultImageUrl,
                timestamp: Date.now()
            }));

            // 分發自定義事件通知 MainPage
            window.dispatchEvent(new Event('virtualTryOnComplete'));

        } catch (err) {
            console.error('虛擬試穿失敗:', err);
            const errorMsg = err.response?.data?.message || err.message || '未知錯誤';
            
            // 通知 MainPage 試穿失敗
            localStorage.setItem('virtualTryOnError', JSON.stringify({
                error: errorMsg,
                timestamp: Date.now()
            }));
            
            window.dispatchEvent(new Event('virtualTryOnError'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileSelected = (file, onComplete) => {
        if (!file) {
            onComplete();
            return;
        }
        navigate('/home', { state: { fileToUpload: file } });
        onComplete();
    };

    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <div className="tryon-title-bar">
                <div className="pagetitle-label">選擇衣服進行虛擬試穿</div>
                {selectedClothes.length > 0 && (
                    <div className="selection-info">已選擇 {selectedClothes.length}/2</div>
                )}
            </div>

            {/* 主要內容區 */}
            <main className="virtual-tryon-content">
                {/* 載入中 */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                        <p>正在載入衣服...</p>
                    </div>
                )}

                {/* 錯誤提示 */}
                {error && !isLoading && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c33',
                        padding: '12px 16px',
                        margin: '12px 16px',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {/* 動態渲染分類和衣服 */}
                {!isLoading && Object.keys(groupedClothes).length > 0 ? (
                    Object.keys(groupedClothes).map((category) => (
                        <section key={category} className="category-group">
                            <h2 className="pagetitle-label">
                                {category} ({groupedClothes[category].length})
                            </h2>
                            <div className="clothes-list">
                                {groupedClothes[category].map((clothes) => (
                                    <div
                                        key={clothes.clothes_uid}
                                        className={`clothes-item ${isClothesSelected(clothes.clothes_uid) ? 'selected' : ''}`}
                                        onClick={() => handleClothesSelect(clothes)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={getFullClothesImageUrl(clothes.clothes_image_url)}
                                            alt={clothes.clothes_category}
                                            className="clothes-image"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                borderRadius: '8px'
                                            }}
                                            onError={() => console.error('圖片加載失敗:', clothes.clothes_image_url)}
                                        />
                                        {isClothesSelected(clothes.clothes_uid) && (
                                            <div className="selection-badge">✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    !isLoading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                            <p>衣櫃空空的，趕快上傳衣服吧！</p>
                        </div>
                    )
                )}

                {/* 底部留白防止遮擋 */}
                <div style={{ height: '100px' }}></div>
            </main>

            {/* 試穿結果顯示區 - 當有結果時替換上面的衣服列表 */}
            {/* 已移除：結果現在在 MainPage 顯示 */}

            {/* 試穿按鈕 - 只有選擇 2 張時才顯示 */}
            {selectedClothes.length === 2 && (
                <div className="try-on-button-container">
                    <button 
                        className="try-on-button"
                        onClick={handleVirtualTryOn}
                        disabled={isProcessing}
                    >
                        {isProcessing ? '試穿中...' : '試穿'}
                    </button>
                </div>
            )}

            <BottomNavigation onFileSelected={handleFileSelected} />
        </div>
    );
};

export default VirtualTryOn;
