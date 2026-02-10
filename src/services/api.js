import axios from 'axios';

// 從環境變數讀取 API 網址，若沒設定就用預設值
const API_URL = import.meta.env.VITE_API_URL || "http://192.168.233.128:30000";

// 建立 axios 實例並設定基本配置
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 可以在這裡添加請求攔截器或回應攔截器
// 例如：自動添加認證 token、處理錯誤等

export default apiClient;
export { API_URL };
