import axios from 'axios';
import { API_URL } from './api';

/**
 * 用戶登入
 * @param {string} username - 使用者名稱或信箱
 * @param {string} password - 密碼
 * @returns {Promise<Object>} - 登入結果 (包含 token 等)
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/login`, {
      username,
      password,
    });
    
    console.log("✅ 登入成功");
    return response.data;
  } catch (error) {
    console.error("❌ 登入失敗:", error.message);
    throw error;
  }
};

/**
 * 用戶註冊
 * @param {string} email - 電子郵件
 * @param {string} username - 使用者名稱
 * @param {string} password - 密碼
 * @returns {Promise<Object>} - 註冊結果
 */
export const register = async (email, username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/register`, {
      email,
      username,
      password,
    });
    
    console.log("✅ 註冊成功");
    return response.data;
  } catch (error) {
    console.error("❌ 註冊失敗:", error.message);
    throw error;
  }
};

/**
 * 登出
 * @returns {Promise<Object>} - 登出結果
 */
export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/logout`);
    console.log("✅ 登出成功");
    return response.data;
  } catch (error) {
    console.error("❌ 登出失敗:", error.message);
    throw error;
  }
};

/**
 * 檢查使用者是否已登入
 * @returns {Promise<Object>} - 使用者資訊
 */
export const checkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/check`);
    return response.data;
  } catch (error) {
    console.error("❌ 認證檢查失敗:", error.message);
    throw error;
  }
};
