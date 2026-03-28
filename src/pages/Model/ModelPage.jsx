import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './ModelPage.css';
import * as Images from '../../assets';
import BackButton from '../../components/Header/BackButton';
import Navigation from '../../components/Navigation/Navigation';
import BottomNavigation from '../../components/Navigation/BottomNavigation';

const ModelPage = () => {
    // 模擬模特兒數據
    const models = [
    { id: 1, name: '預設模特' },
    { id: 2, name: '模特1' },
    // 你可以在這裡隨意新增更多物件來測試滾動
    ];
    return (
        <div className="container">
            <Navigation position="top" />

            {/* 左上角返回箭頭 */}
            <BackButton />

            <BottomNavigation onAddButtonClick={handleBlackButtonClick} />
        </div>
    );
}

export default ModelPage;
