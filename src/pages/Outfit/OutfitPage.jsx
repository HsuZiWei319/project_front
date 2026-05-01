import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../App.css';
import './OutfitPage.css';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import { useImageUpload } from '../../hooks/useImageUpload';
import apiClient, { API_URL } from '../../services/api';

const OutfitPage = () => {
    const { modelId } = useParams();
    const navigate = useNavigate();
    const { handleFileSelectedForClothesUpload } = useImageUpload();
    
    const [outfit, setOutfit] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 組件掛載時調用 API
    useEffect(() => {
        fetchOutfitDetail();
    }, [modelId]);

    // 調用 /combine/user/virtual-try-on-detail/<model_uuid> API
    const fetchOutfitDetail = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await apiClient.get(
                `/combine/user/virtual-try-on-detail/${modelId}`
            );

            console.log('穿搭詳情 API 返回數據:', response.data);
            // API 返回的數據結構：{ success, message, data: { actual outfit data } }
            if (response.data.success && response.data.data) {
                setOutfit(response.data.data);
            } else {
                setOutfit(response.data);
            }
        } catch (err) {
            console.error('獲取穿搭詳情失敗:', err);
            setError(err.message || '無法載入穿搭詳情');
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
            const currentPort = window.location.port ? `:${window.location.port}` : '';
            
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

    // 刪除穿搭
    const handleDeleteOutfit = async () => {
        if (!window.confirm('確定要刪除這個穿搭紀錄嗎？')) {
            return;
        }

        try {
            setIsDeleting(true);
            await apiClient.delete(
                `/combine/user/virtual-try-on-delete/${modelId}`
            );

            console.log('穿搭已成功刪除');
            // 刪除後回到衣櫃頁面
            navigate('/wardrobe');
        } catch (err) {
            console.error('刪除穿搭失敗:', err);
            alert(err.message || '無法刪除穿搭');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container">
            <Navigation position="top" />
            <BackButton />

            <main className="outfit-detail-content">
                {/* 載入中 */}
                {isLoading && (
                    <div className="empty-state">
                        <div className="empty-state-icon">⏳</div>
                        <p className="empty-state-text">正在載入穿搭詳情...</p>
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

                {/* 調試信息
                {!isLoading && outfit && (
                    <div style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#1e40af',
                        padding: '12px 16px',
                        margin: '0 16px 16px 16px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        fontFamily: 'monospace',
                        maxHeight: '200px',
                        overflow: 'auto'
                    }}>
                        <strong>調試信息：</strong><br/>
                        <pre style={{margin: '8px 0 0 0', fontSize: '11px'}}>
                        {JSON.stringify({
                            modelId,
                            hasOutfit: !!outfit,
                            outfitKeys: outfit ? Object.keys(outfit) : [],
                            model_style: outfit?.model_style,
                            model_picture: outfit?.model_picture?.substring(0, 50) + '...',
                            clothes_list_length: outfit?.clothes_list?.length,
                            clothes_list_sample: outfit?.clothes_list?.[0] ? {
                                clothes_category: outfit.clothes_list[0].clothes_category,
                                clothes_image_url: outfit.clothes_list[0].clothes_image_url?.substring(0, 50) + '...'
                            } : null
                        }, null, 2)}
                        </pre>
                    </div>
                )}
                     */}

                {/* 穿搭詳情 */}
                {!isLoading && outfit && (
                    <div className="outfit-detail-container">

                        {/* 模特風格標籤 */}
                        <div className="outfit-detail-styles">
                            <h2 className="outfit-detail-subtitle">模特風格</h2>
                            <div className="styles-tag-group">
                                {outfit.model_style && outfit.model_style.length > 0 ? (
                                    outfit.model_style.map((style, index) => (
                                        <span key={index} className="detail-style-tag">{style}</span>
                                    ))
                                ) : (
                                    <span className="detail-style-tag">未分類</span>
                                )}
                            </div>
                        </div>

                        {/* 模特照片 */}
                        <div className="outfit-detail-section">
                            <h2 className="outfit-detail-subtitle">模特穿搭照片</h2>
                            <div className="outfit-detail-image-container">
                                <img
                                    src={getFullClothesImageUrl(outfit.model_picture)}
                                    alt="模特穿搭"
                                    className="outfit-detail-image"
                                    onError={(e) => {
                                        console.error('模特照片加載失敗:', outfit.model_picture);
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f0f0f0" width="300" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3E圖片加載失敗%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </div>
                        </div>

                        {/* 衣服詳情 */}
                        <div className="outfit-detail-section">
                            <h2 className="outfit-detail-subtitle">衣服組合</h2>
                            <div className="clothes-grid">
                                {outfit.clothes_list && outfit.clothes_list.length > 0 ? (
                                    outfit.clothes_list.map((clothes, index) => (
                                        <div key={index} className="clothes-detail-item">
                                            <div className="clothes-detail-image-container">
                                                <img
                                                    src={getFullClothesImageUrl(clothes.clothes_image_url)}
                                                    alt={clothes.clothes_category}
                                                    className="clothes-detail-image"
                                                    onError={(e) => {
                                                        console.error('衣服照片加載失敗:', clothes.clothes_image_url);
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23f0f0f0" width="150" height="150"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3E加載失敗%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                            <p className="clothes-detail-category">{clothes.clothes_category}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{textAlign: 'center', color: 'var(--gray-600)'}}>未找到衣服信息</p>
                                )}
                            </div>
                        </div>

                        {/* 穿搭資訊*/}
                        <div className="outfit-detail-section">
                            <h2 className="outfit-detail-subtitle">穿搭資訊</h2>
                            <div className="outfit-info-box">
                                {/*<div className="info-row">
                                    <span className="info-label">狀態：</span>
                                    
                                    <span className="info-value">
                                        {outfit.status === 'completed' ? '✅ 已完成' : '⏳ 處理中'}
                                    </span>
                                </div>*/}
                                <div className="info-row">
                                    <span className="info-label">建立時間：</span>
                                    <span className="info-value">
                                        {(outfit.model_created_time || outfit.created_at) ? new Date(outfit.model_created_time || outfit.created_at).toLocaleDateString('zh-TW', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '日期未知'}
                                    </span>
                                </div>
                            </div>
                        </div> 

                        {/* 刪除按鈕 */}
                        <div className="outfit-detail-actions">
                            <button
                                className="btn-delete"
                                onClick={handleDeleteOutfit}
                                disabled={isDeleting}
                            >
                                {isDeleting ? '刪除中...' : '刪除穿搭'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 底部留白防止遮擋 */}
                <div style={{ height: '80px' }}></div>
            </main>

            <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
        </div>
    );
};

export default OutfitPage;
