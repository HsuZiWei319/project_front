#!/bin/bash

# ==========================================
# 🔧 設定區 (Config)
# 請在這裡填入後端的 IP (可以是 localhost, 192.168.x.x 或 ngrok)
# 預設值先寫 localhost，組員拿去跑的時候叫他們自己改這裡
BACKEND_URL="http://35.201.135.229:30000"

# 容器名稱與 Port
CONTAINER_NAME="upload-image-cont"
IMAGE_NAME="upload-image-img"
PORT=8080
DEV_MODE=${1:-dev}  # 預設為開發模式，可以傳入其他值改為生產模式
# ==========================================

echo "🚀 [前端] 準備啟動..."
echo "🔗 後端 API 指向: $BACKEND_URL"

# 檢查 npm 是否已安裝
if command -v npm &> /dev/null; then
    echo "📦 安裝 npm 依賴..."
    npm install
else
    echo "⚠️  npm 未安裝，跳過本地 npm install（Docker 會自動安裝）"
fi

# 檢查是否為開發模式
if [ "$DEV_MODE" = "dev" ]; then
    echo "🔥 開發模式 (HOT RELOAD 已啟用)"
    IS_DEV=true
else
    echo "📦 生產模式"
    IS_DEV=false
fi

# 1. 清理舊的容器 (如果有)
# 優先嘗試使用 sudo，如果沒有權限則提示用戶
if docker ps -aq -f name=$CONTAINER_NAME &>/dev/null; then
    echo "🧹 清除舊容器..."
    docker rm -f $CONTAINER_NAME 2>/dev/null || {
        echo "⚠️  需要 Docker 權限，嘗試使用 sudo..."
        sudo docker rm -f $CONTAINER_NAME
    }
fi

# 2. 打包映像檔 (關鍵：把網址傳進去！)
echo "📦 正在打包 Docker Image..."
docker build \
  --build-arg VITE_API_URL=$BACKEND_URL \
  -t $IMAGE_NAME . 2>/dev/null || {
    echo "⚠️  需要 Docker 權限，嘗試使用 sudo..."
    sudo docker build \
      --build-arg VITE_API_URL=$BACKEND_URL \
      -t $IMAGE_NAME .
}

# 3. 啟動容器
echo "🔥 啟動容器中..."

# 啟動開發模式容器：使用卷掛載和 Vite dev server
docker run -d \
  -p $PORT:5173 \
  -v "$(pwd)/src:/app/src" \
  -v "$(pwd)/public:/app/public" \
  --name $CONTAINER_NAME \
  $IMAGE_NAME npm run dev -- --host 0.0.0.0 2>/dev/null || {
    echo "⚠️  需要 Docker 權限，嘗試使用 sudo..."
    sudo docker run -d \
      -p $PORT:5173 \
      -v "$(pwd)/src:/app/src" \
      -v "$(pwd)/public:/app/public" \
      --name $CONTAINER_NAME \
      $IMAGE_NAME npm run dev -- --host 0.0.0.0
}
echo "========================================"
echo "🎉 前端開發模式運行在: http://localhost:$PORT"
echo "📝 檔案變更會自動重新載入 (HOT RELOAD)"
echo "========================================"

echo "📋 容器名稱: $CONTAINER_NAME"
echo "💡 查看日誌: docker logs -f $CONTAINER_NAME"
echo "⏹️  停止容器: docker stop $CONTAINER_NAME"
echo ""
echo "💡 如果經常需要輸入密碼，建議執行以下命令一次性解決 Docker 權限問題："
echo "   sudo usermod -aG docker \$USER"
echo "   newgrp docker"
echo "   系統重啟後生效"