import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const searchClothesWithAI = async (query) => {
  try {
    const prompt = `
      你是一個專業的時尚購物助手。使用者正在尋找： "${query}"。
      請在「蝦皮購物 (Shopee Taiwan)」上搜尋符合描述的 3-5 件衣服商品。
      
      請以 JSON 格式回傳結果，結構如下：
      {
        "results": [
          {
            "Name": "商品名稱",
            "Price": "價格 (例如 NT$ 599)",
            "Description": "商品描述",
            "ImageUrl": "商品真實圖片連結",
            "ProductUrl": "蝦皮商品連結 (https://shopee.tw/...)"
          }
        ],
        "error": "如果遇到任何困難（例如無法瀏覽蝦皮的商品、找不到符合條件的商品、搜尋字詞不當等），請在此提供友善的中文錯誤說明，不要生成虛假的內容。如果搜尋成功，此欄位應為 null。"
      }
      
      重要指令：
      1. 如果你無法找到真正符合需求的商品，請在 "error" 欄位中說明原因，不要隨便生成虛假的內容。
      2. 請僅回傳 JSON 格式的內容，不要包含任何 Markdown 標籤 (如 \`\`\`json) 或額外的文字說明。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    if (!response || !response.text) {
      throw new Error("AI 服務暫時無法回應，請稍後再試。");
    }

    const text = response.text;
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.error) {
        throw new Error(data.error);
      }
      return data.results || [];
    }
    
    throw new Error("無法解析 AI 回傳的資料格式。");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
