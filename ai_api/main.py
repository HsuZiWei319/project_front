import os
import httpx # 建議安裝: pip install httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import json
import urllib.parse # 把中文字轉換成網址編碼的標準函式庫

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 GenAI Client
api_key = os.getenv("GEMINI_API_KEY")
serper_api_key = os.getenv("SERPER_API_KEY")

client = genai.Client(api_key=api_key) if api_key else None

# Pydantic Models
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

# --- 專門用來約束 Gemini 輸出的精簡格式 ---
class AIFilterResult(BaseModel):
    item_id: str  # AI 只需要回傳它選中的 ID
    Description: str # 以及 AI 幫忙想的推銷文案

class AIFilterResponse(BaseModel):
    selected_items: List[AIFilterResult]
    error: Optional[str] = None

# --- 新增：Serper.dev 搜尋函數 ---
async def fetch_serper_shopping(query: str):
    """使用 Serper.dev 的 Shopping 搜尋介面"""
    url = "https://google.serper.dev/shopping"
    payload = json.dumps({
        "q": f"{query}", # 限定搜尋蝦皮
        "gl": "tw", # 地區：台灣
        "hl": "zh-tw" # 語言：繁體中文
    })
    headers = {
        'X-API-KEY': serper_api_key,
        'Content-Type': 'application/json'
    }

    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            response = await http_client.post(url, headers=headers, content=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print("=========================================")
            print(f"Serper API 網路請求失敗: {e}")
            print("=========================================")
            return None

@app.post("/search", response_model=SearchResponse)
async def search_clothes(search_query: SearchQuery):
    if not client or not serper_api_key:
        raise HTTPException(status_code=500, detail="API keys not configured.")

    original_query = search_query.query
    enhanced_query = f"{original_query} 服飾 衣服"

    # 第一步：先從 Serper 抓取實時購物資料
    serper_data = await fetch_serper_shopping(enhanced_query)

    '''
    # 【修改點】安全地列印除錯資訊 (只印前 500 個字元，避免終端機崩潰)
    if serper_data:
        safe_log = json.dumps(serper_data, ensure_ascii=False)[:500]
        print(f"DEBUG - Serper 成功回傳 (截斷顯示): {safe_log}...")
    '''
        
    if not serper_data or "shopping" not in serper_data:
        # 這邊加個 debug 訊息讓 Gemini 知道
        return SearchResponse(results=[], error=f"Serper API 有回傳但找不到 shopping 資料。回傳 Keys 為: {list(serper_data.keys()) if serper_data else 'None'}")

    # 提取 Serper 的原始搜尋結果做為 Context
    raw_results = serper_data.get("shopping", [])[:4] # 取前 4 筆

    # 【關鍵架構】將龐大資料留在 Python (original_data_map)
    # 只把乾淨、輕量的文字 (ai_context) 送給 Gemini
    original_data_map = {}
    ai_context = []

    for idx, item in enumerate(raw_results):
        item_id = f"item_{idx}"
        original_data_map[item_id] = item # 完整保留含有 Base64 圖片和落落長網址的原始資料
        
        # 只餵給 AI 品名、價格，讓它做判斷
        ai_context.append({
            "item_id": item_id,
            "title": item.get("title", ""),
            "price": item.get("price", ""),
            "source": item.get("source", "")
        })

    # 第二步：把搜尋結果餵給 Gemini 進行整理
    prompt = f"""
      你是一個專業的時尚衣服購物助手。
      使用者正在尋找："{enhanced_query}" 的穿搭商品。
      
      以下是從搜尋引擎取得的原始資料：
      {json.dumps(ai_context, ensure_ascii=False)}

      任務：
        1. 請從上方資料中，挑選出「最接近」使用者需求的商品。
        2. 排除任何非穿著類的商品。
        3. 針對挑選的商品，務必正確填入對應的 item_id。 
        4. 根據標題(title)，為該商品寫一句約 15 字以內、吸引人的 Description。
        5. 如果Serper 給的資料你無法分析，請在 error 欄位說明。
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", # 建議使用目前的穩定版本
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AIFilterResponse, # 使用精簡版 Schema
            )
        )
        
        data = response.parsed
        if not data:
            raise HTTPException(status_code=500, detail="AI 解析失敗。")
            
        if data.error:
             return SearchResponse(results=[], error=data.error)
        
        #【資料還原】AI 選完後，Python 負責把原汁原味的圖片和網址組合回去
        final_results = []
        for ai_item in data.selected_items:
            # 透過 item_id 找回原始資料
            orig_item = original_data_map.get(ai_item.item_id)
            if orig_item:
                title = orig_item.get("title", "")
                source = orig_item.get("source", "")
                
                # --- 【關鍵修改】：捨棄原本壞掉的 link，動態生成安全的商品搜尋網址 ---
                # 把商家名稱跟標題組合起來，例如 "Uniqlo Taiwan 女裝 防風立領外套"
                search_term = f"{source} {title}".strip()
                
                # urllib.parse.quote 會把中文轉成網址安全格式 (如 %E7%BE%8A...)
                # 這裡直接生成一個 Google 搜尋該商品的網址
                safe_product_url = f"https://www.google.com/search?q={urllib.parse.quote(search_term)}"

                final_results.append(SearchResult(
                    Name=orig_item.get("title", ""),
                    Price=orig_item.get("price", ""),
                    Description=ai_item.Description, # 這個是 AI 想的
                    ImageUrl=orig_item.get("imageUrl", ""), # 100% 原始未破壞的圖片
                    ProductUrl=safe_product_url    # 自己生成的安全網址
                ))

        return SearchResponse(results=final_results)

    except Exception as e:
        print(f"Error calling GenAI API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)