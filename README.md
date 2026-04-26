# AI Outfit System - Frontend Module

這是「AI 智慧穿搭系統」的前端模組，使用 React + Vite 開發，並以 Nginx 容器化部署。

## 快速啟動 (Quick Start)

前置需求 (Prerequisites)

Node.js (v20+)

Python (v3.9+)

Docker

### 1. 先啟動後端 Compose
前端會透過共享 Docker 網路連到後端容器 `django-backend:30000`。

請先在後端目錄啟動：

```bash
cd ../backend
docker compose up -d
```

### 2. 用 Docker Compose 啟動前端（Nginx）
```bash
docker compose up -d --build
```

### 3. 開啟網頁
啟動完成後，請瀏覽： `http://localhost:8080`

### 4. 停止服務
```bash
docker compose down
```

### 專案結構
src/ - React 原始碼

docker-compose.yml - 一鍵啟動前端 Nginx

Dockerfile - 多階段建置腳本 (Node.js Build / Nginx Prod / Vite Dev)

nginx.conf - Nginx 路由設定 (SPA Support)

start.sh - 一鍵啟動與配置腳本
