#!/bin/bash

# 設置環境變數，確保虛擬環境中的工具優先使用
#export PATH="/opt/venv/bin:$PATH"

# 啟動 AI API (FastAPI) 並放入背景
#echo "🤖 正在啟動 AI API (Production)..."
#cd /app/ai_api

# 使用絕對路徑執行 uvicorn
#/opt/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &

# 稍微等待 AI API 啟動
#sleep 2

# 啟動 Nginx (前台運行)
echo "🚀 正在啟動 Nginx..."
nginx -g "daemon off;"
