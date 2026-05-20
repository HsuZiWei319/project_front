import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import OutfitDisplay from '../OutfitDisplay/OutfitDisplay';
import './VirtualFavoriteOutfitList.css';

/**
 * 收藏穿搭的虛擬滾動列表
 * 只在視口內渲染項目，大幅減少3D模型加載
 */
const VirtualFavoriteOutfitList = ({
  outfits,
  onOutfitClick,
  show3DMap = {},
  onToggle3D,
  getImageUrl,
  itemHeight = 420,
  windowHeight = 800
}) => {
  const itemCount = outfits?.length || 0;

  const Row = useCallback(({ index, style }) => {
    const outfit = outfits[index];
    if (!outfit) return null;

    const outfitId = outfit.model_uid || outfit.model_uuid || outfit.id;
    const isShow3D = show3DMap[outfitId];

    return (
      <div style={style} key={outfitId} className="virtual-favorite-outfit-item-wrapper">
        <div
          className="outfit-item"
          onClick={() => onOutfitClick(outfit)}
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

          <div className="virtual-favorite-outfit-model-section">
            <OutfitDisplay
              url={getImageUrl(isShow3D ? outfit.model_picture_3d : outfit.model_picture)}
              alt="模特穿搭"
              className="virtual-favorite-outfit-model-image"
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
                className="unified-view-button result-mode favorites-toggle-button"
                title={isShow3D ? '切換到 2D 結果' : '切換到 3D 結果'}
              >
                <span className="view-icon">🔄</span>
                <span className="view-label">{isShow3D ? '看2D' : '看3D'}</span>
              </button>
            )}
            <span className="virtual-favorite-outfit-favorite-mark">
              ❤️
            </span>
          </div>

          <div className="virtual-favorite-outfit-info">
            <span className="virtual-favorite-outfit-date">
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
      <h2 className="virtual-favorite-outfit-list-title">
        <span className="virtual-favorite-outfit-list-title-bar"></span>
        穿搭收藏{' '}
        <span className="virtual-favorite-outfit-list-count">
          (共 {itemCount} 組)
        </span>
      </h2>

      {itemCount > 0 ? (
        <List
          height={windowHeight}
          itemCount={itemCount}
          itemSize={itemHeight}
          width="100%"
          overscanCount={2}
        >
          {Row}
        </List>
      ) : (
        <div className="virtual-favorite-outfit-list-empty">
          <div className="virtual-favorite-outfit-list-empty-icon">✨</div>
          <p>還沒有收藏任何穿搭喔</p>
        </div>
      )}
    </div>
  );
};

export default VirtualFavoriteOutfitList;
