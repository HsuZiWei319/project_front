#!/bin/bash

# 啟動 AI API (FastAPI) 並放入背景
echo "🤖 正在啟動 AI API (Production)..."
cd /app/ai_api
uvicorn main:app --host 0.0.0.0 --port 8000 &

# 啟動 Nginx (前台運行)
echo "🚀 正在啟動 Nginx..."
nginx -g "daemon off;"
