import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Images from '../../assets';

const Navigation = ({ position = 'top' }) => {
  const navigate = useNavigate();

  // 導航功能
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLikeClick = () => {
    // 未來可以導航到喜歡頁面
    console.log('喜歡頁面 - 建設中');
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

  return (
    <div className={`shared-nav ${position}-nav`}>
      {position === 'top' && topNavContent}
    </div>
  );
};

export default Navigation;
