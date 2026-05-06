#!/bin/bash

# 啟動 AI API (FastAPI) 並放入背景
echo "🤖 正在啟動 AI API..."
cd /app
uvicorn ai_api.main:app --host 0.0.0.0 --port 8000 --reload &

# 稍微等待 AI API 啟動完成
sleep 2

# 啟動前端開發伺服器
echo "🚀 正在啟動前端服務..."
npm run dev -- --host 0.0.0.0
