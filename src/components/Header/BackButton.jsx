import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Images from '../../assets';

const BackButton = () => {
  const navigate = useNavigate();
  
  return (
    <img
      src={Images.icon_return}
      alt="return"
      className="back-arrow"
      onClick={() => navigate(-1)}
    />
  );
};

export default BackButton;
