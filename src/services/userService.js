import apiClient from './api';

/**
 * 獲取用戶身體數據
 * @returns {Promise<Object>} - 用戶身體信息
 */
export const getUserInfo = async () => {
  try {
    const response = await apiClient.get('/account/user/get_info');

    console.log('✅ 獲取用戶身體數據成功:', response.data);
    // 回傳嵌套在 user 鍵中的數據
    return response.data.user || response.data;
  } catch (error) {
    console.error('❌ 獲取用戶身體數據失敗:', error.message);
    throw error;
  }
};

/**
 * 更新用戶身體數據
 * @param {Object} userInfo - 用戶身體信息
 * @param {number} userInfo.user_height - 身高 (cm)
 * @param {number} userInfo.user_weight - 體重 (kg)
 * @param {number} userInfo.user_arm_length - 臂長 (cm)
 * @param {number} userInfo.user_shoulder_width - 肩寬 (cm)
 * @param {number} userInfo.user_waistline - 腰圍 (cm)
 * @param {number} userInfo.user_leg_length - 腿長 (cm)
 * @returns {Promise<Object>} - 更新結果
 */
export const updateUserInfo = async (userInfo) => {
  try {
    const response = await apiClient.post('/account/user/user_info', {
      user_height: parseFloat(userInfo.user_height),
      user_weight: parseFloat(userInfo.user_weight),
      user_arm_length: parseFloat(userInfo.user_arm_length),
      user_shoulder_width: parseFloat(userInfo.user_shoulder_width),
      user_waistline: parseFloat(userInfo.user_waistline),
      user_leg_length: parseFloat(userInfo.user_leg_length),
    });

    console.log('✅ 更新用戶身體數據成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 更新用戶身體數據失敗:', error.message);
    throw error;
  }
};
