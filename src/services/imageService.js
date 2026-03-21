import axios from 'axios';
import { API_URL } from './api';

/**
 * 上傳圖片進行去背處理
 * @param {File} file - 圖片檔案
 * @returns {Promise<string>} - 處理後的圖片 URL
 */
export const uploadImageForProcessing = async (file) => {
  const formData = new FormData();
  formData.append('image_data', file);
  formData.append('filename', file.name);

  try {
    const uploadUrl = `${API_URL}/api/upload-image`;

    console.log("正在上傳圖片至:", uploadUrl);

    const response = await axios.post(uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });

    console.log("回傳結果:", response.data);

    // 根據後端回應取得圖片 URL
    if (response.data.processed_url || response.data.storage_status?.url) {
      const imageUrl = response.data.processed_url || response.data.storage_status.url;
      console.log("收到圖片 URL:", imageUrl);
      return imageUrl;
    } else {
      throw new Error('後端未返回圖片 URL');
    }
  } catch (error) {
    console.error("上傳失敗:", error.message);
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
