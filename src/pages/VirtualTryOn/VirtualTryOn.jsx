import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import './VirtualTryOn.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import apiClient, { API_URL } from '../../services/api';

const VirtualTryOn = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [groupedClothes, setGroupedClothes] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClothes, setSelectedClothes] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [virtualTryOnMode, setVirtualTryOnMode] = useState('2d'); // '2d', '3d', '2d+3d'
    const isMountedRef = React.useRef(true);

    // 在組件掛載時調用 API
    useEffect(() => {
        // 從 MainPage 或 localStorage 獲取虛擬試穿模式
        if (location.state?.virtualTryOnMode) {
            setVirtualTryOnMode(location.state.virtualTryOnMode);
        } else {
            // 如果沒有傳遞，則從 localStorage 讀取
            const savedMode = localStorage.getItem('virtualTryOnMode');
            if (savedMode) {
                setVirtualTryOnMode(savedMode);
            }
        }
        
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
        if (selectedClothes.length === 0) {
            alert('請至少選擇1件衣服');
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
            console.log('虛擬試穿模式:', virtualTryOnMode);

            // 先調用2D API以獲取 model_uid
            console.log('📍 第一步：調用 2D API...');
            const response2D = await apiClient.post('/combine/user/virtual-try-on/2d', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 0,
            });

            console.log('2D 虛擬試穿 API 回應:', response2D.data);

            // 提取 2D 結果
            const resultUrl2D = response2D.data.model_data?.model_picture;
            const modelUid = response2D.data.model_data?.model_uid;
            
            if (!resultUrl2D) {
                throw new Error('2D 試穿：後端未返回結果');
            }

            console.log('✅ 2D 試穿成功，model_uid:', modelUid);

            // 根據模式決定後續操作
            if (virtualTryOnMode === '2d') {
                // 純 2D 模式：直接使用 2D 結果
                console.log('🎨 純 2D 模式');
                
                const isGLB = resultUrl2D.toLowerCase().includes('.glb');
                const fileType = isGLB ? 'glb' : 'png';

                console.log('🔍 虛擬試穿 URL 詳細信息:');
                console.log('   URL:', resultUrl2D);
                console.log('   文件類型:', fileType);
                console.log('   時間戳:', new Date().toISOString());

                localStorage.setItem('virtualTryOnResult', JSON.stringify({
                    url: resultUrl2D,
                    fileType: fileType,
                    timestamp: Date.now(),
                    requestTime: new Date().toISOString()
                }));

                window.dispatchEvent(new Event('virtualTryOnComplete'));

            } else if (virtualTryOnMode === '3d') {
                // 純 3D 模式：調用 3D API，需要 model_uid
                console.log('🎭 純 3D 模式，調用 3D API，model_uid:', modelUid);

                if (!modelUid) {
                    throw new Error('3D 試穿：無法獲取 model_uid');
                }

                const request3DData = {
                    clothes_ids: clothesIds,
                    model_uid: modelUid
                };

                console.log('📤 發送 3D API 請求:', request3DData);

                const response3D = await apiClient.post('/combine/user/virtual-try-on/3d', request3DData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 0,
                });

                console.log('📥 3D 虛擬試穿 API 完整回應:', response3D.data);
                console.log('📥 3D response3D.data.model_data:', response3D.data.model_data);

                // 3D 模式應該讀取 model_picture_3d（GLB 文件）
                const resultUrl3D = response3D.data.model_data?.model_picture_3d;
                
                if (!resultUrl3D) {
                    console.error('❌ 3D 試穿：後端未返回 model_picture_3d');
                    console.error('   response3D.data:', response3D.data);
                    console.error('   response3D.data.model_data:', response3D.data.model_data);
                    throw new Error('3D 試穿：後端未返回 3D 結果');
                }

                console.log('✅ 3D 試穿成功，resultUrl3D:', resultUrl3D);

                const isGLB = resultUrl3D.toLowerCase().includes('.glb');
                const fileType = isGLB ? 'glb' : 'png';

                console.log('🔍 3D 虛擬試穿 URL 詳細信息:');
                console.log('   URL:', resultUrl3D);
                console.log('   文件類型:', fileType);
                console.log('   是否為 GLB:', isGLB);
                console.log('   時間戳:', new Date().toISOString());

                localStorage.setItem('virtualTryOnResult', JSON.stringify({
                    url: resultUrl3D,
                    fileType: fileType,
                    timestamp: Date.now(),
                    requestTime: new Date().toISOString()
                }));

                window.dispatchEvent(new Event('virtualTryOnComplete'));

            } else if (virtualTryOnMode === '2d+3d') {
                // 2D+3D 模式：同時調用兩個 API，保存兩個結果
                console.log('🔄 2D+3D 模式，同時調用 2D 和 3D API...');

                if (!modelUid) {
                    throw new Error('2D+3D 試穿：無法獲取 model_uid');
                }

                const request3DData = {
                    clothes_ids: clothesIds,
                    model_uid: modelUid
                };

                const response3D = await apiClient.post('/combine/user/virtual-try-on/3d', request3DData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 0,
                });

                console.log('2D+3D 虛擬試穿 API 回應:', response3D.data);

                // 2D+3D 模式應該讀取 model_picture_3d（GLB 文件）作為主要結果
                const resultUrl3D = response3D.data.model_data?.model_picture_3d;
                
                if (!resultUrl3D) {
                    // 3D 結果失敗，只使用 2D 結果
                    console.log('⚠️ 3D 結果失敗（無 model_picture_3d），只保存 2D 結果');
                    
                    const isGLB = resultUrl2D.toLowerCase().includes('.glb');
                    const fileType = isGLB ? 'glb' : 'png';

                    localStorage.setItem('virtualTryOnResult', JSON.stringify({
                        url: resultUrl2D,
                        fileType: fileType,
                        timestamp: Date.now(),
                        requestTime: new Date().toISOString(),
                        hasBothResults: false
                    }));

                    window.dispatchEvent(new Event('virtualTryOnComplete'));
                    return;
                }

                console.log('✅ 2D 和 3D 試穿都成功');

                // 檢查文件類型
                const isGLB2D = resultUrl2D.toLowerCase().includes('.glb');
                const fileType2D = isGLB2D ? 'glb' : 'png';
                const isGLB3D = resultUrl3D.toLowerCase().includes('.glb');
                const fileType3D = isGLB3D ? 'glb' : 'png';

                console.log('🔍 2D+3D 虛擬試穿 URL 詳細信息:');
                console.log('   2D URL:', resultUrl2D, '類型:', fileType2D);
                console.log('   3D URL:', resultUrl3D, '類型:', fileType3D);
                console.log('   時間戳:', new Date().toISOString());

                // 保存兩個結果，預設顯示 3D
                localStorage.setItem('virtualTryOnResult', JSON.stringify({
                    url: resultUrl3D,
                    fileType: fileType3D,
                    timestamp: Date.now(),
                    requestTime: new Date().toISOString(),
                    hasBothResults: true,
                    result2D: {
                        url: resultUrl2D,
                        fileType: fileType2D
                    },
                    result3D: {
                        url: resultUrl3D,
                        fileType: fileType3D
                    },
                    currentView: '3d' // 預設顯示 3D
                }));

                window.dispatchEvent(new Event('virtualTryOnComplete'));
            }

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

            {/* 試穿按鈕 - 當有選擇衣服時顯示 */}
            {selectedClothes.length > 0 && (
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
