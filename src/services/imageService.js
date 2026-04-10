import axios from 'axios';
import { API_URL } from './api';

/**
 * 上傳衣服圖片進行去背處理
 * @param {File} file - 衣服圖片檔案
 * @returns {Promise<string>} - 去背後的圖片 URL
 */
export const uploadImageForProcessing = async (file) => {
  const formData = new FormData();
  formData.append('image_data', file);

  try {
    // 從 localStorage 取得 JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到認證 token，請先登入');
    }

    const uploadUrl = `${API_URL}/picture/clothes/`;

    console.log("正在上傳衣服至:", uploadUrl);

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    console.log("回傳結果:", response.data);

    // 根據後端回應取得圖片 URL
    if (response.data.processed_url) {
      const imageUrl = response.data.processed_url;
      console.log("收到衣服圖片 URL:", imageUrl);
      return imageUrl;
    } else {
      throw new Error('後端未返回圖片 URL');
    }
  } catch (error) {
    console.error("上傳失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};

/**
 * 取得已處理的圖片列表
 * @returns {Promise<Array>} - 圖片列表
 */
export const getProcessedImages = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/processed-images`);
    return response.data.images || [];
  } catch (error) {
    console.error("取得圖片列表失敗:", error.message);
    throw error;
  }
};

/**
 * 上傳衣服圖片進行去背處理（衣服上傳）
 * @param {File} file - 衣服圖片檔案
 * @returns {Promise<Object>} - 衣服上傳結果 (包含 processed_url, clothes_data 等)
 */
export const uploadClothes = async (file) => {
  const formData = new FormData();
  formData.append('image_data', file);

  try {
    // 從 localStorage 取得 JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到認證 token，請先登入');
    }

    const uploadUrl = `${API_URL}/picture/clothes/`;

    console.log("正在上傳衣服至:", uploadUrl);

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    console.log("衣服上傳成功:", response.data);
    
    // 返回完整的上傳結果
    return {
      success: true,
      processed_url: response.data.processed_url,
      clothes_data: response.data.clothes_data,
      ai_status: response.data.ai_status,
      storage_status: response.data.storage_status,
    };
  } catch (error) {
    console.error("上傳衣服失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};

/**
 * 上傳模特照片（目前暫時保持舊 API，之後改成 /picture/user/photo）
 * @param {File} file - 圖片檔案
 * @returns {Promise<Object>} - 上傳結果 (包含 photo ID, original_url, removed_bg_url 等)
 */
export const uploadModelPhoto = async (file) => {
  const formData = new FormData();
  formData.append('image_data', file);
  formData.append('filename', file.name);

  try {
    // 從 localStorage 取得 JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到認證 token，請先登入');
    }

    const uploadUrl = `${API_URL}/api/upload-image`;

    console.log("正在上傳模特照片至:", uploadUrl);

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    console.log("模特照片上傳成功:", response.data);
    
    // 轉換响應格式以適應前端需求
    return {
      success: true,
      photo: {
        id: response.data.image_id || response.data.id,
        original_url: response.data.storage_status?.url || response.data.original_url,
        removed_bg_url: response.data.processed_url || response.data.removed_bg_url,
        status: 'completed'
      }
    };
  } catch (error) {
    console.error("上傳模特照片失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};

/**
 * 刪除圖片
 * @param {string} imageId - 圖片 ID
 * @returns {Promise<Object>} - 刪除結果
 */
export const deleteImage = async (imageId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error("刪除圖片失敗:", error.message);
    throw error;
  }
};
