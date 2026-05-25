import React, { useState, useRef, useEffect } from 'react';
import './ImageCropper.css';

/**
 * 圖像裁切組件
 * @param {Object} props
 * @param {boolean} props.isOpen - 裁切器是否打開
 * @param {string|File} props.imageSrc - 要裁切的圖像來源（URL 或 File）
 * @param {Function} props.onClose - 關閉裁切器回調
 * @param {Function} props.onCropComplete - 裁切完成回調，傳遞裁切後的 File
 * @param {number} props.aspectRatio - 縱橫比 (寬/高，e.g., 1 表示正方形)
 */
const ImageCropper = ({ isOpen, imageSrc, onClose, onCropComplete, aspectRatio = 1 }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 裁切框狀態
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState(null); // 'move', 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w', 'pan'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  // 初始化圖像
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let dataUrl;

        // 如果是 File 對象，轉換為 Data URL
        if (imageSrc instanceof File) {
          const reader = new FileReader();
          await new Promise((resolve, reject) => {
            reader.onload = () => {
              dataUrl = reader.result;
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageSrc);
          });
        } else {
          dataUrl = imageSrc;
        }

        // 加載圖像
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });

        setImageData({ 
          dataUrl, 
          width: img.naturalWidth || img.width, 
          height: img.naturalHeight || img.height 
        });
        setZoomLevel(1);
        setImageOffset({ x: 0, y: 0 });

        // 初始化裁切框大小
        setTimeout(() => {
          initializeCropArea();
        }, 100);
      } catch (err) {
        console.error('❌ 加載圖像失敗:', err);
        setError('無法加載圖像');
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [isOpen, imageSrc]);

  // 全局拖動事件監聽
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging || !dragMode) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (dragMode === 'pan') {
        // 移動圖像
        setImageOffset((prev) => ({
          x: prev.x + deltaX / zoomLevel,
          y: prev.y + deltaY / zoomLevel,
        }));
      } else if (dragMode === 'move') {
        // 移動裁切框
        setCropArea((prev) => {
          let newX = prev.x + deltaX;
          let newY = prev.y + deltaY;

          // 限制邊界
          if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            newX = Math.max(0, Math.min(newX, containerRect.width - prev.width));
            newY = Math.max(0, Math.min(newY, containerRect.height - prev.height));
          }

          return { ...prev, x: newX, y: newY };
        });
      } else {
        // 調整大小
        setCropArea((prev) => {
          let newX = prev.x;
          let newY = prev.y;
          let newWidth = prev.width;
          let newHeight = prev.height;
          const minSize = 50; // 最小裁切框大小

          if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();

            switch (dragMode) {
              case 'n': // 上邊
                newY = Math.max(0, prev.y + deltaY);
                newHeight = Math.max(minSize, prev.height - (newY - prev.y));
                newY = prev.y + prev.height - newHeight;
                break;
              case 's': // 下邊
                newHeight = Math.max(minSize, Math.min(containerRect.height - prev.y, prev.height + deltaY));
                break;
              case 'e': // 右邊
                newWidth = Math.max(minSize, Math.min(containerRect.width - prev.x, prev.width + deltaX));
                break;
              case 'w': // 左邊
                newX = Math.max(0, prev.x + deltaX);
                newWidth = Math.max(minSize, prev.width - (newX - prev.x));
                newX = prev.x + prev.width - newWidth;
                break;
              case 'nw': // 左上角
                newX = Math.max(0, prev.x + deltaX);
                newY = Math.max(0, prev.y + deltaY);
                newWidth = Math.max(minSize, prev.width - (newX - prev.x));
                newHeight = Math.max(minSize, prev.height - (newY - prev.y));
                newX = prev.x + prev.width - newWidth;
                newY = prev.y + prev.height - newHeight;
                break;

              case 'ne': // 右上角
                newY = Math.max(0, prev.y + deltaY);
                newWidth = Math.max(minSize, Math.min(containerRect.width - prev.x, prev.width + deltaX));
                newHeight = Math.max(minSize, prev.height - (newY - prev.y));
                newY = prev.y + prev.height - newHeight;
                break;

              case 'sw': // 左下角
                newX = Math.max(0, prev.x + deltaX);
                newWidth = Math.max(minSize, prev.width - (newX - prev.x));
                newHeight = Math.max(minSize, Math.min(containerRect.height - prev.y, prev.height + deltaY));
                newX = prev.x + prev.width - newWidth;
                break;

              case 'se': // 右下角
                newWidth = Math.max(minSize, Math.min(containerRect.width - prev.x, prev.width + deltaX));
                newHeight = Math.max(minSize, Math.min(containerRect.height - prev.y, prev.height + deltaY));
                break;

              default:
                return prev;
            }

            // 應用縱橫比約束
            if (aspectRatio && aspectRatio > 0) {
              if (dragMode === 'n' || dragMode === 's' || (Math.abs(deltaY) > Math.abs(deltaX) && dragMode.length === 2)) {
                // 優先調整寬度以匹配高度
                const targetWidth = newHeight * aspectRatio;
                if (dragMode === 'n' || dragMode === 's' || dragMode === 'ne' || dragMode === 'se') {
                  newWidth = Math.min(containerRect.width - newX, targetWidth);
                  newHeight = newWidth / aspectRatio;
                } else {
                  // nw, sw
                  newWidth = Math.min(newX + prev.width, targetWidth);
                  newX = prev.x + prev.width - newWidth;
                  newHeight = newWidth / aspectRatio;
                  if (dragMode === 'nw') newY = prev.y + prev.height - newHeight;
                }
              } else {
                // 優先調整高度以匹配寬度
                const targetHeight = newWidth / aspectRatio;
                if (dragMode === 'e' || dragMode === 'w' || dragMode === 'se' || dragMode === 'sw') {
                  newHeight = Math.min(containerRect.height - newY, targetHeight);
                  newWidth = newHeight * aspectRatio;
                  if (dragMode === 'w' || dragMode === 'sw') newX = prev.x + prev.width - newWidth;
                } else {
                  // ne, nw
                  newHeight = Math.min(newY + prev.height, targetHeight);
                  newY = prev.y + prev.height - newHeight;
                  newWidth = newHeight * aspectRatio;
                  if (dragMode === 'nw') newX = prev.x + prev.width - newWidth;
                }
              }
            }

            // 最後邊界檢查
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + newWidth > containerRect.width) newWidth = containerRect.width - newX;
            if (newY + newHeight > containerRect.height) newHeight = containerRect.height - newY;
          }

          return { x: newX, y: newY, width: newWidth, height: newHeight };
        });
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, dragMode, aspectRatio, zoomLevel]);

  // 初始化裁切框
  const initializeCropArea = () => {
    if (!containerRef.current || !imgRef.current) return;

    setImageOffset({ x: 0, y: 0 });

    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const maxWidth = containerRect.width * 0.8;
    const maxHeight = containerRect.height * 0.6;

    let width = Math.min(maxWidth, imgRect.width * 0.8);
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    const x = (containerRect.width - width) / 2;
    const y = (containerRect.height - height) / 2;

    setCropArea({ x, y, width, height });
  };

  // 處理裁切框拖動 - 區分移動框和調整大小
  const handleMouseDown = (e, mode = 'pan') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragMode(mode);
  };

  const handleMouseMove = (e) => {
    // 这个函数现在由全局事件监听器处理
    // 保留用於向後兼容
  };

  const handleMouseUp = () => {
    // 这个函数现在由全局事件监听器处理
    // 保留用於向後兼容
  };

  // 處理縮放
  const handleZoom = (delta) => {
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta * 0.1));
    setZoomLevel(newZoom);
  };

  // 完成裁切
  const handleCropComplete = async () => {
    if (!imgRef.current || !canvasRef.current || !imageData) return;

    try {
      setIsLoading(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imgRef.current;
      const imgRect = img.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // 計算相對於原始圖像的裁切區域
      const scaleX = imageData.width / imgRect.width;
      const scaleY = imageData.height / imgRect.height;

      const cropX = (cropArea.x - (imgRect.left - containerRect.left)) * scaleX;
      const cropY = (cropArea.y - (imgRect.top - containerRect.top)) * scaleY;
      const cropWidth = cropArea.width * scaleX;
      const cropHeight = cropArea.height * scaleY;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        img,
        Math.max(0, cropX),
        Math.max(0, cropY),
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // 轉換為 Blob 並創建 File
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
            onCropComplete?.(file);
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('❌ 裁切失敗:', err);
      setError('裁切失敗，請重試。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper-container">
        <div className="cropper-header">
          <h2>裁切圖像</h2>
          <button 
            className="cropper-close-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div
          className="cropper-content"
          ref={containerRef}
          onMouseDown={(e) => handleMouseDown(e, 'pan')}
        >
          {isLoading && !imageData ? (
            <div className="cropper-loading">
              <div className="loading-spinner"></div>
              <p>加載圖像中...</p>
            </div>
          ) : error ? (
            <div className="cropper-error">
              <p>{error}</p>
            </div>
          ) : imageData ? (
            <>
              <div 
                className="image-wrapper" 
                style={{ 
                  transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${zoomLevel})` 
                }}
              >
                <img ref={imgRef} src={imageData.dataUrl} alt="crop-source" />
              </div>

              <div
                className="crop-box"
                style={{
                  left: `${cropArea.x}px`,
                  top: `${cropArea.y}px`,
                  width: `${cropArea.width}px`,
                  height: `${cropArea.height}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'pan')}
              >
                {/* 邊緣調整句柄 */}
                <div className="crop-edge crop-edge-n" onMouseDown={(e) => handleMouseDown(e, 'n')} />
                <div className="crop-edge crop-edge-s" onMouseDown={(e) => handleMouseDown(e, 's')} />
                <div className="crop-edge crop-edge-e" onMouseDown={(e) => handleMouseDown(e, 'e')} />
                <div className="crop-edge crop-edge-w" onMouseDown={(e) => handleMouseDown(e, 'w')} />

                {/* 角落調整句柄 */}
                <div 
                  className="crop-handle crop-handle-nw"
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                  title="拖動調整大小"
                />
                <div 
                  className="crop-handle crop-handle-ne"
                  onMouseDown={(e) => handleMouseDown(e, 'ne')}
                  title="拖動調整大小"
                />
                <div 
                  className="crop-handle crop-handle-sw"
                  onMouseDown={(e) => handleMouseDown(e, 'sw')}
                  title="拖動調整大小"
                />
                <div 
                  className="crop-handle crop-handle-se"
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                  title="拖動調整大小"
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="cropper-toolbar">
          <button
            className="zoom-btn"
            onClick={() => handleZoom(-1)}
            disabled={isLoading || zoomLevel <= 0.5}
          >
            −
          </button>
          <span className="zoom-info">{Math.round(zoomLevel * 100)}%</span>
          <button
            className="zoom-btn"
            onClick={() => handleZoom(1)}
            disabled={isLoading || zoomLevel >= 3}
          >
            +
          </button>
        </div>

        <div className="cropper-footer">
          <button 
            className="cropper-cancel-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </button>
          <button 
            className="cropper-confirm-btn"
            onClick={handleCropComplete}
            disabled={isLoading}
          >
            {isLoading ? '處理中...' : '確認裁切'}
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default ImageCropper;
