import axios from 'axios';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

export const searchClothesWithAI = async (query) => {
  try {
    const response = await axios.post(`${AI_API_URL}/search`, { query });
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    return response.data.results || [];
  } catch (error) {
    console.error("Error calling AI API:", error);
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
};
