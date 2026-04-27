import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 處理 Vite HMR 連接丟失
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    console.log('🔄 Vite 完整重載中...');
  });

  import.meta.hot.dispose(() => {
    console.log('🔌 HMR 連接丟失，準備重新連接...');
  });

  // 監聽 HMR 連接狀態
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  import.meta.hot.on('vite:beforePrune', () => {
    reconnectAttempts = 0;
  });
}

// 自動處理連接失敗的情況
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('message channel closed')) {
    console.warn('⚠️ 消息通道已關閉，將在 3 秒後重試連接...');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
