import React, { useState } from 'react';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import BackButton from '../../components/Header/BackButton';
import { searchClothesWithAI } from '../../services/geminiService';
import './CrawlerPage.css';

const CrawlerPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchClothesWithAI(query);
      setResults(data);
    } catch (err) {
      setError(err.message || 'AI 搜尋失敗，請稍後再試。');
      console.error(err);
      setResults([]); // Clear previous results on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelectedForClothesUpload = (file, callback) => {
    console.log('Selected file for upload:', file);
    if (callback) callback();
  };

  return (
    <div className="container crawler-container">
      <Navigation position="top" />
      <BackButton />
      
      <div className="crawler-content">
        <h1 className="crawler-title">AI 購物助手</h1>
        <p className="crawler-subtitle">告訴我你想找什麼樣的衣服，我幫你在網上搜尋！</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：一件藍色碎花洋裝"
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? '搜尋中...' : '搜尋'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="results-list">
          {results.length > 0 ? (
            results.map((item, index) => (
              <div key={index} className="result-item">
                <a 
                  href={item.ProductUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="result-link"
                >
                  <img src={item.ImageUrl} alt={item.Name} className="result-image" />
                  <div className="result-info">
                    <h3>{item.Name}</h3>
                    <p className="price">{item.Price}</p>
                    <p className="description">{item.Description}</p>
                  </div>
                </a>
              </div>
            ))
          ) : (
            !loading && <p className="no-results">還沒有搜尋結果，試著輸入一些關鍵字吧！</p>
          )}
        </div>
      </div>

      <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
    </div>
  );
};

export default CrawlerPage;
