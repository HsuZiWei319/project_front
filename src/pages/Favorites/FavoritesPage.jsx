import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import '../../App.css';
import './FavoritesPage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import OutfitDisplay from '../../components/OutfitDisplay/OutfitDisplay';
import VirtualFavoriteOutfitList from '../../components/OutfitList/VirtualFavoriteOutfitList';
import { useImageUpload } from '../../hooks/useImageUpload';
import apiClient, { API_URL, fetcher } from '../../services/api';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { handleFileSelectedForClothesUpload } = useImageUpload();
    const [filterMode, setFilterMode] = useState('category'); // 'category' 或 'style'
    const [viewMode, setViewMode] = useState('wardrobe'); // 'wardrobe' 或 'outfit'
    const [show3DMap, setShow3DMap] = useState({}); // 追蹤每個穿搭的 3D 顯示狀態

    // 使用 SWR 獲取收藏的衣服數據
    const { 
        data: favoriteData, 
        error: favoriteError, 
        isValidating: favoriteValidating 
    } = useSWR('/picture/clothes/favorites', fetcher, {
        revalidateOnFocus: false
    });

    // 使用 SWR 獲取收藏的試穿結果數據
    const { 
        data: outfitFavoritesData, 
        error: outfitFavoritesError, 
        isValidating: outfitFavoritesValidating 
    } = useSWR(viewMode === 'outfit' ? '/combine/user/virtual-try-on-favorites' : null, fetcher, {
        revalidateOnFocus: false
    });

    // 構建完整的收藏列表
    const allClothes = useMemo(() => {
        return favoriteData?.results || [];
    }, [favoriteData]);

    // 根據分組模式重新分組衣服
    const groupedClothes = useMemo(() => {
        const grouped = {};
        const clothes = allClothes;
        
        if (filterMode === 'category') {
            // 按類型分組
            clothes.forEach((item) => {
                const category = item.clothes_category || '未分類';
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

    const isLoading = !favoriteData && !favoriteError;

    // 獲取穿搭收藏列表
    const outfitFavorites = useMemo(() => {
        const outfits = outfitFavoritesData?.results || outfitFavoritesData?.data || outfitFavoritesData || [];
        return Array.isArray(outfits) ? outfits : [];
    }, [outfitFavoritesData]);

    const outfitIsLoading = viewMode === 'outfit' && !outfitFavoritesData && !outfitFavoritesError;

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
        console.log('點擊衣服:', clothes);
        navigate(`/clothes/${clothes.clothes_uid}`);
    };

    // 轉換穿搭圖片 URL
    const getFullOutfitImageUrl = (url) => {
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

    const handleOutfitClick = (outfit) => {
        console.log('點擊穿搭:', outfit);
        const modelUuid = outfit.model_uid || outfit.model_uuid || outfit.id;
        navigate(`/outfit/${modelUuid}`);
    };

    const toggle3D = (e, uid) => {
        e.stopPropagation(); // 防止觸發卡片點擊
        setShow3DMap(prev => ({
            ...prev,
            [uid]: !prev[uid]
        }));
    };

    return (
        <div className="container favorites-page">
            <Navigation position="top" />
            <BackButton />

            <div className="title-bar">
                <div className="pagetitle-label">收藏</div>
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

            <main className={`wardrobe-content ${viewMode === 'wardrobe' ? 'wardrobe-clothes-view' : 'wardrobe-outfit-view'}`}>
                {viewMode === 'wardrobe' && (
                    <>
                        {isLoading && (
                            <div className="empty-state">
                                <div className="empty-state-icon">⏳</div>
                                <p className="empty-state-text">正在載入你的收藏...</p>
                            </div>
                        )}

                        {favoriteError && (
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
                                <span>{favoriteError.message || '無法載入收藏列表'}</span>
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
                                                title={clothes.clothes_category}
                                            >
                                                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                                                    <img
                                                        src={getFullClothesImageUrl(clothes.clothes_image_url)}
                                                        alt={clothes.clothes_category}
                                                        className="clothes-image"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            borderRadius: '8px',
                                                        }}
                                                        onError={() => console.error('圖片加載失敗:', clothes.clothes_image_url)}
                                                    />
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        ) : (
                            !isLoading && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">❤️</div>
                                    <p className="empty-state-text">還沒有收藏任何衣服喔</p>
                                    <p style={{fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)'}}>去衣櫃裡標記你喜歡的衣服吧！</p>
                                </div>
                            )
                        )}
                        <div style={{ height: '80px' }}></div>
                    </>
                )}

                {viewMode === 'outfit' && (
                    <>
                        {outfitIsLoading && (
                            <div className="empty-state">
                                <div className="empty-state-icon">⏳</div>
                                <p className="empty-state-text">正在載入你的穿搭收藏...</p>
                            </div>
                        )}

                        {outfitFavoritesError && (
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
                                <span>{outfitFavoritesError.message || '無法載入收藏試穿結果'}</span>
                            </div>
                        )}

                        {!outfitIsLoading && outfitFavorites.length > 0 ? (
                            <VirtualFavoriteOutfitList
                                outfits={outfitFavorites}
                                onOutfitClick={(outfit) => {
                                    const modelUuid = outfit.model_uid || outfit.model_uuid || outfit.id;
                                    navigate(`/outfit/${modelUuid}`);
                                }}
                                show3DMap={show3DMap}
                                onToggle3D={(uid) => {
                                    setShow3DMap(prev => ({
                                        ...prev,
                                        [uid]: !prev[uid]
                                    }));
                                }}
                                getImageUrl={getFullOutfitImageUrl}
                                itemHeight={420}
                                windowHeight={window.innerHeight - 300}
                            />
                        ) : (
                            !outfitIsLoading && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">✨</div>
                                    <p className="empty-state-text">還沒有收藏任何穿搭喔</p>
                                    <p style={{fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)'}}>去虛擬試穿中標記你喜歡的穿搭吧！</p>
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

export default FavoritesPage;
