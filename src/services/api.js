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

// 用來標記是否正在刷新 Token
let isRefreshing = false;
// 待處理的請求隊列
let failedQueue = [];

// 處理待處理請求隊列
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// 請求攔截器：自動添加認證 token，並正確處理 FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 如果是 FormData，刪除 Content-Type 讓瀏覽器自動設定為 multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器：自動刷新 Token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // 如果是 401 錯誤且還沒有重試過
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果已經在刷新，將此請求加入待處理隊列
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      // 標記正在刷新
      isRefreshing = true;
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // 沒有 refreshToken，直接登出
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(error);
      }

      // 嘗試刷新 Token
      return axios.post(`${API_URL}/account/user/refresh`, 
        { refresh: refreshToken },
        { 
          baseURL: API_URL,
          headers: { 'Content-Type': 'application/json' }
        }
      ).then(response => {
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        // 更新本地存儲的 Token
        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 更新原始請求的 Authorization header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log('✅ Token 已自動刷新');

        // 處理隊列中的所有請求
        processQueue(null, newAccessToken);

        // 重試原始請求
        isRefreshing = false;
        return apiClient(originalRequest);
      }).catch(err => {
        // 刷新失敗，清除存儲並登出
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        processQueue(err, null);
        
        console.log('⚠️  Token 刷新失敗，請重新登入');
        isRefreshing = false;
        window.location.href = '/';
        return Promise.reject(err);
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };
