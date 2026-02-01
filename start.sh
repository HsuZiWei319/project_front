#!/bin/bash

# ==========================================
# 🔧 設定區 (Config)
# 請在這裡填入後端的 IP (可以是 localhost, 192.168.x.x 或 ngrok)
# 預設值先寫 localhost，組員拿去跑的時候叫他們自己改這裡
BACKEND_URL="http://192.168.233.128:30000"

# 容器名稱與 Port
CONTAINER_NAME="upload-image-cont"
IMAGE_NAME="upload-image-img"
PORT=8080
DEV_MODE=${1:-dev}  # 預設為開發模式，可以傳入其他值改為生產模式
# ==========================================

echo "🚀 [前端] 準備啟動..."
echo "🔗 後端 API 指向: $BACKEND_URL"

# 安裝依賴
echo "📦 安裝 npm 依賴..."
npm install

# 檢查是否為開發模式
if [ "$DEV_MODE" = "dev" ]; then
    echo "🔥 開發模式 (HOT RELOAD 已啟用)"
    IS_DEV=true
else
    echo "📦 生產模式"
    IS_DEV=false
fi

# 1. 清理舊的容器 (如果有)
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🧹 清除舊容器..."
    docker rm -f $CONTAINER_NAME
fi

# 2. 打包映像檔 (關鍵：把網址傳進去！)
echo "📦 正在打包 Docker Image..."
# --build-arg 就是把變數塞進 Dockerfile 的關鍵
docker build \
  --build-arg VITE_API_URL=$BACKEND_URL \
  -t $IMAGE_NAME .

# 3. 啟動容器
echo "🔥 啟動容器中..."

# 啟動開發模式容器：使用卷掛載和 Vite dev server
docker run -d \
  -p $PORT:5173 \
  -v "$(pwd)/src:/app/src" \
  -v "$(pwd)/public:/app/public" \
  --name $CONTAINER_NAME \
  $IMAGE_NAME npm run dev -- --host 0.0.0.0
echo "========================================"
echo "🎉 前端開發模式運行在: http://localhost:$PORT"
echo "📝 檔案變更會自動重新載入 (HOT RELOAD)"
echo "========================================"

echo "📋 容器名稱: $CONTAINER_NAME"
echo "💡 查看日誌: docker logs -f $CONTAINER_NAME"
echo "⏹️  停止容器: docker stop $CONTAINER_NAME"