#!/bin/bash

# ==========================================
# 🔧 設定區 (Config)
# 請在這裡填入後端的 IP (可以是 localhost, 192.168.x.x 或 ngrok)
# 預設值先寫 localhost，組員拿去跑的時候叫他們自己改這裡
BACKEND_URL="http://localhost:8000"

# 容器名稱與 Port
CONTAINER_NAME="frontend-container"
IMAGE_NAME="frontend-image"
PORT=8080
# ==========================================

echo "🚀 [前端] 準備啟動..."
echo "🔗 後端 API 指向: $BACKEND_URL"

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
docker run -d \
  -p $PORT:80 \
  --name $CONTAINER_NAME \
  $IMAGE_NAME

echo "========================================"
echo "🎉 前端已成功跑在: http://localhost:$PORT"
echo "========================================"