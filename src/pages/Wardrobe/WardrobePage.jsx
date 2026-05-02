import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './WardrobePage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { useImageUpload } from '../../hooks/useImageUpload';
import apiClient, { API_URL } from '../../services/api';

// 開發用衣服配置
const DEV_CLOTHES = {
    clothes_uid: 'dev-clothes-001',
    clothes_category: '開發用圖片',
    clothes_image_url: Images.test_clothes,
    clothes_arm_length: 0,
    clothes_leg_length: 0,
    clothes_shoulder_width: 0,
    clothes_waistline: 0,
    clothes_favorite: false,
    is_dev_clothes: true, // 標記為開發衣服
};

const WardrobePage = () => {
    const navigate = useNavigate();
    const { handleFileSelectedForClothesUpload } = useImageUpload();
    const [groupedClothes, setGroupedClothes] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterMode, setFilterMode] = useState('category'); // 'category' 或 'style'
    const [allClothes, setAllClothes] = useState([]); // 保存原始衣服數據
    // 從 localStorage 初始化 viewMode，若無則預設為 'wardrobe'
    const [viewMode, setViewMode] = useState(() => {
        const savedViewMode = localStorage.getItem('wardrobeViewMode');
        return savedViewMode || 'wardrobe';
    });
    const [outfitHistory, setOutfitHistory] = useState([]); // 穿搭歷史
    const [outfitLoading, setOutfitLoading] = useState(false); // 穿搭加載狀態
    const [outfitError, setOutfitError] = useState(null); // 穿搭錯誤信息

    // 在組件掛載時調用 API
    useEffect(() => {
        fetchUserClothes();
    }, []);

    // 當 filterMode 改變時，重新分組衣服
    useEffect(() => {
        if (allClothes.length > 0) {
            regroupClothes(allClothes);
        }
    }, [filterMode]);

    // 當 viewMode 改變時，保存到 localStorage 並調用歷史 API
    useEffect(() => {
        // 保存 viewMode 到 localStorage
        localStorage.setItem('wardrobeViewMode', viewMode);
        
        // 如果切換到穿搭模式則調用歷史 API
        if (viewMode === 'outfit') {
            fetchVirtualTryOnHistory();
        }
    }, [viewMode]);

    // 調用 /combine/user/virtual-try-on-history API 並獲取穿搭歷史
    const fetchVirtualTryOnHistory = async () => {
        try {
            setOutfitLoading(true);
            setOutfitError(null);

            // 調用 API 獲取虛擬試穿歷史，預設取得第一頁，每頁 20 筆
            const response = await apiClient.get('/combine/user/virtual-try-on-history', {
                params: {
                    page: 1,
                    limit: 20
                }
            });

            console.log('穿搭歷史 API 返回數據:', response.data);
            setOutfitHistory(response.data.results || []);
        } catch (err) {
            console.error('獲取虛擬試穿歷史失敗:', err);
            setOutfitError(err.message || '無法載入穿搭歷史');
            setOutfitHistory([]);
        } finally {
            setOutfitLoading(false);
        }
    };

    // 根據分組模式重新分組衣服
    const regroupClothes = (clothes) => {
        const grouped = {};
        
        if (filterMode === 'category') {
            // 按類型分組
            clothes.forEach((item) => {
                const category = item.clothes_category;
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(item);
            });
        } else if (filterMode === 'style') {
            // 按風格分組
            clothes.forEach((item) => {
                if (item.styles && item.styles.length > 0) {
                    // 每件衣服可能有多個風格，添加到每個風格的組中
                    item.styles.forEach((style) => {
                        const styleName = style.style_name;
                        if (!grouped[styleName]) {
                            grouped[styleName] = [];
                        }
                        grouped[styleName].push(item);
                    });
                } else {
                    // 如果沒有風格信息，添加到"未分類"
                    if (!grouped['未分類']) {
                        grouped['未分類'] = [];
                    }
                    grouped['未分類'].push(item);
                }
            });
        }
        
        setGroupedClothes(grouped);
    };

    // 調用 /picture/clothes/my API 並分組
    const fetchUserClothes = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 調用 API 獲取用戶的所有衣服
            const response = await apiClient.get('/picture/clothes/my');
            
            console.log('API 返回數據:', response.data);

            // 構建完整的衣服列表（包括開發衣服）
            const clothesList = [...response.data.results];
            // 總是添加開發衣服
            clothesList.push(DEV_CLOTHES);
            
            setAllClothes(clothesList);
            regroupClothes(clothesList);
        } catch (err) {
            console.error('獲取衣服列表失敗:', err);
            console.warn('⚠️ 後端無法連線，但仍顯示開發圖片');
            setError(err.message || '無法載入衣服列表');
            
            // 當 API 失敗時，只顯示開發衣服
            setAllClothes([DEV_CLOTHES]);
            regroupClothes([DEV_CLOTHES]);
        } finally {
            setIsLoading(false);
        }
    };

    // 轉換衣服圖片 URL（類似 UploadClothesPage）
    const getFullClothesImageUrl = (url) => {
        if (!url) return '';
        
        // 如果已經是完整的 URL（以 http:// 或 https:// 開頭）
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // 獲取當前頁面的域名和協議
            const currentHost = window.location.hostname;
            const currentProtocol = window.location.protocol;
            const currentPort = window.location.port ? `:${window.location.port}` : '';
            
            // 如果使用了 localhost 或局域網 IP，轉換為當前頁面的域名
            if (url.includes('localhost:9000') || url.includes('192.168.')) {
                // 將任何 http://localhost:9000 或 http://192.168.x.x:9000 轉換為當前頁面的域名
                return url.replace(/https?:\/\/(localhost|[\d.]+)(:9000)?/, `${currentProtocol}//${currentHost}:9000`);
            }
            return url;
        }
        
        // 如果是相對路徑，組合成完整的後端 URL
        if (url.startsWith('/')) {
            return `${API_URL}${url}`;
        }
        return url;
    };

    const handleClotheClick = (clothes) => {
        // 點擊衣服時導航到衣服詳細信息頁面
        console.log('點擊衣服:', clothes);
        
        // 傳遞開發衣服標記給 ClothesInfoPage
        if (clothes.is_dev_clothes) {
            navigate(`/clothes/${clothes.clothes_uid}`, {
                state: { isDevImage: true }
            });
        } else {
            navigate(`/clothes/${clothes.clothes_uid}`);
        }
    };

    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <div className="wardrobe-title-bar">
                <div className="pagetitle-label">{viewMode === 'wardrobe' ? '衣櫃' : '穿搭'}</div>
                <div className="segmented-control">
                    <button 
                        className={`segment-btn ${viewMode === 'wardrobe' ? 'active' : ''}`}
                        onClick={() => setViewMode('wardrobe')}
                    >
                        衣櫃
                    </button>
                    <button 
                        className={`segment-btn ${viewMode === 'outfit' ? 'active' : ''}`}
                        onClick={() => setViewMode('outfit')}
                    >
                        穿搭
                    </button>
                </div>
            </div>

            {/* 篩選按鈕 - 僅在衣櫃模式顯示 */}
            {viewMode === 'wardrobe' && (
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filterMode === 'category' ? 'active' : ''}`}
                        onClick={() => setFilterMode('category')}
                    >
                        按類型
                    </button>
                    <button 
                        className={`filter-btn ${filterMode === 'style' ? 'active' : ''}`}
                        onClick={() => setFilterMode('style')}
                    >
                        按風格
                    </button>
                </div>
            )}

            {/* 主要內容區 */}
            <main className="wardrobe-content">
                {/* 衣櫃模式 */}
                {viewMode === 'wardrobe' && (
                    <>
                        {/* 載入中 */}
                        {isLoading && (
                            <div className="empty-state">
                                <div className="empty-state-icon">⏳</div>
                                <p className="empty-state-text">正在載入你的衣服...</p>
                            </div>
                        )}

                        {/* 錯誤提示 */}
                        {error && !isLoading && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#dc2626',
                                padding: '16px 20px',
                                margin: '16px',
                                borderRadius: 'var(--radius-xl)',
                                fontSize: '14px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{fontSize: '18px'}}>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* 動態渲染分類和衣服 */}
                        {!isLoading && Object.keys(groupedClothes).length > 0 ? (
                            Object.keys(groupedClothes).map((category) => (
                                <section key={category} className="category-group">
                                    <h2>
                                        {category} <span style={{fontSize: '14px', fontWeight: '500', color: 'var(--gray-600)'}}>({groupedClothes[category].length})</span>
                                    </h2>
                                    <div className="clothes-list">
                                        {groupedClothes[category].map((clothes) => (
                                            <div
                                                key={clothes.clothes_uid}
                                                className="clothes-item"
                                                onClick={() => handleClotheClick(clothes)}
                                                style={{ cursor: 'pointer' }}
                                                title={clothes.is_dev_clothes ? '開發用衣服 - 點擊進入上傳頁面' : clothes.clothes_category}
                                            >
                                                <img
                                                    src={clothes.is_dev_clothes ? clothes.clothes_image_url : getFullClothesImageUrl(clothes.clothes_image_url)}
                                                    alt={clothes.clothes_category}
                                                    className="clothes-image"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px',
                                                        opacity: clothes.is_dev_clothes ? 0.7 : 1, // 開發衣服稍微透明
                                                    }}
                                                    onError={() => console.error('圖片加載失敗:', clothes.clothes_image_url)}
                                                />
                                                {clothes.is_dev_clothes && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                        color: 'white',
                                                        padding: '8px 12px',
                                                        borderRadius: 'var(--radius-lg)',
                                                        fontSize: '12px',
                                                        zIndex: 10,
                                                        pointerEvents: 'none',
                                                        fontWeight: '500'
                                                    }}>
                                                        🔧 開發衣服
                                                    </div>
                                                )}
                                                {clothes.clothes_favorite && !clothes.is_dev_clothes && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        fontSize: '20px',
                                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                                        zIndex: 5
                                                    }}>
                                                        ❤️
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        ) : (
                            !isLoading && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👕</div>
                                    <p className="empty-state-text">衣櫃空空的呢</p>
                                    <p style={{fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)'}}>快去上傳你的衣服吧！</p>
                                </div>
                            )
                        )}

                        {/* 底部留白防止遮擋 */}
                        <div style={{ height: '80px' }}></div>
                    </>
                )}

                {/* 穿搭模式 - 虛擬試穿歷史 */}
                {viewMode === 'outfit' && (
                    <>
                        {/* 載入中 */}
                        {outfitLoading && (
                            <div className="empty-state">
                                <div className="empty-state-icon">⏳</div>
                                <p className="empty-state-text">正在載入穿搭歷史...</p>
                            </div>
                        )}

                        {/* 錯誤提示 */}
                        {outfitError && !outfitLoading && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#dc2626',
                                padding: '16px 20px',
                                margin: '16px',
                                borderRadius: 'var(--radius-xl)',
                                fontSize: '14px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{fontSize: '18px'}}>⚠️</span>
                                <span>{outfitError}</span>
                            </div>
                        )}

                        {/* 穿搭歷史列表 */}
                        {!outfitLoading && outfitHistory.length > 0 ? (
                            <div className="outfit-history-container">
                                <h2 style={{
                                    fontSize: 'var(--font-2xl)',
                                    fontWeight: '700',
                                    color: 'var(--gray-900)',
                                    marginBottom: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)'
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '4px',
                                        height: '28px',
                                        background: 'linear-gradient(180deg, var(--primary), #a855f7)',
                                        borderRadius: '2px'
                                    }}></span>
                                    我的穿搭 <span style={{fontSize: '14px', fontWeight: '500', color: 'var(--gray-600)'}}>(共 {outfitHistory.length} 組)</span>
                                </h2>
                                <div className="outfit-history-list">
                                    {outfitHistory.map((outfit) => (
                                        <div 
                                            key={outfit.model_uid} 
                                            className="outfit-item"
                                            onClick={() => navigate(`/outfit/${outfit.model_uid}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {/* 頂部：模特風格標籤 */}
                                            <div className="outfit-styles">
                                                {outfit.model_style && outfit.model_style.length > 0 ? (
                                                    outfit.model_style.map((style, index) => (
                                                        <span key={index} className="style-tag">{style}</span>
                                                    ))
                                                ) : (
                                                    <span className="style-tag">未分類</span>
                                                )}
                                            </div>

                                            {/* 中部：模特照片（大） */}
                                            <div className="outfit-model-section">
                                                <img
                                                    src={getFullClothesImageUrl(outfit.model_picture)}
                                                    alt="模特穿搭"
                                                    className="outfit-model-image"
                                                    onError={(e) => {
                                                        console.error('模特照片加載失敗:', outfit.model_picture);
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23f0f0f0" width="200" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E圖片加載失敗%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>

                                            {/* 底部資訊 */}
                                            <div className="outfit-info">
                                                <span className="outfit-date">
                                                    {(outfit.model_created_time || outfit.created_at) ? new Date(outfit.model_created_time || outfit.created_at).toLocaleDateString('zh-TW', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    }) : '日期未知'}
                                                </span>
                                                {/*<span className="outfit-status">{outfit.status === 'completed' ? '✅ 已完成' : '⏳ 處理中'}</span>*/}
                                            </div>
                                            
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            !outfitLoading && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">✨</div>
                                    <p className="empty-state-text">還沒有穿搭紀錄</p>
                                    <p style={{fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)'}}>快去虛擬試穿你喜歡的衣服組合吧！</p>
                                </div>
                            )
                        )}

                        {/* 底部留白防止遮擋 */}
                        <div style={{ height: '80px' }}></div>
                    </>
                )}
            </main>

            <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
        </div>
    );
};

export default WardrobePage;