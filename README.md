# AI Outfit System - Frontend Module

這是「AI 智慧穿搭系統」的前端模組，使用 React + Vite 開發，並以 Nginx 容器化部署。

## 快速啟動 (Quick Start)

前置需求 (Prerequisites)
Node.js (v20+)

Python (v3.9+)

Docker

### 1. 修改後端連線位址
打開 `start.sh` 檔案，修改最上方的變數：
# 修改這裡換成你的後端 IP
BACKEND_URL="[http://192.168.](http://192.168.)x.x:8000"

### 2. 執行啟動腳本
./start.sh

### 3. 開啟網頁
啟動完成後，請瀏覽： http://localhost:8080

### 專案結構
src/ - React 原始碼

Dockerfile - 兩階段建置腳本 (Node.js Build -> Nginx Serve)

nginx.conf - Nginx 路由設定 (SPA Support)

start.sh - 一鍵啟動與配置腳本
