import React, { useState, useRef, useEffect } from 'react';
import './CameraCapture.css';

/**
 * 相機拍照組件
 * @param {Object} props
 * @param {boolean} props.isOpen - 相機是否打開
 * @param {Function} props.onClose - 關閉相機回調
 * @param {Function} props.onCapture - 拍照後的回調，傳遞拍照圖片(File)
 * @param {boolean} props.initialFacingMode - 初始相機方向 (true: 前置/自拍, false: 後置/環境, 預設: true)
 */
const CameraCapture = ({ isOpen, onClose, onCapture, initialFacingMode = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFacingUser, setIsFacingUser] = useState(initialFacingMode);

  // 初始化相機
  useEffect(() => {
    if (!isOpen) {
      // 關閉相機
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    const startCamera = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 先嘗試用用戶相機（前置相機）
        const constraints = {
          video: {
            facingMode: isFacingUser ? 'user' : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        // 將 stream 綁定到 video 元素
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('❌ 無法訪問相機:', err);
        setError('無法訪問相機。請檢查瀏覽器權限或設備是否有相機。');
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, isFacingUser]);

  // 拍照
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsLoading(true);

      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;

      // 設置 canvas 的寬高為視頻的寬高
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      // 如果是後置相機，需要水平翻轉
      if (!isFacingUser) {
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -video.videoWidth, 0);
        context.restore();
      } else {
        context.drawImage(video, 0, 0);
      }

      // 將 canvas 轉換為 Blob
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            // 創建 File 對象
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            
            // 關閉相機
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
              setStream(null);
            }

            // 調用回調
            onCapture?.(file);
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('❌ 拍照失敗:', err);
      setError('拍照失敗，請重試。');
    } finally {
      setIsLoading(false);
    }
  };

  // 切換相機方向
  const handleToggleCamera = () => {
    setIsFacingUser(!isFacingUser);
  };

  if (!isOpen) return null;

  return (
    <div className="camera-capture-overlay">
      <div className="camera-capture-container">
        <div className="camera-header">
          <h2>拍照</h2>
          <button 
            className="camera-close-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="camera-content">
          {isLoading && !stream ? (
            <div className="camera-loading">
              <div className="loading-spinner"></div>
              <p>正在初始化相機...</p>
            </div>
          ) : error ? (
            <div className="camera-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>

        <div className="camera-footer">
          <button 
            className="camera-toggle-btn"
            onClick={handleToggleCamera}
            disabled={isLoading || !stream}
            title="切換相機方向"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 20 20 20 20 6 16 6"></polyline>
              <polyline points="4 9 2 11"></polyline>
              <polyline points="20 9 22 11"></polyline>
            </svg>
            切換
          </button>

          <button 
            className="camera-capture-btn"
            onClick={handleCapture}
            disabled={isLoading || !stream}
          >
            {isLoading ? '處理中...' : '拍照'}
          </button>

          <button 
            className="camera-cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
