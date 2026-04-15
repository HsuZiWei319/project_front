import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './WardrobePage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import apiClient, { API_URL } from '../../services/api';

const WardrobePage = () => {
    const navigate = useNavigate();
    const [groupedClothes, setGroupedClothes] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 在組件掛載時調用 API
    useEffect(() => {
        fetchUserClothes();
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

    const handleFileSelected = (file, onComplete) => {
        if (!file) {
            onComplete();
            return;
        }

        // 導航回主畫面，傳遞文件讓主畫面進行上傳處理
        navigate('/home', { state: { fileToUpload: file } });
        onComplete();
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
        // 使用 clothes_uid (後端儲存的唯一標識符) 而不是 clothes_id
        console.log('點擊衣服:', clothes);
        navigate(`/clothes/${clothes.clothes_uid}`);
    };

    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <div className="title-bar">
                <div className="pagetitle-label">衣櫃</div>
            </div>

            {/* 主要內容區 */}
            <main className="wardrobe-content">
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
                                        className="clothes-item"
                                        onClick={() => handleClotheClick(clothes)}
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
                                        {clothes.clothes_favorite && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                fontSize: '18px'
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
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                            <p>衣櫃空空的，趕快上傳衣服吧！</p>
                        </div>
                    )
                )}

                {/* 底部留白防止遮擋 */}
                <div style={{ height: '80px' }}></div>
            </main>

            <BottomNavigation onFileSelected={handleFileSelected} />
        </div>
    );
};

export default WardrobePage;