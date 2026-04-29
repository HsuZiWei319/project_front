import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Images from '../../assets';
import './Navigation.css';

const Navigation = ({ position = 'top' }) => {
  const navigate = useNavigate();

  // 導航功能
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLikeClick = () => {
    // 未來可以導航到喜歡頁面
    navigate('/favorites');
  };

  const handleSettingClick = () => {
    // 未來可以導航到設定頁面
    console.log('設定頁面 - 建設中');
  };

  // 頂部導航的固定內容
  const topNavContent = (
    <>
      <div className="profile-card" onClick={handleProfileClick}> 
        <img src={Images.icon_profile} alt="個人檔案" className="profile-icon"/>
        <div className="profile-text">個人檔案</div>
      </div>
      <img src={Images.line} alt="" className="divider-line" />
      <div className="like-card" onClick={handleLikeClick}> 
        <img src={Images.icon_like} alt="喜歡" className="like-icon" />
        <div className="like-text">喜歡</div>
      </div>
      <img src={Images.line} alt="" className="divider-line" />
      <div className="setting-card" onClick={handleSettingClick}> 
        <img src={Images.icon_setting} alt="設定" className="setting-icon" />
        <div className="setting-text">設定</div>
      </div>
    </>
  );

  // 登入頁面導航 - 顯示容器但不顯示導航項目
  const loginNavContent = <></>; // 登入頁面顯示容器但內容為空
  const registerNavContent = <></>; // 註冊頁面顯示容器但內容為空

  return (
    <div className={`shared-nav ${position}-nav`}>
      {position === 'top' && topNavContent}
      {position === 'top_login' && loginNavContent}
      {position === 'top_register' && registerNavContent}
    </div>
  );
};

export default Navigation;
