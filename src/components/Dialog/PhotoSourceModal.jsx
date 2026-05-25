import React, { useState } from 'react';
import './PhotoSourceModal.css';

/**
 * 照片源選擇模態框
 * @param {Object} props
 * @param {boolean} props.isOpen - 模態框是否打開
 * @param {Function} props.onClose - 關閉模態框回調
 * @param {Function} props.onSelectFromLibrary - 用戶選擇從照片庫選擇時的回調
 * @param {Function} props.onSelectCamera - 用戶選擇直接拍照時的回調
 */
const PhotoSourceModal = ({ isOpen, onClose, onSelectFromLibrary, onSelectCamera }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLibraryClick = async () => {
    setIsLoading(true);
    try {
      onSelectFromLibrary?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraClick = async () => {
    setIsLoading(true);
    try {
      onSelectCamera?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="photo-source-modal-overlay" onClick={onClose}>
      <div className="photo-source-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>選擇照片來源</h2>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="option-container">
            <button
              className="photo-option-btn library-btn"
              onClick={handleLibraryClick}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>從照片庫選擇</span>
            </button>

            <button
              className="photo-option-btn camera-btn"
              onClick={handleCameraClick}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 17H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-9"></path>
                <circle cx="12" cy="9" r="4"></circle>
              </svg>
              <span>直接拍照</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="modal-cancel-btn" 
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

export default PhotoSourceModal;
