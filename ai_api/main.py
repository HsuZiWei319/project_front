import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
# 1. 更改匯入來源
from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import json

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. 初始化 GenAI Client
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

if api_key:
    # 建立 client 實例
    client = genai.Client(api_key=api_key)
else:
    client = None
    print("Warning: GEMINI_API_KEY not found in environment variables.")

class SearchResult(BaseModel):
    Name: str
    Price: str
    Description: str
    ImageUrl: str
    ProductUrl: str

class SearchResponse(BaseModel):
    results: List[SearchResult]
    error: Optional[str] = None

class SearchQuery(BaseModel):
    query: str

@app.post("/search", response_model=SearchResponse)
async def search_clothes(search_query: SearchQuery):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API key not configured on server.")

    query = search_query.query
    
    # 這裡稍微優化一下 prompt，因為現在有 response_schema 了
    prompt = f"""
      你是一個專業的時尚購物助手。使用者正在尋找： "{query}"。
      請在「蝦皮購物 (Shopee Taiwan)」上搜尋符合描述的 3-5 件衣服商品。
      
      重要指令：
      1. 如果你無法找到真正符合需求的商品(如無法訪問蝦皮網站)，請在 "error" 欄位中說明原因，不用勉強生成虛假內容。
      2. 務必確保 ImageUrl 和 ProductUrl 的真實性。
    """

    try:
        # 3. 使用新的呼叫方式與結構化輸出 (Controlled Generation)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SearchResponse, # 直接傳入 Pydantic 模型
            )
        )
        
        # 4. 取得解析後的結果
        # 新版 SDK 會自動根據 schema 解析 JSON，可以直接使用 .parsed
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="AI 服務暫時無法回應。")

        # 使用 parsed 屬性直接取得已經轉成 SearchResponse 物件的資料
        data = response.parsed
        
        if data.error:
            return SearchResponse(results=[], error=data.error)
            
        return data

    except Exception as e:
        print(f"Error calling GenAI API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)