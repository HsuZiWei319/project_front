import React, { useState, useMemo } from 'react';
import ModelViewer from '../3D/ModelViewer';
import { detectVirtualTryOnFileType } from '../../services/imageService';

/**
 * 虛擬試穿結果展示組件
 * 支援 GLB (3D 模型) 和 PNG (2D 圖片) 兩種格式
 * 
 * @param {string} url - 虛擬試穿結果 URL (model_picture)
 * @param {string} alt - 圖片 alt 文本
 * @param {string} className - CSS 類名
 * @param {object} style - 內聯樣式
 * @param {function} onError - 加載失敗的回調
 * @param {object} cameraConfig - 相機配置 { position: [x, y, z], fov: number }
 * @returns {JSX.Element}
 */
const OutfitDisplay = ({ 
  url, 
  alt = '虛擬試穿結果',
  className = '',
  style = {},
  onError = null,
  containerStyle = {},
  cameraConfig = {}
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelKey, setModelKey] = React.useState(0);
  const previousUrlRef = React.useRef(url);
  const previousFileTypeRef = React.useRef(null);

  // 檢測文件類型
  const fileType = useMemo(() => {
    return detectVirtualTryOnFileType(url);
  }, [url]);

  // 當 URL 改變時，更新模型 (但文件類型相同時不改變 key)
  React.useEffect(() => {
    if (previousUrlRef.current !== url) {
      console.log('🔄 虛擬試穿 URL 已改變:', previousUrlRef.current, '->', url);
      previousUrlRef.current = url;
      setIsLoading(true);
      setError(null);
      
      // 只在文件類型改變或首次加載時改變 key
      if (fileType === 'glb') {
        if (previousFileTypeRef.current !== 'glb') {
          // 延遲改變 key，給 Canvas 時間準備
          const timer = setTimeout(() => {
            setModelKey(prev => prev + 1);
          }, 100);
          return () => clearTimeout(timer);
        }
        // 同為 GLB 時，只改變 key 來觸發模型重載
        setModelKey(prev => prev + 1);
      }
      previousFileTypeRef.current = fileType;
    }
  }, [url, fileType]);

  const handleImageError = (e) => {
    const errorMsg = `無法加載${fileType === 'glb' ? '3D 模型' : '圖片'}: ${url}`;
    console.error(errorMsg);
    setError(errorMsg);
    setIsLoading(false);
    
    if (onError) {
      onError(e);
    }
    
    // 顯示錯誤圖片
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f0f0f0" width="300" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3E圖片加載失敗%3C/text%3E%3C/svg%3E';
  };

  if (!url) {
    return (
      <div style={{ ...containerStyle, textAlign: 'center', color: '#999' }}>
        無結果數據
      </div>
    );
  }

  // GLB 模型 - 使用 3D ModelViewer
  if (fileType === 'glb') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...containerStyle
      }}>
        <ModelViewer
          key={modelKey}
          modelPath={url}
          onClose={() => {}}
          cameraConfig={cameraConfig}
        />
      </div>
    );
  }

  // PNG/JPG 圖片 - 使用普通 img
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      ...containerStyle
    }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d32f2f',
          fontSize: '14px',
          borderRadius: '8px',
          zIndex: 10
        }}>
          {error}
        </div>
      )}
      <img
        src={url}
        alt={alt}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          ...style
        }}
        onLoad={() => setIsLoading(false)}
        onError={handleImageError}
      />
    </div>
  );
};

export default OutfitDisplay;
