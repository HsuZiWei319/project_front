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

// 請求攔截器：自動添加認證 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器：處理 401 錯誤
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token 過期或無效，清除本地儲存並導向登入頁
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };
