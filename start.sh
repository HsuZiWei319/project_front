#!/bin/bash

# 讀取 .env 檔案
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# 定義變數 (方便之後修改)
NETWORK_NAME="outfit-system-net"
BACKEND_IMAGE="my-backend-img"
FRONTEND_IMAGE="my-frontend-img"

echo "🔧 正在準備環境..."

# 1. 建立 Docker 內部網路 (如果不存在的話)
# 這是為了讓後端可以連到 MinIO，不用走公網
if [ -z "$(docker network ls | grep $NETWORK_NAME)" ]; then
    echo "🌐 建立網路: $NETWORK_NAME"
    docker network create $NETWORK_NAME
else
    echo "✅ 網路已存在: $NETWORK_NAME"
fi

# 2. 啟動 MinIO (資料庫)
echo "📦 正在啟動 MinIO..."
docker run -d \
  --name minio \
  --network $NETWORK_NAME \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=password \
  minio/minio server /data --console-address ":9001"

# 3. 建置並啟動後端 (Backend)
echo "🐍 正在建置後端..."
cd backend
docker build -t $BACKEND_IMAGE .
docker run -d \
  --name backend \
  --network $NETWORK_NAME \
  -p 8000:8000 \
  -e MINIO_ENDPOINT=minio:9000 \
  $BACKEND_IMAGE
cd ..

# 4. 建置並啟動前端 (Frontend)
echo "⚛️ 正在建置前端..."
# 這裡不需要加入 network，因為前端是在使用者的瀏覽器跑的
docker build -t $FRONTEND_IMAGE .
docker run -d \
  --name frontend \
  -p 8080:80 \
  $FRONTEND_IMAGE

echo "=================================================="
echo "🎉  系統啟動完成！(純 Docker 模式)"
echo "👉  前端頁面： http://localhost:8080"
echo "👉  後端 API： http://localhost:8000/docs"
echo "👉  MinIO 後台： http://localhost:9001"
echo "=================================================="