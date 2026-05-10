import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Images from '../../assets';
import './BackButton.css';

const BackButton = ({ onCustomBack }) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    // 如果有自訂返回邏輯（如在詳情頁），優先使用
    if (onCustomBack) {
      onCustomBack();
    } else {
      // 否則返回上一頁
      navigate(-1);
    }
  };
  
  return (
    <img
      src={Images.icon_return}
      alt="return"
      className="back-arrow"
      onClick={handleBackClick}
    />
  );
};

export default BackButton;
