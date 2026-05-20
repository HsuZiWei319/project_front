import React, { useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import OutfitDisplay from '../OutfitDisplay/OutfitDisplay';
import '../../pages/Wardrobe/WardrobePage.css';

/**
 * 虚拟滚动穿搭列表 - 只在视口内渲染项目，大幅减少3D模型加载
 * 使用场景：WardrobePage 和 FavoritesPage 的穿搭列表视图
 * 
 * @param {Array} outfits - 穿搭列表数据
 * @param {Function} onOutfitClick - 点击穿搭项时的回调
 * @param {Object} show3DMap - 追踪每个穿搭的3D显示状态
 * @param {Function} onToggle3D - 切换2D/3D显示的回调
 * @param {Function} getImageUrl - 获取完整URL的函数
 * @param {number} itemHeight - 每个穿搭项的高度（px）
 */
const VirtualOutfitList = ({
  outfits,
  onOutfitClick,
  show3DMap = {},
  onToggle3D,
  getImageUrl,
  itemHeight = 420, // 高度包括图片、标签、日期等
  windowHeight = 800 // 可见窗口高度
}) => {
  const itemCount = outfits?.length || 0;

  // 创建行渲染器
  const Row = useCallback(({ index, style }) => {
    const outfit = outfits[index];
    if (!outfit) return null;

    const outfitId = outfit.model_uid || outfit.model_uuid || outfit.id;
    const isShow3D = show3DMap[outfitId];

    return (
      <div style={style} key={outfitId} className="virtual-outfit-item-wrapper">
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
              <span className="style-tag">未分类</span>
            )}
          </div>

          <div className="outfit-model-section">
            <OutfitDisplay
              url={getImageUrl(isShow3D ? outfit.model_picture_3d : outfit.model_picture)}
              alt="模特穿搭"
              className="outfit-model-image"
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
                title={isShow3D ? '切换到 2D 结果' : '切换到 3D 结果'}
              >
                <span className="view-icon">🔄</span>
                <span className="view-label">{isShow3D ? '看2D' : '看3D'}</span>
              </button>
            )}
            {outfit.model_favorite && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '20px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  zIndex: 5
                }}
              >
                ❤️
              </span>
            )}
          </div>

          <div className="outfit-info">
            <span className="outfit-date">
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
      <h2
        style={{
          fontSize: 'var(--font-2xl)',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          paddingLeft: '20px'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '4px',
            height: '28px',
            background: 'linear-gradient(180deg, var(--primary), #a855f7)',
            borderRadius: '2px'
          }}
        ></span>
        我的穿搭{' '}
        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-600)' }}>
          (共 {itemCount} 组)
        </span>
      </h2>

      {itemCount > 0 ? (
        <List
          height={windowHeight}
          itemCount={itemCount}
          itemSize={itemHeight}
          width="100%"
          overscanCount={2} // 预加载相邻项，提高滚动流畅度
        >
          {Row}
        </List>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--gray-600)'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✨</div>
          <p>还没有穿搭记录</p>
        </div>
      )}
    </div>
  );
};

export default VirtualOutfitList;
