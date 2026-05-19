import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import '../../App.css';
import './WardrobePage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import OutfitDisplay from '../../components/OutfitDisplay/OutfitDisplay';
import { useImageUpload } from '../../hooks/useImageUpload';
import apiClient, { API_URL, fetcher } from '../../services/api';

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
    const [filterMode, setFilterMode] = useState('category'); // 'category' 或 'style'
    const [show3DMap, setShow3DMap] = useState({}); // 追蹤每個穿搭的 3D 顯示狀態
    
    // 從 localStorage 初始化 viewMode，若無則預設為 'wardrobe'
    const [viewMode, setViewMode] = useState(() => {
        const savedViewMode = localStorage.getItem('wardrobeViewMode');
        return savedViewMode || 'wardrobe';
    });

    // 使用 SWR 獲取衣服數據
    const { 
        data: clothesData, 
        error: clothesError, 
        isValidating: clothesValidating 
    } = useSWR('/picture/clothes/my', fetcher, {
        revalidateOnFocus: false,
        shouldRetryOnError: false
    });

    // 使用 SWR 獲取穿搭歷史數據
    const { 
        data: outfitData, 
        error: outfitError, 
        isValidating: outfitValidating 
    } = useSWR(
        viewMode === 'outfit' ? '/combine/user/virtual-try-on-history?page=1&limit=20' : null, 
        fetcher,
        {
            revalidateOnFocus: false
        }
    );

    // 當 viewMode 改變時，保存到 localStorage
    useEffect(() => {
        localStorage.setItem('wardrobeViewMode', viewMode);
    }, [viewMode]);

    // 構建完整的衣服列表（包括開發衣服）
    const allClothes = useMemo(() => {
        const list = clothesData?.results ? [...clothesData.results] : [];
        // 總是添加開發衣服
        list.push(DEV_CLOTHES);
        return list;
    }, [clothesData]);

    // 根據分組模式重新分組衣服
    const groupedClothes = useMemo(() => {
        const grouped = {};
        const clothes = allClothes;
        
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
        
        return grouped;
    }, [allClothes, filterMode]);

    const outfitHistory = outfitData?.results || [];
    const isLoading = !clothesData && !clothesError;
    const isOutfitLoading = viewMode === 'outfit' && !outfitData && !outfitError;

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

    const handleClotheClick = (clothes) => {
        if (clothes.is_dev_clothes) {
            navigate(`/clothes/${clothes.clothes_uid}`, {
                state: { isDevImage: true }
            });
        } else {
            navigate(`/clothes/${clothes.clothes_uid}`);
        }
    };

    const toggle3D = (e, uid) => {
        e.stopPropagation(); // 防止觸發卡片點擊
        setShow3DMap(prev => ({
            ...prev,
            [uid]: !prev[uid]
        }));
    };

    return (
        <div className="container wardrobe-page">
            <Navigation position="top" />
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

            <main className="wardrobe-content">
                {viewMode === 'wardrobe' && (
                    <>
                        {isLoading && (
                            <div className="empty-state">
                                <div className="empty-state-icon">⏳</div>
                                <p className="empty-state-text">正在載入你的衣服...</p>
                            </div>
                        )}

                        {clothesError && (
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
                                <span>{clothesError.message || '無法載入衣服列表'}</span>
                            </div>
                        )}

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
                                                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                                                    <img
                                                        src={clothes.is_dev_clothes ? clothes.clothes_image_url : getFullClothesImageUrl(clothes.clothes_image_url)}
                                                        alt={clothes.clothes_category}
                                                        className="clothes-image"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            borderRadius: '8px',
                                                            opacity: clothes.is_dev_clothes ? 0.7 : 1,
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
                        <div style={{ height: '80px' }}></div>
                    </>
                )}

                {viewMode === 'outfit' && (
                    <>
                        {isOutfitLoading && (
                            <div className="empty-state">
                                <div className="empty-state-icon">⏳</div>
                                <p className="empty-state-text">正在載入穿搭歷史...</p>
                            </div>
                        )}

                        {outfitError && (
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
                                <span>{outfitError.message || '無法載入穿搭歷史'}</span>
                            </div>
                        )}

                        {!isOutfitLoading && outfitHistory.length > 0 ? (
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
                                            <div className="outfit-styles">
                                                {Array.isArray(outfit.model_style) && outfit.model_style.length > 0 ? (
                                                    outfit.model_style.map((style, index) => (
                                                        <span key={index} className="style-tag">{style}</span>
                                                    ))
                                                ) : outfit.model_style && typeof outfit.model_style === 'string' ? (
                                                    <span className="style-tag">{outfit.model_style}</span>
                                                ) : (
                                                    <span className="style-tag">未分類</span>
                                                )}
                                            </div>

                                            <div className="outfit-model-section">
                                                <OutfitDisplay
                                                    url={getFullClothesImageUrl(show3DMap[outfit.model_uid] ? outfit.model_picture_3d : outfit.model_picture)}
                                                    alt="模特穿搭"
                                                    className="outfit-model-image"
                                                    style={{ borderRadius: '8px' }}
                                                    containerStyle={{
                                                        width: '100%',
                                                        height: '280px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden'
                                                    }}
                                                    cameraConfig={{
                                                        position: [0, 0.5, 1.5],
                                                        fov: 50
                                                    }}
                                                />
                                                {outfit.model_picture_3d && (
                                                    <button
                                                        onClick={(e) => toggle3D(e, outfit.model_uid)}
                                                        className="unified-view-button result-mode wardrobe-toggle-button"
                                                        title={show3DMap[outfit.model_uid] ? '切換到 2D 結果' : '切換到 3D 結果'}
                                                    >
                                                        <span className="view-icon">🔄</span>
                                                        <span className="view-label">{show3DMap[outfit.model_uid] ? '看2D' : '看3D'}</span>
                                                    </button>
                                                )}
                                                {outfit.model_favorite && (
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

                                            <div className="outfit-info">
                                                <span className="outfit-date">
                                                    {(outfit.model_created_time || outfit.created_at) ? new Date(outfit.model_created_time || outfit.created_at).toLocaleDateString('zh-TW', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    }) : '日期未知'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            !isOutfitLoading && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">✨</div>
                                    <p className="empty-state-text">還沒有穿搭紀錄</p>
                                    <p style={{fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)'}}>快去虛擬試穿你喜歡的衣服組合吧！</p>
                                </div>
                            )
                        )}
                        <div style={{ height: '80px' }}></div>
                    </>
                )}
            </main>

            <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
        </div>
    );
};

export default WardrobePage;
