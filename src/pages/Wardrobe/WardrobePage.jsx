import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './WardrobePage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import apiClient from '../../services/api';

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

    const handleClotheClick = (clothes) => {
        // 點擊衣服時的處理邏輯（可選）
        console.log('點擊衣服:', clothes);
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
                            <h2 className="category-title">
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
                                            src={clothes.clothes_image_url}
                                            alt={clothes.clothes_category}
                                            className="clothes-image"
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
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