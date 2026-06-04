import React, { useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import OutfitDisplay from '../OutfitDisplay/OutfitDisplay';
import './VirtualOutfitList.css';

/**
 * 虛擬滾動穿搭列表 - 只在視口內渲染項目，大幅減少3D模型加載
 * 使用場景：WardrobePage 和 FavoritesPage 的穿搭列表視圖
 * 
 * @param {Array} outfits - 穿搭列表資料
 * @param {Function} onOutfitClick - 點擊穿搭項時的回調
 * @param {Object} show3DMap - 追蹤每個穿搭的3D顯示狀態
 * @param {Function} onToggle3D - 切換2D/3D顯示的回調
 * @param {Function} getImageUrl - 獲取完整URL的函數
 * @param {number} itemHeight - 每個穿搭項的高度（px）
 */
const VirtualOutfitList = ({
  outfits,
  onOutfitClick,
  show3DMap = {},
  onToggle3D,
  getImageUrl,
  itemHeight = 420, // 高度包括圖片、標籤、日期等
  windowHeight = 800 // 可見窗口高度
}) => {
  const itemCount = outfits?.length || 0;
  const pressTimerRef = React.useRef({}); // 追蹤每個穿搭項的按下計時器
  const LONG_PRESS_THRESHOLD = 500; // 500ms 判定為長按

  const containerRef = React.useRef(null);
  const [listHeight, setListHeight] = React.useState(windowHeight);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.target.clientHeight;
        if (height > 0) {
          setListHeight(height);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    const initialHeight = containerRef.current.clientHeight;
    if (initialHeight > 0) {
      setListHeight(initialHeight);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (!containerRef.current || containerRef.current.clientHeight === 0) {
      setListHeight(windowHeight);
    }
  }, [windowHeight]);

  // 創建行渲染器
  const Row = useCallback(({ index, style }) => {
    const outfit = outfits[index];
    if (!outfit) return null;

    const outfitId = outfit.model_uid || outfit.model_uuid || outfit.id;
    const isShow3D = show3DMap[outfitId];

    const handleMouseDown = () => {
      const startTime = Date.now();
      pressTimerRef.current[outfitId] = startTime;
    };

    const handleMouseUp = (e) => {
      const startTime = pressTimerRef.current[outfitId];
      if (startTime) {
        const pressDuration = Date.now() - startTime;
        // 檢查點擊目標是否為按鈕或其子元素
        const isClickOnButton = e.target.closest('.unified-view-button, .wardrobe-toggle-button, .favorites-toggle-button');
        // 只有短按（少於 LONG_PRESS_THRESHOLD）才觸發點擊，且不是按鈕
        if (pressDuration < LONG_PRESS_THRESHOLD && !isClickOnButton) {
          onOutfitClick(outfit);
        }
        delete pressTimerRef.current[outfitId];
      }
    };

    const handleMouseLeave = () => {
      // 用戶按著滑鼠移出時，取消計時
      delete pressTimerRef.current[outfitId];
    };

    return (
      <div style={style} key={outfitId} className="virtual-outfit-item-wrapper">
        <div
          className="outfit-item"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'pointer', marginBottom: '16px' }}
        >
          <div className="outfit-styles">
            {Array.isArray(outfit.model_style) && outfit.model_style.length > 0 ? (
              outfit.model_style.map((style, styleIndex) => (
                <span key={styleIndex} className="style-tag">
                  {style}
                </span>
              ))
            ) : outfit.model_style && typeof outfit.model_style === 'string' ? (
              <span className="style-tag">{outfit.model_style}</span>
            ) : (
              <span className="style-tag">未分類</span>
            )}
          </div>

          <div className="virtual-outfit-model-section">
            <OutfitDisplay
              url={getImageUrl(isShow3D ? outfit.model_picture_3d : outfit.model_picture)}
              alt="模特穿搭"
              className="virtual-outfit-model-image"
              style={{ borderRadius: '8px' }}
              containerStyle={{
                width: '100%',
                height: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              cameraConfig={{
                position: [0, 0.5, 1.5],
                fov: 50
              }}
            />
            {outfit.model_picture_3d && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle3D(outfitId);
                }}
                className="unified-view-button result-mode wardrobe-toggle-button"
                title={isShow3D ? '切換到 2D 結果' : '切換到 3D 結果'}
              >
                <span className="view-icon">🔄</span>
                <span className="view-label">{isShow3D ? '看2D' : '看3D'}</span>
              </button>
            )}
            {outfit.model_favorite && (
              <span className="virtual-outfit-favorite-mark">
                ❤️
              </span>
            )}
          </div>

          <div className="virtual-outfit-info">
            <span className="virtual-outfit-date">
              {outfit.model_created_time || outfit.created_at
                ? new Date(
                    outfit.model_created_time || outfit.created_at
                  ).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })
                : '日期未知'}
            </span>
          </div>
        </div>
      </div>
    );
  }, [outfits, show3DMap, onToggle3D, getImageUrl, onOutfitClick]);

  return (
    <div className="outfit-history-container">
      <h2 className="virtual-outfit-list-title">
        <span className="virtual-outfit-list-title-bar"></span>
        我的穿搭{' '}
        <span className="virtual-outfit-list-count">
          (共 {itemCount} 組)
        </span>
      </h2>

      {itemCount > 0 ? (
        <div className="virtual-outfit-list-wrapper" ref={containerRef}>
          <List
            height={listHeight}
            itemCount={itemCount}
            itemSize={itemHeight}
            width="100%"
            overscanCount={2}
          >
            {Row}
          </List>
        </div>
      ) : (
        <div className="virtual-outfit-list-empty">
          <div className="virtual-outfit-list-empty-icon">✨</div>
          <p>還沒有穿搭紀錄</p>
        </div>
      )}
    </div>
  );
};

export default VirtualOutfitList;
