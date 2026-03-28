import React from 'react';
import * as Images from '../../assets';

const BottomNavigation = ({ onAddButtonClick }) => (
  <div className="shared-nav">
    <div className="home-card"> 
      <img src={Images.icon_home} alt="主畫面" className="home-icon"/>
      <div className="home-text">主畫面</div>
    </div>
    
    <div className="add-button-container" onClick={onAddButtonClick}>
      <img src={Images.button_plus} alt="新增" className="plus-icon"/>
    </div>

    <div className="notification-card"> 
      <img src={Images.icon_notification} alt="通知" className="notification-icon"/>
      <div className="notification-text">通知</div>
    </div>
  </div>
);

export default BottomNavigation;
