# --- 階段一：建置 (Builder) ---
FROM node:20-alpine AS builder
WORKDIR /app

# 1. 安裝依賴
COPY package.json package-lock.json ./
RUN npm install

# 2. 複製所有程式碼並打包
COPY . .
RUN npm run build
# (Vite 預設會打包到 /app/dist 資料夾)


# --- 階段二：執行 (Runner) ---
FROM nginx:alpine

# 1. 把階段一打包好的 dist 資料夾，複製到 Nginx 預設目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 2. 複製我們寫好的 nginx 設定檔
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. 開放 80 port
EXPOSE 80

# 4. 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]