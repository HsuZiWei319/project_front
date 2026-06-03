import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // HMR 配置 - 適配 Docker 容器環境
    hmr: {
      // 在容器中，使用 'localhost' 讓客戶端自動偵測正確的 IP
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
      // 增加 HMR 超時時間，防止連接過於敏感
    },
    // 增加超時時間，防止頻繁斷開
    middlewareMode: false,
    // 監聽所有網絡介面
    host: '0.0.0.0',
    // API 代理配置 - 將請求轉發到後端
    proxy: {
      '/api': {
        target: 'http://localhost:30000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/media': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
})
