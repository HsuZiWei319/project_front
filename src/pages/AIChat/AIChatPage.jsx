import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import './AIChatPage.css';
import Navigation from '../../components/Navigation/Navigation';
import BackButton from '../../components/Header/BackButton';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import {
  generateAIRecommendation,
  getAIRecommendationHistory,
  getAIRecommendationDetail,
  deleteAIRecommendation,
} from '../../services/imageService';

const AIChatPage = () => {
  const navigate = useNavigate();

  // 狀態管理
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  // SWR Fetcher
  const fetcher = async (url) => {
    const result = await getAIRecommendationHistory(currentPage, 20, 'newest');
    if (!result.success) {
      throw new Error(result.error || '獲取推薦歷史失敗');
    }
    return result.data;
  };

  // 使用 SWR 獲取推薦歷史
  const { data, error: swrError, isLoading: swrIsLoading, mutate } = useSWR(
    showHistory ? ['aichat_recommend_history', currentPage] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 60秒內不重複請求
      focusThrottleInterval: 300000, // 5分鐘
    }
  );

  const recommendations = data?.results || [];
  const totalPages = data?.total_pages || 1;

  // 清除訊息（5秒後）
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 如果 SWR 有錯誤，更新狀態
  useEffect(() => {
    if (swrError) {
      setError(swrError.message);
    }
  }, [swrError]);

  /**
   * 刷新推薦歷史
   */
  const refreshRecommendationHistory = async () => {
    await mutate();
  };

  /**
   * 生成新的推薦
   */
  const handleGenerateRecommendation = async (e) => {
    e.preventDefault();

    // 驗證輸入
    if (!userInput.trim()) {
      setError('請輸入你的想法或需求');
      return;
    }

    if (userInput.trim().length < 5) {
      setError('輸入文字太短，請至少輸入 5 個字符');
      return;
    }

    if (userInput.trim().length > 500) {
      setError('輸入文字過長，請不超過 500 個字符');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage('');

      const result = await generateAIRecommendation(userInput, 1);

      if (result.success) {
        setSuccessMessage('✨ 推薦穿搭已生成！');
        setUserInput('');
        
        // 直接顯示推薦詳情，而不是重新加載歷史
        const recommendation = result.data.recommendations?.[0];
        if (recommendation) {
          // 轉換後端返回的結構為詳情頁面所需的格式
          const detailData = {
            model_uid: recommendation.model_uid,
            model_picture: recommendation.model_picture,
            recommendation_score: recommendation.recommendation_score,
            recommendation_context: recommendation.recommendation_context || userInput,
            model_style: recommendation.model_style || [],
            ai_reasoning: recommendation.ai_reasoning,
            // 為了兼容現有的詳情頁邏輯
            recommendation_keywords: {
              reasoning: recommendation.ai_reasoning
            },
            clothes_list: recommendation.clothes_info ? [
              recommendation.clothes_info.top,
              recommendation.clothes_info.bottom
            ] : [],
            created_at: new Date().toISOString()
          };
          
          setSelectedRecommendation(detailData);
          setShowHistory(false);
        }
      } else {
        setError(result.error || '生成推薦失敗，請稍後重試');
      }
    } catch (err) {
      setError('生成推薦時發生錯誤，請檢查網路連接');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 查看推薦詳情
   */
  const handleViewDetail = async (modelUid) => {
    try {
      setError(null);
      const result = await getAIRecommendationDetail(modelUid);

      if (result.success) {
        setSelectedRecommendation(result.data);
        setShowHistory(false);
      } else {
        setError(result.error || '無法載入推薦詳情');
      }
    } catch (err) {
      setError('無法載入推薦詳情');
    }
  };

  /**
   * 刪除推薦
   */
  const handleDeleteRecommendation = async (modelUid) => {
    if (!window.confirm('確定要刪除這個推薦穿搭嗎？')) {
      return;
    }

    try {
      setError(null);
      const result = await deleteAIRecommendation(modelUid);

      if (result.success) {
        setSuccessMessage('✓ 推薦已刪除');
        setSelectedRecommendation(null);
        setCurrentPage(1);
        await refreshRecommendationHistory();
      } else {
        setError(result.error || '刪除失敗');
      }
    } catch (err) {
      setError('刪除失敗，請檢查網路連接');
    }
  };

  /**
   * 返回歷史列表
   */
  const handleBackToHistory = async () => {
    setShowHistory(true);
    setSelectedRecommendation(null);
    // 刷新數據
    await refreshRecommendationHistory();
  };

  /**
   * 處理文件上傳（如果需要用戶照片）
   */
  const handleFileSelectedForClothesUpload = (file) => {
    // 這個函數來自 BottomNavigation，主要用於上傳衣服
    console.log('File selected:', file);
  };

  return (
    <div className="container">
      <Navigation position="top" />
      <BackButton onCustomBack={!showHistory ? handleBackToHistory : undefined} />
      <div className="ai-chat-content">
        <div className="title-bar">
          <div className="pagetitle-label">
            AI 穿搭助理
          </div>
        </div>
        

        {/* 錯誤和成功訊息 */}
        {error && (
          <div className="ai-chat-alert ai-chat-alert-error">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="ai-chat-alert ai-chat-alert-success">
            {successMessage}
          </div>
        )}

        {/* 主要內容區域 */}
        {showHistory ? (
          <>
            {/* 推薦生成表單 */}
            <div className="ai-chat-form-section">
              <div className="ai-chat-form-card">
                <h2>告訴我你的需求</h2>
                <p className="ai-chat-form-hint">描述今天的心情、天氣、場合或你想要的穿搭風格</p>
                
                <form onSubmit={handleGenerateRecommendation} className="ai-chat-form">
                  <div className="ai-chat-input-wrapper">
                    <textarea
                      className="ai-chat-input"
                      placeholder="例如：今天天氣很好，我要去逛街，希望穿得舒適又時尚..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      rows="4"
                      disabled={isLoading}
                    />
                    <div className="ai-chat-input-counter">
                      {userInput.length}/500
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="ai-chat-btn-generate"
                    disabled={isLoading || !userInput.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="ai-chat-spinner"></span>
                        生成中...
                      </>
                    ) : (
                      '✨ 生成推薦'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* 推薦歷史列表 */}
            <div className="ai-chat-history-section">
              <h2>推薦歷史</h2>
              
              {swrIsLoading ? (
                <div className="ai-chat-empty-state">
                  <div className="ai-chat-empty-icon">⏳</div>
                  <p>加載中...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="ai-chat-empty-state">
                  <div className="ai-chat-empty-icon">📝</div>
                  <p>還沒有推薦記錄</p>
                  <p className="ai-chat-empty-hint">輸入你的需求，AI 就會幫你推薦穿搭</p>
                </div>
              ) : (
                <div className="ai-chat-history-grid">
                  {recommendations.map((rec) => (
                    <div key={rec.model_uid} className="ai-chat-history-card">
                      {/* 推薦圖片 */}
                      {rec.model_picture && (
                        <div className="ai-chat-card-image">
                          <img
                            src={rec.model_picture}
                            alt="推薦穿搭"
                            onError={(e) => {
                              e.target.src = '../../assets/background/placeholder.png';
                            }}
                          />
                          <div className="ai-chat-card-score">
                            ⭐ {(rec.recommendation_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}

                      {/* 推薦信息 */}
                      <div className="ai-chat-card-content">
                        <p className="ai-chat-card-context">
                          {rec.recommendation_context?.substring(0, 60)}...
                        </p>
                        
                        {rec.model_style && rec.model_style.length > 0 && (
                          <div className="ai-chat-card-tags">
                            {rec.model_style.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="ai-chat-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="ai-chat-card-date">
                          {new Date(rec.created_at).toLocaleDateString('zh-TW')}
                        </p>
                      </div>

                      {/* 操作按鈕 */}
                      <div className="ai-chat-card-actions">
                        <button
                          className="ai-chat-btn-view"
                          onClick={() => handleViewDetail(rec.model_uid)}
                        >
                          查看詳情
                        </button>
                        <button
                          className="ai-chat-btn-delete"
                          onClick={() => handleDeleteRecommendation(rec.model_uid)}
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 分頁 */}
              {totalPages > 1 && (
                <div className="ai-chat-pagination">
                  <button
                    disabled={currentPage === 1 || swrIsLoading}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="ai-chat-btn-pagination"
                  >
                    ← 上一頁
                  </button>
                  <span className="ai-chat-page-info">
                    第 {currentPage} / {totalPages} 頁
                  </span>
                  <button
                    disabled={currentPage === totalPages || swrIsLoading}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="ai-chat-btn-pagination"
                  >
                    下一頁 →
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 推薦詳情頁 */}
            {selectedRecommendation && (
              <div className="ai-chat-detail-section">
                <div className="ai-chat-detail-container">
                  {/* 左側 - 推薦圖片 */}
                  <div className="ai-chat-detail-image">
                    {selectedRecommendation.model_picture && (
                      <>
                        <img
                          src={selectedRecommendation.model_picture}
                          alt="推薦穿搭"
                          onError={(e) => {
                            e.target.src = '../../assets/background/placeholder.png';
                          }}
                        />
                        <div className="ai-chat-detail-score">
                          推薦評分: {(selectedRecommendation.recommendation_score * 100).toFixed(0)}%
                        </div>
                      </>
                    )}
                  </div>

                  {/* 右側 - 推薦詳情 */}
                  <div className="ai-chat-detail-info">
                    {/* 用戶需求 */}
                    <div className="ai-chat-detail-section-item">
                      <h3>你的需求</h3>
                      <p className="ai-chat-detail-context">
                        {selectedRecommendation.recommendation_context}
                      </p>
                    </div>

                    {/* AI 推理 */}
                    {selectedRecommendation.recommendation_keywords?.reasoning && (
                      <div className="ai-chat-detail-section-item">
                        <h3>AI 分析</h3>
                        <p className="ai-chat-detail-reasoning">
                          {selectedRecommendation.recommendation_keywords.reasoning}
                        </p>
                      </div>
                    )}

                    {/* 推薦風格 */}
                    {selectedRecommendation.model_style && selectedRecommendation.model_style.length > 0 && (
                      <div className="ai-chat-detail-section-item">
                        <h3>風格標籤</h3>
                        <div className="ai-chat-detail-tags">
                          {selectedRecommendation.model_style.map((tag, idx) => (
                            <span key={idx} className="ai-chat-tag-large">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 推薦衣服 */}
                    {selectedRecommendation.clothes_list && selectedRecommendation.clothes_list.length > 0 && (
                      <div className="ai-chat-detail-section-item">
                        <h3>推薦衣服</h3>
                        <div className="ai-chat-clothes-list">
                          {selectedRecommendation.clothes_list.map((clothes, idx) => (
                            <div key={idx} className="ai-chat-clothes-item">
                              {clothes.clothes_image_url && (
                                <img
                                  src={clothes.clothes_image_url}
                                  alt={clothes.clothes_category}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="ai-chat-clothes-category">
                                {clothes.clothes_category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 日期 */}
                    <div className="ai-chat-detail-section-item">
                      <p className="ai-chat-detail-date">
                        生成時間: {new Date(selectedRecommendation.created_at).toLocaleString('zh-TW')}
                      </p>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="ai-chat-detail-actions">
                      <button
                        className="ai-chat-btn-delete-large"
                        onClick={() => handleDeleteRecommendation(selectedRecommendation.model_uid)}
                      >
                        刪除推薦
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 底部導航 */}
      <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
    </div>
  );
};

export default AIChatPage;
