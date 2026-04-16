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

# 顯示顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
# ==========================================

echo "🚀 [前端] 準備啟動..."
echo "🔗 後端 API 指向: $BACKEND_URL"

# ===== 步驟 1: 安裝 npm 依賴 =====
echo ""
echo "========================================"
echo "步驟 1: 依賴管理 📦"
echo "========================================"

if command -v npm &> /dev/null; then
    echo "✓ npm 已找到"
    echo "📦 正在安裝/更新 npm 依賴..."
    
    # 檢查 node_modules 是否已存在
    if [ -d "node_modules" ]; then
        echo "   ✅ node_modules 已存在，執行增量更新..."
    else
        echo "   📥 node_modules 不存在，開始完整安裝..."
    fi
    
    # 執行 npm install，並檢查是否成功
    if npm install; then
        echo -e "   ${GREEN}✨ npm 依賴安裝成功！${NC}"
    else
        echo -e "   ${RED}❌ npm 依賴安裝失敗，請檢查網路連接或 npm 配置${NC}"
        echo "   💡 您可以手動執行: npm install"
        exit 1
    fi
else
    echo "⚠️  npm 未安裝在本機，Docker 容器內會自動安裝依賴"
    echo "   如果要本機開發，請先安裝 Node.js"
fi

# 檢查是否為開發模式
if [ "$DEV_MODE" = "dev" ]; then
    echo "🔥 開發模式 (HOT RELOAD 已啟用)"
    IS_DEV=true
else
    echo "📦 生產模式"
    IS_DEV=false
fi

echo ""
echo "========================================"
echo "步驟 2: 容器管理 🐳"
echo "========================================"

# 1. 清理舊的容器 (如果有)
# 優先嘗試使用 sudo，如果沒有權限則提示用戶
if docker ps -aq -f name=$CONTAINER_NAME &>/dev/null; then
    echo "🧹 清除舊容器 ($CONTAINER_NAME)..."
    docker rm -f $CONTAINER_NAME 2>/dev/null || {
        echo "⚠️  需要 Docker 權限，嘗試使用 sudo..."
        sudo docker rm -f $CONTAINER_NAME
    }
    echo "   ✓ 舊容器已清除"
else
    echo "✓ 沒有舊容器需要清除"
fi

echo ""

# 2. 打包映像檔 (關鍵：把網址傳進去！)
echo "📦 正在打包 Docker Image..."

# 驗證關鍵文件是否存在
echo "   ✓ 檢查項目文件..."
if [ ! -f "package.json" ]; then
    echo "   ❌ 找不到 package.json，請確保在正確的目錄中運行此腳本"
    exit 1
fi

if [ ! -d "src" ]; then
    echo "   ❌ 找不到 src 目錄"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "   ❌ 找不到 Dockerfile"
    exit 1
fi

echo "   ✅ 所有關鍵文件都存在"
echo "   ✓ 檢查樣式文件..."
if [ -f "src/styles/variables.css" ]; then
    echo "      ✓ src/styles/variables.css (設計系統)"
fi
if [ -f "src/styles/global.css" ]; then
    echo "      ✓ src/styles/global.css (全局樣式)"
fi

echo ""
echo "   🔨 開始 Docker 構建..."
docker build \
  --build-arg VITE_API_URL=$BACKEND_URL \
  -t $IMAGE_NAME . 2>/dev/null || {
    echo "⚠️  需要 Docker 權限，嘗試使用 sudo..."
    sudo docker build \
      --build-arg VITE_API_URL=$BACKEND_URL \
      -t $IMAGE_NAME .
}

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ Docker Image 構建成功！${NC}"
else
    echo -e "   ${RED}❌ Docker Image 構建失敗${NC}"
    exit 1
fi

echo ""

# 3. 啟動容器
echo "========================================"
echo "步驟 3: 啟動應用 🚀"
echo "========================================"
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

# 等待容器完全啟動
sleep 2

# 檢查容器是否成功啟動
if docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" &>/dev/null; then
    echo -e "${GREEN}✅ 容器成功啟動！${NC}"
else
    echo -e "${RED}❌ 容器啟動失敗，查看日誌：${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}🎉 前端開發模式運行在: http://localhost:$PORT${NC}"
echo "========================================"
echo -e "📝 檔案變更會自動重新載入 (${GREEN}HOT RELOAD${NC})"
echo ""
echo "📋 容器名稱: $CONTAINER_NAME"
echo "💡 查看日誌: docker logs -f $CONTAINER_NAME"
echo "⏹️  停止容器: docker stop $CONTAINER_NAME"
echo "🗑️  刪除容器: docker rm $CONTAINER_NAME"
echo ""
echo "💡 如果經常需要輸入密碼，建議執行以下命令一次性解決 Docker 權限問題："
echo "   sudo usermod -aG docker \$USER"
echo "   newgrp docker"
echo "   系統重啟後生效"