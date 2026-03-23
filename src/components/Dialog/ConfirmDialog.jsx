import React, { useState } from 'react';
import '../../App.css';
import PrimaryButton from '../Button/PrimaryButton';

const ConfirmDialog = ({ 
  title, 
  message, 
  confirmText = '確認', 
  cancelText = '取消',
  onConfirm, 
  onCancel,
  isLoading = false,
  requirePassword = false,
  confirmButtonColor = '#FF4444'
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requirePassword) {
      if (!password.trim()) {
        setError('請輸入密碼');
        return;
      }
      await onConfirm(password);
    } else {
      await onConfirm();
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError(''); // 清除錯誤訊息
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-title">{title}</div>
        <div className="dialog-message">{message}</div>
        
        {requirePassword && (
          <div className="input-group-dialog">
            <input
              type="password"
              placeholder="請輸入密碼確認"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
            />
            {error && <div className="dialog-error">{error}</div>}
          </div>
        )}

        <div className="dialog-buttons">
          <button 
            className="dialog-btn confirm-btn" 
            onClick={handleConfirm}
            disabled={isLoading}
            style={{ color: confirmButtonColor }}
          >
            {isLoading ? '處理中...' : confirmText}
          </button>
          <button 
            className="dialog-btn cancel-btn" 
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
