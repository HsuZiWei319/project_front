import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingPage.css';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';
import BackButton from '../../components/Header/BackButton';
import { useImageUpload } from '../../hooks/useImageUpload';

const SettingPage = () => {
  const navigate = useNavigate();
  const { handleFileSelectedForClothesUpload } = useImageUpload();

  const settingSections = [
    {
      title: '帳號與安全',
      items: [
        { 
          id: 'account', 
          title: '個人資料', 
          description: '姓名、電子郵件、大頭貼',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )
        },
        { 
          id: 'security', 
          title: '帳號安全', 
          description: '密碼、雙重驗證',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          )
        },
      ]
    },
    {
      title: '應用程式設定',
      items: [
        { 
          id: 'notifications', 
          title: '通知設定', 
          description: '推播通知、郵件提醒',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          )
        },
        { 
          id: 'privacy', 
          title: '隱私與權限', 
          description: '管理您的資料隱私',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          )
        },
        { 
          id: 'language', 
          title: '語言', 
          description: '繁體中文',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          )
        },
      ]
    },
    {
      title: '支援與關於',
      items: [
        { 
          id: 'help', 
          title: '幫助與回饋', 
          description: '常見問題、聯絡客服',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          )
        },
        { 
          id: 'about', 
          title: '關於我們', 
          description: '版本 1.0.0',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          )
        },
      ]
    }
  ];

  return (
    <div className="container">
      <Navigation position="top" />
      <BackButton />
      
      <div className="setting-content">
        <div className="setting-header-scroll">
          <h1 className="pagetitle-label">設定</h1>
        </div>
        
        {settingSections.map((section, idx) => (
          <div key={idx} className="setting-section">
            {section.title && <h2 className="section-title">{section.title}</h2>}
            <div className="section-card">
              {section.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`setting-item ${item.isDanger ? 'danger' : ''}`}
                >
                  <div className="item-left">
                    <div className="item-icon-wrapper">
                      {item.icon}
                    </div>
                    <div className="item-info">
                      <span className="item-title">{item.title}</span>
                      {item.description && (
                        <span className="item-description">{item.description}</span>
                      )}
                    </div>
                  </div>
                  {!item.isDanger && (
                    <div className="item-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="setting-footer">
          <p> </p>
        </div>
      </div>

      <BottomNavigation onFileSelected={handleFileSelectedForClothesUpload} />
    </div>
  );
};

export default SettingPage;
