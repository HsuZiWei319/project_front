import apiClient from './api';

/**
 * 上傳衣服圖片進行去背處理
 * @param {File} file - 衣服圖片檔案
 * @returns {Promise<string>} - 去背後的圖片 URL
 */
export const uploadImageForProcessing = async (file) => {
  const formData = new FormData();
  formData.append('image_data', file);

  try {
    console.log("正在上傳衣服至:", '/picture/clothes/');

    const response = await apiClient.post('/picture/clothes/', formData, {
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
    const response = await apiClient.get('/api/processed-images');
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
    console.log("正在上傳衣服至:", '/picture/clothes/');

    const response = await apiClient.post('/picture/clothes/', formData, {
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
 * 上傳模特照片至 /picture/user/photo API
 * @param {File} file - 圖片檔案
 * @returns {Promise<Object>} - 上傳結果 (包含 user_image_url 等)
 */
export const uploadModelPhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo_file', file);

  try {
    console.log("正在上傳模特照片至:", '/picture/user/photo');

    const response = await apiClient.post('/picture/user/photo', formData, {
      timeout: 60000,
    });

    console.log("模特照片上傳成功:", response.data);
    
    // 返回用戶照片 URL
    // 後端 API 返回的結構：response.data.user.user_image_url
    const user_image_url = response.data.user?.user_image_url || response.data.data?.user_image_url;
    
    if (!user_image_url) {
      console.error("❌ 後端返回的用戶照片 URL 為空:", {
        response_data: response.data,
        user_obj: response.data.user,
        data_obj: response.data.data,
        user_image_url: user_image_url
      });
      throw new Error('後端返回的照片 URL 為空，請檢查後端响應');
    }
    
    return {
      success: true,
      photo: {
        user_image_url: user_image_url,
        upload_time: response.data.user?.updated_at || response.data.data?.upload_time,
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
 * 獲取用戶之前上傳的模特照片
 * @returns {Promise<Object>} - 用戶照片信息（包含 user_image_url）
 */
export const getModelPhoto = async () => {
  try {
    console.log("正在獲取用戶模特照片...");

    const response = await apiClient.get('/picture/user/photo', {
      timeout: 30000,
    });

    console.log("獲取模特照片成功:", response.data);
    
    // 後端 GET 端點返回的結構：response.data.data.user_image_url
    const user_image_url = response.data.data?.user_image_url;
    const upload_time = response.data.data?.upload_time;
    
    if (!user_image_url) {
      console.log("⚠️  用戶未設置模特照片");
      return {
        success: false,
        message: '用戶未設置模特照片',
        photo: null
      };
    }
    
    return {
      success: true,
      photo: {
        user_image_url: user_image_url,
        upload_time: upload_time,
        status: 'completed'
      }
    };
  } catch (error) {
    // 如果是 404（照片不存在），返回 success: false
    if (error.response?.status === 404) {
      console.log("⚠️  用戶未設置模特照片（404）");
      return {
        success: false,
        message: '用戶未設置模特照片',
        photo: null
      };
    }
    
    console.error("獲取模特照片失敗:", error.message);
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
    const response = await apiClient.delete(`/api/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error("刪除圖片失敗:", error.message);
    throw error;
  }
};

/**
 * 上傳衣服圖片並包含測量數據（袖長、褲長、肩寬、腰圍）
 * @param {File} file - 衣服圖片檔案
 * @param {Object} measurements - 測量數據 { sleeve_length, pant_length, shoulder_width, waist_circumference }
 * @returns {Promise<Object>} - 衣服上傳結果
 */
export const uploadClothesWithMeasurements = async (file, measurements) => {
  const formData = new FormData();
  formData.append('image_data', file);
  formData.append('clothes_arm_length', measurements.sleeve_length);
  formData.append('clothes_leg_length', measurements.pant_length);
  formData.append('clothes_shoulder_width', measurements.shoulder_width);
  formData.append('clothes_waistline', measurements.waist_circumference);

  try {
    console.log("正在上傳衣服至:", '/picture/clothes/');
    console.log("測量數據:", measurements);

    const response = await apiClient.post('/picture/clothes/', formData, {
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
 * 獲取單個衣服的詳細信息
 * @param {number|string} clothesId - 衣服 ID
 * @returns {Promise<Object>} - 衣服詳細信息
 */
export const getClothesDetail = async (clothesId) => {
  try {
    const url = `/picture/clothes/${clothesId}/`;

    console.log("正在獲取衣服詳細信息:", url);

    const response = await apiClient.get(url);

    console.log("獲取衣服詳細信息成功:", response.data);
    return response.data;
  } catch (error) {
    console.error("獲取衣服詳細信息失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};

/**
 * 更新衣服信息
 * @param {number|string} clothesId - 衣服 ID
 * @param {Object} updateData - 更新的衣服數據 { clothes_category, clothes_arm_length, clothes_shoulder_width, clothes_waistline, clothes_leg_length, colors, styles }
 * @returns {Promise<Object>} - 更新後的衣服信息
 */
export const updateClothes = async (clothesId, updateData) => {
  try {
    const url = `/picture/clothes/${clothesId}/`;

    console.log("正在更新衣服信息:", url);
    console.log("更新數據:", updateData);

    const response = await apiClient.put(url, updateData);

    console.log("衣服更新成功:", response.data);
    return response.data;
  } catch (error) {
    console.error("衣服更新失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};

/**
 * 更新衣服信息（包含新圖片）
 * @param {number|string} clothesId - 衣服 ID
 * @param {File} file - 新的衣服圖片檔案（可選）
 * @param {Object} measurements - 測量數據 { sleeve_length, pant_length, shoulder_width, waist_circumference, category }
 * @returns {Promise<Object>} - 更新後的衣服信息
 */
export const updateClothesWithImage = async (clothesId, file, measurements) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到認證 token，請先登入');
    }

    const url = `${API_URL}/picture/clothes/${clothesId}/`;

    console.log("正在更新衣服信息（含圖片）:", url);
    console.log("測量數據:", measurements);

    // 如果有新的圖片，需要先上傳圖片，然後更新衣服信息
    if (file) {
      const formData = new FormData();
      formData.append('image_data', file);
      formData.append('clothes_arm_length', measurements.sleeve_length);
      formData.append('clothes_leg_length', measurements.pant_length);
      formData.append('clothes_shoulder_width', measurements.shoulder_width);
      formData.append('clothes_waistline', measurements.waist_circumference);
      if (measurements.category) {
        formData.append('clothes_category', measurements.category);
      }

      const response = await apiClient.put(url, formData, {
        timeout: 60000,
      });

      console.log("衣服更新成功（含圖片）:", response.data);
      return response.data;
    } else {
      // 只更新文本信息
      const updateData = {
        clothes_arm_length: measurements.sleeve_length,
        clothes_leg_length: measurements.pant_length,
        clothes_shoulder_width: measurements.shoulder_width,
        clothes_waistline: measurements.waist_circumference,
      };
      if (measurements.category) {
        updateData.clothes_category = measurements.category;
      }

      const response = await apiClient.put(url, updateData);

      console.log("衣服更新成功:", response.data);
      return response.data;
    }
  } catch (error) {
    console.error("衣服更新失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};

/**
 * 刪除衣服
 * @param {number|string} clothesId - 衣服 ID
 * @returns {Promise<Object>} - 刪除結果
 */
export const deleteClothes = async (clothesId) => {
  try {
    const url = `/picture/clothes/${clothesId}/`;

    console.log("正在刪除衣服:", url);

    const response = await apiClient.delete(url);

    console.log("衣服刪除成功:", response.data);
    return response.data;
  } catch (error) {
    console.error("衣服刪除失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};

/**
 * 切換衣服的喜歡狀態
 * @param {number|string} clothesId - 衣服 ID
 * @returns {Promise<Object>} - 更新後的衣服信息（包含最新的喜歡狀態）
 */
export const toggleClothesLike = async (clothesId) => {
  try {
    const url = `/picture/clothes/${clothesId}/favorite`;

    console.log("正在切換衣服喜歡狀態:", url);

    const response = await apiClient.post(url);

    console.log("衣服喜歡狀態更新成功:", response.data);
    return response.data;
  } catch (error) {
    console.error("切換喜歡狀態失敗:", error.message);
    if (error.response?.data) {
      console.error("後端錯誤訊息:", error.response.data);
    }
    throw error;
  }
};
